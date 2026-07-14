'use client'

import { useEffect, useState, useCallback } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { adminFetch } from '@/lib/admin-fetch'
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  FileText,
  FilePen,
  Tag,
  Hash,
  Rss,
  Briefcase,
  ClipboardList,
  Bot,
  MessageCircle,
  Search,
  Map,
  Shield,
  ShieldAlert,
  ShieldOff,
  Ban,
  Globe,
  Users,
  LogIn,
  LogOut,
  IndianRupee,
  ArrowRight,
  Lightbulb,
  Settings,
  Trash2,
  RotateCcw,
  Trash,
  Bug,
} from 'lucide-react'
import TrashDashboardSection from '@/components/admin/TrashDashboardSection'
import CacheClearBox from '@/components/admin/CacheClearBox'
import ActivitySummaryWidget from '@/components/admin/ActivitySummaryWidget'

/* ── Types ────────────────────────────────────────────── */

interface DashboardStats {
  queries: number
  orders: number
  revenue: number
  blogPublished: number
  blogDraft: number
  categories: number
  tags: number
  rssFeeds: number
  activeJobs: number
  applications: number
  chatbotQna: number
  chatbotConversations: number
  seoAudits: number
  sitemapUrls: number
  robotsRules: number
  attacksToday: number
  totalBlockedEver: number
  bannedIPs: number
  blockedDomains: number
  subAdmins: number
  loginLogs: number
  failedLoginsToday: number
  totalInTrash: number
  totalRestored: number
  totalPermanentlyDeleted: number
}

/* ── Helpers ──────────────────────────────────────────── */

