import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest } from '@/lib/auth'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/orders/[id]/status
 * Body: { deliveryStatus: 'not_yet' | 'received' }
 * Manually flips the delivery status of an order.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const next = body?.deliveryStatus
    if (next !== 'not_yet' && next !== 'received') {
      return NextResponse.json({ error: 'deliveryStatus must be not_yet or received.' }, { status: 400 })
    }

    const orders = await getOrdersCollection()
    const res = await orders.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { deliveryStatus: next, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!res) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, deliveryStatus: res.deliveryStatus })
  } catch (err: any) {
    console.error('PATCH /api/admin/orders/[id]/status error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
