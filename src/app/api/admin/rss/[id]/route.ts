import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import connectMongoose from '@/lib/mongoose'
import RssFeed from '@/lib/models/RssFeed'
import { invalidateFeedCache } from '@/lib/rss-fetcher'
import { invalidateNewsCache } from '@/lib/rss-news-cache'
import { softDeleteFromMongoose } from '@/lib/trash'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/admin/rss/[id] — update a feed
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check edit permission for sub-admins
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'rss', 'edit', subPerms)
      if (denied) return denied
    }

    await connectMongoose()
    const { id } = await params

    const existing = await RssFeed.findById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, url, category, status, location } = body

    // Validate URL if provided
    if (url) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }
    }

    // Invalidate old cache if URL changed
    if (url && url !== existing.url) {
      invalidateFeedCache(existing.url)
    }

    const updates: Record<string, any> = {}
    if (name !== undefined) updates.name = name.trim()
    if (url !== undefined) updates.url = url.trim()
    if (category !== undefined) updates.category = category.trim()
    if (status !== undefined) updates.status = status
    if (location !== undefined) updates.location = location

    const feed = await RssFeed.findByIdAndUpdate(id, { $set: updates }, { new: true })
    if (!feed) {
      return NextResponse.json({ error: 'Feed not found after update' }, { status: 404 })
    }

    // Invalidate news cache so changes appear immediately
    invalidateNewsCache()

    return NextResponse.json({ item: feed })
  } catch (err) {
    console.error('PUT /api/admin/rss/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/rss/[id] — delete a feed
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check delete permission for sub-admins
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'rss', 'delete', subPerms)
      if (denied) return denied
    }

    await connectMongoose()
    const { id } = await params

    const feed = await RssFeed.findById(id)
    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 })
    }

    // Soft delete — move to trash
    await softDeleteFromMongoose(
      'rss',
      RssFeed,
      id,
      { username: admin.username, role: admin.role },
      (doc) => (doc as any)?.name || id,
    )

    // Invalidate cache for deleted feed
    invalidateFeedCache(feed.url)
    invalidateNewsCache()

    return NextResponse.json({ success: true, id, message: 'Feed moved to trash.' })
  } catch (err) {
    console.error('DELETE /api/admin/rss/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
