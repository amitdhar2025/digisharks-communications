import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Coupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  isActive: boolean
  restrictToProducts?: string[]
  restrictToCategories?: string[]
}

/**
 * POST /api/checkout/validate-coupon
 * Body: { code: string, subtotal: number, items: { slug: string, title: string, category?: string, price: number, qty: number }[] }
 * Returns: { valid, discount, discountType, discountValue, couponCode, message }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = (body.code || '').toUpperCase().trim()
    const subtotal = Number(body.subtotal) || 0
    const items: { slug: string; category?: string }[] = Array.isArray(body.items) ? body.items : []

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code.' })
    }
    if (subtotal <= 0) {
      return NextResponse.json({ valid: false, message: 'Cart is empty.' })
    }

    const db = await getDb()
    const coupon = await db.collection<Coupon>('coupons').findOne({ code })

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Coupon code not found.' })
    }
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'This coupon is no longer active.' })
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit.' })
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired.' })
    }
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required.`,
      })
    }

    // Product-level restrictions
    if (coupon.restrictToProducts && coupon.restrictToProducts.length > 0) {
      const itemSlugs = items.map((i) => i.slug)
      const eligible = itemSlugs.some((s) => coupon.restrictToProducts!.includes(s))
      if (!eligible) {
        return NextResponse.json({ valid: false, message: 'This coupon is not applicable to items in your cart.' })
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (coupon.discountValue / 100))
    } else {
      discount = Math.min(coupon.discountValue, subtotal) // can't exceed subtotal
    }

    return NextResponse.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      couponCode: coupon.code,
      message: coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% off — you save ₹${discount.toLocaleString('en-IN')}`
        : `₹${coupon.discountValue.toLocaleString('en-IN')} off — you save ₹${discount.toLocaleString('en-IN')}`,
    })
  } catch (err: any) {
    console.error('POST /api/checkout/validate-coupon error', err)
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon.' })
  }
}
