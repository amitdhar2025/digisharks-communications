/**
 * Public Menus API — No auth required
 *
 * GET /api/public/menus?type=alert-bar  — fetch active menu items by type
 *
 * Frontend components (AlertBar, Navigation) call this to get editable menus.
 */

import { NextResponse } from 'next/server'
import MenuItem from '@/models/MenuItem'
import { connectCMSDb } from '@/lib/db-cms'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: 'type query parameter is required' },
        { status: 400 }
      )
    }

    if (!['alert-bar', 'alert-ticker', 'main-nav', 'services-sub'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be alert-bar, alert-ticker, main-nav, or services-sub' },
        { status: 400 }
      )
    }

    const items = await MenuItem.find({ type, isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('label href order icon')
      .lean()

    return NextResponse.json({ items })
  } catch (err) {
    console.error('[public] GET /api/public/menus error:', err)
    // Return empty array on error so frontend doesn't break
    return NextResponse.json({ items: [] })
  }
}
