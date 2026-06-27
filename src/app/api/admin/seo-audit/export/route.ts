import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { getAdminFromRequest } from '@/lib/auth'
import { exportAudits } from '@/lib/seo-audit'

export const dynamic = 'force-dynamic'

function fmtDate(d: any) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await exportAudits()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Digisharks Admin'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('SEO Audits', {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    sheet.columns = [
      { header: 'Full Name', key: 'userName', width: 22 },
      { header: 'Email Address', key: 'userEmail', width: 28 },
      { header: 'Phone Number', key: 'userPhone', width: 18 },
      { header: 'Website URL', key: 'url', width: 36 },
      { header: 'Domain', key: 'domain', width: 24 },
      { header: 'Result', key: 'overall', width: 10 },
      { header: 'Checks Count', key: 'checksCount', width: 14 },
      { header: 'Date', key: 'createdAt', width: 20 },
    ]

    // Style header
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0EA5E9' },
    }
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
    sheet.getRow(1).height = 22

    items.forEach((item) => {
      sheet.addRow({
        userName: item.userName || '',
        userEmail: item.userEmail || '',
        userPhone: item.userPhone || '',
        url: item.url || '',
        domain: item.domain || '',
        overall: item.overall?.toUpperCase() || '',
        checksCount: item.checks?.length || 0,
        createdAt: fmtDate(item.createdAt),
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="seo-audits-${new Date().toISOString().substring(0, 10)}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('Export SEO audits error:', err)
    return NextResponse.json({ error: 'Failed to export audits' }, { status: 500 })
  }
}
