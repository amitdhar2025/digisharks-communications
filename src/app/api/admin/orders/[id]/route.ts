import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getOrdersCollection } from '@/lib/products'
import { softDeleteFromNative } from '@/lib/trash'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/orders/[id]
 * Soft-deletes a single order (moves to trash).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }    // Check delete permission for sub-admins
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'orders', 'delete', subPerms)
      if (denied) return denied
    }

  try {
    const { id } = await params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    await softDeleteFromNative(
      'orders',
      'orders',
      id,
      { username: admin.username, role: admin.role },
      (doc) => `Order #${(doc as any)?.orderNumber || id}`,
    )

    return NextResponse.json({ success: true, message: 'Order moved to trash.' })
  } catch (err: any) {
    console.error('DELETE /api/admin/orders/[id] error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
