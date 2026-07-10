/**
 * CMS Admin Forgot Password Page
 *
 * Simple form where the admin enters their username to request
 * a password reset. The new password is sent via email.
 */

'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'

export default function CMSForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setNewPassword(null)
    setLoading(true)

    try {
      const res = await fetch('/api/content/admin/forgot-password', {
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-dot" />
          Digisharks CMS
        </div>
        <p className="login-subtitle">
          Reset your CMS admin password
        </p>

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
              Enter the email address associated with your CMS admin account. A new password will be
              generated and sent to this email.
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Resetting password…' : 'Reset Password'}
            </button>

            <div className="login-back">
              <a href="/content/admin/login">← Back to Login</a>
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
