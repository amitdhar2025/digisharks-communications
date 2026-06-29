import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { deleteAudit } from '@/lib/seo-audit'

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
    const result = await deleteAudit(id)
    if (!result) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, id: result.id })
  } catch (err: any) {
    console.error('DELETE /api/admin/seo-audit/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 })
  }
}
