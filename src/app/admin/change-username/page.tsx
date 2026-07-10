'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminChangeUsernamePage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [confirmUsername, setConfirmUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        setCurrentUsername(d.username || '')
        setCheckingAuth(false)
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmed = newUsername.trim()

    if (trimmed !== confirmUsername.trim()) {
      setError('New usernames do not match.')
      return
    }

    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (trimmed === currentUsername) {
      setError('New username is the same as your current username.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: trimmed,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Failed to change username')
        setLoading(false)
        return
      }

      setSuccess(data?.message || 'Username changed successfully.')
      setCurrentUsername(data?.username || trimmed)
      setCurrentPassword('')
      setNewUsername('')
      setConfirmUsername('')
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
        <div className="admin-login-sub">Change your admin username</div>

        <div
          style={{
            fontSize: 13,
            color: '#94a3b8',
            marginBottom: 16,
            padding: '10px 12px',
            background: 'rgba(14,165,233,0.08)',
            border: '1px solid rgba(14,165,233,0.2)',
            borderRadius: 8,
          }}
        >
          Current username: <strong style={{ color: '#7dd3fc' }}>{currentUsername}</strong>
        </div>

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
            <label htmlFor="new-username">New Username</label>
            <input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="At least 3 characters"
              autoComplete="off"
              required
              disabled={loading}
              minLength={3}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm-username">Confirm New Username</label>
            <input
              id="confirm-username"
              type="text"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder="Re-enter your new username"
              autoComplete="off"
              required
              disabled={loading}
              minLength={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Changing Username…' : 'Change Username'}
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
