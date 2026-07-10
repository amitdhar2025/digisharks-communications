'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        setCheckingAuth(false)
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  async function handleSubmit(e: FormEvent) {
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
      const res = await fetch('/api/admin/change-password', {
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
      <div className="admin-login-wrap">
        <div className="admin-login-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="dot" />
          Digisharks Admin
        </div>
        <div className="admin-login-sub">Change your admin password</div>

        {error ? (
          <div className="alert alert-error" aria-live="polite">
            {error}
          </div>
        ) : null}

        {success ? (
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 13, color: '#4ade80', lineHeight: 1.5 }}>
            ✓ {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ marginTop: 8 }} autoComplete="off">
          <div className="field">
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
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

          <div className="field">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
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

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Changing Password…' : 'Change Password'}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a
            href="/admin/dashboard"
            style={{ color: '#7dd3fc', textDecoration: 'none', fontSize: 13 }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
