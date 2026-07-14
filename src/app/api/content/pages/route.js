/**
 * Pages API — List all pages with their CMS status
 *
 * GET /api/content/pages
 *
 * Returns all registered pages with their CMS content status
 * (whether they have content saved, and when it was last updated).
 *
 * Also includes registration form pages from the form builder,
 * so they appear in the CMS Pages list for editing.
 */

import { NextResponse } from 'next/server'
import PageContent from '@/models/PageContent'
import RegistrationFormConfig from '@/models/RegistrationFormConfig'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { getAllPageMeta } from '@/lib/page-fields'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    // Get all pages that have CMS content saved
    const savedPages = await PageContent.find({})
      .select('pageSlug content updatedAt')
      .lean()

    // Build a map of slug -> saved data
    const savedMap = {}
    for (const p of savedPages) {
      savedMap[p.pageSlug] = {
        hasContent: true,
        updatedAt: p.updatedAt?.toISOString?.() ?? null,
      }
    }

    // Merge with all registered page slugs
    const allPages = getAllPageMeta().map((meta) => ({
      ...meta,
      hasContent: !!savedMap[meta.slug],
      updatedAt: savedMap[meta.slug]?.updatedAt || null,
      isRegistrationForm: false,
      formKey: null,
    }))

    // Fetch all enabled registration form configs and add them as pages
    const regForms = await RegistrationFormConfig.find({})
      .select('key slug name formTitle updatedAt')
      .lean()

    for (const form of regForms) {
      allPages.push({
        slug: `register/${form.slug}`,
        pageName: form.name || form.formTitle || form.slug,
        hasContent: true,
        updatedAt: form.updatedAt?.toISOString?.() ?? null,
        isRegistrationForm: true,
        formKey: form.key,
      })
    }

    return NextResponse.json({ pages: allPages })
  } catch (err) {
    console.error('[cms] GET /api/content/pages error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}
