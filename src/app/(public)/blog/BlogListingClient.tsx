'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { BlogContent } from '@/lib/blog-content'

interface Category {
  _id: string
  name: string
  slug: string
  color: string
}

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  shortDescription?: string
  coverImage?: string
  featuredImage?: { url: string; publicId: string } | null
  authorImage?: string
  isFeatured?: boolean
  author: string
  categories: Category[]
  tags: { _id: string; name: string; slug: string }[]
  publishedAt?: string
  readingTime: number
  views: number
  comments: number
}

export default function BlogListingClient({ content }: { content?: BlogContent }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = 9

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (activeCategory) params.set('category', activeCategory)

      const res = await fetch(`/api/blog/posts?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data || !Array.isArray(data.posts)) throw new Error('Invalid response')
      setPosts(data.posts || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (err: any) {
      console.error('Failed to load blog posts:', err)
      setError(err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [page, activeCategory])

  useEffect(() => { loadPosts() }, [loadPosts])

  useEffect(() => {
    fetch('/api/blog/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.categories)) setCategories(d.categories)
      })
      .catch(() => {})
  }, [])

  function handleCategoryClick(slug: string) {
    setPage(1)
    setActiveCategory(slug === activeCategory ? '' : slug)
  }

  function formatDate(iso?: string) {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return '' }
  }

  const imageUrl = (post: BlogPost) => post.coverImage || post.featuredImage?.url || ''

  return (
    <div className="blog-page">
      {/* Hero Banner */}
      <div className="blog-hero-banner">
        <img
          src={content?.heroImage || '/blog.webp'}
          alt={content?.heroHeading || 'Digisharks Blog'}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="blog-hero-overlay">
          <h1>{content?.heroHeading || 'Digisharks Blog'}</h1>
          <p>{content?.heroDescription || 'Insights, analysis, and stories on digital PR, marketing, technology, and business growth.'}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="blog-categories">
        <button
          className={`blog-cat-pill ${!activeCategory ? 'active' : ''}`}
          onClick={() => { setActiveCategory(''); setPage(1) }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`blog-cat-pill ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="blog-error">
          <div className="blog-error-icon">⚠️</div>
          <p>Unable to load articles. Please try again.</p>
          <button onClick={loadPosts} className="blog-cat-pill active">
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="blog-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="blog-card skeleton">
              <div className="blog-card-image-wrap">
                <div className="blog-card-image-placeholder" style={{ height: '100%' }} />
              </div>
              <div className="blog-card-body">
                <div className="blog-skeleton" style={{ width: '80%', height: 18, marginBottom: '0.5rem' }} />
                <div className="blog-skeleton" style={{ width: '100%', height: 12, marginBottom: '0.3rem' }} />
                <div className="blog-skeleton" style={{ width: '70%', height: 12, marginBottom: '1rem' }} />
                <div className="blog-skeleton" style={{ width: '40%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!error && !loading && posts.length === 0 && (
        <div className="blog-empty">
          <div className="blog-empty-icon">📭</div>
          <p>{activeCategory ? 'No articles found in this category yet. Check back soon!' : 'No articles published yet. Check back soon!'}</p>
          {activeCategory && (
            <button className="blog-cat-pill" onClick={() => { setActiveCategory(''); setPage(1) }}>
              View all articles
            </button>
          )}
        </div>
      )}

      {/* Posts grid */}
      {!error && !loading && posts.length > 0 && (
        <>
          <div className="blog-grid">
            {posts.map((post) => {
              const img = imageUrl(post)
              return (
                <Link key={post._id} href={`/blog/${post.slug}`} className="blog-card">
                  <div className="blog-card-image-wrap">
                    {img ? (
                      <img src={img} alt={post.title} className="blog-card-image" loading="lazy" />
                    ) : (
                      <div className="blog-card-image-placeholder">📰</div>
                    )}
                    {post.isFeatured && (
                      <div className="blog-card-featured-badge">
                        ★ Featured
                      </div>
                    )}
                    {post.categories.length > 0 && (
                      <div className="blog-card-category-overlay">
                        <span
                          className="blog-card-category-badge"
                          style={{ background: post.categories[0].color || '#4F46E5', color: '#fff' }}
                        >
                          {post.categories[0].name}
                        </span>
                      </div>
                    )}
                    {/* Title overlay on bottom of image */}
                    <div className="blog-card-title-overlay">
                      <h3>{post.title}</h3>
                    </div>
                  </div>
                  <div className="blog-card-body">
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-description">
                      {post.excerpt || post.shortDescription || ''}
                    </p>
                    <span className="blog-card-read-more">
                      READ MORE →
                    </span>
                    <div className="blog-card-footer">
                      <div className="blog-card-author">
                        <div className="blog-card-author-avatar">
                          {post.authorImage ? (
                            <img src={post.authorImage} alt={post.author} />
                          ) : (
                            (post.author || 'D')[0]
                          )}
                        </div>
                        <span>{post.author || 'Digisharks Team'}</span>
                      </div>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="blog-pagination">
              <button
                className="blog-pag-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              {Array.from({ length: pages }).map((_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    className={`blog-pag-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                className="blog-pag-btn"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
