'use client'

import { categoryColor } from '@/lib/news-categorizer'

interface NewsCardItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category: string
  feedId: string
}

interface NewsCardProps {
  item: NewsCardItem
  variant?: 'large' | 'medium' | 'small'
}

function timeAgo(dateStr: string): string {
  try {
    const now = Date.now()
    const date = new Date(dateStr).getTime()
    const diffMs = now - date
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m) return { r: 255, g: 107, b: 0 }
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) }
}

function tint(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function NewsCard({ item, variant = 'small' }: NewsCardProps) {
  const isLarge = variant === 'large'
  const isMedium = variant === 'medium'
  const cat = item.category || 'General'
  const color = categoryColor(cat)

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: isLarge ? 24 : 16,
        textDecoration: 'none',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        height: '100%',
        position: 'relative',
        borderTop: isLarge ? `4px solid ${color}` : '1px solid #e5e7eb',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 4px 12px ${tint(color, 0.18)}`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Category badge — colored to match the auto-detected category */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: color,
          background: tint(color, 0.12),
          marginBottom: isLarge ? 14 : 10,
        }}
      >
        {cat}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-sora), ui-sans-serif, system-ui, sans-serif',
          fontSize: isLarge ? 20 : isMedium ? 16 : 14,
          fontWeight: 700,
          color: '#1a1a1a',
          lineHeight: 1.3,
          margin: 0,
          marginBottom: isLarge ? 10 : 6,
          display: '-webkit-box',
          WebkitLineClamp: isLarge ? 3 : 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.title}
      </h3>

      {/* Description (only for large/medium) */}
      {(isLarge || isMedium) && item.description && (
        <p
          style={{
            fontSize: isLarge ? 14 : 13,
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0,
            marginBottom: 'auto',
            display: '-webkit-box',
            WebkitLineClamp: isLarge ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {item.description}
        </p>
      )}

      {/* Spacer for small cards */}
      {!isLarge && !isMedium && <div style={{ flex: 1 }} />}

      {/* Bottom row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: isLarge ? 16 : 12,
          paddingTop: isLarge ? 14 : 10,
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: isLarge ? 12 : 11,
              color: '#6c757d',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.source}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: isLarge ? 12 : 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
            {timeAgo(item.pubDate)}
          </span>
          <span
            style={{
              fontSize: isLarge ? 13 : 11,
              fontWeight: 600,
              color: '#ff6b00',
              whiteSpace: 'nowrap',
            }}
          >
            Read →
          </span>
        </div>
      </div>
    </a>
  )
}
