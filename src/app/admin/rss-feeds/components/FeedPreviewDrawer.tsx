'use client'

import { useEffect, useState } from 'react'

interface PreviewItem {
  title: string
  link: string
  pubDate: string
}

interface FeedPreviewDrawerProps {
  feedName: string
  feedUrl: string
  onClose: () => void
}

export default function FeedPreviewDrawer({ feedName, feedUrl, onClose }: FeedPreviewDrawerProps) {
  const [items, setItems] = useState<PreviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/admin/rss/preview?url=${encodeURIComponent(feedUrl)}&limit=5`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch')
        setItems(data.items || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [feedUrl])

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch { return iso }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 420,
          maxWidth: '100vw',
          height: '100%',
          background: '#0f172a',
          borderLeft: '1px solid #1e293b',
          padding: 24,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Feed Preview</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>{feedName}</p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '6px 10px', fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        <a
          href={feedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontSize: 12,
            color: '#7dd3fc',
            marginBottom: 16,
            wordBreak: 'break-all',
          }}
        >
          {feedUrl}
        </a>

        {loading && (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
            <span className="spinner" /> Loading headlines...
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            No headlines found in this feed.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
              Latest {items.length} headlines
            </div>
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  background: '#0b1220',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0ea5e9')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {item.pubDate ? formatDate(item.pubDate) : ''}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
