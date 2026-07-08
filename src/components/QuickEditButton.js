'use client'

import { useState, useEffect } from 'react'

/**
 * QuickEditButton — Floating edit button for CMS admins.
 *
 * Renders a small button in the bottom-right corner of the page
 * that links directly to the CMS editor for the current page.
 * Only visible to logged-in CMS admins (checks auth on mount).
 *
 * @param {Object} props
 * @param {string} props.slug - The CMS page slug (e.g. 'home', 'about-us')
 * @param {string} [props.label] - Optional label override (default: 'Edit this page')
 * @param {string} [props.position] - Optional position override (default: 'bottom-right')
 */
export default function QuickEditButton({ slug, label, position }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const res = await fetch('/api/content/admin/me')
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          setIsLoggedIn(data.loggedIn === true)
        }
      } catch {
        // Silently fail — treat as not logged in
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    checkAuth()

    return () => { cancelled = true }
  }, [])

  // Don't render anything while checking, or if not logged in
  if (checking || !isLoggedIn) return null

  const btnLabel = label || '✏️ Edit this page'
  const pos = position || 'bottom-right'

  const positionStyles = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' },
  }

  const posStyle = positionStyles[pos] || positionStyles['bottom-right']

  return (
    <a
      href={`/content/admin/pages/${slug}/edit`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        zIndex: 9999,
        ...posStyle,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        background: '#FF5B2E',
        color: '#fff',
        border: 'none',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textDecoration: 'none',
        boxShadow: '0 4px 16px rgba(255,91,46,0.4)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,91,46,0.5)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,91,46,0.4)'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      {btnLabel}
    </a>
  )
}
