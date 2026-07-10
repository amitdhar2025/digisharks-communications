import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

function getCouponsCollection() {
  return getDb().then((db) => db.collection('coupons'))
}

/**
 * PATCH /api/admin/coupons/[id]
 * Update coupon fields (toggle active, etc.)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'coupons', 'edit', subPerms)
      if (denied) return denied
    }
    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await req.json()
    const $set: Record<string, any> = {}

    if (typeof body.isActive === 'boolean') $set.isActive = body.isActive
    if (body.discountType) $set.discountType = body.discountType
    if (body.discountValue) $set.discountValue = Number(body.discountValue)
    if (body.minOrderValue !== undefined) $set.minOrderValue = body.minOrderValue ? Number(body.minOrderValue) : undefined
    if (body.maxUses !== undefined) $set.maxUses = body.maxUses ? Number(body.maxUses) : undefined
    if (body.expiresAt !== undefined) $set.expiresAt = body.expiresAt || undefined

    if (Object.keys($set).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const coupons = await getCouponsCollection()
    const res = await coupons.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set },
      { returnDocument: 'after' }
    )
    if (!res) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })

    return NextResponse.json({ success: true, coupon: { ...res, _id: res._id.toString() } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/coupons/[id]
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'coupons', 'delete', subPerms)
      if (denied) return denied
    }
    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const coupons = await getCouponsCollection()
    const res = await coupons.deleteOne({ _id: new ObjectId(id) })
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
