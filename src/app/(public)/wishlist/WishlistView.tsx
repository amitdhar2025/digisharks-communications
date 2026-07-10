'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function WishlistView() {
  const { items, hydrated, remove, clear } = useWishlist()
  const { add } = useCart()
  const router = useRouter()

  if (!hydrated) {
    return (
      <div className="dp-empty-state">
        <p style={{ color: 'var(--muted)' }}>Loading your wishlist…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="dp-empty-state">
        <div className="icon" aria-hidden="true">🤍</div>
        <h2>Your wishlist is empty</h2>
        <p>Save products you love to buy later.</p>
        <Link href="/digital-products" className="dp-buy-btn" style={{ maxWidth: 320, margin: '0 auto', display: 'inline-flex' }}>
          Browse Digital Products →
        </Link>
      </div>
    )
  }

  return (
    <div className="dp-wishlist-page">
      <div className="dp-wishlist-header">
        <span className="dp-wishlist-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <button type="button" className="dp-wishlist-clear" onClick={clear}>
          Clear all
        </button>
      </div>

      <div className="dp-wishlist-grid">
        {items.map((item) => (
          <div key={item.slug} className="dp-wishlist-card">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.title} className="dp-wishlist-img" />
            ) : (
              <div className="dp-wishlist-placeholder">📦</div>
            )}
            <div className="dp-wishlist-info">
              <h3 className="dp-wishlist-title">
                <Link href={`/digital-products/${item.slug}`}>{item.title}</Link>
              </h3>
              <div className="dp-wishlist-price">
                {formatINR(item.price)}
                {item.compareAtPrice && item.compareAtPrice > item.price && (
                  <span className="dp-wishlist-original">{formatINR(item.compareAtPrice)}</span>
                )}
              </div>
              <div className="dp-wishlist-actions">
                <button
                  type="button"
                  className="dp-product-btn"
                  onClick={() => {
                    add({ slug: item.slug, title: item.title, price: item.price, image: item.image }, 1)
                    router.push('/shopping-cart')
                  }}
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  className="dp-wishlist-remove"
                  onClick={() => remove(item.slug)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
