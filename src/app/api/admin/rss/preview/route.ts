import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { parseFeed } from '@/lib/rss-fetcher'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/rss/preview?url=&limit= — fetch and return live headlines for a given URL
 * Used by the admin Add Feed form to verify a feed URL works
 * @param limit - number of items to return (default 3 for form preview, 5 for side drawer)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '3', 10)))

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const result = await parseFeed(url)

    // Return latest N headlines for preview (default 3 for form, 5 for drawer)
    const previewItems = result.items.slice(0, limit).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
    }))

    return NextResponse.json({
      success: true,
      feedTitle: result.feedTitle,
      articleCount: result.articleCount,
      items: previewItems,
    })
  } catch (err: any) {
    console.error('GET /api/admin/rss/preview error:', err)
    return NextResponse.json(
      {
        error: `Failed to fetch feed: ${err?.message || 'Unknown error'}`,
      },
      { status: 422 }
    )
  }
}
