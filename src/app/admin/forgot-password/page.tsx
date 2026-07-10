'use client'

import { useState, FormEvent } from 'react'

export const dynamic = 'force-dynamic'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setNewPassword(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      setSuccess(data?.message || 'Password reset successful.')
      if (data?.newPassword) {
        setNewPassword(data.newPassword)
      }
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
        <div className="admin-login-sub">Reset your admin password</div>

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

            {newPassword && (
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 10,
                  padding: '16px 20px',
                  textAlign: 'center',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  Your New Password
                </div>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#7dd3fc',
                    letterSpacing: '0.05em',
                    wordBreak: 'break-all',
                  }}
                >
                  {newPassword}
                </div>
              </div>
            )}

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

            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>
              Enter the email address associated with your admin account. A new password will be
              generated and sent to this email.
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Resetting password…' : 'Reset Password'}
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

        <div style={{ marginTop: 12, textAlign: 'center' }}>
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
