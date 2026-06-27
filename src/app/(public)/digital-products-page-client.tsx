'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

interface Product {
  _id?: string
  slug: string
  title: string
  category: string
  price: number
  compareAtPrice: number
  currency: string
  shortPitch: string
  images: string[]
  rating: number
  isActive: boolean
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function discountPercent(price: number, original: number): number {
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 100)
}

export default function DigitalProductsPageClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { add } = useCart()
  const router = useRouter()

  function handleAddToCart(p: Product) {
    // (a) Add the item to cart state/context.
    add(
      {
        slug: p.slug,
        title: p.title,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: p.images && p.images.length > 0 ? p.images[0] : undefined,
      },
      1
    )
    // (b) Immediately redirect to the shopping cart page.
    router.push('/shopping-cart')
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/products', { cache: 'default' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load products')
        return r.json()
      })
      .then((data: Product[]) => {
        if (cancelled) return
        setProducts(Array.isArray(data) ? data.filter((p) => p.isActive) : [])
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message ?? 'Failed to load products')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="dp-page">
      <div className="dp-container">
        <h1 className="dp-title">Digital Products</h1>
        <p className="dp-listing-intro">
          Verified databases and digital assets, delivered instantly. Choose a product to view details and add to cart.
        </p>

        {loading ? (
          <p style={{ color: '#666' }}>Loading products…</p>
        ) : error ? (
          <div className="dp-error-banner">{error}</div>
        ) : products.length === 0 ? (
          <div className="dp-empty-state">
            <h2>No products available</h2>
            <p>Check back soon — we're launching new digital products regularly.</p>
          </div>
        ) : (
          <div className="dp-product-grid">
            {products.map((p) => {
              const cover = p.images && p.images.length > 0 ? p.images[0] : null
              const discount = discountPercent(p.price, p.compareAtPrice)
              return (
                <article key={p.slug} className="dp-product-card">
                  <Link
                    href={`/digital-products/${p.slug}`}
                    className="dp-product-image"
                    aria-label={p.title}
                    style={{ display: 'block' }}
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={p.title} loading="lazy" />
                    ) : (
                      <div className="placeholder">📦</div>
                    )}
                    {discount > 0 ? (
                      <span className="dp-product-sale-badge">Sale!</span>
                    ) : null}
                  </Link>
                  <div className="dp-product-body">
                    <h2 className="dp-product-title">
                      <Link href={`/digital-products/${p.slug}`}>{p.title}</Link>
                    </h2>
                    <div className="dp-product-price-row">
                      <span className="dp-product-price">{formatINR(p.price)}</span>
                      {p.compareAtPrice > p.price ? (
                        <span className="dp-product-original">{formatINR(p.compareAtPrice)}</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="dp-product-btn"
                      onClick={() => handleAddToCart(p)}
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
