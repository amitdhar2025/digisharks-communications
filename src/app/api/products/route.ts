import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug, listActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')

  try {
    if (slug) {
      // Keep API contract as specified: GET /api/products?slug=x
      const product = await getProductBySlug(slug)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      const res = NextResponse.json(product, { status: 200 })
      res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=30')
      return res
    }

    const products = await listActiveProducts()
    const res = NextResponse.json(products, { status: 200 })
    res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=30')
    return res
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to load products', detail: err?.message },
      { status: 500 }
    )
  }
}

