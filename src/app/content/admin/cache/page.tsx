'use client'

import { useEffect, useState } from 'react'
import CacheClearBox from '@/components/admin/CacheClearBox'
import { Zap, Database, HardDrive, RefreshCw, RotateCcw } from 'lucide-react'

export default function CMSAdminCachePage() {
  const [username, setUsername] = useState('')

  useEffect(() => {
    fetch('/api/content/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.username) setUsername(d.username)
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Page header */}
      <div className="cms-page-header">
        <h1>Cache Management</h1>
        <p className="cms-page-subtitle">
          {username ? `Welcome, ${username}` : 'Cache Management'}
        </p>
      </div>

      {/* Cache Clear Box */}
      <div style={{ marginBottom: 24, maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            CLEAR CACHE
          </span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 4 }} />
        </div>
        <CacheClearBox />
      </div>

      {/* Cache Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 24, maxWidth: 800 }}>
        {[
          {
            icon: <Database size={20} />,
            title: 'API Response Cache',
            desc: 'Cached API responses for fast page loads. Cleared automatically when content is updated in the CMS.',
            color: '#6366f1',
          },
          {
            icon: <HardDrive size={20} />,
            title: 'Server Cache (TTL)',
            desc: 'In-memory TTL cache for RSS feeds, chatbot responses, and other server-side data.',
            color: '#f59e0b',
          },
          {
            icon: <RefreshCw size={20} />,
            title: 'RSS Feed Cache',
            desc: 'Parsed RSS feed articles cached for 5 minutes. Cleared when feeds are updated.',
            color: '#10b981',
          },
          {
            icon: <RotateCcw size={20} />,
            title: 'Next.js Data Cache',
            desc: 'Built-in fetch cache and router cache. Clearing triggers a full page refresh.',
            color: '#0ea5e9',
          },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{card.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.04))',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          maxWidth: 800,
        }}
      >
        <Zap size={18} style={{ color: '#6366f1', flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
            How caching works
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
            Caching improves performance by storing frequently accessed data in memory.
            When you update content in the CMS (pages, menus, settings, etc.), caches are
            automatically invalidated. Use the Clear Cache button above to force a full cache
            reset if changes are not visible immediately on the frontend.
          </div>
        </div>
      </div>
    </div>
  )
}
