/**
 * Admin Products API — CRUD for digital products
 *
 * GET    /api/admin/products       — list all products (incl. inactive)
 * POST   /api/admin/products       — create a new product
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getProductsCollection } from '@/lib/products'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'products', 'view', subPerms)
    if (denied) return denied
  }

  try {
    const products = await getProductsCollection()
    const all = await products.find({}).sort({ createdAt: -1 }).toArray()
    const items = all.map((p) => ({
      _id: String(p._id),
      slug: p.slug,
      title: p.title,
      category: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      currency: p.currency,
      shortPitch: p.shortPitch,
      images: p.images || [],
      description: p.description || '',
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      demoVideo: p.demoVideo || '',
      demoVideoLabel: p.demoVideoLabel || '',
      titleFontSize: p.titleFontSize || '',
      howToUseVideo: p.howToUseVideo || '',
      rating: p.rating || 0,
      isActive: p.isActive,
      downloadUrl: p.downloadUrl || '',
      featuredImage: p.featuredImage || '',
      variations: p.variations || [],
      buttonText: p.buttonText || '',
      buyButtonText: p.buyButtonText || '',
      buttonColor: p.buttonColor || '',
      cartButtonBg: p.cartButtonBg || '',
      cartButtonTextColor: p.cartButtonTextColor || '',
      cartButtonBorderColor: p.cartButtonBorderColor || '',
      cartButtonHoverBg: p.cartButtonHoverBg || '',
      cartButtonHoverTextColor: p.cartButtonHoverTextColor || '',
      buyButtonBg: p.buyButtonBg || '',
      buyButtonTextColor: p.buyButtonTextColor || '',
      buyButtonBorderColor: p.buyButtonBorderColor || '',
      buyButtonHoverBg: p.buyButtonHoverBg || '',
      buyButtonHoverTextColor: p.buyButtonHoverTextColor || '',
      tabs: p.tabs || [],
      testimonials: p.testimonials || [],
      faq: p.faq || [],
      trustCards: p.trustCards || [],
      createdAt: p.createdAt?.toISOString?.() || null,
    }))
    return NextResponse.json({ items })
  } catch (err) {
    console.error('GET /api/admin/products error:', err)
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'products', 'create', subPerms)
    if (denied) return denied
  }

  try {
    const body = await req.json()
    const { title, category, price, compareAtPrice, shortPitch, images, demoVideo, howToUseVideo, rating, isActive, downloadUrl, variations } = body

    if (!title || !price) {
      return NextResponse.json({ error: 'Title and price are required' }, { status: 400 })
    }

    // Generate a URL-safe slug from title
    let slug = slugify(title, { lower: true, strict: true })
    if (!slug) slug = 'product-' + Date.now()

    // Ensure slug uniqueness
    const products = await getProductsCollection()
    const existing = await products.findOne({ slug })
    if (existing) {
      slug = slug + '-' + Date.now().toString(36)
    }

    const doc = {
      slug,
      title,
      category: category || 'Digital',
      price: Number(price),
      compareAtPrice: Number(compareAtPrice || price),
      currency: 'INR',
      shortPitch: shortPitch || '',
      description: body.description || '',
      seoTitle: body.seoTitle || '',
      seoDescription: body.seoDescription || '',
      images: Array.isArray(images) ? images : [],
      featuredImage: body.featuredImage || '',
      demoVideo: demoVideo || '',
      demoVideoLabel: body.demoVideoLabel || '',
      titleFontSize: body.titleFontSize || '',
      howToUseVideo: howToUseVideo || '',
      rating: Math.min(5, Math.max(0, Number(rating) || 0)),
      isActive: isActive !== false,
      downloadUrl: downloadUrl || '',
      variations: Array.isArray(variations) ? variations : [],
      buttonText: body.buttonText || '',
      buyButtonText: body.buyButtonText || '',
      buttonColor: body.buttonColor || '',
      cartButtonBg: body.cartButtonBg || '',
      cartButtonTextColor: body.cartButtonTextColor || '',
      cartButtonBorderColor: body.cartButtonBorderColor || '',
      cartButtonHoverBg: body.cartButtonHoverBg || '',
      cartButtonHoverTextColor: body.cartButtonHoverTextColor || '',
      buyButtonBg: body.buyButtonBg || '',
      buyButtonTextColor: body.buyButtonTextColor || '',
      buyButtonBorderColor: body.buyButtonBorderColor || '',
      buyButtonHoverBg: body.buyButtonHoverBg || '',
      buyButtonHoverTextColor: body.buyButtonHoverTextColor || '',
      tabs: Array.isArray(body.tabs) ? body.tabs : [],
      testimonials: Array.isArray(body.testimonials) ? body.testimonials : [],
      faq: Array.isArray(body.faq) ? body.faq : [],
      trustCards: Array.isArray(body.trustCards) ? body.trustCards : [],
      createdAt: new Date(),
    }

    const result = await products.insertOne(doc as any)

    return NextResponse.json({
      success: true,
      item: { ...doc, _id: String(result.insertedId) },
    }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/products error:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
