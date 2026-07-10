import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getOrdersCollection } from '@/lib/products'

export const dynamic = 'force-dynamic'

function fmtDate(d: any) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function buildCsv(rows: any[]): string {
  const headers = [
    'Order Number',
    'Created At',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Company',
    'GSTIN',
    'Items',
    'Amount (INR)',
    'Currency',
    'Payment Provider',
    'Payment Status',
    'Razorpay Order ID',
    'Razorpay Payment ID',
    'Delivery Status',
    'Email Sent',
    'Email Sent At',
    'Email Error',
  ]
  const lines: string[] = [headers.map(csvEscape).join(',')]
  for (const o of rows) {
    const items = (o.items || [])
      .map((it: any) => `${it.title} × ${it.qty}`)
      .join(' | ')
    lines.push(
      [
        o.orderNumber,
        fmtDate(o.createdAt),
        o.customer?.name,
        o.customer?.email,
        o.customer?.phone,
        o.customer?.company,
        o.customer?.gst,
        items,
        o.amount,
        o.currency,
        o.payment?.provider,
        o.payment?.status,
        o.payment?.razorpayOrderId,
        o.payment?.razorpayPaymentId,
        o.deliveryStatus,
        o.emailSent ? 'yes' : 'no',
        fmtDate(o.emailSentAt),
        o.emailError,
      ]
        .map(csvEscape)
        .join(',')
    )
  }
  // Excel-friendly BOM so non-ASCII renders correctly
  return '\uFEFF' + lines.join('\r\n')
}

function statusLabel(s: any): string {
  if (!s) return ''
  const v = String(s)
  return v.charAt(0).toUpperCase() + v.slice(1)
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check view permission for sub-admins
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    const subPerms = await getSubAdminPermissions(admin.subAdminId)
    const denied = await requirePermission(admin, 'orders', 'view', subPerms)
    if (denied) return denied
  }

  const { searchParams } = new URL(req.url)
  const format = (searchParams.get('format') || 'xlsx').toLowerCase()
  const id = searchParams.get('id')
  const status = searchParams.get('paymentStatus') || ''
  const delivery = searchParams.get('deliveryStatus') || ''
  const q = (searchParams.get('q') || '').trim()

  const collection = await getOrdersCollection()
  const filter: any = {}
  if (id && ObjectId.isValid(id)) {
    filter._id = new ObjectId(id)
  }
  if (status === 'paid' || status === 'failed' || status === 'created') {
    filter['payment.status'] = status
  }
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered']
  if (validStatuses.includes(delivery)) {
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

  const items = await collection.find(filter).sort({ createdAt: -1 }).toArray()

  const today = new Date().toISOString().substring(0, 10)
  const baseFilename = id
    ? `order-${id}`
    : `orders-${today}`

  if (format === 'csv') {
    const csv = buildCsv(items)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseFilename}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  // xlsx (default)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Digisharks Admin'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet('Orders', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'Order #', key: 'orderNumber', width: 22 },
    { header: 'Date', key: 'createdAt', width: 20 },
    { header: 'Customer', key: 'customerName', width: 22 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Company', key: 'company', width: 22 },
    { header: 'GSTIN', key: 'gst', width: 18 },
    { header: 'Items', key: 'items', width: 40 },
    { header: 'Amount (INR)', key: 'amount', width: 14 },
    { header: 'Payment', key: 'payment', width: 12 },
    { header: 'Rzp Order', key: 'rzpOrder', width: 24 },
    { header: 'Rzp Payment', key: 'rzpPay', width: 24 },
    { header: 'Delivery', key: 'delivery', width: 12 },
    { header: 'Email Sent', key: 'emailSent', width: 12 },
    { header: 'Email At', key: 'emailAt', width: 20 },
  ]

  // Header style
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' },
  }
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
  sheet.getRow(1).height = 22

  for (const o of items) {
    sheet.addRow({
      orderNumber: o.orderNumber,
      createdAt: fmtDate(o.createdAt),
      customerName: o.customer?.name || '',
      email: o.customer?.email || '',
      phone: o.customer?.phone || '',
      company: o.customer?.company || '',
      gst: o.customer?.gst || '',
      items: (o.items || [])
        .map((it: any) => `${it.title} × ${it.qty}`)
        .join(' | '),
      amount: o.amount,
      payment: statusLabel(o.payment?.status),
      rzpOrder: o.payment?.razorpayOrderId || '',
      rzpPay: o.payment?.razorpayPaymentId || '',
      delivery: statusLabel(o.deliveryStatus),
      emailSent: o.emailSent ? 'yes' : 'no',
      emailAt: fmtDate(o.emailSentAt),
    })
  }

  sheet.getColumn('items').alignment = { wrapText: true, vertical: 'top' }
  sheet.getColumn('email').alignment = { wrapText: true, vertical: 'top' }

  // Summary sheet
  const totalRevenue = items
    .filter((o) => o.payment?.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0)
  const totalItems = items
    .filter((o) => o.payment?.status === 'paid')
    .reduce((sum, o) => sum + (o.items || []).reduce((s, it) => s + (it.qty || 0), 0), 0)
  const paidCount = items.filter((o) => o.payment?.status === 'paid').length
  const deliveredCount = items.filter(
    (o) => o.payment?.status === 'paid' && o.deliveryStatus === 'delivered'
  ).length

  const summary = workbook.addWorksheet('Summary')
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 24 },
    { header: 'Value', key: 'value', width: 18 },
  ]
  summary.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summary.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' },
  }
  summary.addRow({ metric: 'Total orders', value: items.length })
  summary.addRow({ metric: 'Paid orders', value: paidCount })
  summary.addRow({ metric: 'Delivered orders', value: deliveredCount })
  summary.addRow({ metric: 'Total products sold', value: totalItems })
  summary.addRow({ metric: 'Total revenue (INR)', value: totalRevenue })

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${baseFilename}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
