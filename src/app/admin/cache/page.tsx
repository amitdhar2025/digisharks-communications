'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import CacheClearBox from '@/components/admin/CacheClearBox'
import { RotateCcw, Database, HardDrive, Zap, RefreshCw } from 'lucide-react'

export default function CachePage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        setUsername(d.username || '')
      })
      .catch(() => router.push('/admin/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        {/* ── PAGE HEADER ── */}
        <div className="admin-topbar">
          <div>
            <h1>Cache Management</h1>
            <div className="sub">
              {username ? `Welcome back, ${username}` : 'Welcome back, Admin'}
            </div>
          </div>
        </div>

        {/* ── Cache Clear Box ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
              CLEAR CACHE
            </span>
            <div style={{ flex: 1, height: 1, background: '#1e293b', marginLeft: 4 }} />
          </div>
          <CacheClearBox />
        </div>

        {/* ── Cache Info Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            {
              icon: <Database size={20} />,
              title: 'API Response Cache',
              desc: 'Cached API responses for fast page loads. Cleared automatically when content is updated in the admin panel.',
              color: '#6366f1',
            },
            {
              icon: <HardDrive size={20} />,
              title: 'Server Cache (TTL)',
              desc: 'In-memory TTL cache for RSS feeds, chatbot responses, and other server-side data. Automatically expires after 5 minutes.',
              color: '#f59e0b',
            },
            {
              icon: <RefreshCw size={20} />,
              title: 'RSS Feed Cache',
              desc: 'Parsed RSS feed articles are cached for 5 minutes to reduce external fetch calls. Cleared when feeds are updated in admin.',
              color: '#10b981',
            },
            {
              icon: <RotateCcw size={20} />,
              title: 'Next.js Data Cache',
              desc: 'Next.js built-in fetch cache and router cache. Clearing triggers a full page refresh on next visit.',
              color: '#0ea5e9',
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${card.color}14`,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{card.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Info Box ── */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.04))',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 12,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <Zap size={18} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
              How caching works
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Caching improves performance by storing frequently accessed data in memory.
              When you update content in the admin panel (blog posts, pages, menus, etc.),
              caches are automatically invalidated. Use the Clear Cache button above to
              force a full cache reset if changes aren't visible immediately on the frontend.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
