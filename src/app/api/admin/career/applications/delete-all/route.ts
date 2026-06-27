import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/career/applications/delete-all - Delete ALL applications
// Optional filters via query params: status, jobId (must be JSON-stringified object)
export async function DELETE(req: NextRequest) {
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

    const count = await CareerApplication.countDocuments(query)
    if (count === 0) {
      return NextResponse.json({ success: true, deletedCount: 0, message: 'No applications matched the filter.' })
    }

    const result = await CareerApplication.deleteMany(query)
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `Deleted ${result.deletedCount || 0} application(s).`,
    })
  } catch (err: any) {
    console.error('DELETE /api/admin/career/applications/delete-all error', err)
    return NextResponse.json({ error: err.message || 'Failed to delete applications' }, { status: 500 })
  }
}
