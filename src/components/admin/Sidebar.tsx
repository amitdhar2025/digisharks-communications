'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'

interface SubAdminPermissions {
  blog: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  store: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  career: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  chatbot: { view: boolean; manage: boolean; settings: boolean }
  seoAudit: { view: boolean; delete: boolean }
  rss: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  queries: { view: boolean; edit: boolean; delete: boolean; export: boolean }
}

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
  const [role, setRole] = useState<'admin' | 'sub-admin'>('admin')
  const [permissions, setPermissions] = useState<SubAdminPermissions | null>(null)

  useEffect(() => {
    adminFetch<{
      authenticated: boolean
      username: string
      role: string
      permissions: SubAdminPermissions | null
    }>('/api/admin/me').then(({ data }) => {
      if (data?.authenticated) {
        setUsername(data.username)
        setRole(data.role as 'admin' | 'sub-admin')
        setPermissions(data.permissions)
      }
    })
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

  // Helper: check if a section has any view permission
  function hasSectionAccess(section: keyof SubAdminPermissions): boolean {
    if (role === 'admin') return true // super admin sees everything
    if (!permissions) return false
    const sectionPerms = permissions[section]
    if (!sectionPerms) return false
    return Object.values(sectionPerms).some(Boolean)
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

      {/* Main Section */}
      <div className="nav-section">Main</div>
      {role === 'admin' && navItem('/admin/dashboard', '📊 Dashboard')}
      {hasSectionAccess('queries') && navItem('/admin/queries', '📋 Queries')}
      {hasSectionAccess('store') && navItem('/admin/store', '🛒 Digital Products Sales')}
      {hasSectionAccess('blog') && navItem('/admin/blog', '📝 Blog')}
      {hasSectionAccess('rss') && navItem('/admin/rss', '📡 RSS Feeds')}
      {hasSectionAccess('career') && navItem('/admin/career', '💼 Career')}

      {/* Chatbot Section */}
      {hasSectionAccess('chatbot') && (
        <>
          <div className="nav-section">🤖 Chatbot</div>
          {navItem('/admin/chatbot', '📊 Dashboard')}
          {permissions?.chatbot?.manage && navItem('/admin/chatbot/qna', '💬 Q&A Manager')}
          {permissions?.chatbot?.manage && navItem('/admin/chatbot/upload', '📤 Upload')}
          {permissions?.chatbot?.settings && navItem('/admin/chatbot/settings', '⚙ Settings')}
        </>
      )}

      {/* SEO Section */}
      {hasSectionAccess('seoAudit') && (
        <>
          <div className="nav-section">🔍 SEO</div>
          {navItem('/admin/seo-audit', '📊 Audit Dashboard')}
          {navItem('/admin/seo-audit/settings', '⚙ Audit Settings')}
        </>
      )}

      {/* Admin Management — only for super admin */}
      {role === 'admin' && (
        <>
          <div className="nav-section">⚙ Admin</div>
          {navItem('/admin/sub-admins', '👥 Sub-Admins')}
          {navItem('/admin/login-logs', '📋 Log Details')}
        </>
      )}

      {navItem('/', '🏠 Home (opens in new tab)')}

      <div className="spacer" />

      <div className="nav-section">Account</div>
      <div style={{ padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>
        Signed in as{' '}
        <span style={{ color: '#7dd3fc' }}>{username || '…'}</span>
        {role === 'sub-admin' && (
          <span style={{ color: '#fbbf24', fontSize: 11, marginLeft: 6, display: 'inline-block' }}>
            (sub-admin)
          </span>
        )}
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
