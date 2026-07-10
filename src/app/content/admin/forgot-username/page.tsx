/**
 * CMS Admin Forgot Username Page
 *
 * Simple form where the admin enters their email to receive
 * their username(s) via email.
 */

'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'

export default function CMSForgotUsernamePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch('/api/content/admin/forgot-username', {
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-dot" />
          Digisharks CMS
        </div>
        <p className="login-subtitle">Retrieve your CMS admin username</p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div style={{ marginTop: 16 }}>
            <div
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

            <div className="login-back" style={{ textAlign: 'center', marginTop: 12 }}>
              <a href="/content/admin/login">← Back to Login</a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="login-field">
              <label htmlFor="cms-email">Email Address</label>
              <input
                id="cms-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email on your CMS account"
                autoComplete="off"
                required
                disabled={loading}
              />
            </div>

            <p
              style={{
                color: '#64748b',
                fontSize: 12,
                lineHeight: 1.5,
                margin: '0 0 16px',
              }}
            >
              Enter the email address associated with your CMS admin account. If a match is found,
              your username will be sent to this email.
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send Username'}
            </button>

            <div className="login-back" style={{ marginTop: 12 }}>
              <a href="/content/admin/login">← Back to Login</a>
            </div>

            <div className="login-back" style={{ marginTop: 8 }}>
              <a href="/content/admin/forgot-password">Forgot your password instead?</a>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .login-loading {
          text-align: center;
          color: #64748b;
          padding: 20px 0;
          font-size: 13px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 16px;
        }
        .login-field input::placeholder {
          color: #64748b;
        }
      `}</style>
    </div>
  )
}
