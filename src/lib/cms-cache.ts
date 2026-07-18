/**
 * CMS In-Memory Cache
 *
 * Simple TTL-based cache for CMS page content to avoid hitting MongoDB
 * on every request. Content is cached for 60 seconds by default.
 *
 * When CMS content is updated via the admin panel, the cache is invalidated
 * automatically through the cache clear API (/api/admin/cache/clear).
 */

interface CacheEntry<T> {
  data: T
  expiry: number
}

const store = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL_MS = 60_000 // 60 seconds

/**
 * Get a value from the CMS cache.
 * Returns undefined if the key doesn't exist or has expired.
 */
export function getFromCache<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiry) {
    store.delete(key)
    return undefined
  }
  return entry.data as T
}

/**
 * Set a value in the CMS cache with an optional TTL.
 * Default TTL is 60 seconds.
 */
export function setInCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiry: Date.now() + ttlMs })
}

/**
 * Clear all CMS cache entries.
 * Called by the cache clear API so admin edits appear immediately.
 */
export function clearCMSCache(): void {
  store.clear()
}
