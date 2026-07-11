/**
 * Cache Clearing — logic for clearing all in-memory and Next.js caches.
 * Extracted from the admin cache clear API route for independent testing.
 */

import { revalidatePath } from 'next/cache'

declare global {
  var __appCaches: Map<string, Map<string, unknown>> | undefined
}

/**
 * Clears all registered in-memory caches and invalidates Next.js cache.
 * Returns an array of status messages describing what was cleared.
 */
export function clearAllCaches(): string[] {
  const results: string[] = []

  // 1. Clear each individual cache store, THEN clear the registry
  if (global.__appCaches) {
    const size = global.__appCaches.size
    // Clear each individual cache store first (e.g. TTLCache stores)
    for (const [, cacheStore] of global.__appCaches) {
      if (cacheStore && typeof cacheStore.clear === 'function') {
        cacheStore.clear()
      }
    }
    // Now clear the outer registry
    global.__appCaches.clear()
    results.push(`🧠 Cleared ${size} global cache bucket(s) — individual stores emptied`)
  } else {
    results.push('ℹ️ No global caches registered')
  }

  // 2. Clear Next.js revalidation cache
  try {
    revalidatePath('/', 'layout')
    results.push('🔄 Next.js data cache revalidated')
  } catch {
    results.push('⚠️ Could not revalidate Next.js cache')
  }

  return results
}
