/**
 * Menus Reorder API — Batch Update Order
 *
 * PUT /api/content/admin/menus/reorder
 *
 * Body: { items: [{ _id: "...", order: 0 }, ...] }
 *
 * Updates the order field for multiple menu items in a single request.
 * Used by the drag-and-drop reorder UI.
 */

import { NextResponse } from 'next/server'
import MenuItem from '@/models/MenuItem'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'

export const dynamic = 'force-dynamic'

export async function PUT(req) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const body = await req.json()

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 }
      )
    }

    // Update each item's order in parallel
    const ops = body.items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: item.order } },
      },
    }))

    await MenuItem.bulkWrite(ops)

    return NextResponse.json({ success: true, updated: body.items.length })
  } catch (err) {
    console.error('[cms] PUT /api/content/admin/menus/reorder error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to reorder items' },
      { status: 500 }
    )
  }
}
