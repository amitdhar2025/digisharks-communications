/**
 * Single Page API — GET / PUT
 *
 * GET  /api/content/pages/:slug  — get page content (for admin editor)
 * PUT  /api/content/pages/:slug  — save/update page content
 *
 * Also handles CORS for public frontend access via a separate public endpoint.
 */

import { NextResponse } from 'next/server'
import PageContent from '@/models/PageContent'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { getPageFields } from '@/lib/page-fields'

export const dynamic = 'force-dynamic'

// ── GET: Fetch page content ───────────────────────────────────────────
export async function GET(req, { params }) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const { slug } = await params

    const pageContent = await PageContent.findOne({ pageSlug: slug }).lean()

    if (!pageContent) {
      // Return empty content for new pages
      return NextResponse.json({
        pageSlug: slug,
        pageName: getPageFields(slug)?.pageName || slug,
        content: {},
        hasContent: false,
      })
    }

    return NextResponse.json({
      pageSlug: pageContent.pageSlug,
      pageName: pageContent.pageName,
      content: pageContent.content || {},
      hasContent: true,
      updatedAt: pageContent.updatedAt?.toISOString?.() ?? null,
    })
  } catch (err) {
    console.error('[cms] GET /api/content/pages/[slug] error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch page content' },
      { status: 500 }
    )
  }
}

// ── PUT: Save / update page content ───────────────────────────────────
export async function PUT(req, { params }) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const { slug } = await params
    const body = await req.json()

    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const pageName = getPageFields(slug)?.pageName || slug

    // Upsert: update if exists, create if not
    const updated = await PageContent.findOneAndUpdate(
      { pageSlug: slug },
      {
        $set: {
          pageSlug: slug,
          pageName,
          content: body.content,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean()

    return NextResponse.json({
      success: true,
      pageSlug: updated.pageSlug,
      updatedAt: updated.updatedAt?.toISOString?.() ?? null,
    })
  } catch (err) {
    console.error('[cms] PUT /api/content/pages/[slug] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update page content' },
      { status: 500 }
    )
  }
}
