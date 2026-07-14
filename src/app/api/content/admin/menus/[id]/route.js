/**
 * Single Menu Item API — Update & Delete
 *
 * PUT    /api/content/admin/menus/:id  — update a menu item
 * DELETE /api/content/admin/menus/:id  — delete a menu item
 */

import { NextResponse } from 'next/server'
import MenuItem from '@/models/MenuItem'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

// ── PUT: Update a menu item ───────────────────────────────────────────
export async function PUT(req, { params }) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const { id } = await params
    const body = await req.json()

    const updateFields = {}
    if (body.label !== undefined) updateFields.label = body.label.trim()
    if (body.href !== undefined) updateFields.href = body.href.trim()
    if (body.order !== undefined) updateFields.order = body.order
    if (body.isActive !== undefined) updateFields.isActive = body.isActive
    if (body.icon !== undefined) updateFields.icon = body.icon
    if (body.type !== undefined) {
      if (!['alert-bar', 'alert-ticker', 'main-nav', 'services-sub'].includes(body.type)) {
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        )
      }
      updateFields.type = body.type
    }

    const updated = await MenuItem.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    logActivity({ event: 'menu_update', description: `Updated menu item: ${updated.label}`, username: admin.username, dashboard: 'cms', target: updated.type }).catch(() => {})
    return NextResponse.json({ item: updated })
  } catch (err) {
    console.error('[cms] PUT /api/content/admin/menus/[id] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

// ── DELETE: Delete a menu item ────────────────────────────────────────
export async function DELETE(req, { params }) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const { id } = await params

    const deleted = await MenuItem.findByIdAndDelete(id).lean()

    if (!deleted) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    logActivity({ event: 'menu_delete', description: `Deleted menu item: ${deleted.label} (${deleted.type})`, username: admin.username, dashboard: 'cms', target: deleted.type }).catch(() => {})
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cms] DELETE /api/content/admin/menus/[id] error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
