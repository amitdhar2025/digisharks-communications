import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getAllAttacksForExport } from '@/lib/anti-spam'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const attacks = await getAllAttacksForExport()

    // Build CSV
    const headers = ['#', 'Date & Time', 'Reason', 'IP', 'Email', 'Country', 'Code', 'User Agent', 'Form', 'Page URL']
    const rows = attacks.map((a, i) => [
      String(i + 1),
      a.createdAt?.toISOString() || '',
      a.reason,
      a.ip,
      a.email || '',
      a.country || '',
      a.countryCode || '',
      `"${(a.userAgent || '').replace(/"/g, '""')}"`,
      a.formType,
      a.pageUrl || '',
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="security-attacks-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error('GET /api/admin/security/export error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
