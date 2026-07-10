/**
 * CMS Admin Change Username Page
 *
 * Simple form where the admin enters their current password and a new
 * username to update their credentials.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CMSChangeUsernamePage() {
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
    fetch('/api/content/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.loggedIn) {
          router.push('/content/admin/login')
          return
        }
        setCurrentUsername(d.username || '')
        setCheckingAuth(false)
      })
      .catch(() => router.push('/content/admin/login'))
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmed = newUsername.trim().toLowerCase()

    if (trimmed !== confirmUsername.trim().toLowerCase()) {
      setError('New usernames do not match.')
      return
    }

    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (trimmed === currentUsername.toLowerCase()) {
      setError('New username is the same as your current username.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/content/admin/change-username', {
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
        <p className="login-subtitle">Change your CMS admin username</p>

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
            <label htmlFor="cms-new-username">New Username</label>
            <input
              id="cms-new-username"
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

          <div className="login-field">
            <label htmlFor="cms-confirm-username">Confirm New Username</label>
            <input
              id="cms-confirm-username"
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Changing Username…' : 'Change Username'}
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
