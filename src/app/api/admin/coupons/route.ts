import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

/* ── Coupon document shape ──────────────────────────── */
export interface Coupon {
  _id?: ObjectId
  code: string               // uppercase, unique
  discountType: 'percentage' | 'fixed'
  discountValue: number       // e.g. 10 = 10% off or ₹10 off
  minOrderValue?: number
  maxUses?: number
  usedCount: number
  expiresAt?: string          // ISO date string
  isActive: boolean
  restrictToProducts?: string[] // product slugs
  restrictToCategories?: string[] // category names
  createdAt: Date
}

function getCouponsCollection() {
  return getDb().then((db) => db.collection<Coupon>('coupons'))
}

/* ── Validate coupon code format ────────────────────── */
function isValidCode(code: string): boolean {
  return /^[A-Z0-9_-]{3,30}$/.test(code)
}

/* ── GET — list all coupons ─────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'coupons', 'view', subPerms)
      if (denied) return denied
    }
    const coupons = await getCouponsCollection()
    const list = await coupons.find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json({
      success: true,
      coupons: list.map((c) => ({ ...c, _id: c._id?.toString() })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

/* ── POST — create a coupon ─────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'coupons', 'create', subPerms)
      if (denied) return denied
    }
    const body = await req.json()
    const code = (body.code || '').toUpperCase().trim()
    if (!isValidCode(code)) {
      return NextResponse.json({ error: 'Code must be 3–30 uppercase letters, numbers, hyphens, or underscores.' }, { status: 400 })
    }
    if (!['percentage', 'fixed'].includes(body.discountType)) {
      return NextResponse.json({ error: 'discountType must be percentage or fixed' }, { status: 400 })
    }
    const dv = Number(body.discountValue)
    if (!dv || dv <= 0 || (body.discountType === 'percentage' && dv > 100)) {
      return NextResponse.json({ error: body.discountType === 'percentage' ? 'Percentage must be 1–100' : 'Value must be greater than 0' }, { status: 400 })
    }

    const coupons = await getCouponsCollection()
    const existing = await coupons.findOne({ code })
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }

    const doc: Coupon = {
      code,
      discountType: body.discountType,
      discountValue: dv,
      minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : undefined,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
      usedCount: 0,
      expiresAt: body.expiresAt || undefined,
      isActive: body.isActive !== false,
      restrictToProducts: Array.isArray(body.restrictToProducts) && body.restrictToProducts.length > 0 ? body.restrictToProducts : undefined,
      restrictToCategories: Array.isArray(body.restrictToCategories) && body.restrictToCategories.length > 0 ? body.restrictToCategories : undefined,
      createdAt: new Date(),
    }
    const result = await coupons.insertOne(doc)
    return NextResponse.json({ success: true, coupon: { ...doc, _id: result.insertedId.toString() } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
