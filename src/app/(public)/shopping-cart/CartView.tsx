'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function CartView() {
  const { items, hydrated, subtotal, setQty, remove } = useCart()

  if (!hydrated) {
    return (
      <div className="sc-page">
        <h1 className="sc-title">Shopping Cart</h1>
        <div className="sc-state">Loading your cart…</div>
        <ScStyles />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="sc-page">
        <h1 className="sc-title">Shopping Cart</h1>
        <div className="sc-state">
          <div className="sc-state-icon" aria-hidden="true">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add a digital product to get started.</p>
          <Link href="/digital-products" className="sc-btn sc-btn-primary">
            Browse Digital Products →
          </Link>
        </div>
        <ScStyles />
      </div>
    )
  }

  return (
    <div className="sc-page">
      <h1 className="sc-title">Shopping Cart</h1>

      {/* ---------- CART TABLE ---------- */}
      <section className="sc-card">
        <div className="sc-table">
          <div className="sc-row sc-head">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span className="sc-right">Subtotal</span>
          </div>

          {items.map((it) => {
            const productHref = `/digital-products/${it.slug}`
            return (
              <div className="sc-row sc-item" key={it.slug}>
                <div className="sc-product">
                  <button
                    type="button"
                    className="sc-remove"
                    onClick={() => remove(it.slug)}
                    aria-label={`Remove ${it.title}`}
                    title="Remove"
                  >
                    ×
                  </button>
                  <Link href={productHref} className="sc-thumb-link" aria-label={it.title}>
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.title} loading="lazy" className="sc-thumb" />
                    ) : (
                      <span className="sc-thumb sc-thumb-empty" aria-hidden="true" />
                    )}
                  </Link>
                  <Link href={productHref} className="sc-name">
                    {it.title}
                  </Link>
                </div>

                <div className="sc-cell">
                  <span className="sc-label">Price</span>
                  <span>{formatINR(it.price)}</span>
                </div>

                <div className="sc-cell">
                  <span className="sc-label">Quantity</span>
                  <div className="sc-qty" role="group" aria-label="Quantity">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setQty(it.slug, it.qty - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) =>
                        setQty(it.slug, Math.max(1, parseInt(e.target.value || '1', 10)))
                      }
                      aria-label="Quantity"
                    />
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setQty(it.slug, it.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="sc-cell sc-right">
                  <span className="sc-label">Subtotal</span>
                  <span className="sc-subtotal">{formatINR(it.price * it.qty)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="sc-card-footer">
          <button
            type="button"
            className="sc-btn sc-btn-update"
            disabled
            title="Quantities update automatically"
          >
            Update Cart
          </button>
        </div>
      </section>

      {/* ---------- CART TOTALS ---------- */}
      <section className="sc-card sc-totals">
        <h2 className="sc-totals-title">Cart Totals</h2>

        <div className="sc-totals-row">
          <span className="sc-totals-label">Subtotal</span>
          <span className="sc-totals-val">{formatINR(subtotal)}</span>
        </div>
        <div className="sc-totals-row">
          <span className="sc-totals-label sc-strong">Total</span>
          <span className="sc-totals-val sc-strong">{formatINR(subtotal)}</span>
        </div>

        <div className="sc-totals-footer">
          <Link href="/checkout" className="sc-btn sc-btn-primary">
            Proceed to Checkout
          </Link>
        </div>
      </section>

      <ScStyles />
    </div>
  )
}

/* Namespaced global styles — kept under `.sc-page` so a dark app theme
   can't bleed in, and so they don't leak out to the rest of the app. */
function ScStyles() {
  return (
    <style jsx global>{`
      .sc-page {
        max-width: 980px;
        margin: 0 auto;
        padding: 1.5rem;
        font-family: Arial, 'Hind Madurai', sans-serif;
        color: #2b2b2b !important;
        background: transparent;
      }
      .sc-page * {
        box-sizing: border-box;
      }

      .sc-title {
        font-size: 2.1rem;
        font-weight: 800;
        margin: 0 0 1rem;
        color: #1a1a1a !important;
        padding-bottom: 1rem;
        border-bottom: 1px solid #ededed;
      }

      /* ---------- CARDS ---------- */
      .sc-card {
        background: #ffffff !important;
        border: 1px solid #e3e3e3 !important;
        border-radius: 6px;
        padding: 0.5rem 1.25rem 1.25rem;
        margin-bottom: 1.5rem;
        box-shadow: none !important;
      }

      /* ---------- TABLE ---------- */
      .sc-table {
        width: 100%;
      }
      .sc-row {
        display: grid;
        grid-template-columns: 1fr 110px 170px 130px;
        align-items: center;
        gap: 1rem;
        padding: 1.1rem 0;
      }
      .sc-head {
        color: #777 !important;
        font-size: 0.92rem;
        border-bottom: 1px solid #eee;
      }
      .sc-item {
        border-bottom: 1px solid #f1f1f1;
      }
      .sc-right {
        text-align: right;
        justify-self: end;
      }

      .sc-product {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }
      .sc-remove {
        flex: 0 0 auto;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid #ddd;
        background: #fff !important;
        color: #999 !important;
        font-size: 1rem;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sc-remove:hover {
        background: #f3f3f3 !important;
        color: #d32f2f !important;
        border-color: #d32f2f;
      }
      .sc-thumb-link {
        flex: 0 0 auto;
        display: inline-flex;
        line-height: 0;
      }
      .sc-thumb {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #eee;
        display: block;
      }
      .sc-thumb-empty {
        background: #f0f0f0;
      }
      .sc-name {
        color: #555 !important;
        font-size: 0.95rem;
        text-decoration: none;
      }
      .sc-name:hover {
        color: #6c4ed8 !important;
        text-decoration: underline;
      }
      .sc-cell {
        color: #444 !important;
      }
      .sc-subtotal {
        color: #555 !important;
      }
      .sc-label {
        display: none;
        color: #888 !important;
        font-size: 0.8rem;
        margin-right: 0.5rem;
      }

      /* ---------- QUANTITY STEPPER ---------- */
      .sc-qty {
        display: inline-flex;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }
      .sc-qty button {
        width: 34px;
        height: 38px;
        border: none;
        background: #8a5cf6 !important;
        color: #fff !important;
        font-size: 1.1rem;
        cursor: pointer;
      }
      .sc-qty button:hover {
        background: #7c4ef0 !important;
      }
      .sc-qty input {
        width: 46px;
        height: 38px;
        border: none;
        border-left: 1px solid #e3e3e3;
        border-right: 1px solid #e3e3e3;
        text-align: center;
        font-size: 0.95rem;
        color: #2b2b2b !important;
        background: #fff !important;
        -moz-appearance: textfield;
      }
      .sc-qty input::-webkit-outer-spin-button,
      .sc-qty input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* ---------- BUTTONS ---------- */
      .sc-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 0.65rem 1.4rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.15s ease, opacity 0.15s ease;
      }
      .sc-card-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 1rem;
      }
      .sc-btn-update {
        background: #b9a6e8 !important;
        color: #fff !important;
      }
      .sc-btn-update:disabled {
        cursor: default;
        opacity: 0.9;
      }
      .sc-btn-primary {
        background: #6c4ed8 !important;
        color: #fff !important;
      }
      .sc-btn-primary:hover {
        background: #5b3fc4 !important;
      }

      /* ---------- CART TOTALS ---------- */
      .sc-totals {
        padding: 1.5rem;
      }
      .sc-totals-title {
        font-size: 1.7rem;
        font-weight: 800;
        margin: 0 0 1.25rem;
        color: #1a1a1a !important;
      }
      .sc-totals-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.85rem 0;
        border-bottom: 1px solid #eee;
      }
      .sc-totals-label {
        color: #1a1a1a !important;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .sc-totals-val {
        color: #888 !important;
        font-size: 0.95rem;
      }
      .sc-strong {
        color: #1a1a1a !important;
        font-weight: 700;
      }
      .sc-totals-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 1.5rem;
      }

      /* ---------- STATES ---------- */
      .sc-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #555 !important;
      }
      .sc-state h2 {
        color: #1a1a1a !important;
        margin: 0.5rem 0;
      }
      .sc-state-icon {
        font-size: 2.5rem;
      }

      /* ---------- RESPONSIVE ---------- */
      @media (max-width: 700px) {
        .sc-head {
          display: none;
        }
        .sc-row {
          grid-template-columns: 1fr;
          gap: 0.6rem;
          padding: 1rem 0;
        }
        .sc-right,
        .sc-cell.sc-right {
          text-align: left;
          justify-self: start;
        }
        .sc-cell {
          display: flex;
          align-items: center;
        }
        .sc-label {
          display: inline-block;
          min-width: 90px;
          font-weight: 600;
        }
      }
      @media (max-width: 480px) {
        .sc-page {
          padding: 1rem;
        }
        .sc-title {
          font-size: 1.6rem;
        }
        .sc-totals-title {
          font-size: 1.4rem;
        }
      }
    `}</style>
  )
}