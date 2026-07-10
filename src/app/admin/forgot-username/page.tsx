'use client'

import { useState, FormEvent } from 'react'

export const dynamic = 'force-dynamic'

export default function AdminForgotUsernamePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/forgot-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Failed to process request')
        setLoading(false)
        return
      }

      setSuccess(
        data?.message ||
          'If an admin account is associated with this email, the username has been sent.'
      )
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="dot" />
          Digisharks Admin
        </div>
        <div className="admin-login-sub">Retrieve your admin username</div>

        {error ? (
          <div className="alert alert-error" aria-live="polite">
            {error}
          </div>
        ) : null}

        {success ? (
          <div style={{ marginTop: 16 }}>
            <div
              className="alert"
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
                padding: '14px 16px',
                borderRadius: 10,
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              {success}
            </div>

            <div style={{ textAlign: 'center' }}>
              <a
                href="/admin/login"
                className="btn btn-primary"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                ← Back to Login
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 8 }} autoComplete="off">
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email on your admin account"
                autoComplete="off"
                required
                disabled={loading}
              />
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#64748b',
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              Enter the email address associated with your admin account. If a match is found,
              your username will be sent to this email.
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Sending…' : 'Send Username'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a
            href="/admin/login"
            style={{
              color: '#7dd3fc',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            ← Back to Login
          </a>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a
            href="/admin/forgot-password"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: 12,
            }}
          >
            Forgot your password instead?
          </a>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: 12,
            }}
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  )
}
