'use client'

import { useEffect } from 'react'

/**
 * Dynamically sets the favicon from CMS Site Settings.
 * Injects a <link rel="icon"> element if one isn't already present
 * and updates its href when settings are loaded.
 */
export default function FaviconInjector() {
  useEffect(() => {
    let cancelled = false

    fetch('/api/public/settings')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const favicon = data.settings?.favicon
        if (!favicon) return

        // Find or create the favicon <link> element
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = favicon

        // Also set apple-touch-icon if applicable
        let apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
        if (!apple) {
          apple = document.createElement('link')
          apple.rel = 'apple-touch-icon'
          document.head.appendChild(apple)
        }
        apple.href = favicon
      })
      .catch(() => {
        // Silently fail — the default favicon from metadata will be used
      })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
