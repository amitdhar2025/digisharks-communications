import { NextRequest, NextResponse } from 'next/server'
import { getLoginLogsCollection } from '@/lib/db'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const LIMIT = 25

/**
 * GET /api/admin/login-logs
 * List login logs with pagination, search, and filtering.
 */
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const search = (searchParams.get('search') || '').trim()
    const status = searchParams.get('status') || 'all' // all, active, blocked-ip, blocked-user
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(LIMIT))))

    const col = await getLoginLogsCollection()

    // Build filter
    const filter: Record<string, any> = {}

    if (search) {
      const regex = { $regex: search, $options: 'i' }
      filter.$or = [
        { username: regex },
        { ip: regex },
        { country: regex },
        { region: regex },
        { city: regex },
        { isp: regex },
      ]
    }

    if (status === 'blocked-ip') {
      filter.blockedIp = true
    } else if (status === 'blocked-user') {
      filter.blockedUser = true
    }

    const [items, total] = await Promise.all([
      col.find(filter)
        .sort({ loginTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      col.countDocuments(filter),
    ])

    // Stats
    const [totalAll, blockedIpCount, blockedUserCount, activeSessions] = await Promise.all([
      col.countDocuments(),
      col.countDocuments({ blockedIp: true }),
      col.countDocuments({ blockedUser: true }),
      col.countDocuments({ logoutTime: { $exists: false } }),
    ])

    const serialized = items.map((item) => ({
      _id: String(item._id),
      username: item.username,
      role: item.role,
      ip: item.ip,
      country: item.country,
      region: item.region,
      city: item.city,
      isp: item.isp,
      userAgent: item.userAgent,
      loginTime: item.loginTime?.toISOString() || null,
      logoutTime: item.logoutTime?.toISOString() || null,
      blockedIp: item.blockedIp || false,
      blockedUser: item.blockedUser || false,
      blockedAt: item.blockedAt?.toISOString() || null,
      blockedBy: item.blockedBy || null,
    }))

    return NextResponse.json({
      items: serialized,
      total,
      pages: Math.ceil(total / limit),
      page,
      stats: {
        total: totalAll,
        activeSessions,
        blockedIps: blockedIpCount,
        blockedUsers: blockedUserCount,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load login logs' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/login-logs
 * Delete all login logs (super admin only).
 */
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const col = await getLoginLogsCollection()
    const result = await col.deleteMany({})
    return NextResponse.json({
      success: true,
      deleted: result.deletedCount || 0,
      message: `Deleted ${result.deletedCount || 0} login log(s).`,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 })
  }
}
