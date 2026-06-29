import { NextRequest, NextResponse } from 'next/server'
import { getLoginLogsCollection } from '@/lib/db'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/login-logs/export
 * Download login logs as a CSV file (Excel-compatible).
 */
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const col = await getLoginLogsCollection()
    const items = await col.find({})
      .sort({ loginTime: -1 })
      .toArray()

    // CSV header
    const headers = [
      'Username',
      'Role',
      'IP Address',
      'Country',
      'State/Region',
      'City',
      'ISP',
      'Login Time',
      'Logout Time',
      'Session Duration (min)',
      'Blocked IP',
      'Blocked User',
      'User Agent',
    ]

    const rows = items.map((item) => {
      const loginTime = item.loginTime ? new Date(item.loginTime) : null
      const logoutTime = item.logoutTime ? new Date(item.logoutTime) : null
      let duration = ''
      if (loginTime && logoutTime) {
        duration = String(Math.round((logoutTime.getTime() - loginTime.getTime()) / 60000))
      } else if (loginTime) {
        duration = 'Still active'
      }

      return [
        escapeCsv(item.username),
        item.role,
        item.ip,
        escapeCsv(item.country),
        escapeCsv(item.region),
        escapeCsv(item.city),
        escapeCsv(item.isp),
        loginTime ? loginTime.toISOString() : '',
        logoutTime ? logoutTime.toISOString() : '',
        duration,
        item.blockedIp ? 'Yes' : 'No',
        item.blockedUser ? 'Yes' : 'No',
        escapeCsv(item.userAgent),
      ].join(',')
    })

    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n') // BOM for Excel

    const filename = `login-logs-${new Date().toISOString().substring(0, 10)}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to export login logs' }, { status: 500 })
  }
}

function escapeCsv(val: string | undefined | null): string {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}
