'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CartView() {
  const { items, hydrated, subtotal, setQty, remove } = useCart()

  if (!hydrated) {
    return (
      <div className="dp-empty-state">
        <p style={{ color: 'var(--muted)' }}>Loading your cart…</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="dp-empty-state">
        <div className="icon" aria-hidden="true">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add a digital product to get started.</p>
        <Link href="/digital-products" className="dp-buy-btn" style={{ maxWidth: 320, margin: '0 auto', display: 'inline-flex' }}>
          Browse Digital Products →
        </Link>
      </div>
    )
  }

  return (
    <div className="dp-cart-grid">
      <div className="dp-cart-items">
        {items.map((it) => (
          <div key={it.slug} className="dp-cart-item">
            {it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image} alt={it.title} />
            ) : (
              <div style={{ width: 80, height: 80, background: '#0b0d18', borderRadius: 10 }} />
            )}
            <div className="info">
              <h3>{it.title}</h3>
              <div className="unit-price">{formatINR(it.price)} each</div>
              <div className="dp-qty" style={{ marginTop: '.5rem' }} role="group" aria-label="Quantity">
                <button type="button" aria-label="Decrease" onClick={() => setQty(it.slug, it.qty - 1)}>−</button>
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => setQty(it.slug, Math.max(1, parseInt(e.target.value || '1', 10)))}
                  aria-label="Quantity"
                />
                <button type="button" aria-label="Increase" onClick={() => setQty(it.slug, it.qty + 1)}>+</button>
              </div>
            </div>
            <div className="actions">
              <span className="row-amt">{formatINR(it.price * it.qty)}</span>
              <button type="button" className="row-remove" onClick={() => remove(it.slug)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="dp-cart-summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <div className="row">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="row">
          <span>Delivery</span>
          <span style={{ color: 'var(--emerald)' }}>Free</span>
        </div>
        <div className="row total">
          <span>Total</span>
          <span className="val">{formatINR(subtotal)}</span>
        </div>
        <Link href="/checkout" className="checkout-btn">
          Proceed to checkout →
        </Link>
        <Link href="/digital-products" className="back-link">
          ← Continue shopping
        </Link>
      </aside>
    </div>
  )
}
