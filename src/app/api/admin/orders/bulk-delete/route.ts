import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/orders/bulk-delete
 * Body: { ids: string[] }  — or  { all: true, filter?: {...} }
 * Soft-deletes the matching orders (moves to trash).
 */
export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check delete permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'orders', 'delete', subPerms)
    if (denied) return denied
  }

  try {
    const body = await req.json().catch(() => ({}))
    const orders = await getOrdersCollection()
    const { softDeleteFromNative } = await import('@/lib/trash')

    let filter: any = {}

    if (body?.all) {
      // Build a filter from query params (status / delivery / search)
      const url = new URL(req.url)
      const status = url.searchParams.get('paymentStatus') || ''
      const delivery = url.searchParams.get('deliveryStatus') || ''
      const q = (url.searchParams.get('q') || '').trim()

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
    } else {
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
        return NextResponse.json({ error: 'No valid order ids provided.', invalid }, { status: 400 })
      }
      filter._id = { $in: objectIds }
    }

    // Find matching orders
    const matchingOrders = await orders.find(filter).project({ _id: 1, orderNumber: 1, 'customer.name': 1 }).toArray()
    if (matchingOrders.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No orders matched the filter.',
      })
    }

    // Soft-delete each order
    let deletedCount = 0
    for (const order of matchingOrders) {
      try {
        await softDeleteFromNative(
          'orders',
          'orders',
          String(order._id),
          { username: admin.username, role: admin.role as 'admin' | 'sub-admin' },
          (doc) => (doc as any)?.orderNumber || (doc as any)?.customer?.name || 'Order',
        )
        deletedCount++
      } catch (err) {
        console.error(`Failed to soft-delete order ${order._id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} ${deletedCount === 1 ? 'order' : 'orders'} moved to trash.`,
    })
  } catch (err: any) {
    console.error('POST /api/admin/orders/bulk-delete error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
