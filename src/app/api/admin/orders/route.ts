import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/orders
 * Lists digital-product orders plus summary stats.
 * Optional query: ?deliveryStatus=not_yet|received
 *                 ?q=search (matches orderNumber, email, phone, name)
 *                 ?sort=date_desc|date_asc|amount_desc|amount_asc
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const deliveryStatus = url.searchParams.get('deliveryStatus') || ''
    const q = (url.searchParams.get('q') || '').trim()
    const sort = url.searchParams.get('sort') || 'date_desc'

    const filter: any = {}
    if (deliveryStatus === 'not_yet' || deliveryStatus === 'received') {
      filter.deliveryStatus = deliveryStatus
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

    let sortSpec: any = { createdAt: -1 }
    switch (sort) {
      case 'date_asc':
        sortSpec = { createdAt: 1 }
        break
      case 'amount_desc':
        sortSpec = { amount: -1 }
        break
      case 'amount_asc':
        sortSpec = { amount: 1 }
        break
      default:
        sortSpec = { createdAt: -1 }
    }

    const orders = await getOrdersCollection()
    const [list, paidStats, deliveredStats, totalRevenue, totalItemsSold, totalOrders] =
      await Promise.all([
        orders.find(filter).sort(sortSpec).limit(500).toArray(),
        orders.countDocuments({ 'payment.status': 'paid' }),
        orders.countDocuments({ 'payment.status': 'paid', deliveryStatus: 'received' }),
        orders
          .aggregate<{ _id: null; total: number }>([
            { $match: { 'payment.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ])
          .toArray(),
        orders
          .aggregate<{ _id: null; qty: number }>([
            { $match: { 'payment.status': 'paid' } },
            { $group: { _id: null, qty: { $sum: { $sum: '$items.qty' } } } },
          ])
          .toArray(),
        orders.countDocuments({}),
      ])

    return NextResponse.json({
      success: true,
      stats: {
        totalProductsSold: totalItemsSold[0]?.qty || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        paidOrders: paidStats,
        deliveredOrders: deliveredStats,
        pendingDelivery: paidStats - deliveredStats,
      },
      orders: list.map((o) => ({
        _id: o._id?.toString(),
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        customer: o.customer,
        items: o.items,
        amount: o.amount,
        currency: o.currency,
        payment: o.payment,
        deliveryStatus: o.deliveryStatus,
        emailSent: !!o.emailSent,
        emailSentAt: o.emailSentAt || null,
        emailError: o.emailError || null,
      })),
    })
  } catch (err: any) {
    console.error('GET /api/admin/orders error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
