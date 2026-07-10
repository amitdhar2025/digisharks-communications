import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/reports/stats
 * Returns revenue breakdown by period, best-selling products, and summary stats.
 * Query params:
 *   period=daily|weekly|monthly|all   (default: monthly)
 *   months=number                     (default: 12, how many months back to aggregate)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'reports', 'view', subPerms)
      if (denied) return denied
    }

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'monthly'
    const monthsBack = parseInt(url.searchParams.get('months') || '12', 10)

    const orders = await getOrdersCollection()
    const now = new Date()
    const since = new Date(now)
    since.setMonth(since.getMonth() - monthsBack)
    since.setHours(0, 0, 0, 0)

    // Match only paid orders within the date range
    const matchStage = {
      $match: {
        'payment.status': 'paid',
        createdAt: { $gte: since },
      },
    }

    // --- Revenue by period ---
    let dateGroup: any
    switch (period) {
      case 'daily':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        }
        break
      case 'weekly': {
        // Use ISO week number
        dateGroup = {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' },
        }
        break
      }
      case 'all':
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        }
        break
      case 'monthly':
      default:
        dateGroup = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        }
        break
    }

    const revenueByPeriod = await orders
      .aggregate([
        matchStage,
        {
          $group: {
            _id: dateGroup,
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 },
            itemsSold: { $sum: { $sum: '$items.qty' } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
      ])
      .toArray()

    // --- Best-selling products (aggregate all paid orders) ---
    const bestSellers = await orders
      .aggregate([
        matchStage,
        { $unwind: '$items' },
        {
          $group: {
            _id: { slug: '$items.slug', title: '$items.title' },
            totalQty: { $sum: '$items.qty' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
            orderCount: { $addToSet: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            slug: '$_id.slug',
            title: '$_id.title',
            totalQty: 1,
            totalRevenue: 1,
            orderCount: { $size: '$orderCount' },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 20 },
      ])
      .toArray()

    // --- Summary stats (paid orders in range) ---
    const summaryAgg = await orders
      .aggregate([
        matchStage,
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalOrders: { $sum: 1 },
            totalItemsSold: { $sum: { $sum: '$items.qty' } },
            avgOrderValue: { $avg: '$amount' },
          },
        },
      ])
      .toArray()

    // --- Status breakdown (all time) ---
    const statusBreakdown = await orders
      .aggregate([
        { $match: { 'payment.status': 'paid' } },
        {
          $group: {
            _id: '$deliveryStatus',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // --- Revenue by day for chart (last 30 or last N) ---
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60)

    const dailyRevenue = await orders
      .aggregate([
        {
          $match: {
            'payment.status': 'paid',
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ])
      .toArray()

    const summary = summaryAgg[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalItemsSold: 0,
      avgOrderValue: 0,
    }

    // Format the revenue periods into label/value pairs
    const formatLabel = (id: any) => {
      if (period === 'daily') {
        const d = new Date(id.year, id.month - 1, id.day)
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      }
      if (period === 'weekly') {
        return `W${id.week} ${id.year}`
      }
      // monthly
      const d = new Date(id.year, id.month - 1, 1)
      return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue: summary.totalRevenue,
        totalOrders: summary.totalOrders,
        totalItemsSold: summary.totalItemsSold,
        avgOrderValue: Math.round(summary.avgOrderValue),
      },
      revenueByPeriod: revenueByPeriod.map((r: any) => ({
        label: formatLabel(r._id),
        revenue: r.revenue,
        orders: r.orders,
        itemsSold: r.itemsSold || 0,
      })),
      bestSellers: bestSellers.map((p: any) => ({
        slug: p.slug,
        title: p.title,
        totalQty: p.totalQty,
        totalRevenue: p.totalRevenue,
        orderCount: p.orderCount,
      })),
      statusBreakdown: statusBreakdown.map((s: any) => ({
        status: s._id,
        count: s.count,
      })),
      dailyRevenue: dailyRevenue.map((r: any) => ({
        date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
        revenue: r.revenue,
        orders: r.orders,
      })),
    })
  } catch (err: any) {
    console.error('GET /api/admin/reports/stats error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
