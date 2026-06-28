'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface AdminSidebarProps {
  /** Optional callback when a nav link is clicked (for mobile auto-close) */
  onNavClick?: () => void
  /** Whether the sidebar is open on mobile */
  isOpen?: boolean
}

export default function AdminSidebar({ onNavClick, isOpen }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [username, setUsername] = useState('')

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) setUsername(d.username)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard'
    if (href === '/admin/chatbot') return pathname === '/admin/chatbot'
    if (href === '/admin/seo-audit') return pathname === '/admin/seo-audit'
    if (href === '/admin/rss') return pathname === '/admin/rss'
    return pathname.startsWith(href)
  }

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      className={`nav-item ${isActive(href) ? 'active' : ''}`}
      onClick={onNavClick}
    >
      {label}
    </Link>
  )

  return (
    <aside className={`admin-sidebar${isOpen ? ' open' : ''}`}>
      <div className="brand">
        <span className="dot" /> Digisharks
      </div>

      <div className="nav-section">Main</div>
      {navItem('/admin/dashboard', '📋 Queries')}
      {navItem('/admin/store', '🛒 Digital Products Sales')}
      {navItem('/admin/blog', '📝 Blog')}
      {navItem('/admin/rss', '📡 RSS Feeds')}
      {navItem('/admin/career', '💼 Career')}

      <div className="nav-section">🤖 Chatbot</div>
      {navItem('/admin/chatbot', '📊 Dashboard')}
      {navItem('/admin/chatbot/qna', '💬 Q&A Manager')}
      {navItem('/admin/chatbot/upload', '📤 Upload')}
      {navItem('/admin/chatbot/settings', '⚙ Settings')}

      <div className="nav-section">🔍 SEO</div>
      {navItem('/admin/seo-audit', '📊 Audit Dashboard')}
      {navItem('/admin/seo-audit/settings', '⚙ Audit Settings')}

      {navItem('/', '🏠 Home (opens in new tab)')}

      <div className="spacer" />

      <div className="nav-section">Account</div>
      <div style={{ padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>
        Signed in as <span style={{ color: '#7dd3fc' }}>{username || '…'}</span>
      </div>
      <button className="nav-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>
        🚪 Sign out
      </button>
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
  )
}
