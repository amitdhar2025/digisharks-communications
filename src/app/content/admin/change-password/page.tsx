/**
 * CMS Admin Change Password Page
 *
 * Simple form where the admin enters their current password and a new
 * password to update their credentials.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CMSChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    fetch('/api/content/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.loggedIn) {
          router.push('/content/admin/login')
          return
        }
        setCheckingAuth(false)
      })
      .catch(() => router.push('/content/admin/login'))
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/content/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Failed to change password')
        setLoading(false)
        return
      }

      setSuccess(data?.message || 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-dot" />
          Digisharks CMS
        </div>
        <p className="login-subtitle">Change your CMS admin password</p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 13, color: '#4ade80', lineHeight: 1.5 }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="login-field">
            <label htmlFor="cms-current-password">Current Password</label>
            <input
              id="cms-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="cms-new-password">New Password</label>
            <input
              id="cms-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="login-field">
            <label htmlFor="cms-confirm-password">Confirm New Password</label>
            <input
              id="cms-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Changing Password…' : 'Change Password'}
          </button>

          <div className="login-back" style={{ marginTop: 12 }}>
            <a href="/content/admin">← Back to Dashboard</a>
          </div>
        </form>
      </div>

      <style>{`
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
