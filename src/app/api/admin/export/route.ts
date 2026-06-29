import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import ExcelJS from 'exceljs'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getQueriesCollection, getSubAdminsCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Return the sub-admin's allowed query categories (services they can export).
 * Empty array = no access. Only meaningful for sub-admins.
 */
async function getSubAdminQueryCategories(subAdminId: string): Promise<string[]> {
  try {
    const col = await getSubAdminsCollection()
    const sub = await col.findOne({ _id: new ObjectId(subAdminId) })
    if (!sub) return []
    return Array.isArray(sub.queryCategories) ? sub.queryCategories : []
  } catch {
    return []
  }
}

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

  // Sub-admin: enforce export permission + category restriction
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    const subPerms = await getSubAdminPermissions(admin.subAdminId)
    const denied = await requirePermission(admin, 'queries', 'export', subPerms)
    if (denied) return denied
  }

  const collection = await getQueriesCollection()
  const filter: any = {}

  // Resolve sub-admin allowed categories (empty = no access)
  let allowedCategories: string[] | null = null
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    allowedCategories = await getSubAdminQueryCategories(admin.subAdminId)
    if (allowedCategories.length === 0) {
      // Empty allow-list => deny export entirely
      return NextResponse.json(
        { error: 'No categories assigned to your account. Contact a super admin to be granted categories.' },
        { status: 403 },
      )
    }
  }

  if (id) {
    try {
      filter._id = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
  }
  if (status && status !== 'all') {
    filter.status = status
  }
  if (allowedCategories !== null) {
    // Sub-admin: enforce that single-id export is also within their categories.
    if (id) {
      // Need to also match the service category. Defer final decision below.
    } else {
      filter.service = { $in: allowedCategories }
    }
  }
  const items = await collection.find(filter).sort({ createdAt: -1 }).toArray()

  // Single-id export: still filter by category restriction
  if (id && allowedCategories !== null) {
    const filtered = items.filter((q) => allowedCategories!.includes(q.service))
    if (filtered.length === 0) {
      return NextResponse.json(
        { error: 'You do not have permission to export this query.' },
        { status: 403 },
      )
    }
  }

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
