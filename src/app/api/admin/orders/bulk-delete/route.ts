import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest } from '@/lib/auth'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/orders/bulk-delete
 * Body: { ids: string[] }  — or  { all: true, filter?: {...} }
 * Permanently deletes the matching orders.
 */
export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const orders = await getOrdersCollection()

    if (body?.all) {
      // Build a filter from query params (status / delivery / search) and
      // delete every matching order.
      const url = new URL(req.url)
      const status = url.searchParams.get('paymentStatus') || ''
      const delivery = url.searchParams.get('deliveryStatus') || ''
      const q = (url.searchParams.get('q') || '').trim()

      const filter: any = {}
      if (status === 'paid' || status === 'failed' || status === 'created') {
        filter['payment.status'] = status
      }
      if (delivery === 'not_yet' || delivery === 'received') {
        filter.deliveryStatus = delivery
      }
      if (q) {
        const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        filter.$or = [
          { orderNumber: { $regex: safe, $options: 'i' } },
          { 'customer.email': { $regex: safe, $options: 'i' } },
          { 'customer.phone': { $regex: safe, $options: 'i' } },
          { 'customer.name': { $regex: safe, $options: 'i' } },
        ]
      }

      const matched = await orders.countDocuments(filter)
      if (matched === 0) {
        return NextResponse.json({
          success: true,
          deletedCount: 0,
          message: 'No orders matched the filter.',
        })
      }
      const result = await orders.deleteMany(filter)
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Deleted ${result.deletedCount} ${result.deletedCount === 1 ? 'order' : 'orders'}.`,
      })
    }

    // Bulk delete by ids
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Provide either { all: true } or { ids: [...] }.' },
        { status: 400 }
      )
    }

    const objectIds: ObjectId[] = []
    const invalid: string[] = []
    for (const id of ids) {
      if (typeof id === 'string' && ObjectId.isValid(id)) {
        objectIds.push(new ObjectId(id))
      } else {
        invalid.push(String(id))
      }
    }
    if (objectIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid order ids provided.', invalid },
        { status: 400 }
      )
    }

    const result = await orders.deleteMany({ _id: { $in: objectIds } })
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      requested: ids.length,
      invalid,
      message: `Deleted ${result.deletedCount} of ${ids.length} ${ids.length === 1 ? 'order' : 'orders'}.`,
    })
  } catch (err: any) {
    console.error('POST /api/admin/orders/bulk-delete error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
