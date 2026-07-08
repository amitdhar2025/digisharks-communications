'use client'

import { Suspense, useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function AdminLoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      let data: any = null
      try {
        const text = await res.text()
        data = text ? JSON.parse(text) : null
      } catch {
        setError(
          `Login failed: the server returned a non-JSON response (HTTP ${res.status}). ` +
            `Please try again in a moment.`
        )
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data?.error || `Login failed (HTTP ${res.status}). Please try again.`)
        setLoading(false)
        return
      }

      const rawNext =
        (typeof search.get('next') === 'string' && search.get('next')) ||
        (typeof search.get('redirect') === 'string' && search.get('redirect')) ||
        '/admin/dashboard'

      const safeNext =
        typeof rawNext === 'string' &&
        rawNext.startsWith('/') &&
        !rawNext.startsWith('//')
          ? rawNext
          : '/admin/dashboard'

      router.push(safeNext)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {error ? (
        <div className="alert alert-error" aria-live="polite">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          style={{ marginTop: 6 }}
        >
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="dot" />
          Digisharks Admin
        </div>
        <div className="admin-login-sub">Sign in to manage contact queries</div>

        <Suspense
          fallback={
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
              Loading…
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>

        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Default credentials are set via <code>ADMIN_USERNAME</code> and{' '}
          <code>ADMIN_PASSWORD</code> in <code>.env.local</code>.
          <br />
          The first login attempt will create the admin account automatically.
        </div>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: '#7dd3fc',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  )
}

