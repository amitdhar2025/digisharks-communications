/**
 * Admin Products API — individual product operations
 *
 * PUT    /api/admin/products/:id  — update a product
 * DELETE /api/admin/products/:id  — delete a product
 */

import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getProductsCollection } from '@/lib/products'
import { softDeleteFromNative } from '@/lib/trash'
import slugify from 'slugify'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'products', 'edit', subPerms)
    if (denied) return denied
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const products = await getProductsCollection()

    const updateData: Record<string, any> = {}

    const fields = ['title', 'category', 'shortPitch', 'demoVideo', 'demoVideoLabel', 'titleFontSize', 'howToUseVideo', 'downloadUrl', 'images']
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f]
    }
    if (body.price !== undefined) updateData.price = Number(body.price)
    if (body.compareAtPrice !== undefined) updateData.compareAtPrice = Number(body.compareAtPrice)
    if (body.rating !== undefined) updateData.rating = Math.min(5, Math.max(0, Number(body.rating)))
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage
    if (body.description !== undefined) updateData.description = body.description
    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription
    if (body.variations !== undefined) updateData.variations = body.variations
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText
    if (body.buyButtonText !== undefined) updateData.buyButtonText = body.buyButtonText
    if (body.buttonColor !== undefined) updateData.buttonColor = body.buttonColor
    if (body.cartButtonBg !== undefined) updateData.cartButtonBg = body.cartButtonBg
    if (body.cartButtonTextColor !== undefined) updateData.cartButtonTextColor = body.cartButtonTextColor
    if (body.cartButtonBorderColor !== undefined) updateData.cartButtonBorderColor = body.cartButtonBorderColor
    if (body.cartButtonHoverBg !== undefined) updateData.cartButtonHoverBg = body.cartButtonHoverBg
    if (body.cartButtonHoverTextColor !== undefined) updateData.cartButtonHoverTextColor = body.cartButtonHoverTextColor
    if (body.buyButtonBg !== undefined) updateData.buyButtonBg = body.buyButtonBg
    if (body.buyButtonTextColor !== undefined) updateData.buyButtonTextColor = body.buyButtonTextColor
    if (body.buyButtonBorderColor !== undefined) updateData.buyButtonBorderColor = body.buyButtonBorderColor
    if (body.buyButtonHoverBg !== undefined) updateData.buyButtonHoverBg = body.buyButtonHoverBg
    if (body.buyButtonHoverTextColor !== undefined) updateData.buyButtonHoverTextColor = body.buyButtonHoverTextColor
    if (body.tabs !== undefined) updateData.tabs = body.tabs
    if (body.testimonials !== undefined) updateData.testimonials = body.testimonials
    if (body.faq !== undefined) updateData.faq = body.faq
    if (body.trustCards !== undefined) updateData.trustCards = body.trustCards

    // Regenerate slug if title changed
    if (body.title) {
      let slug = slugify(body.title, { lower: true, strict: true })
      if (!slug) slug = 'product-' + Date.now()
      const existing = await products.findOne({ slug, _id: { $ne: new ObjectId(id) } })
      if (existing) slug = slug + '-' + Date.now().toString(36)
      updateData.slug = slug
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    logActivity({ event: 'product_update', description: `Updated product: ${body.title || id}`, username: admin.username, dashboard: 'admin', target: id }).catch(() => {})
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/products/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'products', 'delete', subPerms)
    if (denied) return denied
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const adminInfo = { username: admin.username, role: (isSuperAdmin(admin) ? 'admin' : 'sub-admin') as 'admin' | 'sub-admin' }

    const trashId = await softDeleteFromNative(
      'products',
      'products',
      id,
      adminInfo,
      (doc) => (doc as any).title || 'Product',
    )

    logActivity({ event: 'product_delete', description: `Deleted product: ${id}`, username: admin.username, dashboard: 'admin', target: id }).catch(() => {})
    return NextResponse.json({ success: true, message: 'Product moved to trash.' })
  } catch (err) {
    console.error('DELETE /api/admin/products/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
