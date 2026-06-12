import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params
  const slug = resolved.slug

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  try {
    const product = await getProductBySlug(slug)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to load product', detail: err?.message },
      { status: 500 }
    )
  }
}
