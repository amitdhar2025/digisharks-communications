import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/career/applications/delete-all - Soft-delete ALL applications
// Optional filters via query params: status, jobId (must be JSON-stringified object)
export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check delete permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'career', 'delete', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const jobId = searchParams.get('jobId')

    const query: any = {}
    if (status && status !== 'all') query.status = status
    if (jobId && jobId !== 'all') query.jobId = jobId

    const applications = await CareerApplication.find(query).select('_id').lean()
    if (applications.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0, message: 'No applications matched the filter.' })
    }

    const { softDeleteFromMongoose } = await import('@/lib/trash')
    let deletedCount = 0
    for (const app of applications) {
      try {
        await softDeleteFromMongoose(
          'careerapplications',
          CareerApplication,
          String(app._id),
          { username: admin.username, role: admin.role },
          (doc) => (doc as any)?.applicantName || (doc as any)?.email || String(app._id),
        )
        deletedCount++
      } catch (err) {
        console.error(`Failed to soft-delete application ${app._id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} application(s) moved to trash.`,
    })
  } catch (err: any) {
    console.error('DELETE /api/admin/career/applications/delete-all error', err)
    return NextResponse.json({ error: err.message || 'Failed to delete applications' }, { status: 500 })
  }
}
