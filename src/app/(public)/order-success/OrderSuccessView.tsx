'use client'

import { useEffect, useState } from 'react'

interface OrderLine {
  slug: string
  title: string
  qty: number
  price: number
}

interface OrderResp {
  order: {
    orderNumber: string
    items: OrderLine[]
    amount: number
    customer: { name: string; email: string }
    payment: { status: string }
    deliveryStatus: 'not_yet' | 'received'
    emailSent: boolean
    createdAt: string
  } | null
  downloadUrl?: string
  howToUseVideo?: string
  supportEmail: string
  error?: string
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OrderSuccessView({ orderNumber }: { orderNumber: string }) {
  const [data, setData] = useState<OrderResp | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false)
      return
    }
    fetch('/api/checkout/order?order=' + encodeURIComponent(orderNumber))
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setData({ order: null, supportEmail: 'marketing@digisharkscommunications.com', error: e?.message }))
      .finally(() => setLoading(false))
  }, [orderNumber])

  if (!orderNumber) {
    return (
      <>
        <h1>Order confirmed</h1>
        <p className="lead">Thanks for your purchase! Check your email for the download link.</p>
      </>
    )
  }

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Loading your order…</p>
  }

  if (!data?.order) {
    return (
      <>
        <h1>Order placed</h1>
        <p className="lead">We could not retrieve the full order details, but we have your order number. Check your email for the download link.</p>
        <p className="order-no">#{orderNumber}</p>
      </>
    )
  }

  const o = data.order
  return (
    <>
      <div className="dp-success-icon" aria-hidden="true">✓</div>
      <h1>Order confirmed</h1>
      <p className="lead">
        Thank you, <strong>{o.customer.name}</strong>! Your order is confirmed. A confirmation email with the
        database download link and the &ldquo;how to use&rdquo; video is on its way to <strong>{o.customer.email}</strong>.
      </p>
      <p className="order-no">Order #{o.orderNumber}</p>

      <article className="dp-success-card" aria-label="Order summary">
        <h2>Order summary</h2>
        {o.items.map((it) => (
          <div key={it.slug} className="line-item">
            <span className="name">{it.title} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>× {it.qty}</span></span>
            <span className="amt">{formatINR(it.price * it.qty)}</span>
          </div>
        ))}
        <div className="totals">
          <div className="row total">
            <span>Total paid</span>
            <span className="val">{formatINR(o.amount)}</span>
          </div>
        </div>

        {data.downloadUrl && (
          <a href={data.downloadUrl} className="download-btn" target="_blank" rel="noopener noreferrer">
            📥 Download your database
          </a>
        )}

        <p className="meta">
          We also emailed you a copy of the PDF / database and a &ldquo;how to use&rdquo; demo video link so you can
          get started right away.
          {data.howToUseVideo && (
            <>
              {' '}How-to-use video:{' '}
              <a href={data.howToUseVideo} target="_blank" rel="noopener noreferrer">
                Watch tutorial
              </a>
              .
            </>
          )}
        </p>

        {o.deliveryStatus === 'not_yet' && !o.emailSent && (
          <div className="dp-pending-note">
            ⏳ Your confirmation email is being sent. If you don't see it in a few minutes, check your spam folder or
            contact <a href={`mailto:${data.supportEmail}`} style={{ color: 'inherit' }}>{data.supportEmail}</a>.
          </div>
        )}

        {o.deliveryStatus === 'received' && (
          <div className="dp-pending-note" style={{ background: 'rgba(16,185,129,.08)', borderColor: 'rgba(16,185,129,.35)', color: 'var(--emerald)' }}>
            ✓ Delivery email sent. Lifetime access, free future updates.
          </div>
        )}

        <p className="meta" style={{ marginTop: '1.5rem' }}>
          Questions? Reach our support team at{' '}
          <a href={`mailto:${data.supportEmail}`}>{data.supportEmail}</a>{' '}
          or call <a href="tel:+919627332332">+91 96273 32332</a>.
        </p>
      </article>
    </>
  )
}
