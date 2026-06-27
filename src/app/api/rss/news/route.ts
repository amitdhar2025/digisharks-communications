import { NextRequest, NextResponse } from 'next/server'
import connectMongoose from '@/lib/mongoose'
import RssFeed from '@/lib/models/RssFeed'
import { parseFeeds, NormalizedItem } from '@/lib/rss-fetcher'
import { getNewsCache } from '@/lib/rss-news-cache'
import { detectCategory, getAllAutoCategories, AutoCategory } from '@/lib/news-categorizer'

const newsCache = getNewsCache()

export const dynamic = 'force-dynamic'

export interface NewsApiResponse {
  items: NormalizedItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  meta: {
    activeFeedCount: number
    categoryCount: number
    categories: string[]
    categoryCounts: Record<string, number>
  }
}

/**
 * GET /api/rss/news?category=all&page=1&limit=9
 *
 * Fetches paginated news items from all active RSS feeds,
 * auto-categorizes every article using the news-categorizer, and
 * filters by the requested category.
 *
 * The filter bar exposes all known auto-categories
 * (Technology, Business, Lifestyle, Science, Sports,
 * Entertainment, Health, Politics, World, India, General)
 * so the public news page always shows every category even if
 * the underlying feeds aren't pre-tagged.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = (searchParams.get('category') || 'all').trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '9', 10)))
    const skip = (page - 1) * limit

    // Build cache key
    const cacheKey = `news:${category.toLowerCase()}:${page}:${limit}`

    // Check cache
    const cached = newsCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        items: cached.items,
        total: cached.total,
        page,
        limit,
        hasMore: skip + limit < cached.total,
        meta: cached.meta,
      })
    }

    await connectMongoose()

    // Build feed query: pull every active feed that may be used on the news page
    const feedFilter: Record<string, any> = {
      status: 'active',
      location: { $in: ['news-page', 'both'] },
    }

    const feeds = await RssFeed.find(feedFilter)
      .select('_id name url category')
      .lean()

    // Active feed count (for the "Fetching from N feeds" line)
    const activeFeedCount = await RssFeed.countDocuments({ status: 'active' })

    // Build the static list of auto-categories. We always expose every
    // known category so the FilterBar is complete even when a category
    // currently has zero articles.
    const allAutoCategories: string[] = getAllAutoCategories()

    if (feeds.length === 0) {
      const emptyResult = {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        meta: {
          activeFeedCount,
          categoryCount: allAutoCategories.length,
          categories: allAutoCategories,
          categoryCounts: {},
        },
      }
      newsCache.set(cacheKey, {
        items: [],
        total: 0,
        meta: {
          activeFeedCount,
          categoryCount: allAutoCategories.length,
          categories: allAutoCategories,
          categoryCounts: {},
        },
      })
      return NextResponse.json(emptyResult)
    }

    const { results } = await parseFeeds(
      feeds.map((f) => ({
        _id: f._id.toString(),
        name: f.name,
        url: f.url,
        category: f.category,
      }))
    )

    // Auto-categorize every item (use feed-supplied category as a hint
    // for fallback only — auto-detection takes priority).
    for (const item of results) {
      const auto: AutoCategory = detectCategory(
        item.title || '',
        item.description || '',
        item.source || item.feedName || '',
        item.category || ''
      )
      // Overwrite the category with the auto-detected one
      item.category = auto
    }

    // Deduplicate by link URL
    const seen = new Set<string>()
    const unique: NormalizedItem[] = []
    for (const item of results) {
      const key = item.link || item.title
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(item)
      }
    }

    // Sort by pubDate descending
    unique.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )

    // Apply category filter
    const filtered = category && category.toLowerCase() !== 'all'
      ? unique.filter((it) => (it.category || '').toLowerCase() === category.toLowerCase())
      : unique

    const total = filtered.length
    const paginated = filtered.slice(skip, skip + limit)

    // Build per-category counts from ALL articles (pre-pagination) so
    // each chip on the FilterBar can display its full count.
    const categoryCounts: Record<string, number> = {}
    for (const c of allAutoCategories) categoryCounts[c] = 0
    for (const it of unique) {
      const c = it.category || 'General'
      categoryCounts[c] = (categoryCounts[c] || 0) + 1
    }

    const meta = {
      activeFeedCount,
      categoryCount: allAutoCategories.length,
      categories: allAutoCategories,
      categoryCounts,
    }

    // Cache the result
    newsCache.set(cacheKey, {
      items: paginated,
      total,
      meta,
    })

    // Update lastFetchedAt and article count for these feeds
    try {
      await RssFeed.updateMany(
        { _id: { $in: feeds.map((f) => f._id) } },
        { $set: { lastFetchedAt: new Date(), lastArticleCount: unique.length } }
      )
    } catch {
      // non-critical
    }

    return NextResponse.json({
      items: paginated,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
      meta,
    } satisfies NewsApiResponse)
  } catch (err) {
    console.error('GET /api/rss/news error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
