'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

/* ─── Component ─── */

export default function SeoAuditWidget() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Audit failed')

      // Redirect to the results page
      if (data.redirect) {
        router.push(data.redirect + '?email_sent=true')
      } else if (data.auditId) {
        router.push(`/seo-audit/${data.auditId}?email_sent=true`)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="seo-audit-promo-inner fade-up">
      <div className="seo-audit-promo-badge">🔍 Free Tool</div>
      <h2>Free SEO Health <span className="orange-text">Audit Tool</span></h2>
      <p className="seo-audit-promo-text">
        Analyze any website for SEO performance, security, and best practices — in seconds.
        Check PageSpeed, SSL, meta tags, structured data, HTML validation, and more.
        <strong> No credit card required.</strong>
      </p>

      {loading ? (
        /* ── Loading State ── */
        <div className="seo-audit-loading">
          <div className="seo-spinner-lg" />
          <p>🔍 Please wait, running audit…</p>
          <div className="seo-audit-loading-tags">
            <span>🚀 PageSpeed</span>
            <span>🔒 SSL</span>
            <span>🛡️ Security</span>
            <span>🤖 Robots.txt</span>
            <span>🗺️ Sitemap</span>
            <span>🏷️ Meta Tags</span>
          </div>
        </div>
      ) : (
        /* ── User Details Form ── */
        <form onSubmit={handleSubmit} className="seo-audit-details-form">
          <div className="seo-audit-details-grid">
            <div className="seo-audit-field">
              <label htmlFor="seo-name">Your Name *</label>
              <input
                id="seo-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="seo-audit-field">
              <label htmlFor="seo-email">Email Address *</label>
              <input
                id="seo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="seo-audit-field">
              <label htmlFor="seo-phone">Phone Number *</label>
              <input
                id="seo-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <div className="seo-audit-field">
              <label htmlFor="seo-url">Website URL *</label>
              <input
                id="seo-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                required
              />
            </div>
          </div>

          {error && (
            <div className="seo-audit-error">❌ {error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary btn-large" style={{ width: '100%', justifyContent: 'center' }}>
            🔍 Run Free Audit →
          </button>

          <p className="seo-audit-field-footnote">
            We&apos;ll send the full report to your email. No spam, unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  )
}
