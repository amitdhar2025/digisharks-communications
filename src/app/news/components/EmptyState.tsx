'use client'

import Link from 'next/link'

export default function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 20px',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>
        📡
      </div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#1a1a1a',
          fontFamily: 'var(--font-sora), ui-sans-serif, system-ui, sans-serif',
          marginBottom: 8,
        }}
      >
        No feeds configured yet
      </h2>
      <p style={{ fontSize: 14, color: '#6c757d', lineHeight: 1.7, marginBottom: 20 }}>
        Go to <strong>Admin → RSS Feeds</strong> to add your first RSS feed.
        Once feeds are active, the latest headlines will appear here automatically.
      </p>
      <Link
        href="/admin/rss-feeds"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          background: '#ff6b00',
          color: '#ffffff',
          textDecoration: 'none',
          border: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e55f00'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ff6b00'
        }}
      >
        Go to RSS Feed Manager →
      </Link>
    </div>
  )
}
