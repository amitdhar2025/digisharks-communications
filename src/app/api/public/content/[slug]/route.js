/**
 * Public Page Content API
 *
 * GET /api/public/content/:slug
 *
 * Returns the CMS content for a page. No authentication required.
 * Used by public-facing pages to fetch editable content.
 * Returns empty content {} if no CMS data exists, so pages can
 * fall back to their hardcoded defaults.
 */

import { NextResponse } from 'next/server'
import PageContent from '@/models/PageContent'
import { connectCMSDb } from '@/lib/db-cms'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  try {
    await connectCMSDb()
    const { slug } = await params

    const doc = await PageContent.findOne({ pageSlug: slug })
      .select('content updatedAt')
      .lean()

    return NextResponse.json({
      slug,
      content: doc?.content || {},
      hasContent: !!doc && !!doc.content && Object.keys(doc.content).length > 0,
      updatedAt: doc?.updatedAt?.toISOString?.() ?? null,
    })
  } catch (err) {
    console.error('[public] GET /api/public/content/[slug] error:', err)
    return NextResponse.json(
      { slug: params.slug, content: {}, hasContent: false },
      { status: 500 }
    )
  }
}
