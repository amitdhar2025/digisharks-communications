/**
 * Registered Entries Export API
 *
 * GET /api/content/admin/registered/export?search=...&sort=...&form=...
 *
 * Returns an Excel (.xlsx) file with all registered entries.
 * Form data fields are dynamically flattened into columns
 * so every entry's data appears in a single row.
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import Registration from '@/models/Registration'
import RegistrationFormConfig from '@/models/RegistrationFormConfig'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

/** Friendly label map for known formData keys */
const FIELD_LABELS: Record<string, string> = {
  company: 'Company / Organization',
  service: 'Service Interested In',
  preferredContact: 'Preferred Contact Method',
  budget: 'Budget Range',
  hearAbout: 'How Did You Hear About Us?',
  message: 'Message / Comments',
  agreeToTerms: 'Agreed To Terms',
  updatesConsent: 'Consent To Updates',
  fileUpload: 'Uploaded File',
}

function friendlyLabel(key: string): string {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

function formatValue(value: any): string {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

/** Build a column definition for a formData key */
function buildFormDataColumn(key: string): Partial<ExcelJS.Column> {
  return { header: friendlyLabel(key), key: `form_${key}`, width: Math.min(Math.max(friendlyLabel(key).length + 4, 16), 40) }
}

export async function GET(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'newest'
    const formSlug = searchParams.get('form') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const updatedFrom = searchParams.get('updatedFrom') || ''
    const updatedTo = searchParams.get('updatedTo') || ''

    // Build query
    const query: Record<string, any> = {}
    if (formSlug.trim()) {
      query.formSlug = formSlug.trim()
    }

    // Helper to apply a date range on a field
    function applyDateRange(field: string, from: string, to: string) {
      if (!from && !to) return
      const cond: Record<string, Date> = {}
      if (from) {
        const d = new Date(from)
        if (!isNaN(d.getTime())) cond.$gte = d
      }
      if (to) {
        const d = new Date(to)
        if (!isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999)
          cond.$lte = d
        }
      }
      if (Object.keys(cond).length > 0) query[field] = cond
    }

    applyDateRange('createdAt', dateFrom, dateTo)
    applyDateRange('updatedAt', updatedFrom, updatedTo)

    if (search.trim()) {
      const s = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = [
        { fullName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { reference: { $regex: s, $options: 'i' } },
      ]
    }

    const sortField = searchParams.get('sortField') || 'createdAt'
    const allowedSortFields = ['createdAt', 'updatedAt']
    const sf = allowedSortFields.includes(sortField) ? sortField : 'createdAt'
    const sortDir = sort === 'oldest' || sort === 'asc' ? 1 : -1
    const items = await Registration.find(query)
      .sort({ [sf]: sortDir })
      .lean()

    // ── Collect all formData keys across ALL items ────────────────
    const allFormDataKeys = new Set<string>()
    for (const item of items) {
      if (item.formData && typeof item.formData === 'object') {
        Object.keys(item.formData).forEach(k => allFormDataKeys.add(k))
      }
    }
    const sortedKeys = Array.from(allFormDataKeys).sort()

    // ── Build form name map ──────────────────────────────────────
    const formConfigs = await RegistrationFormConfig.find({}).select('slug name').lean()
    const formNameMap: Record<string, string> = {}
    if (Array.isArray(formConfigs)) {
      for (const fc of formConfigs as any[]) {
        formNameMap[fc.slug] = fc.name
      }
    }

    // ── Build Excel Workbook ─────────────────────────────────────
    const workbook = new ExcelJS.Workbook()

    // ── Sheet 1: All entries with dynamic form data columns ──────
    const sheet1 = workbook.addWorksheet('Registered Entries')

    // Static columns
    const staticCols: Partial<ExcelJS.Column>[] = [
      { header: 'Reference', key: 'reference', width: 18 },
      { header: 'Form', key: 'formName', width: 22 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Submitted At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
      { header: 'Email Sent', key: 'emailSent', width: 12 },
    ]

    // Dynamic columns for form data
    const dynamicCols = sortedKeys.map(buildFormDataColumn)

    sheet1.columns = [...staticCols, ...dynamicCols]

    // Style header row
    const headerRow = sheet1.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Add data rows
    for (const item of items) {
      const row: Record<string, any> = {
        reference: item.reference,
        formName: formNameMap[item.formSlug] || item.formSlug || '',
        fullName: item.fullName,
        email: item.email,
        phone: item.phone || '',
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : '',
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : '',
        emailSent: item.emailSent ? 'Yes' : 'No',
      }

      // Populate form data columns
      const formData = item.formData || {}
      for (const key of sortedKeys) {
        row[`form_${key}`] = formatValue(formData[key])
      }

      sheet1.addRow(row)
    }

    // ── Sheet 2: Raw JSON / Debug data ───────────────────────────
    // Only add if there are items with formData
    const itemsWithFormData = items.filter(i => i.formData && Object.keys(i.formData).length > 0)
    if (itemsWithFormData.length > 0) {
      const sheet2 = workbook.addWorksheet('Raw Data (JSON)')
      sheet2.columns = [
        { header: 'Reference', key: 'reference', width: 18 },
        { header: 'Form Slug', key: 'formSlug', width: 20 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Raw Form Data (JSON)', key: 'formDataJson', width: 80 },
      ]

      const h2 = sheet2.getRow(1)
      h2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      h2.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' },
      }

      for (const item of itemsWithFormData) {
        sheet2.addRow({
          reference: item.reference,
          formSlug: item.formSlug || '',
          fullName: item.fullName,
          formDataJson: JSON.stringify(item.formData, null, 2),
        })
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="registered-entries-${new Date().toISOString().slice(0, 10)}.xlsx"`,
        'Content-Length': String((buffer as any).length || Buffer.byteLength(buffer)),
      },
    })
  } catch (err) {
    console.error('[cms] GET /api/content/admin/registered/export error:', err)
    return NextResponse.json(
      { error: 'Failed to export entries' },
      { status: 500 }
    )
  }
}
