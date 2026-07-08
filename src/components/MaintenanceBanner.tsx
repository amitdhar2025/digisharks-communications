'use client'

import { useState, useEffect } from 'react'

/**
 * MaintenanceBanner
 *
 * A subtle top banner shown in admin/CMS panels when the site is in
 * maintenance mode. Helps admins remember to turn it off after work
 * is complete.
 *
 * Place this at the top of admin layouts.
 */
export default function MaintenanceBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setVisible(!!(data.settings || {}).maintenanceMode)
      })
      .catch(() => {
        // If settings API is unreachable, don't show a broken banner
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!visible) return null

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>🔧</span>
      <span style={styles.text}>
        Maintenance mode is <strong>active</strong> — public visitors see a
        maintenance page.
      </span>
      <a href="/content/admin/settings" style={styles.link}>
        Turn off →
      </a>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 18px',
    background: 'rgba(249, 115, 22, 0.12)',
    borderBottom: '1px solid rgba(249, 115, 22, 0.25)',
    fontSize: 13,
    color: '#fb923c',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lineHeight: 1.5,
  },
  icon: {
    fontSize: 16,
    flexShrink: 0,
  },
  text: {
    flex: 1,
  },
  link: {
    color: '#fb923c',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    fontWeight: 600,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
}
