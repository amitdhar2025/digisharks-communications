import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import SeoAudit from '@/lib/models/SeoAudit'
import { softDeleteFromMongoose } from '@/lib/trash'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check delete permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'seoAudit', 'delete', subPerms)
    if (denied) return denied
  }

  try {
    const { id } = await params
    await connectMongoose()

    await softDeleteFromMongoose(
      'seoaudits',
      SeoAudit,
      id,
      { username: admin.username, role: admin.role },
      (doc) => (doc as any)?.url || id,
    )

    return NextResponse.json({ success: true, message: 'Audit moved to trash.' })
  } catch (err: any) {
    console.error('DELETE /api/admin/seo-audit/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 })
  }
}
