/**
 * CMS Admin Login Page
 *
 * Simple login form with username/email and password.
 * On success, redirects to the CMS dashboard.
 * Shows error messages on invalid credentials.
 */

'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Auto-redirect if already authenticated (e.g. after proxy.ts sends logged-in
  // users here when they visit /content/admin root)
  useEffect(() => {
    fetch('/api/content/admin/me')
      .then((r) => {
        if (r.ok) {
          const next = search.get('next')
          const redirectTo =
            next && next.startsWith('/') && !next.startsWith('//')
              ? next
              : '/content/admin/pages'
          router.replace(redirectTo)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [router, search])

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
      // Default to /content/admin/pages instead of /content/admin root
      // because proxy.ts always redirects /content/admin to the login page.
      const redirectTo =
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : '/content/admin/pages'

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      {/* Hidden dummy fields to confuse browser password manager */}
      <input
        type="text"
        style={{ position: 'absolute', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
        data-form-type="other"
        data-lpignore="true"
      />
      <input
        type="password"
        style={{ position: 'absolute', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
        data-form-type="other"
        data-lpignore="true"
      />

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <div className="login-field">
        <label htmlFor="cms-username">Username</label>
        <input
          id="cms-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={(e) => (e.target.readOnly = false)}
          placeholder="admin@digisharks.com"
          autoComplete="off"
          readOnly
          required
          disabled={loading}
          data-form-type="other"
          data-lpignore="true"
        />
      </div>

      <div className="login-field">
        <label htmlFor="cms-password">Password</label>
        <input
          id="cms-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={(e) => (e.target.readOnly = false)}
          placeholder="Enter your password"
          autoComplete="new-password"
          readOnly
          required
          disabled={loading}
          data-form-type="other"
          data-lpignore="true"
        />
      </div>

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In to CMS'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <a
          href="/content/admin/forgot-password"
          style={{
            color: '#64748b',
            textDecoration: 'none',
            fontSize: 12,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#7dd3fc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          Forgot Password?
        </a>
        <span style={{ color: '#475569', margin: '0 6px', fontSize: 12 }}>·</span>
        <a
          href="/content/admin/forgot-username"
          style={{
            color: '#64748b',
            textDecoration: 'none',
            fontSize: 12,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#7dd3fc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          Forgot Username?
        </a>
      </div>

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
