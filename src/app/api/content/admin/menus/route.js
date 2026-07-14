/**
 * Menus API — List & Create Menu Items
 *
 * GET  /api/content/admin/menus?type=alert-bar  — list menu items (filtered by type)
 * POST /api/content/admin/menus                  — create a new menu item
 */

import { NextResponse } from 'next/server'
import MenuItem from '@/models/MenuItem'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

// ── GET: List menu items ──────────────────────────────────────────────
export async function GET(req) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const filter = type ? { type } : {}
    const items = await MenuItem.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean()

    return NextResponse.json({ items })
  } catch (err) {
    console.error('[cms] GET /api/content/admin/menus error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// ── POST: Create a new menu item ──────────────────────────────────────
export async function POST(req) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const body = await req.json()

    // Tick items don't require href; only label (text) is needed
    if (!body.type || !body.label) {
      return NextResponse.json(
        { error: 'type and label are required' },
        { status: 400 }
      )
    }

    if (!['alert-bar', 'alert-ticker', 'main-nav', 'services-sub'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be alert-bar, alert-ticker, main-nav, or services-sub' },
        { status: 400 }
      )
    }

    // Auto-assign order if not provided
    if (body.order === undefined || body.order === null) {
      const lastItem = await MenuItem.findOne({ type: body.type })
        .sort({ order: -1 })
        .select('order')
        .lean()

      body.order = (lastItem?.order ?? -1) + 1
    }

    const item =    await MenuItem.create({
      type: body.type,
      label: body.label.trim(),
      href: body.href.trim(),
      order: body.order,
      isActive: body.isActive !== false,
      icon: body.icon || '',
    })

    logActivity({ event: 'menu_create', description: `Created menu item: ${body.label} (${body.type})`, username: admin.username, dashboard: 'cms', target: body.type }).catch(() => {})

    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/menus error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
