import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/orders/[id]/status
 * Body: { deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered', deliveryDate?: string, trackingNotes?: string }
 * Updates the delivery status, delivery date, and tracking notes of an order.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check edit permission for sub-admins
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'orders', 'edit', subPerms)
      if (denied) return denied
    }
    const { id } = await params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))

    const updateFields: Record<string, any> = { updatedAt: new Date() }

    if (body.deliveryStatus !== undefined) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered']
      if (!validStatuses.includes(body.deliveryStatus)) {
        return NextResponse.json({
          error: `deliveryStatus must be one of: ${validStatuses.join(', ')}`
        }, { status: 400 })
      }
      updateFields.deliveryStatus = body.deliveryStatus
    }

    if (body.deliveryDate !== undefined) {
      updateFields.deliveryDate = body.deliveryDate
    }

    if (body.trackingNotes !== undefined) {
      updateFields.trackingNotes = body.trackingNotes
    }

    const orders = await getOrdersCollection()
    const res = await orders.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    if (!res) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      deliveryStatus: res.deliveryStatus,
      deliveryDate: res.deliveryDate || null,
      trackingNotes: res.trackingNotes || null,
    })
  } catch (err: any) {
    console.error('PATCH /api/admin/orders/[id]/status error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
