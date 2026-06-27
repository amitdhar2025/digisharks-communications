import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'

export const dynamic = 'force-dynamic'

// GET /api/admin/career/applications/export - Export all applications as CSV (Excel compatible)
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const jobId = searchParams.get('jobId')

    const query: any = {}
    if (status && status !== 'all') query.status = status
    if (jobId && jobId !== 'all') query.jobId = jobId

    const applications = await CareerApplication.find(query)
      .populate('jobId', 'title slug category location')
      .sort({ createdAt: -1 })
      .lean()

    // CSV header row (Excel friendly)
    const headers = [
      'S.No',
      'Applicant Name',
      'Email',
      'Phone',
      'Job Applied For',
      'Job Category',
      'Job Location',
      'Status',
      'Resume URL',
      'Cover Letter',
      'Admin Notes',
      'Applied On',
      'Status Updated At',
    ]

    const escape = (val: any): string => {
      if (val === null || val === undefined) return ''
      let s = String(val)
      // Prevent CSV formula injection
      if (/^[=+\-@]/.test(s)) s = "'" + s
      // Escape quotes and wrap in quotes if contains comma/newline/quote
      if (/[",\n\r]/.test(s)) {
        s = '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }

    const fmt = (d: any) => {
      if (!d) return ''
      try {
        const date = new Date(d)
        if (isNaN(date.getTime())) return ''
        return date.toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      } catch { return '' }
    }

    const rows = applications.map((a: any, idx: number) => [
      idx + 1,
      escape(a.applicantName),
      escape(a.email),
      escape(a.phone),
      escape(a.jobId?.title || ''),
      escape(a.jobId?.category || ''),
      escape(a.jobId?.location || ''),
      escape(a.status || ''),
      escape(a.resumeUrl || ''),
      escape(a.coverLetter || ''),
      escape(a.adminNotes || ''),
      fmt(a.createdAt),
      fmt(a.statusUpdatedAt),
    ])

    // Add BOM so Excel detects UTF-8 properly
    const bom = '\uFEFF'
    const csv = bom + [headers, ...rows].map((r) => r.map(escape).join(',')).join('\r\n')

    const filename = `career-applicants-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('GET /api/admin/career/applications/export error', err)
    return NextResponse.json({ error: err.message || 'Failed to export applications' }, { status: 500 })
  }
}
