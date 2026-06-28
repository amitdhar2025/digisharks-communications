import { LRUCache } from 'lru-cache'

/**
 * Simple IP-based rate limiter that tracks requests per IP address.
 * Blocks any IP making more than `maxRequests` per `windowMs` window.
 *
 * Uses lru-cache so stale entries are evicted automatically without
 * needing a background sweep.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimiter = new LRUCache<string, RateLimitEntry>({
  max: 10_000,                        // keep up to 10 000 IPs
  ttl: 60_000,                         // auto-evict after 1 minute
})

const DEFAULT_WINDOW_MS = 60_000       // 1 minute
const DEFAULT_MAX_REQUESTS = 10        // 10 requests per window

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether `ip` is allowed to proceed.
 *
 * @param ip          The client IP address.
 * @param maxRequests Maximum number of requests allowed in the window (default 10).
 * @param windowMs    Time window in milliseconds (default 60 000 = 1 minute).
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now()

  let entry = rateLimiter.get(ip)

  if (!entry || now >= entry.resetAt) {
    // First request or window expired — start a fresh window
    entry = { count: 1, resetAt: now + windowMs }
    rateLimiter.set(ip, entry)
    return { allowed: true, remaining: maxRequests - 1, resetAt: entry.resetAt }
  }

  // Increment the counter
  entry.count += 1

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract the client IP from a Next.js request, respecting common
 * proxy / CDN headers (X-Forwarded-For, X-Real-IP).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}
