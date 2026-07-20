'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import '../blog.css'

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
  content: string
  excerpt: string
  shortDescription?: string
  coverImage?: string
  featuredImage?: { url: string; publicId: string; alt: string } | null
  bannerImage?: { url: string; publicId: string; alt: string } | null
  videoUrl?: string
  author: string
  authorImage?: string
  authorBio?: string
  categories: Category[]
  tags: { _id: string; name: string; slug: string }[]
  publishedAt?: string
  readingTime: number
  views: number
  comments: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[] | string
  ogTitle?: string
  ogDescription?: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([])
  const [allTags, setAllTags] = useState<{ _id: string; name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('')
  const [readProgress, setReadProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Load post
  useEffect(() => {
    if (!params.slug) return
    setLoading(true)
    setError(null)

    fetch(`/api/blog/posts/${params.slug}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Post not found')
        setPost(data.post)
        setRelated(data.related || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.slug])

  // Load latest posts & tags
  useEffect(() => {
    fetch('/api/blog/posts?limit=5')
      .then((r) => r.json())
      .then((d) => { if (d?.posts) setLatestPosts(d.posts) })
      .catch(() => {})
    fetch('/api/blog/tags')
      .then((r) => r.json())
      .then((d) => { if (d?.tags) setAllTags(d.tags) })
      .catch(() => {})
  }, [])

  // Reading progress bar
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setReadProgress(Math.min(100, (scrollTop / docHeight) * 100))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll spy for TOC
  useEffect(() => {
    if (!post) return
    const headings = document.querySelectorAll('.blog-detail-content h2, .blog-detail-content h3')
    if (!headings.length) return

    function handleScroll() {
      let current = ''
      headings.forEach((h) => {
        const rect = h.getBoundingClientRect()
        if (rect.top <= 120) {
          current = h.textContent || ''
        }
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [post])

  // Scroll to heading
  function scrollToHeading(text: string) {
    const headings = document.querySelectorAll('.blog-detail-content h2, .blog-detail-content h3')
    for (const h of headings) {
      if (h.textContent === text) {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }

  // Update SEO meta tags
  useEffect(() => {
    if (!post) return
    const title = post.seoTitle || post.title || 'Digisharks Blog'
    document.title = title

    // Get or create meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', post.seoDescription || post.excerpt || post.shortDescription || '')

    // Get or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.appendChild(metaKeywords)
    }
    const keywords = Array.isArray(post.seoKeywords) ? post.seoKeywords.join(', ') : (post.seoKeywords || '')
    metaKeywords.setAttribute('content', keywords)

    // Add og:title and og:description if they don't exist
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', post.ogTitle || title)

    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (!ogDesc) {
      ogDesc = document.createElement('meta')
      ogDesc.setAttribute('property', 'og:description')
      document.head.appendChild(ogDesc)
    }
    ogDesc.setAttribute('content', post.ogDescription || post.seoDescription || post.excerpt || '')
  }, [post])

  function formatDate(iso?: string) {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return '' }
  }

  function getPostUrl(): string {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/blog/${post?.slug}`
  }

  function shareOn(platform: string) {
    const url = getPostUrl()
    const text = post?.title || ''
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    }
    window.open(urls[platform] || '', '_blank', 'width=600,height=400')
  }

  // Extract headings from content for TOC
  function extractHeadings(html: string): { level: number; text: string }[] {
    const headings: { level: number; text: string }[] = []
    const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
    let match
    while ((match = regex.exec(html)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '').trim()
      if (text) headings.push({ level: parseInt(match[1]), text })
    }
    return headings
  }

  function getJsonLd() {
    if (!post) return ''
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://digisharkscommunications.com'
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || post.shortDescription,
      image: post.coverImage || post.featuredImage?.url || '',
      author: { '@type': 'Person', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'Digisharks Communications',
        logo: { '@type': 'ImageObject', url: `${siteUrl}/darks.avif` },
      },
      datePublished: post.publishedAt || '',
      dateModified: post.publishedAt || '',
      mainEntityOfPage: { '@type': 'WebPage', '@id': getPostUrl() },
    })
  }

  if (loading) {
    return (
      <div className="blog-detail-layout">
        <div className="blog-detail-hero" style={{ height: 380, background: 'var(--surface2)' }} />
        <div style={{ maxWidth: 800, margin: '2rem auto 0' }}>
          <div className="blog-skeleton" style={{ height: 32, width: '70%', marginBottom: '1rem' }} />
          <div className="blog-skeleton" style={{ height: 16, width: '40%', marginBottom: '2rem' }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="blog-skeleton" style={{ height: 14, width: '100%', marginBottom: '0.6rem' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="blog-detail-layout" style={{ textAlign: 'center', paddingTop: '160px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Article Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/blog" className="blog-cat-pill active" style={{ textDecoration: 'none' }}>
          ← Back to Blog
        </Link>
      </div>
    )
  }

  const displayImage = post.coverImage || post.featuredImage?.url || post.bannerImage?.url || ''
  const tocHeadings = extractHeadings(post.content)
  const categoryColor = post.categories[0]?.color || '#4F46E5'

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readProgress}%` }} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: getJsonLd() }} />

      <div className="blog-detail-layout">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/blog">Blog</Link>
          {post.categories.length > 0 && (
            <>
              <span className="breadcrumb-sep">›</span>
              <Link href={`/blog?category=${post.categories[0].slug}`}>
                {post.categories[0].name}
              </Link>
            </>
          )}
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{post.title}</span>
        </div>

        <div className="blog-detail-wrapper">
          {/* MAIN CONTENT */}
          <div className="blog-detail-main">
            {/* SEO Title H1 */}
            <h1 className="blog-detail-title">{post.title}</h1>

            {/* Author details line */}
            <div className="blog-detail-meta-line">
              <span>{post.author}</span>
              <span className="blog-detail-meta-sep">·</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span className="blog-detail-meta-sep">·</span>
              <span>{post.readingTime} min read</span>
            </div>

            {/* Hero Image */}
            <div className="blog-detail-hero">
              {displayImage ? (
                <img src={displayImage} alt={post.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface2), #FFD6E4)' }} />
              )}
              {post.categories.length > 0 && (
                <span
                  className="blog-detail-hero-category"
                  style={{ background: categoryColor, color: 'var(--surface)' }}
                >
                  {post.categories[0].name}
                </span>
              )}
            </div>

            {/* Social Share Buttons */}
            <div className="blog-share-bar">
              <button className="blog-share-btn facebook" onClick={() => shareOn('facebook')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" stroke="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Share
              </button>
              <button className="blog-share-btn twitter" onClick={() => shareOn('twitter')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Tweet
              </button>
              <button className="blog-share-btn pinterest" onClick={() => shareOn('pinterest')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#E60023" stroke="none"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.935 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.38l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                Pin
              </button>
              <button className="blog-share-btn whatsapp" onClick={() => shareOn('whatsapp')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
            </div>

            {/* Article Body */}
            <article>
              {post.videoUrl && (
                <div className="blog-video-wrapper">
                  <video src={post.videoUrl} controls />
                </div>
              )}
              <div
                ref={contentRef}
                className="blog-detail-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="blog-detail-tags">
                {post.tags.map((tag) => (
                  <Link key={tag._id} href={`/blog?tag=${tag.slug}`} className="blog-detail-tag">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Box */}
            <div className="blog-detail-author-box">
              <div className="blog-detail-author-avatar">
                {post.authorImage ? (
                  <img src={post.authorImage} alt={post.author} />
                ) : (
                  (post.author || 'D')[0]
                )}
              </div>
              <div className="blog-detail-author-info">
                <h4>{post.author || 'Digisharks Team'}</h4>
                <p>{post.authorBio || 'Digisharks Communications — We help brands build their digital presence through strategic PR, marketing, and communications.'}</p>
              </div>
            </div>

            {/* Related Posts */}
            {related.length > 0 && (
              <div className="related-posts">
                <h2>You Might Also Like</h2>
                <div className="related-grid">
                  {related.map((rp) => {
                    const rpImage = rp.coverImage || rp.featuredImage?.url || ''
                    return (
                      <Link key={rp._id} href={`/blog/${rp.slug}`} className="related-card">
                        {rpImage ? (
                          <img src={rpImage} alt={rp.title} className="related-card-image" loading="lazy" />
                        ) : (
                          <div className="related-card-image" style={{ background: 'var(--surface2)' }} />
                        )}
                        <div className="related-card-body">
                          <h3>{rp.title}</h3>
                          <div className="meta">{formatDate(rp.publishedAt)}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="blog-sidebar">
            {/* Social Follow */}
            <div className="sidebar-section">
              <h3>Follow Us</h3>
              <div className="social-follow-grid">
                <a href="https://facebook.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-follow-item social-fb">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span className="count">12.5K</span>
                  <span className="label">Fans</span>
                </a>
                <a href="https://instagram.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-follow-item social-ig">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  <span className="count">8.2K</span>
                  <span className="label">Followers</span>
                </a>
                <a href="https://twitter.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-follow-item social-tw">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span className="count">15.3K</span>
                  <span className="label">Followers</span>
                </a>
                <a href="https://youtube.com/@digisharks" target="_blank" rel="noopener noreferrer" className="social-follow-item social-yt">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  <span className="count">5.7K</span>
                  <span className="label">Subscribers</span>
                </a>
              </div>
            </div>

            {/* Latest Posts */}
            {latestPosts.length > 0 && (
              <div className="sidebar-section">
                <h3>Latest Post</h3>
                <div className="latest-posts">
                  {latestPosts.slice(0, 5).map((lp) => {
                    const lpImg = lp.coverImage || lp.featuredImage?.url || ''
                    return (
                      <Link key={lp._id} href={`/blog/${lp.slug}`} className="latest-post-item">
                        {lpImg ? (
                          <img src={lpImg} alt="" className="latest-post-thumb" loading="lazy" />
                        ) : (
                          <div className="latest-post-thumb" style={{ background: 'var(--surface2)' }} />
                        )}
                        <div className="latest-post-info">
                          <h4>{lp.title}</h4>
                          <div className="date">{formatDate(lp.publishedAt)}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Table of Contents */}
            {tocHeadings.length > 0 && (
              <div className="sidebar-section">
                <h3>In This Article</h3>
                <div className="toc-list">
                  {tocHeadings.map((h, i) => (
                    <button
                      key={i}
                      className={`toc-item ${h.level === 3 ? 'level-3' : ''} ${activeSection === h.text ? 'active' : ''}`}
                      onClick={() => scrollToHeading(h.text)}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="sidebar-section">
                <h3>Tags</h3>
                <div className="sidebar-tags">
                  {allTags.slice(0, 12).map((tag) => (
                    <Link key={tag._id} href={`/blog?tag=${tag.slug}`} className="sidebar-tag">
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
