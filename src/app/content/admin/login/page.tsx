/**
 * CMS Admin Login Page
 *
 * Simple login form with username/email and password.
 * On success, redirects to the CMS dashboard.
 * Shows error messages on invalid credentials.
 */

'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/content/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        setError(`Server error (HTTP ${res.status}). Please try again.`)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data?.error || `Login failed (HTTP ${res.status})`)
        setLoading(false)
        return
      }

      const next = search.get('next')
      const redirectTo =
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : '/content/admin'

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <div className="login-field">
        <label htmlFor="cms-username">Username or Email</label>
        <input
          id="cms-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin@digisharks.com"
          autoComplete="username"
          required
          disabled={loading}
        />
      </div>

      <div className="login-field">
        <label htmlFor="cms-password">Password</label>
        <input
          id="cms-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          disabled={loading}
        />
      </div>

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In to CMS'}
      </button>

      <div className="login-back">
        <a href="/">← Back to main website</a>
      </div>
    </form>
  )
}

export default function CMSLoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-dot" />
          Digisharks CMS
        </div>
        <p className="login-subtitle">
          Sign in to manage your website content
        </p>

        <Suspense
          fallback={
            <div className="login-loading">Loading…</div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Login styles are in admin-shell.css (.cms-shell .login-*) for reliable rendering */}
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
