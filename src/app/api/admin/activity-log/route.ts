/**
 * Activity Log API
 *
 * GET    /api/admin/activity-log — query activity logs with date filtering
 * POST   /api/admin/activity-log — create a new activity log entry
 * DELETE /api/admin/activity-log — clear activity log entries
 *
 * Query params (GET):
 *   page       — page number (default 1)
 *   limit      — items per page (default 50, max 200)
 *   period     — '24h' | '7d' | '30d' | 'all' (default 'all')
 *   event      — filter by event type (optional)
 *   username   — filter by username (optional)
 *   dashboard  — filter by dashboard: 'admin' | 'cms' (optional)
 *   target     — filter by target slug/id (optional)
 *   search     — text search across description, username, target
 *   export     — 'csv' to download results as CSV (optional)
 *
 * DELETE params:
 *   period/event/dashboard/search — same filters to delete matching entries
 *   ids        — comma-separated MongoDB _id values to delete specific entries
 *   all        — set to '1' to delete ALL entries (requires confirm)
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { getAdminFromRequest } from '@/lib/auth'
import ActivityLog, { IActivityLog } from '@/lib/models/ActivityLog'

export const dynamic = 'force-dynamic'

// ── Shared: Build filter from query params ──────────────────────────

async function buildFilter(searchParams: URLSearchParams): Promise<Record<string, any>> {
  const filter: Record<string, any> = {}
  const period = searchParams.get('period') || 'all'
  const event = searchParams.get('event') || ''
  const username = searchParams.get('username') || ''
  const dashboard = searchParams.get('dashboard') || ''
  const target = searchParams.get('target') || ''
  const search = searchParams.get('search') || ''

  if (period && period !== 'all') {
    const now = new Date()
    let from: Date
    switch (period) {
      case '24h':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        from = new Date(0)
    }
    filter.createdAt = { $gte: from }
  }

  if (event) filter.event = event
  if (username) filter.username = username
  if (dashboard) filter.dashboard = dashboard
  if (target) filter.target = target

  if (search.trim()) {
    const s = search.trim()
    filter.$or = [
      { description: { $regex: s, $options: 'i' } },
      { username: { $regex: s, $options: 'i' } },
      { target: { $regex: s, $options: 'i' } },
    ]
  }

  return filter
}

// ── GET: Query activity logs ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const isExport = searchParams.get('export') === 'csv'

    if (isExport) {
      // ── CSV export ──
      const filter = await buildFilter(searchParams)
      const items = await ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .lean()

      const headers = ['Time', 'Event', 'User', 'Dashboard', 'Description', 'Target', 'IP']
      const rows = items.map((item: any) => [
        new Date(item.createdAt).toISOString(),
        item.event,
        item.username,
        item.dashboard,
        item.description,
        item.target || '',
        item.ip || '',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((r: string[]) =>
          r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="activity-log-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    // ── JSON paginated response ──
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const filter = await buildFilter(searchParams)

    const total = await ActivityLog.countDocuments(filter)
    const pages = Math.ceil(total / limit)

    const items = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const eventTypes = await ActivityLog.distinct('event', {})
    const usernames = await ActivityLog.distinct('username', {})

    return NextResponse.json({
      items,
      total,
      pages,
      page,
      eventTypes: eventTypes.sort(),
      usernames: usernames.sort(),
    })
  } catch (err) {
    console.error('[cms] GET /api/admin/activity-log error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

// ── POST: Create a new activity log entry ────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const admin = getAdminFromRequest(req)
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const body = await req.json()

    // Validate required fields
    if (!body.event || !body.description || !body.username) {
      return NextResponse.json(
        { error: 'event, description, and username are required' },
        { status: 400 }
      )
    }

    const log = await ActivityLog.create({
      event: body.event,
      description: body.description,
      username: body.username,
      dashboard: body.dashboard || 'admin',
      target: body.target || '',
      metadata: body.metadata || {},
      ip: body.ip || '',
    })

    return NextResponse.json({ success: true, log })
  } catch (err) {
    console.error('[cms] POST /api/admin/activity-log error:', err)
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
}

// ── DELETE: Clear activity logs ─────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const ids = searchParams.get('ids')
    const deleteAll = searchParams.get('all') === '1'

    let deletedCount: number

    if (ids) {
      // Delete specific entries by _id
      const idArray = ids.split(',').map(id => id.trim()).filter(Boolean)
      const mongoose = await import('mongoose')
      const objectIds = idArray.map(id => new mongoose.Types.ObjectId(id))
      const result = await ActivityLog.deleteMany({ _id: { $in: objectIds } })
      deletedCount = result.deletedCount
    } else if (deleteAll) {
      // Delete ALL entries (must have explicit all=1 flag)
      const result = await ActivityLog.deleteMany({})
      deletedCount = result.deletedCount
    } else {
      // Delete by current filters (period, event, dashboard, search)
      const filter = await buildFilter(searchParams)
      // Require at least one non-trivial filter to prevent accidental full clear
      const hasFilter =
        filter.event ||
        filter.dashboard ||
        filter.target ||
        filter.$or ||
        filter.createdAt
      if (!hasFilter) {
        return NextResponse.json(
          { error: 'Use all=1 to clear all entries, or add filters to clear specific entries' },
          { status: 400 }
        )
      }
      const result = await ActivityLog.deleteMany(filter)
      deletedCount = result.deletedCount
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} ${deletedCount === 1 ? 'entry' : 'entries'} deleted.`,
    })
  } catch (err) {
    console.error('[cms] DELETE /api/admin/activity-log error:', err)
    return NextResponse.json(
      { error: 'Failed to delete activity logs' },
      { status: 500 }
    )
  }
}