function fmtINR(n: number) {
  if (n >= 1_00_00_000) return '₹' + (n / 1_00_00_000).toFixed(1) + ' Cr'
  if (n >= 1_00_000) return '₹' + (n / 1_00_000).toFixed(1) + ' L'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

/* ── Stat Box Config ──────────────────────────────────── */

interface StatBox {
  key: keyof DashboardStats
  label: string
  icon: ReactNode
  link: string
  color: string
  cssColor: string
  format?: 'number' | 'currency'
}

const STAT_GROUPS: { label: string; color: string; boxes: StatBox[] }[] = [
  {
    label: 'MAIN',
    color: '#0ea5e9',
    boxes: [
      { key: 'queries', label: 'Contact Queries', icon: <MessageSquare size={18} />, link: '/admin/queries', color: '#0ea5e9', cssColor: 'blue' },
      { key: 'orders', label: 'Total Orders', icon: <ShoppingCart size={18} />, link: '/admin/store', color: '#10b981', cssColor: 'green' },
      { key: 'revenue', label: 'Revenue', icon: <IndianRupee size={18} />, link: '/admin/store', color: '#f59e0b', cssColor: 'amber', format: 'currency' },
      { key: 'blogPublished', label: 'Blog Published', icon: <FileText size={18} />, link: '/admin/blog', color: '#8b5cf6', cssColor: 'purple' },
      { key: 'blogDraft', label: 'Blog Draft', icon: <FilePen size={18} />, link: '/admin/blog', color: '#6b7280', cssColor: 'gray' },
      { key: 'rssFeeds', label: 'RSS Feeds', icon: <Rss size={18} />, link: '/admin/rss', color: '#f97316', cssColor: 'orange' },
      { key: 'activeJobs', label: 'Job Listings', icon: <Briefcase size={18} />, link: '/admin/career', color: '#0ea5e9', cssColor: 'blue' },
      { key: 'applications', label: 'Job Applications', icon: <ClipboardList size={18} />, link: '/admin/career', color: '#6366f1', cssColor: 'indigo' },
    ],
  },
  {
    label: 'CHATBOT',
    color: '#8b5cf6',
    boxes: [
      { key: 'chatbotQna', label: 'Q&A Pairs', icon: <Bot size={18} />, link: '/admin/chatbot/qna', color: '#8b5cf6', cssColor: 'purple' },
      { key: 'chatbotConversations', label: 'Conversations', icon: <MessageCircle size={18} />, link: '/admin/chatbot', color: '#7c3aed', cssColor: 'violet' },
    ],
  },
  {
    label: 'BLOG',
    color: '#06b6d4',
    boxes: [
      { key: 'categories', label: 'Categories', icon: <Tag size={18} />, link: '/admin/blog/categories', color: '#06b6d4', cssColor: 'cyan' },
      { key: 'tags', label: 'Tags', icon: <Hash size={18} />, link: '/admin/blog/tags', color: '#14b8a6', cssColor: 'teal' },
    ],
  },
  {
    label: 'SEO',
    color: '#10b981',
    boxes: [
      { key: 'seoAudits', label: 'SEO Audits', icon: <Search size={18} />, link: '/admin/seo-audit', color: '#10b981', cssColor: 'green' },
      { key: 'sitemapUrls', label: 'Sitemap URLs', icon: <Map size={18} />, link: '/admin/sitemap', color: '#059669', cssColor: 'emerald' },
      { key: 'robotsRules', label: 'Robots Rules', icon: <Shield size={18} />, link: '/admin/robots', color: '#84cc16', cssColor: 'lime' },
    ],
  },
  {
    label: 'SECURITY',
    color: '#ef4444',
    boxes: [
      { key: 'attacksToday', label: 'Attacks Today', icon: <ShieldAlert size={18} />, link: '/admin/security', color: '#ef4444', cssColor: 'rose' },
      { key: 'totalBlockedEver', label: 'Total Blocked', icon: <ShieldOff size={18} />, link: '/admin/security', color: '#f43f5e', cssColor: 'rose' },
      { key: 'bannedIPs', label: 'Banned IPs', icon: <Ban size={18} />, link: '/admin/security', color: '#dc2626', cssColor: 'red' },
      { key: 'blockedDomains', label: 'Blocked Domains', icon: <Globe size={18} />, link: '/admin/security', color: '#f97316', cssColor: 'orange' },
    ],
  },
  {
    label: 'ADMIN',
    color: '#eab308',
    boxes: [
      { key: 'subAdmins', label: 'Sub Admins', icon: <Users size={18} />, link: '/admin/sub-admins', color: '#eab308', cssColor: 'amber' },
      { key: 'loginLogs', label: 'Login Logs', icon: <LogIn size={18} />, link: '/admin/login-logs', color: '#64748b', cssColor: 'slate' },
      { key: 'failedLoginsToday', label: 'Failed Logins', icon: <LogOut size={18} />, link: '/admin/login-logs', color: '#ef4444', cssColor: 'rose' },
      { key: 'totalInTrash', label: 'Total in Trash', icon: <Trash2 size={18} />, link: '/admin/trash', color: '#ef4444', cssColor: 'red' },
      { key: 'totalRestored', label: 'Total Restored', icon: <RotateCcw size={18} />, link: '/admin/trash', color: '#22c55e', cssColor: 'green' },
      { key: 'totalPermanentlyDeleted', label: 'Deleted Forever', icon: <Trash size={18} />, link: '/admin/trash', color: '#f97316', cssColor: 'orange' },
    ],
  },
]

/* ── Navigation Card Definitions ──────────────────────── */

interface CardDef {
  title: string
  description: string
  href: string
  icon: ReactNode
  color: string
}

const SECTIONS: { label: string; color: string; cards: CardDef[] }[] = [
  {
    label: 'MAIN',
    color: '#0ea5e9',
    cards: [
      { title: 'Dashboard', description: 'View overall site stats', href: '/admin/dashboard', icon: <LayoutDashboard size={22} />, color: '#0ea5e9' },
      { title: 'Queries', description: 'View and respond to contact queries', href: '/admin/queries', icon: <MessageSquare size={22} />, color: '#0ea5e9' },
      { title: 'Digital Products Sales', description: 'Manage orders and digital products', href: '/admin/store', icon: <ShoppingCart size={22} />, color: '#0ea5e9' },
      { title: 'Blog', description: 'Write, edit and manage blog posts', href: '/admin/blog', icon: <FileText size={22} />, color: '#0ea5e9' },
      { title: 'RSS Feeds', description: 'Manage RSS news feeds', href: '/admin/rss', icon: <Rss size={22} />, color: '#0ea5e9' },
      { title: 'Career', description: 'Manage job listings and applications', href: '/admin/career', icon: <Briefcase size={22} />, color: '#0ea5e9' },
    ],
  },
  {
    label: 'CHATBOT',
    color: '#8b5cf6',
    cards: [
      { title: 'Dashboard', description: 'View chatbot stats and conversations', href: '/admin/chatbot', icon: <Bot size={22} />, color: '#8b5cf6' },
    ],
  },
  {
    label: 'SEO',
    color: '#10b981',
    cards: [
      { title: 'Audit Dashboard', description: 'Run and view website SEO audits', href: '/admin/seo-audit', icon: <Search size={22} />, color: '#10b981' },
      { title: 'Audit Settings', description: 'Configure SEO audit settings', href: '/admin/seo-audit/settings', icon: <Settings size={22} />, color: '#10b981' },
      { title: 'Sitemap', description: 'Generate and manage XML sitemap', href: '/admin/sitemap', icon: <Globe size={22} />, color: '#10b981' },
      { title: 'Robots.txt', description: 'Control search engine bot access', href: '/admin/robots', icon: <Shield size={22} />, color: '#10b981' },
    ],
  },
  {
    label: 'SECURITY',
    color: '#ef4444',
    cards: [
      { title: 'Security Dashboard', description: 'Monitor spam bots and attacks', href: '/admin/security', icon: <ShieldAlert size={22} />, color: '#ef4444' },
    ],
  },
  {
    label: 'ADMIN',
    color: '#eab308',
    cards: [
      { title: 'Sub-Admins', description: 'Manage sub admin accounts', href: '/admin/sub-admins', icon: <Users size={22} />, color: '#eab308' },
      { title: 'Change Username', description: 'Update your admin account username', href: '/admin/change-username', icon: <Settings size={22} />, color: '#eab308' },
      { title: 'Log Details', description: 'View all admin login activity', href: '/admin/login-logs', icon: <LogIn size={22} />, color: '#eab308' },
    ],
  },
  {
    label: 'DEBUG',
    color: '#f59e0b',
    cards: [
      { title: 'Debug & Errors', description: 'View error logs and system diagnostics', href: '/admin/debug', icon: <Bug size={22} />, color: '#f59e0b' },
    ],
  },
]

/* ── Skeleton Pulse ───────────────────────────────────── */

function SkeletonBox({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: 10,
        minHeight: 20,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

/* ── Component ────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      const { data, error } = await adminFetch<DashboardStats>('/api/admin/dashboard/stats')
      if (!error && data) {
        setStats(data)
      }
    } catch {
      // ignore
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        setUsername(d.username || '')
        setIsSuperAdmin(d?.role === 'admin')
        loadStats()
      })
      .catch(() => router.push('/admin/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function formatStatValue(val: number | undefined, format?: 'number' | 'currency'): string {
    if (val === undefined) return '—'
    if (format === 'currency') return fmtINR(val)
    return String(val)
  }

  return (
    <div className="admin-layout">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .dash-stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .dash-stat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .dash-stat-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1400px) {
          .dash-stat-grid { grid-template-columns: repeat(6, 1fr); }
        }
        .dash-stat-card.gray::before { background: linear-gradient(90deg, #6b7280, #9ca3af); }
        .dash-stat-card.orange::before { background: linear-gradient(90deg, #f97316, #fb923c); }
        .dash-stat-card.indigo::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .dash-stat-card.violet::before { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
        .dash-stat-card.teal::before { background: linear-gradient(90deg, #14b8a6, #2dd4bf); }
        .dash-stat-card.emerald::before { background: linear-gradient(90deg, #059669, #34d399); }
        .dash-stat-card.lime::before { background: linear-gradient(90deg, #84cc16, #a3e635); }
        .dash-stat-card.red::before { background: linear-gradient(90deg, #dc2626, #f87171); }
        .dash-stat-card.slate::before { background: linear-gradient(90deg, #64748b, #94a3b8); }
        .dash-stat-card.green::before { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .dash-grid-responsive {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .dash-grid-responsive { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .dash-grid-responsive { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1400px) {
          .dash-grid-responsive { grid-template-columns: repeat(6, 1fr); }
        }
      `}</style>

      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* ── PAGE HEADER ── */}
        <div className="admin-topbar">
          <div>
            <h1>Dashboard</h1>
            <div className="sub">
              {username ? `Welcome back, ${username}` : 'Welcome back, Admin'}
            </div>
          </div>
          <div className="admin-header-meta">
            <span className="admin-header-pill">
              <span className="admin-header-dot" /> Super Admin
            </span>
          </div>
        </div>

        {/* ── STAT BOX GROUPS ── */}
        {STAT_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: group.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b',
                }}
              >
                {group.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: '#1e293b',
                  marginLeft: 4,
                }}
              />
            </div>
            <div className="dash-stat-grid">
              {group.boxes.map((box) => (
                <a
                  key={box.key}
                  href={box.link}
                  className={`dash-stat-card ${box.cssColor}`}
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',

                  }}
                >
                  <span className="dash-stat-icon" style={{ color: box.color }}>
                    {box.icon}
                  </span>
                  {statsLoading ? (
                    <div
                      className="dash-stat-value loading"
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <SkeletonBox style={{ width: 50, height: 22, borderRadius: 6 }} />
                    </div>
                  ) : (
                    <div className="dash-stat-value">
                      {formatStatValue(stats?.[box.key], box.format)}
                    </div>
                  )}
                  <div className="dash-stat-label">{box.label}</div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* ── RECENT ACTIVITY ── */}
        <ActivitySummaryWidget debugLink="/admin/debug" />

        {/* ── SECTIONS WITH NAVIGATION CARDS ── */}
        {SECTIONS.map((section) => (
          <div key={section.label} className="dash-section">
            <div className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: section.color,
                  flexShrink: 0,
                }}
              />
              {section.label}
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: '#1e293b',
                  marginLeft: 8,
                }}
              />
            </div>
            <div className="dash-grid-responsive">
              {section.cards.map((card) => (
                <DashboardCard key={card.href} card={card} />
              ))}
            </div>
          </div>
        ))}

        {/* ── TRASH SECTION (super admin only) ── */}
        {isSuperAdmin && <TrashDashboardSection />}

        {/* ── CACHE CLEAR BOX ── */}
        <CacheClearBox />

        {/* ── YELLOW TIP BOX ── */}
        <div
          style={{
            marginTop: 32,
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(234,179,8,0.06), rgba(245,158,11,0.04))',
            border: '1px solid rgba(234,179,8,0.2)',
            borderRadius: 14,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <Lightbulb size={20} style={{ color: '#eab308', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
              Quick Tip
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Use the sidebar on the left to navigate between sections at any time.
              Manage tab admin permissions and access from{' '}
              <a href="/admin/sub-admins" style={{ color: '#7dd3fc', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Sub Admins
              </a>
              . Need help? Reach out to the development team.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


/* ── Dashboard Card — vertical layout ─────────────────── */

function DashboardCard({ card }: { card: CardDef }) {
  return (
    <a href={card.href} className="dash-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, padding: '16px' }}>
      {/* Top row: icon left, arrow right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          className="dash-card-icon"
          style={{ background: `${card.color}14`, color: card.color }}
        >
          {card.icon}
        </div>
        <ArrowRight size={14} className="dash-card-arrow" />
      </div>
      {/* Title */}
      <div className="dash-card-title" style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
        {card.title}
      </div>
      {/* Description */}
      <div className="dash-card-desc" style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4, whiteSpace: 'normal' }}>
        {card.description}
      </div>
    </a>
  )
}
