'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * MaintenanceGuard
 *
 * Fetches maintenance mode from the public settings API and shows a
 * full-screen maintenance page when enabled, unless the current route
 * is an admin or CMS admin path.
 */
export default function MaintenanceGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // Default to inactive so the site renders immediately — no blank flash
  // while the settings API responds.
  const [maintenance, setMaintenance] = useState<{
    active: boolean
    message: string
    email: string
  }>({ active: false, message: '', email: '' })

  useEffect(() => {
    // Skip fetch for admin/CMS routes — admins always see the site
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/content') ||
      pathname.startsWith('/api')
    ) {        setMaintenance({ active: false, message: '', email: '' })
      return
    }

    let cancelled = false

    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const s = data.settings || {}
        setMaintenance({
          active: !!s.maintenanceMode,
          message:
            s.maintenanceMessage ||
            'We\'re giving our website a performance upgrade. Our team is working on it and we\'ll be back shortly. For urgent inquiries, contact us at marketing@digisharkscommunications.com.',
          email: s.email || 'marketing@digisharkscommunications.com',
        })
      })
      .catch(() => {
        if (cancelled) return
        // If settings API is unreachable, let the site render normally
        setMaintenance({ active: false, message: '', email: '' })
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  // Still loading — show nothing (prevents flash of maintenance page)
  // Maintenance mode is OFF — render children normally
  if (!maintenance.active) {
    return <>{children}</>
  }

  // Maintenance mode is ON — show full-screen maintenance page
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.icon}>🔧</div>
        <h1 style={styles.heading}>Under Maintenance</h1>
        <p style={styles.message}>{maintenance.message}</p>

        <div style={styles.contactBar}>
          <span style={styles.contactIcon}>📧</span>
          <span style={styles.contactText}>
            Reach us at{" "}
            <a href={`mailto:${maintenance.email}`} style={styles.contactLink}>
              {maintenance.email}
            </a>
          </span>
        </div>

        <div style={styles.etaBar}>
          <span style={styles.etaDot} />
          <span style={styles.etaText}>Estimated return: soon</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0b1220',
    padding: '24px',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  },
  card: {
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    padding: '48px 32px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: '0 0 12px',
  },
  message: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: 0,
  },
  contactBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: '8px 16px',
    background: 'rgba(14, 165, 233, 0.08)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: 8,
    fontSize: 13,
    color: '#7dd3fc',
  },
  contactIcon: {
    fontSize: 14,
  },
  contactText: {
    lineHeight: 1.4,
  },
  contactLink: {
    color: '#38bdf8',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    fontWeight: 600,
  },
  etaBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    fontSize: 12,
    color: '#64748b',
  },
  etaDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#f97316',
    animation: 'none',
  },
  etaText: {
    lineHeight: 1.3,
  },
}
