/**
 * CMS Admin - Registered Entries API
 *
 * GET  /api/content/admin/registered  — list all registrations (paginated)
 * DELETE /api/content/admin/registered — delete all or a specific registration
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import Registration from '@/models/Registration'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const search = (searchParams.get('search') || '').trim()
    const sortDir = searchParams.get('sort') || 'newest'
    const sortField = searchParams.get('sortField') || 'createdAt'
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const updatedFrom = searchParams.get('updatedFrom') || ''
    const updatedTo = searchParams.get('updatedTo') || ''

    // Build sort object — supports createdAt and updatedAt
    const allowedSortFields = ['createdAt', 'updatedAt']
    const field = allowedSortFields.includes(sortField) ? sortField : 'createdAt'
    const direction: 1 | -1 = sortDir === 'oldest' || sortDir === 'asc' ? 1 : -1
    const sortOrder: Record<string, 1 | -1> = { [field]: direction }

    // Build query filter
    const filter: any = {}

    // Filter by form slug
    const formSlug = (searchParams.get('form') || '').trim()
    if (formSlug) {
      filter.formSlug = formSlug
    }

    // Helper to apply a date range on a field
    function applyDateRange(field: string, from: string, to: string) {
      if (!from && !to) return
      const cond: Record<string, Date> = {}
      if (from) {
        const d = new Date(from)
        if (!isNaN(d.getTime())) cond.$gte = d
      }
      if (to) {
        const d = new Date(to)
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999)
          cond.$lte = d
        }
      }
      if (Object.keys(cond).length > 0) filter[field] = cond
    }

    applyDateRange('createdAt', dateFrom, dateTo)
    applyDateRange('updatedAt', updatedFrom, updatedTo)

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ]
    }

    const total = await Registration.countDocuments(filter)
    const pages = Math.ceil(total / limit)

    const items = await Registration.find(filter)
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({ items, total, pages, page })
  } catch (err) {
    console.error('[cms] GET /api/content/admin/registered error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const body = await req.json().catch(() => ({}))

    if (body.id) {
      // Delete single entry
      await Registration.findByIdAndDelete(body.id)
      logActivity({ event: 'registration_delete', description: `Deleted registration entry: ${body.id}`, username: admin.username, dashboard: 'cms', target: 'registration' }).catch(() => {})
      return NextResponse.json({ success: true, message: 'Entry deleted.' })
    }

    if (body.deleteAll) {
      // Delete entries (optionally scoped to form + date ranges)
      const deleteFilter: Record<string, any> = {}
      if (body.form) {
        deleteFilter.formSlug = body.form
      }
      // Apply createdAt date range
      if (body.dateFrom || body.dateTo) {
        const cond: Record<string, Date> = {}
        if (body.dateFrom) {
          const d = new Date(body.dateFrom)
          if (!isNaN(d.getTime())) cond.$gte = d
        }
        if (body.dateTo) {
          const d = new Date(body.dateTo)
          if (!isNaN(d.getTime())) {
            d.setHours(23, 59, 59, 999)
            cond.$lte = d
          }
        }
        if (Object.keys(cond).length > 0) deleteFilter.createdAt = cond
      }
      // Apply updatedAt date range
      if (body.updatedFrom || body.updatedTo) {
        const cond: Record<string, Date> = {}
        if (body.updatedFrom) {
          const d = new Date(body.updatedFrom)
          if (!isNaN(d.getTime())) cond.$gte = d
        }
        if (body.updatedTo) {
          const d = new Date(body.updatedTo)
          if (!isNaN(d.getTime())) {
            d.setHours(23, 59, 59, 999)
            cond.$lte = d
          }
        }
        if (Object.keys(cond).length > 0) deleteFilter.updatedAt = cond
      }
      const result = await Registration.deleteMany(deleteFilter)
      logActivity({ event: 'registration_delete', description: `Deleted ${result.deletedCount} registration entries`, username: admin.username, dashboard: 'cms', target: 'registration' }).catch(() => {})
      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} entries deleted.`,
      })
    }

    return NextResponse.json(
      { error: 'Specify id or deleteAll' },
      { status: 400 }
    )
  } catch (err) {
    console.error('[cms] DELETE /api/content/admin/registered error:', err)
    return NextResponse.json(
      { error: 'Failed to delete entries' },
      { status: 500 }
    )
  }
}
