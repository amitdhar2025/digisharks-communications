import Parser from 'rss-parser'
import { TTLCache } from './cache'

/**
 * Wrapper around rss-parser with per-URL 5-minute in-memory caching,
 * error handling, and normalized item output.
 */

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; DigiSharksRSS/1.0; +https://digisharks-communications.vercel.app)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: ['media:content'],
  },
})

const feedCache = new TTLCache<Parser.Output<{ [key: string]: any }>>(5 * 60 * 1000) // 5 minutes

export interface NormalizedItem {
  title: string
  link: string
  description: string
  pubDate: string
  isoDate: string | undefined
  source: string
  feedName: string
  category: string
  feedId: string
}

export interface ParseResult {
  items: NormalizedItem[]
  feedTitle: string
  articleCount: number
}

/**
 * Parse a single RSS feed URL.
 * Returns a ParseResult with normalized items, or throws on error.
 */
export async function parseFeed(url: string): Promise<ParseResult> {
  const cached = feedCache.get(url)
  let feed: Parser.Output<{ [key: string]: any }>

  if (cached) {
    feed = cached
  } else {
    feed = await parser.parseURL(url)
    feedCache.set(url, feed)
  }

  const feedTitle = feed.title || 'Untitled Feed'
  const items: NormalizedItem[] = (feed.items || []).map((item) => ({
    title: item.title || 'Untitled',
    link: item.link || '',
    description: item.contentSnippet || item.content || item.description || '',
    pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
    isoDate: item.isoDate,
    source: feedTitle,
    feedName: '',
    category: '',
    feedId: '',
  }))

  return {
    items,
    feedTitle,
    articleCount: items.length,
  }
}

/**
 * Parse multiple RSS feeds in parallel using Promise.allSettled.
 * Failing feeds are skipped silently — other feeds still return.
 */
export async function parseFeeds(
  feeds: { _id: string; name: string; url: string; category: string }[]
): Promise<{ results: NormalizedItem[]; errors: { feedId: string; name: string; error: string }[] }> {
  const settled = await Promise.allSettled(
    feeds.map((feed) =>
      parseFeed(feed.url).then((result) => ({
        feedId: feed._id,
        feedName: feed.name,
        category: feed.category,
        result,
      }))
    )
  )

  const results: NormalizedItem[] = []
  const errors: { feedId: string; name: string; error: string }[] = []

  for (const s of settled) {
    if (s.status === 'fulfilled') {
      const { feedId, feedName, category, result } = s.value
      for (const item of result.items) {
        item.source = feedName
        item.feedName = feedName
        item.category = category
        item.feedId = feedId
      }
      results.push(...result.items)
    } else {
      errors.push({
        feedId: 'unknown',
        name: 'unknown',
        error: s.reason?.message || 'Unknown parse error',
      })
    }
  }

  return { results, errors }
}

/**
 * Invalidate the cache for a specific feed URL.
 * Called when admin edits/deletes a feed.
 */
export function invalidateFeedCache(url: string): void {
  feedCache.delete(url)
}

/** Clear the entire RSS cache. */
export function clearFeedCache(): void {
  feedCache.clear()
}
