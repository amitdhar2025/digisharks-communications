'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

interface SubAdminPermissions {
  blog: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  store: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  career: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  chatbot: { view: boolean; manage: boolean; settings: boolean }
  seoAudit: { view: boolean; delete: boolean }
  rss: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  queries: { view: boolean; edit: boolean; delete: boolean; export: boolean }
}

interface MeResponse {
  authenticated: boolean
  username?: string
  role?: 'admin' | 'sub-admin'
  permissions?: SubAdminPermissions | null
}

/** Map each permission section to its admin URL */
const SECTION_URLS: Record<keyof SubAdminPermissions, string> = {
  queries: '/admin/queries',
  store: '/admin/store',
  blog: '/admin/blog',
  rss: '/admin/rss',
  career: '/admin/career',
  chatbot: '/admin/chatbot',
  seoAudit: '/admin/seo-audit',
}

interface DashboardStats {
  queries: number
  orders: number
  revenue: number
  blogPosts: number
  careerApps: number
  rssFeeds: number
}

const QUICK_LINKS: { href: string; label: string; icon: string; description: string; tag: 'main' | 'chatbot' | 'seo' | 'admin' }[] = [
  { href: '/admin/queries', label: 'Contact Queries', icon: '📋', description: 'View & respond to contact-form submissions.', tag: 'main' },
  { href: '/admin/store', label: 'Digital Products Sales', icon: '🛒', description: 'Manage product orders and pricing.', tag: 'main' },
  { href: '/admin/blog', label: 'Blog Posts', icon: '📝', description: 'Create, edit, and publish blog posts.', tag: 'main' },
  { href: '/admin/rss', label: 'RSS Feeds', icon: '📡', description: 'Curate the news & RSS feed sources.', tag: 'main' },
  { href: '/admin/career', label: 'Career', icon: '💼', description: 'Manage job postings & applications.', tag: 'main' },
  { href: '/admin/chatbot', label: 'Chatbot Dashboard', icon: '🤖', description: 'Stats and Q&A manager for the chatbot.', tag: 'chatbot' },
  { href: '/admin/chatbot/qna', label: 'Q&A Manager', icon: '💬', description: 'Edit the chatbot knowledge base.', tag: 'chatbot' },
  { href: '/admin/seo-audit', label: 'SEO Audit', icon: '🔍', description: 'Review site audit reports and tools.', tag: 'seo' },
  { href: '/admin/seo-audit/settings', label: 'Audit Settings', icon: '⚙', description: 'Configure Lighthouse / PageSpeed keys.', tag: 'seo' },
  { href: '/admin/sub-admins', label: 'Sub-Admin Management', icon: '👥', description: 'Create & manage sub-admin accounts.', tag: 'admin' },
]

const TAG_LABEL: Record<string, string> = {
  main: '📋 Management',
  chatbot: '🤖 Chatbot',
  seo: '🔍 SEO',
  admin: '⚙ System',
}

function fmtINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function DashboardOverview() {
  const router = useRouter()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d: MeResponse) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        // Dashboard is for super admins only
        if (d.role === 'sub-admin') {
          // Find the first section this sub-admin has access to
          const perms = d.permissions
          const firstAccessible = (Object.keys(SECTION_URLS) as (keyof SubAdminPermissions)[])
            .find((section) => {
              if (!perms?.[section]) return false
              return Object.values(perms[section]).some(Boolean)
            })
          if (firstAccessible) {
            router.push(SECTION_URLS[firstAccessible])
          } else {
            router.push('/admin/login')
          }
          return
        }
        setMe(d)
      })
      .catch(() => {
        setMe({ authenticated: false })
        router.push('/admin/login')
      })
  }, [router])

  // Fetch dashboard stats from multiple admin APIs
  useEffect(() => {
    if (me?.role !== 'admin') return

    Promise.allSettled([
      fetch('/api/admin/queries?limit=1').then((r) => r.json()),
      fetch('/api/admin/orders').then((r) => r.json()),
      fetch('/api/admin/blog/posts?limit=1').then((r) => r.json()),
      fetch('/api/admin/career/applications?limit=1').then((r) => r.json()),
      fetch('/api/admin/rss/stats').then((r) => r.json()),
    ]).then((results) => {
      const get = <T,>(r: PromiseSettledResult<T>, fallback: T) =>
        r.status === 'fulfilled' ? r.value : fallback

      const queriesData = get<any>(results[0], {})
      const ordersData = get<any>(results[1], {})
      const blogData = get<any>(results[2], {})
      const careerData = get<any>(results[3], {})
      const rssData = get<any>(results[4], {})

      setStats({
        queries: queriesData.total ?? 0,
        orders: ordersData.stats?.totalOrders ?? 0,
        revenue: ordersData.stats?.totalRevenue ?? 0,
        blogPosts: blogData.total ?? 0,
        careerApps: careerData.total ?? 0,
        rssFeeds: rssData.totalFeeds ?? 0,
      })
      setStatsLoading(false)
    }).catch(() => setStatsLoading(false))
  }, [me])

  const uniqueTags = [...new Set(QUICK_LINKS.map((l) => l.tag))]

  const statCards = [
    { icon: '📋', value: stats?.queries, label: 'Contact Queries', color: 'blue' },
    { icon: '🛒', value: stats?.orders, label: 'Orders', color: 'green' },
    { icon: '💰', value: stats ? fmtINR(stats.revenue) : undefined, label: 'Revenue', color: 'amber' },
    { icon: '📝', value: stats?.blogPosts, label: 'Blog Posts', color: 'purple' },
    { icon: '💼', value: stats?.careerApps, label: 'Applications', color: 'rose' },
    { icon: '📡', value: stats?.rssFeeds, label: 'RSS Feeds', color: 'cyan' },
  ]

  return (
    <div className="admin-layout">
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
        {/* Standard admin topbar — consistent with all other admin pages */}
        <div className="admin-topbar">
          <div>
            <h1>📊 Dashboard</h1>
            <div className="sub">
              {me?.username ? `Welcome back, ${me.username}` : 'Admin overview'} &middot; Super Admin
            </div>
          </div>
          <div className="admin-header-meta">
            <span className="admin-header-pill">
              <span className="admin-header-dot" /> Super Admin
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="dash-stats">
          {statCards.map((s) => (
            <div key={s.label} className={`dash-stat-card ${s.color}`}>
              <span className="dash-stat-icon">{s.icon}</span>
              <div className={`dash-stat-value${statsLoading ? ' loading' : ''}`}>
                {statsLoading ? '—' : (s.value ?? '—')}
              </div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links Sections */}
        {uniqueTags.map((tag) => (
          <section key={tag} className="dash-section">
            <div className="dash-section-title">{TAG_LABEL[tag]}</div>
            <div className="dash-grid">
              {QUICK_LINKS.filter((l) => l.tag === tag).map((l) => (
                <a key={l.href} className="dash-card" href={l.href}>
                  <div className="dash-card-icon">{l.icon}</div>
                  <div className="dash-card-body">
                    <div className="dash-card-title">{l.label}</div>
                    <div className="dash-card-desc">{l.description}</div>
                  </div>
                  <div className="dash-card-arrow">→</div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Tip */}
        <div className="dash-tip">
          <div className="dash-tip-title">💡 Quick tip</div>
          <div className="dash-tip-body">
            Use the sidebar on the left to navigate between sections at any time.
            Manage sub-admin permissions and access from{' '}
            <a href="/admin/sub-admins">Sub-Admins</a>.
            Need help? Reach out to the development team.
          </div>
        </div>
      </main>
    </div>
  )
}
