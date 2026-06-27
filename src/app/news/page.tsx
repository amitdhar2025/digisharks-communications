'use client'

import { useEffect, useState, useCallback } from 'react'
import NewsGrid from './components/NewsGrid'
import FilterBar from './components/FilterBar'
import SkeletonCard from './components/SkeletonCard'
import LoadMoreButton from './components/LoadMoreButton'
import EmptyState from './components/EmptyState'

interface NewsItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category: string
  feedId: string
}

interface NewsMeta {
  activeFeedCount: number
  categoryCount: number
  categories: string[]
  categoryCounts: Record<string, number>
}

export default function NewsPage() {
  const [allItems, setAllItems] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<NewsMeta | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const limit = 9

  const fetchNews = useCallback(
    async (p: number, append: boolean) => {
      if (!append) setLoading(true)
      else setLoadingMore(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('category', activeCategory)
        params.set('page', String(p))
        params.set('limit', String(limit))

        const res = await fetch(`/api/rss/news?${params.toString()}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (append) {
          setAllItems((prev) => [...prev, ...(data.items || [])])
        } else {
          setAllItems(data.items || [])
        }
        setTotal(data.total || 0)
        if (data.meta) {
          console.log('[News Page] Categories from API:', data.meta.categories)
          setMeta(data.meta)
        }
        setPage(p)
      } catch (e: any) {
        console.error('Failed to load news:', e)
        setError(e.message || 'Failed to load news')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [activeCategory]
  )

  // Reset and fetch when category changes
  useEffect(() => {
    fetchNews(1, false)
  }, [fetchNews])

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    setAllItems([])
    setPage(1)
  }

  const handleLoadMore = () => {
    fetchNews(page + 1, true)
  }

  return (
    <div style={{ background: '#ffffff' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '140px 5% 2rem',
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', paddingBottom: 28, marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: '#1a1a1a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Latest News
            </h1>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#059669',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live
              </span>
            </div>
          </div>

          <p
            style={{
              fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
              color: '#6c757d',
              maxWidth: 560,
              margin: '0 auto 8px',
              lineHeight: 1.6,
            }}
          >
            Real-time headlines across all topics · Updated automatically
          </p>

          {meta && (
            <p style={{ fontSize: 13, color: '#ff6b00', fontWeight: 600, margin: 0 }}>
              Fetching from {meta.activeFeedCount} active feeds across {meta.categoryCount} categories
            </p>
          )}

          {/* Orange divider below hero */}
          <div
            style={{
              width: 80,
              height: 3,
              background: '#ff6b00',
              borderRadius: 2,
              margin: '20px auto 0',
            }}
          />
        </div>

        {/* Content area with light gray alternating background */}
        <div style={{ background: '#f8f9fa', margin: '0 -5%', padding: '0 5%' }}>
          {/* Dynamic Filter Bar — auto-categorized (Technology, Business, …) */}
          {meta && (
            <FilterBar
              categories={meta.categories || []}
              categoryCounts={meta.categoryCounts || {}}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}

          {/* Error State */}
          {error && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.6 }}>⚠️</div>
              <p style={{ fontSize: 14, color: '#6c757d', marginBottom: 16 }}>{error}</p>
              <button
                onClick={() => fetchNews(1, false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: '#ff6b00',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: 13,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e55f00' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ff6b00' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 20,
                paddingTop: 24,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && meta && meta.activeFeedCount === 0 && (
            <div style={{ paddingTop: 24 }}>
              <EmptyState />
            </div>
          )}

          {/* No results for filter */}
          {!loading && !error && meta && meta.activeFeedCount > 0 && allItems.length === 0 && activeCategory !== 'all' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.6 }}>🔍</div>
              <p style={{ fontSize: 14, color: '#6c757d' }}>
                No articles found in &quot;{activeCategory}&quot; category. Try a different filter.
              </p>
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && allItems.length > 0 && (
            <div style={{ paddingTop: 24 }}>
              <NewsGrid items={allItems} />
            </div>
          )}

          {/* Load More */}
          {!loading && !error && allItems.length > 0 && (
            <LoadMoreButton
              showing={allItems.length}
              total={total}
              loading={loadingMore}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </div>
    </div>
  )
}
