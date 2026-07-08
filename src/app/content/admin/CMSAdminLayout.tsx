/**
 * CMS Admin Layout (Client Component)
 *
 * Provides the admin shell with a sidebar navigation, responsive mobile
 * hamburger menu, and consistent styling for all CMS pages.
 *
 * The login page is detected by pathname and rendered as a standalone
 * layout WITHOUT the sidebar to prevent layout duplication.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileEdit,
  LogOut,
  Menu,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import MaintenanceBanner from '@/components/MaintenanceBanner'
import './css/admin-shell.css'

interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
  onClick?: () => void
}

function NavLink({ href, icon: Icon, label, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`cms-nav-link ${isActive ? 'cms-nav-active' : ''}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  )
}

export default function CMSAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  // Detect login page so we render standalone (no sidebar)
  const isLoginPage = pathname === '/content/admin/login'

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/content/admin/logout', { method: 'POST' })
      // Force full page reload so proxy.ts can check auth state
      window.location.href = '/content/admin/login'
    } catch {
      setLoggingOut(false)
    }
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  // ── Login page: render standalone, no sidebar ─────────────────────
  if (isLoginPage) {
    return (
      <div className="cms-shell">
        <main className="cms-content" style={{ padding: 0 }}>{children}</main>
      </div>
    )
  }

  return (
    <div className="cms-shell">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`cms-sidebar ${sidebarOpen ? 'cms-sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="cms-sidebar-brand">
          <span className="cms-dot" />
          Digisharks CMS
        </div>

        {/* Navigation */}
        <nav className="cms-sidebar-nav">
          <NavLink href="/content/admin" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
          <NavLink href="/content/admin/pages" icon={FileEdit} label="Pages" onClick={closeSidebar} />
          <NavLink href="/content/admin/menus" icon={Menu} label="Menus" onClick={closeSidebar} />
          <NavLink href="/content/admin/settings" icon={Settings} label="Settings" onClick={closeSidebar} />
        </nav>

        {/* Logout */}
        <div className="cms-sidebar-footer">
          <button onClick={handleLogout} disabled={loggingOut} className="cms-nav-link cms-nav-logout">
            <LogOut size={18} />
            <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="cms-overlay" onClick={closeSidebar} aria-hidden="true" />}

      {/* Main content */}
      <div className="cms-main">
        {/* Mobile header */}
        <div className="cms-mobile-header">
          <button onClick={() => setSidebarOpen(true)} className="cms-hamburger" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="cms-mobile-brand">
            <span className="cms-dot" />
            Digisharks CMS
          </span>
        </div>

        <MaintenanceBanner />
        <main className="cms-content">{children}</main>
      </div>
    </div>
  )
}
