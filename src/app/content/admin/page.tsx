/**
 * CMS Admin Dashboard Page
 *
 * Comprehensive dashboard with grouped stat cards, navigation cards,
 * content completion progress, pages list, and quick actions.
 *
 * Uses Tailwind classes alongside CMS admin-shell.css classes.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FileEdit,
  CheckCircle,
  Clock,
  Settings,
  Menu as MenuIcon,
  FileText,
  Edit3,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Globe,
  CheckSquare,
  AlertCircle,
  Bug,
  Users,
} from 'lucide-react'
import ActivitySummaryWidget from '@/components/admin/ActivitySummaryWidget'


export default function CMSDashboardPage() {
  const [stats, setStats] = useState({ total: 0, withContent: 0, withoutContent: 0 })
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/content/pages')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      const allPages = data.pages || []
      const total = allPages.length
      const withContent = allPages.filter((p: any) => p.hasContent).length
      setStats({ total, withContent, withoutContent: total - withContent })
      setPages(allPages.slice(0, 10))
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  function fmtDate(iso: string | null) {
    if (!iso) return 'Never'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'Never'
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function getPublicUrl(slug: string) {
    if (slug === 'home') return '/'
    return '/' + slug
  }

  const completionPct = stats.total > 0 ? Math.round((stats.withContent / stats.total) * 100) : 0

  // ── Stat box definitions ──────────────────────────────────────────────
  const STAT_BOXES = [
    { key: 'total', label: 'Total Pages', value: stats.total, icon: <FileText size={18} />, color: '#0ea5e9', cssColor: 'blue', href: '/content/admin/pages' },
    { key: 'withContent', label: 'Pages with Content', value: stats.withContent, icon: <CheckCircle size={18} />, color: '#10b981', cssColor: 'green', href: '/content/admin/pages' },
    { key: 'withoutContent', label: 'Not Edited Yet', value: stats.withoutContent, icon: <Clock size={18} />, color: '#f59e0b', cssColor: 'amber', href: '/content/admin/pages' },
  ]

  const NAV_CARDS = [
    { title: 'Page Content', description: 'Edit text, images, and content for every page', href: '/content/admin/pages', icon: <FileEdit size={22} />, color: '#0ea5e9' },
    { title: 'Site Settings', description: 'Manage phone, email, social links & branding', href: '/content/admin/settings', icon: <Settings size={22} />, color: '#6366f1' },
    { title: 'Navigation Menus', description: 'Customize alert bar, main nav & sub-menus', href: '/content/admin/menus', icon: <MenuIcon size={22} />, color: '#06b6d4' },
    { title: 'Debug & Errors', description: 'View error logs and system diagnostics', href: '/content/admin/debug', icon: <Bug size={22} />, color: '#f59e0b' },
    { title: 'Change Username', description: 'Update your CMS admin account username', href: '/content/admin/change-username', icon: <Edit3 size={22} />, color: '#eab308' },
    { title: 'Registrations', description: 'View and manage public registration entries', href: '/content/admin/registered', icon: <Users size={22} />, color: '#22c55e' },
  ]

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-6 w-40 rounded-lg bg-slate-700/50 animate-pulse" />
          <div className="h-3.5 w-52 rounded mt-1.5 bg-slate-700/40 animate-pulse" />
        </div>
        <div className="cms-stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-gradient-to-br from-[#0f172a] to-[#0b1220] border border-[#1e293b] rounded-xl p-5">
              <div className="w-[42px] h-[42px] rounded-lg bg-slate-700/50 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-[26px] w-16 rounded bg-slate-700/50 animate-pulse" />
                <div className="h-3 w-20 rounded mt-1.5 bg-slate-700/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="cms-topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Overview of your website content management</div>
        </div>
        <div>
          <Link href="/content/admin/pages" className="cms-btn cms-btn-primary">
            <Edit3 size={15} />
            Edit Pages
          </Link>
        </div>
      </div>

      {error && (
        <div className="cms-alert cms-alert-error" role="alert">
          <AlertCircle size={14} className="inline-block align-middle mr-1" />
          {error}
        </div>
      )}

      {/* ── CONTENT OVERVIEW ──────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="cms-section-title">
          <span className="dot" style={{ background: '#22c55e' }} />
          Content Overview
          <span className="line" />
        </div>
        <div className="cms-stats-grid">
          {STAT_BOXES.map((box) => (
            <Link key={box.key} href={box.href} className={`cms-stat-card ${box.cssColor}`}>
              <div className="cms-stat-icon" style={{ background: `${box.color}14`, color: box.color }}>
                {box.icon}
              </div>
              <div>
                <div className="cms-stat-value">{box.value}</div>
                <div className="cms-stat-label">{box.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <ActivitySummaryWidget debugLink="/content/admin/debug" />

      {/* ── QUICK ACCESS ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="cms-section-title">
          <span className="dot" style={{ background: '#0ea5e9' }} />
          Quick Access
          <span className="line" />
        </div>
        <div className="cms-grid">
          {NAV_CARDS.map((card) => (
            <Link key={card.href} href={card.href} className="cms-dash-card">
              <div className="top-row">
                <div className="card-icon" style={{ background: `${card.color}14`, color: card.color }}>
                  {card.icon}
                </div>
                <ArrowRight size={14} className="card-arrow" />
              </div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.description}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CONTENT COMPLETION PROGRESS ──────────────────────────────── */}
      <div className="cms-progress-section">
        <div className="progress-header">
          <div className="progress-label">
            <BarChart3 size={16} className="text-emerald-400" />
            Content Completion
          </div>
          <span className="progress-pct" style={{ color: completionPct === 100 ? '#4ade80' : '#94a3b8' }}>
            {completionPct}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: completionPct + '%',
              background: completionPct === 100
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : 'linear-gradient(90deg, #0ea5e9, #6366f1)',
            }}
          />
        </div>
        <div className="progress-meta">
          <span>{stats.withContent} pages with content</span>
          <span>{stats.withoutContent} pages remaining</span>
        </div>
      </div>

      {/* ── ALL PAGES ────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="cms-section-title" style={{ marginTop: 32 }}>
          <span className="dot" style={{ background: '#6366f1' }} />
          All Pages
          <span className="line" />
          <Link
            href="/content/admin/pages"
            className="ml-auto text-xs text-sky-300 hover:text-sky-200 flex items-center gap-1 no-underline transition-colors"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        {pages.length === 0 ? (
          <div className="cms-empty-state">
            <Globe size={24} className="opacity-40 mb-2" />
            <p className="text-sm">No pages found.</p>
          </div>
        ) : (
          <div className="cms-table-wrap">
            <table className="cms-table">
              <thead>
                <tr>
                  {['Page', 'Status', 'Last Updated', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map((page: any) => (
                  <tr key={page.slug}>
                    <td>
                      <div className="cms-page-name">{page.pageName}</div>
                      <div className="cms-page-slug">/{page.slug === 'home' ? '' : page.slug}</div>
                    </td>
                    <td>
                      {page.hasContent ? (
                        <span className="cms-status-published">
                          <CheckSquare size={11} />
                          Content Saved
                        </span>
                      ) : (
                        <span className="cms-status-draft">
                          <Clock size={11} />
                          Not Edited Yet
                        </span>
                      )}
                    </td>
                    <td className="cms-text-muted">{fmtDate(page.updatedAt)}</td>
                    <td>
                      <div className="cms-action-btns">
                        <Link href={`/content/admin/pages/${page.slug}/edit`} className="cms-btn cms-btn-sm cms-btn-primary">
                          <Edit3 size={12} />
                          Edit
                        </Link>
                        <a href={getPublicUrl(page.slug)} target="_blank" rel="noopener noreferrer" className="cms-btn cms-btn-sm cms-btn-ghost">
                          <ExternalLink size={12} />
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TIP BOX ──────────────────────────────────────────────────── */}
      <div className="cms-tip">
        <Lightbulb size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="cms-tip-title">Quick Tip</div>
          <div className="cms-tip-body">
            Use the sidebar on the left to navigate between sections. All page content fields now support the{' '}
            <strong>TipTap rich text editor</strong> — bold, italic, headings, links, images, and more.
            Edit any page from the <Link href="/content/admin/pages">Pages</Link> section.
          </div>
        </div>
      </div>
    </div>
  )
}
