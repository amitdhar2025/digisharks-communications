import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'
import mongoose from 'mongoose'
import { softDeleteFromMongoose } from '@/lib/trash'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/career/applications/[id] - Delete an application
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 })
    }

    const application = await CareerApplication.findById(id).lean()
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await softDeleteFromMongoose(
      'careerapplications',
      CareerApplication,
      id,
      { username: admin.username, role: admin.role },
      (doc) => (doc as any)?.applicantName || id,
    )

    return NextResponse.json({
      success: true,
      message: `Application of "${application.applicantName}" moved to trash.`,
    })
  } catch (err: any) {
    console.error('DELETE /api/admin/career/applications/[id] error', err)
    return NextResponse.json({ error: err.message || 'Failed to delete application' }, { status: 500 })
  }
}
