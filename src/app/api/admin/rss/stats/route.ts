import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import connectMongoose from '@/lib/mongoose'
import RssFeed from '@/lib/models/RssFeed'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/rss/stats — aggregate feed statistics
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoose()

    const [totalFeeds, activeFeeds, categories, totalArticles] = await Promise.all([
      RssFeed.countDocuments({}),
      RssFeed.countDocuments({ status: 'active' }),
      RssFeed.distinct('category', { status: 'active' }),
      RssFeed.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$lastArticleCount' } } },
      ]),
    ])

    return NextResponse.json({
      totalFeeds,
      activeFeeds,
      categoryCount: categories.length,
      categories,
      totalArticles: totalArticles[0]?.total || 0,
    })
  } catch (err) {
    console.error('GET /api/admin/rss/stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
