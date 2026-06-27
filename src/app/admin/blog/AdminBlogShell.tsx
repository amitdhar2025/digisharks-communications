'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminBlogShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login?next=/admin/blog')
        } else {
          setUsername(d.username)
        }
      })
      .catch(() => router.push('/admin/login?next=/admin/blog'))
  }, [router])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="dot" /> Digisharks
        </div>
        <Link className="nav-item" href="/admin/dashboard">
          📋 Queries
        </Link>
        <Link className="nav-item" href="/admin/store">
          🛒 Digital Products Sales
        </Link>
        <Link className="nav-item active" href="/admin/blog">
          📝 Blog
        </Link>
        <Link className="nav-item" href="/contact-us" target="_blank" rel="noreferrer">
          🌐 View Site
        </Link>
        <div className="nav-section">Account</div>
        <div style={{ padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>
          Signed in as <span style={{ color: '#7dd3fc' }}>{username || '…'}</span>
        </div>
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ color: '#fca5a5' }}
        >
          🚪 Sign out
        </button>
        <div className="spacer" />
        <div
          style={{
            padding: '10px 12px',
            fontSize: 11,
            color: '#64748b',
            borderTop: '1px solid #1e293b',
          }}
        >
          v1.0 · MongoDB-backed
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
