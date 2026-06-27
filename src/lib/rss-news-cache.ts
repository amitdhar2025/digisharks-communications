import { TTLCache } from './cache'
import { NormalizedItem } from './rss-fetcher'

/**
 * Separate cache module for the /api/rss/news endpoint.
 * Lives in a dedicated file so admin API routes can invalidate it
 * without importing directly from another API route file.
 */

interface NewsCacheValue {
  items: NormalizedItem[]
  total: number
  meta: {
    activeFeedCount: number
    categoryCount: number
    categories: string[]
    categoryCounts: Record<string, number>
  }
}

const newsCache = new TTLCache<NewsCacheValue>(5 * 60 * 1000)

export function getNewsCache(): TTLCache<NewsCacheValue> {
  return newsCache
}

export function invalidateNewsCache(): void {
  newsCache.deleteByPrefix('news:')
}
