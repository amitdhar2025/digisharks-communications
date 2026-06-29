import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import connectMongoose from '@/lib/mongoose'
import RssFeed from '@/lib/models/RssFeed'
import { invalidateFeedCache } from '@/lib/rss-fetcher'
import { invalidateNewsCache } from '@/lib/rss-news-cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/rss — list all feeds with sorted, paginated results
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check view permission for sub-admins
    if (!isSuperAdmin(admin) && admin.subAdminId) {
      const subPerms = await getSubAdminPermissions(admin.subAdminId)
      const denied = await requirePermission(admin, 'rss', 'view', subPerms)
      if (denied) return denied
    }

    await connectMongoose()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sort') || 'createdAt'
    const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Build query filter
    const filter: Record<string, any> = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    const allowedSortFields = ['name', 'category', 'status', 'createdAt', 'updatedAt']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

    const [feeds, total] = await Promise.all([
      RssFeed.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      RssFeed.countDocuments(filter),
    ])

    const totalActive = await RssFeed.countDocuments({ status: 'active' })
    const distinctCats = await RssFeed.distinct('category')

    return NextResponse.json({
      items: feeds,
      total,
      totalActive,
      categories: distinctCats,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('GET /api/admin/rss error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/rss — add a new feed
 */
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check create permission for sub-admins
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'rss', 'create', subPerms)
      if (denied) return denied
    }

    await connectMongoose()

    const body = await req.json()
    const { name, url, category, status, location } = body

    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const feed = await RssFeed.create({
      name: name.trim(),
      url: url.trim(),
      category: category?.trim() || 'General',
      status: status || 'active',
      location: location || 'both',
    })

    // Invalidate news page cache so new feed appears immediately
    invalidateNewsCache()

    return NextResponse.json({ item: feed }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/rss error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
