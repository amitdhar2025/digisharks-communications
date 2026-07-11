/**
 * Generic in-memory TTL cache with automatic expiry.
 * Keys are evicted after `ttlMs` milliseconds from set time.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private readonly ttlMs: number

  constructor(ttlMs: number) {
    if (ttlMs <= 0) throw new Error('TTL must be > 0')
    this.ttlMs = ttlMs
    // Register this cache instance in the global registry for admin cache clearing
    if (typeof globalThis !== 'undefined') {
      if (!global.__appCaches) global.__appCaches = new Map()
      // Use a unique key based on the instance
      const key = `ttl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      global.__appCaches.set(key, this.store)
    }
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  /** Delete all entries whose key starts with the given prefix. */
  deleteByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    // Run GC first so size is accurate
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key)
    }
    return this.store.size
  }
}
