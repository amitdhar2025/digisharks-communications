/**
 * CMS Page Content Helper
 *
 * Used by public-facing pages (page.tsx) to fetch editable content
 * from the CMS, falling back to hardcoded default values.
 *
 * Usage in a page:
 *   import { getPageContent } from '@/lib/cms-page-content'
 *   const content = await getPageContent('about-us')
 *   // content.heroHeading ?? defaultHeroHeading
 */

import PageContent from '@/models/PageContent'
import { connectCMSDb } from '@/lib/db-cms'
import { getFromCache, setInCache } from '@/lib/cms-cache'

/**
 * Fetch CMS content for a page by its slug.
 * Returns null if no CMS content exists (the caller should use hardcoded defaults).
 *
 * Uses an in-memory TTL cache (60s) to avoid hitting MongoDB on every request.
 * Cache is cleared automatically when the admin clears the cache.
 *
 * @param {string} pageSlug - e.g. 'about-us', 'home', 'services-top-pr-digital-marketing'
 * @returns {Promise<object|null>} The content object from CMS, or null
 */
export async function getPageContent(pageSlug) {
  // Check cache first
  const cacheKey = `cms:${pageSlug}`
  const cached = getFromCache(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  try {
    await connectCMSDb()
    const doc = await PageContent.findOne({ pageSlug })
    let result = null
    if (doc && doc.content && Object.keys(doc.content).length > 0) {
      result = doc.content
    }
    // Cache the result (even null, to avoid repeated failed lookups)
    setInCache(cacheKey, result, 60_000)
    return result
  } catch (err) {
    console.error(`[cms] Failed to fetch content for "${pageSlug}":`, err)
    return null
  }
}

/**
 * Fetch CMS content with a fallback object.
 * The fallback is used as-is when no CMS content exists.
 *
 * @param {string} pageSlug
 * @param {object} fallback - Default content values
 * @returns {Promise<object>} Merged content (CMS overrides fallback keys)
 */
export async function getPageContentWithFallback(pageSlug, fallback = {}) {
  const cmsContent = await getPageContent(pageSlug)
  if (!cmsContent) return fallback
  return { ...fallback, ...cmsContent }
}

/**
 * Public API route handler — for client-side fetching from page components.
 * Can be used by client components that need content without a page reload.
 *
 * Example:
 *   fetch('/api/public/content/about-us')
 *     .then(r => r.json())
 *     .then(data => setContent(data.content))
 */
export async function getPublicPageContent(pageSlug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/public/content/${pageSlug}`,
      { next: { revalidate: 60 } } // ISR: revalidate every 60 seconds
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.content || null
  } catch {
    return null
  }
}
