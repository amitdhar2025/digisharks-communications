import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { getAdminFromRequest } from '@/lib/auth'
import { getQueriesCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

function statusLabel(s: string) {
  if (s === 'follow-up') return 'Follow-up'
  if (s === 'completed') return 'Completed'
  return 'Pending'
}

function fmtDate(d: any) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const status = searchParams.get('status')

  const collection = await getQueriesCollection()
  const filter: any = {}
  if (id) {
    try {
      const { ObjectId } = await import('mongodb')
      filter._id = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
  }
  if (status && status !== 'all') {
    filter.status = status
  }

  const items = await collection.find(filter).sort({ createdAt: -1 }).toArray()

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Digisharks Admin'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Contact Queries', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'ID', key: 'id', width: 26 },
    { header: 'Full Name', key: 'fullName', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Service', key: 'service', width: 22 },
    { header: 'Message', key: 'message', width: 50 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Comments Count', key: 'commentsCount', width: 14 },
    { header: 'Comments', key: 'comments', width: 60 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Updated At', key: 'updatedAt', width: 20 },
  ]

  // style header
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' },
  }
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
  sheet.getRow(1).height = 22

  items.forEach((q: any) => {
    const comments = (q.comments || []) as any[]
    const commentsText = comments
      .map((c) => `[${fmtDate(c.createdAt)}] ${c.author}: ${c.text}`)
      .join('\n')

    sheet.addRow({
      id: q._id?.toString() || '',
      fullName: q.fullName || '',
      email: q.email || '',
      phone: q.phone || '',
      service: q.service || '',
      message: q.message || '',
      status: statusLabel(q.status),
      commentsCount: comments.length,
      comments: commentsText,
      createdAt: fmtDate(q.createdAt),
      updatedAt: fmtDate(q.updatedAt),
    })
  })

  // wrap text on long columns
  ;['message', 'comments'].forEach((key) => {
    sheet.getColumn(key).alignment = { wrapText: true, vertical: 'top' }
  })

  const filename = id
    ? `query-${id}.xlsx`
    : `queries-${new Date().toISOString().substring(0, 10)}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
