/**
 * GET /api/admin/backups
 *
 * Returns backup history for the admin dashboard.
 * Protected — requires admin authentication (either main admin or CMS admin).
 *
 * Query params:
 *   period   — 'daily' | 'monthly' | 'all' (default: 'all')
 *   limit    — max records to return (default: 20)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { connectCMSDb } from '@/lib/db-cms'
import BackupRecord from '@/lib/models/BackupRecord'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // ── Auth check ──
  const admin = getAdminFromRequest(req)
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'all'
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10))

    const filter: Record<string, any> = {}
    if (period !== 'all') {
      filter.period = period
    }

    const items = await BackupRecord.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Also return stats
    const total = await BackupRecord.countDocuments({})
    const dailyCount = await BackupRecord.countDocuments({ period: 'daily' })
    const monthlyCount = await BackupRecord.countDocuments({ period: 'monthly' })
    const lastBackup = items.length > 0 ? items[0] : null

    return NextResponse.json({
      items,
      stats: {
        total,
        dailyCount,
        monthlyCount,
        lastBackup,
      },
    })
  } catch (err) {
    console.error('[backups] GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch backup history' },
      { status: 500 }
    )
  }
}
