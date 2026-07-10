'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { getProductContent } from '@/lib/product-content'

interface TrustCard {
  icon: string
  title: string
  description: string
}

interface SpecItem {
  icon: string
  label: string
  value: string
}

interface IncludedItem {
  icon: string
  title: string
  description: string
}

interface CoverageStat {
  number: string
  label: string
}

interface Product {
  _id: string
  slug: string
  title: string
  category: string
  price: number
  compareAtPrice: number
  currency: string
  shortPitch: string
  description?: string
  seoTitle?: string
  seoDescription?: string
  images: string[]
  featuredImage?: string
  demoVideo?: string
  demoVideoLabel?: string
  titleFontSize?: string
  howToUseVideo?: string
  rating: number
  isActive: boolean
  downloadUrl?: string
  buttonText?: string
  buyButtonText?: string
  buttonColor?: string
  cartButtonBg?: string
  cartButtonTextColor?: string
  cartButtonBorderColor?: string
  cartButtonHoverBg?: string
  cartButtonHoverTextColor?: string
  buyButtonBg?: string
  buyButtonTextColor?: string
  buyButtonBorderColor?: string
  buyButtonHoverBg?: string
  buyButtonHoverTextColor?: string
  tabs?: { label: string; content: string; order: number; helpBanner?: { text: string; textColor: string; bgColor: string } }[]
  testimonials?: { name: string; stars: number; text: string }[]
  faq?: { q: string; a: string; order: number }[]
  trustCards?: TrustCard[]
  specs?: SpecItem[]
  whatsIncluded?: IncludedItem[]
  coverageStats?: CoverageStat[]
  variations?: { name: string; price: number; compareAtPrice?: number; isActive: boolean }[]
  createdAt: string | null
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Convert any YouTube URL (watch, youtu.be, embed) to embed format */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    // youtu.be/XXXXX
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
    // youtube.com/watch?v=XXXXX or youtube.com/embed/XXXXX
    const watchMatch = url.match(/youtube\.com\/(?:watch\?v=|embed\/)([a-zA-Z0-9_-]+)/)
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  } catch { /* ignore invalid URLs */ }
  return null
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

export default function DynamicProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null)
  const { add } = useCart()
  const { isWishlisted, toggle } = useWishlist()

  // Dynamic button config from product data
  const btnColor = product?.buttonColor || ''
  const cartBtnText = product?.buttonText || 'Add to cart'
  const buyBtnText = product?.buyButtonText || 'Buy Now'
  const trustCards = (product?.trustCards && product.trustCards.length > 0)
    ? product.trustCards
    : [
        { icon: '⚡', title: 'Instant Download', description: 'Access immediately after payment' },
        { icon: '📧', title: 'Email Delivery', description: 'Copy sent to your inbox' },
        { icon: '🔄', title: 'Lifetime Updates', description: 'Free future updates included' },
      ]

  const specs = (product?.specs && product.specs.length > 0)
    ? product.specs
    : [
        { icon: '📊', label: 'Records:', value: '500K+' },
        { icon: '📅', label: 'Updated:', value: '2025' },
        { icon: '📁', label: 'Format:', value: 'Excel / CSV / PDF' },
        { icon: '📍', label: 'Coverage:', value: 'Pan India' },
        { icon: '⚡', label: 'Delivery:', value: 'Instant Download' },
        { icon: '🛡️', label: 'License:', value: 'Commercial Use' },
      ]

  const includedItems = (product?.whatsIncluded && product.whatsIncluded.length > 0)
    ? product.whatsIncluded
    : [
        { icon: '📋', title: 'Excel (.xls)', description: 'Full database in spreadsheet format' },
        { icon: '📄', title: 'CSV (.csv)', description: 'Universal format for any CRM or tool' },
        { icon: '📕', title: 'PDF Report', description: 'Category-wise summary & insights' },
        { icon: '📝', title: 'Sample Template', description: 'Quick-start guide for campaigns' },
        { icon: '🔄', title: 'Update Log', description: 'Track changes & revision history' },
        { icon: '📧', title: 'Email Delivery', description: 'Copy sent to your inbox' },
      ]

  const coverageStats = (product?.coverageStats && product.coverageStats.length > 0)
    ? product.coverageStats
    : [
        { number: '28', label: 'States' },
        { number: '8', label: 'UTs' },
        { number: '500K+', label: 'Records' },
        { number: '40+', label: 'Industries' },
        { number: '99.9%', label: 'Verified' },
      ]

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/products/${slug}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('Product not found')
          throw new Error('Failed to load product')
        }
        return r.json()
      })
      .then((data: Product) => {
        if (cancelled) return
        setProduct(data)
        document.title = data.seoTitle || `${data.title} · Digisharks Communications`
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message ?? 'Failed to load product')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [slug])

  const effectivePrice = selectedVariation && product?.variations
    ? (product.variations.find((v) => v.name === selectedVariation)?.price ?? product.price)
    : (product?.price ?? 0)

  const effectiveComparePrice = selectedVariation && product?.variations
    ? (product.variations.find((v) => v.name === selectedVariation)?.compareAtPrice ?? product.compareAtPrice)
    : (product?.compareAtPrice ?? 0)

  const discount = effectiveComparePrice > effectivePrice
    ? Math.round(((effectiveComparePrice - effectivePrice) / effectiveComparePrice) * 100)
    : 0

  const images = product?.images?.filter(Boolean) ?? []
  const coverImage = images[0]

  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)

  const handleAddToCart = () => {
    if (!product) return
    add(
      {
        slug: product.slug,
        title: selectedVariation ? `${product.title} - ${selectedVariation}` : product.title,
        price: effectivePrice,
        compareAtPrice: effectiveComparePrice,
        image: coverImage,
      },
      qty
    )
    if (typeof window !== 'undefined') {
      window.location.href = '/shopping-cart'
    }
  }

  const handleBuyNow = () => {
    if (!product) return
    add(
      {
        slug: product.slug,
        title: selectedVariation ? `${product.title} - ${selectedVariation}` : product.title,
        price: effectivePrice,
        compareAtPrice: effectiveComparePrice,
        image: coverImage,
      },
      qty
    )
    if (typeof window !== 'undefined') {
      window.location.href = '/checkout'
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // User cancelled share or clipboard unavailable — silently ignore
    }
  }

  const savedAmount = effectiveComparePrice - effectivePrice

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setZoomOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
  }

  if (loading) {
    return (
      <div className="content">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="mesh-grid"></div>
        <main className="dp-product-detail">
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Loading product...
          </div>
        </main>
      </div>
    )
  }

  if (error || !product) {
    const isNotFound = error === 'Product not found'
    return (
      <div className="content">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="mesh-grid"></div>
        <main className="dp-product-detail">
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h1 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
              {isNotFound ? 'Product Not Found' : 'Oops!'}
            </h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {isNotFound
                ? "The product you're looking for doesn't exist or has been removed."
                : error || 'Something went wrong while loading this product.'}
            </p>
            <Link
              href="/digital-products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#FF5B2E',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ← Back to Digital Products
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="content">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="mesh-grid"></div>
      <main className="dp-product-detail">
        <nav className="dp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">›</span>
          <Link href="/digital-products">Digital Products</Link>
          <span className="sep">›</span>
          <span className="current">{product.title}</span>
        </nav>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Mobile product title — shown before gallery on small screens */}
        <div className="dp-mobile-title">
          <h1>{product.title}</h1>
          {product.category && (
            <span className="dp-product-category-badge">{product.category}</span>
          )}
        </div>

        {/* ── Hero: 55/45 split ── */}
        <div className="dp-detail-top">
          {/* Left — Media Gallery */}
          <div className="dp-gallery-wrap">
            <div className="dp-gallery">
              <div
                className="dp-gallery-main"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[activeImg] || images[0]}
                    alt={product.title}
                    loading="lazy"
                    className={isZooming ? 'dp-zoom' : ''}
                    style={{
                      transform: isZooming ? 'scale(1.8)' : 'scale(1)',
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      transition: 'transform 0.08s ease-out',
                    }}
                  />
                ) : (
                  <div className="dp-gallery-placeholder">📦</div>
                )}
                {discount > 0 && (
                  <span className="dp-sale-badge">-{discount}% OFF</span>
                )}

                {/* Gallery action buttons — wishlist + share */}
                <div className="dp-gallery-actions">
                  <button
                    type="button"
                    className={`dp-gallery-action-btn${isWishlisted(product.slug) ? ' wishlisted' : ''}`}
                    onClick={() => toggle({
                      slug: product.slug,
                      title: product.title,
                      price: product.price,
                      compareAtPrice: product.compareAtPrice,
                      image: coverImage,
                    })}
                    aria-label={isWishlisted(product.slug) ? 'Remove from wishlist' : 'Add to wishlist'}
                    title={isWishlisted(product.slug) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isWishlisted(product.slug) ? '❤️' : '🤍'}
                  </button>
                  <button
                    type="button"
                    className="dp-gallery-action-btn"
                    onClick={handleShare}
                    aria-label="Share product"
                    title="Share"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                </div>
              </div>

              {images.length > 1 && (
                <div className="dp-gallery-thumbs">
                  {images.map((src, i) => (
                    <div key={i} className="dp-gallery-thumb-item">
                      <button
                        type="button"
                        className={i === activeImg ? 'active' : ''}
                        onClick={() => setActiveImg(i)}
                        aria-label={`View image ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" loading="lazy" />
                      </button>
                      <span>{
                        i === 0 ? 'Sample Data' :
                        i === 1 ? 'Coverage Map' :
                        i === 2 ? 'Excel Format' :
                        i === 3 ? 'File Preview' :
                        `View ${i + 1}`
                      }</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery / Trust badges — micro-trust below gallery */}
            {trustCards.length > 0 && (
              <div className="dp-delivery-grid">
                {trustCards.map((card, i) => (
                  <div key={i} className="dp-delivery-card">
                    <div className="dp-delivery-row">
                      <span className="dp-del-icon">{card.icon}</span>
                      <strong>{card.title}</strong>
                      <p>{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Purchase Panel */}
          <div className="dp-info">
            {/* Category pill */}
            {product.category && (
              <span className="dp-product-category-badge">{product.category}</span>
            )}

            {/* Title */}
            <h1 style={product.titleFontSize ? { fontSize: product.titleFontSize } : undefined}>{product.title}</h1>

            {/* Rating + review count */}
            <div className="dp-info-meta">
              {product.rating > 0 && (
                <>
                  <div className="dp-stars">
                    {'★'.repeat(Math.round(product.rating))}
                    {'☆'.repeat(5 - Math.round(product.rating))}
                    <span className="dp-rating-text">{product.rating} / 5</span>
                  </div>
                  <a href="#reviews" className="dp-rating-link" onClick={(e) => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Read reviews
                  </a>
                </>
              )}
            </div>

            {/* Price block */}
            <div className="dp-price-card">
              <div className="dp-price-block">
                {effectiveComparePrice > effectivePrice && (
                  <span className="original">{formatINR(effectiveComparePrice)}</span>
                )}
                <span className="price">{formatINR(effectivePrice)}</span>
                {discount > 0 && (
                  <span className="dp-discount-badge">-{discount}%</span>
                )}
              </div>
              {savedAmount > 0 && (
                <div className="dp-save-badge">💰 You save {formatINR(savedAmount)}!</div>
              )}
              <div className="dp-tax-info">inclusive of all taxes</div>
            </div>

            {/* Value-prop description */}
            {product.shortPitch && (
              <p className="dp-short-desc">{product.shortPitch}</p>
            )}

            {/* ══ Key specs grid (dynamic) ══ */}
            <div className="dp-specs-list">
              {specs.map((spec, i) => (
                <div key={i} className="dp-spec-item">
                  <span className="dp-spec-icon">{spec.icon}</span>
                  <span><span className="dp-spec-label">{spec.label}</span> {spec.value}</span>
                </div>
              ))}
            </div>

            {/* Variation / License tiers */}
            {product.variations && product.variations.length > 0 && (
              <div className="dp-section">
                <h2>Choose Your License</h2>
                <div className="dp-license-tiers">
                  {product.variations.filter((v) => v.isActive !== false).map((v) => {
                    const isSelected = selectedVariation === v.name
                    return (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedVariation(v.name)}
                        className={`dp-license-chip ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="license-name">{v.name}</span>
                        <span className="license-price">₹{v.price.toLocaleString('en-IN')}</span>
                        {v.compareAtPrice && v.compareAtPrice > v.price && (
                          <span style={{ display: 'block', fontSize: '11px', color: '#999', textDecoration: 'line-through', marginTop: 2 }}>₹{v.compareAtPrice.toLocaleString('en-IN')}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Demo video (if any) */}
            {product.demoVideo && (
              <>
                <p className="dp-watch-video">{product?.demoVideoLabel || '▶ Watch Demo'}</p>
                <div className="dp-video-wrap">
                  {isYouTubeUrl(product.demoVideo) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(product.demoVideo) || product.demoVideo}
                      title="Demo video"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video src={product.demoVideo} controls preload="metadata" />
                  )}
                </div>
              </>
            )}

            {/* ══ Primary CTAs ══ */}
            <div className="dp-actions-card">
              <div className="dp-btn-row">
                <button
                  type="button"
                  className="dp-add-cart-btn"
                  onClick={handleAddToCart}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    if (product?.cartButtonHoverBg) el.style.background = product.cartButtonHoverBg
                    if (product?.cartButtonHoverTextColor) el.style.color = product.cartButtonHoverTextColor
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    if (product?.cartButtonHoverBg || product?.cartButtonHoverTextColor) {
                      el.style.background = product?.cartButtonBg || (btnColor ? '#fff' : '')
                      el.style.color = product?.cartButtonTextColor || (btnColor ? btnColor : '')
                    }
                  }}
                  style={{
                    ...(product?.cartButtonBg ? { background: product.cartButtonBg } : btnColor ? { background: btnColor === product?.buttonColor ? '#fff' : btnColor } : {}),
                    ...(product?.cartButtonTextColor ? { color: product.cartButtonTextColor } : btnColor ? { color: btnColor } : {}),
                    ...(product?.cartButtonBorderColor ? { borderColor: product.cartButtonBorderColor } : btnColor ? { borderColor: btnColor } : {}),
                  } as React.CSSProperties}
                >
                  🛒 {cartBtnText}
                </button>
                <button
                  type="button"
                  className="dp-buy-now-btn"
                  onClick={handleBuyNow}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    if (product?.buyButtonHoverBg) el.style.background = product.buyButtonHoverBg
                    if (product?.buyButtonHoverTextColor) el.style.color = product.buyButtonHoverTextColor
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    if (product?.buyButtonHoverBg || product?.buyButtonHoverTextColor) {
                      el.style.background = product?.buyButtonBg || (btnColor ? btnColor : '')
                      el.style.color = product?.buyButtonTextColor || '#fff'
                    }
                  }}
                  style={{
                    ...(product?.buyButtonBg ? { background: product.buyButtonBg } : btnColor ? { background: btnColor } : {}),
                    ...(product?.buyButtonTextColor ? { color: product.buyButtonTextColor } : {}),
                    ...(product?.buyButtonBorderColor ? { borderColor: product.buyButtonBorderColor } : {}),
                  } as React.CSSProperties}
                >
                  ⚡ {buyBtnText}
                </button>
              </div>
            </div>

            {/* ══ Trust row — payment icons ══ */}
            <div className="dp-payment-badges">
              <span className="dp-pay-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Card
              </span>
              <span className="dp-pay-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 1 0 10 10h-4A6 6 0 1 1 12 6V2z"/><path d="M12 2v8l4-4-4-4z"/></svg>
                UPI
              </span>
              <span className="dp-pay-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="6" y1="7" x2="10" y2="7"/><line x1="6" y1="11" x2="14" y2="11"/><line x1="6" y1="15" x2="18" y2="15"/></svg>
                Net Banking
              </span>
              <span className="dp-pay-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
                Wallet
              </span>
            </div>

            {/* ══ Micro-trust badges (2x2 grid) ══ */}
            <div className="dp-micro-trust">
              <div className="dp-micro-badge">
                <span className="badge-icon">⚡</span>
                Instant Download
              </div>
              <div className="dp-micro-badge">
                <span className="badge-icon">🔄</span>
                Free Future Updates
              </div>
              <div className="dp-micro-badge">
                <span className="badge-icon">🔒</span>
                Secure Checkout
              </div>
              <div className="dp-micro-badge">
                <span className="badge-icon">✅</span>
                GDPR Compliant
              </div>
            </div>
          </div>
        </div>

        {/* ══ Content Tabs ══ */}
        {(() => {
          // Build dynamic tab entries
          const tabEntries: { label: string; content: string; isHtml?: boolean; isVideo?: boolean }[] = []

          // 1. Description (default active)
          if (product.description) {
            tabEntries.push({ label: 'Description', content: product.description, isHtml: true })
          } else {
            // Fallback description for data products
            tabEntries.push({
              label: 'Description',
              content: `
<p>This comprehensive database gives you access to <strong>500,000+ verified B2B and B2C contacts</strong> across every industry and region in India. Perfect for email marketing, SMS campaigns, WhatsApp outreach, lead generation, and direct sales.</p>

<h3>Sample Fields Included</h3>
<ul>
  <li><strong>Name</strong> — First & Last</li>
  <li><strong>Phone</strong> — Mobile & Landline</li>
  <li><strong>Email</strong> — Verified working emails</li>
  <li><strong>City & State</strong> — Geographic segmentation</li>
  <li><strong>Pincode</strong> — Precise location targeting</li>
  <li><strong>Industry</strong> — 40+ industry categories</li>
  <li><strong>Designation</strong> — Decision-maker roles</li>
</ul>

<h3>Use Cases</h3>
<ul>
  <li>📧 Email Marketing Campaigns</li>
  <li>📱 SMS & WhatsApp Outreach</li>
  <li>🎯 Lead Generation & Cold Outreach</li>
  <li>💼 B2B Sales & Business Development</li>
  <li>📊 Market Research & Analysis</li>
</ul>
`,
              isHtml: true,
            })
          }

          // 2. How to Use
          if (product.howToUseVideo) {
            tabEntries.push({ label: 'How to Use', content: product.howToUseVideo, isVideo: true })
          } else {
            tabEntries.push({
              label: 'How to Use',
              content: `
<div style="display:flex;flex-direction:column;gap:1.25rem;">
  <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:#f8f9fa;border-radius:10px;border:1px solid #eef0f4;">
    <div style="width:36px;height:36px;background:rgba(255,91,46,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">1️⃣</div>
    <div><strong style="color:#1a1a1a;">Complete Purchase</strong><br><span style="color:#666;font-size:13px;">Add the database to your cart and complete secure checkout via Card, UPI, or Net Banking.</span></div>
  </div>
  <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:#f8f9fa;border-radius:10px;border:1px solid #eef0f4;">
    <div style="width:36px;height:36px;background:rgba(255,91,46,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">2️⃣</div>
    <div><strong style="color:#1a1a1a;">Instant Access</strong><br><span style="color:#666;font-size:13px;">You\'ll be redirected to the download page immediately. A copy is also sent to your email.</span></div>
  </div>
  <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:#f8f9fa;border-radius:10px;border:1px solid #eef0f4;">
    <div style="width:36px;height:36px;background:rgba(255,91,46,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">3️⃣</div>
    <div><strong style="color:#1a1a1a;">Download & Extract</strong><br><span style="color:#666;font-size:13px;">Download the ZIP file and extract. Files are in CSV and Excel formats — no special software needed.</span></div>
  </div>
  <div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:#f8f9fa;border-radius:10px;border:1px solid #eef0f4;">
    <div style="width:36px;height:36px;background:rgba(255,91,46,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">4️⃣</div>
    <div><strong style="color:#1a1a1a;">Start Campaigning</strong><br><span style="color:#666;font-size:13px;">Import into your CRM, email tool, or marketing platform and launch your campaign immediately.</span></div>
  </div>
</div>`,
              isHtml: true,
            })
          }

          // 3. Sample Preview
          tabEntries.push({
            label: 'Sample Preview',
            content: `
<div class="dp-sample-preview">
  <p style="color:#666;font-size:14px;margin-bottom:1rem;">Below is a blurred preview of the data structure. Actual data is fully readable after purchase.</p>
  <div style="overflow-x:auto;border:1px solid #e6e6e6;border-radius:8px;filter:blur(3px);user-select:none;pointer-events:none;">
    <table style="width:100%;border-collapse:collapse;font-size:12px;background:#fff;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:left;">Name</th>
          <th style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:left;">Phone</th>
          <th style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:left;">Email</th>
          <th style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:left;">City</th>
          <th style="padding:8px 10px;border-bottom:1px solid #ddd;text-align:left;">Industry</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Rajesh Kumar</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">98765*****</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">rajesh***@email.com</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Mumbai</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">IT Services</td></tr>
        <tr><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Priya Sharma</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">99887*****</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">priya***@email.com</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Delhi</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Healthcare</td></tr>
        <tr><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Amit Singh</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">88776*****</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">amit***@email.com</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Bangalore</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">E-commerce</td></tr>
        <tr><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Sneha Patel</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">77665*****</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">sneha***@email.com</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Ahmedabad</td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">Real Estate</td></tr>
      </tbody>
    </table>
  </div>
  <p style="color:#888;font-size:12px;margin-top:0.75rem;text-align:center;">🔒 Data is blurred for preview. Full access after purchase.</p>
</div>`,
            isHtml: true,
          })

          // 4. Disclaimer
          tabEntries.push({
            label: 'Disclaimer',
            content: `
<div style="display:flex;flex-direction:column;gap:1rem;">
  <div style="padding:14px;background:#fef7f5;border:1px solid rgba(255,91,46,0.12);border-radius:8px;border-left:4px solid #FF5B2E;">
    <h3 style="margin:0 0 6px;font-size:15px;color:#1a1a1a;">📋 Data Compliance</h3>
    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">This database is compiled from publicly available sources, business directories, and verified listings. It is intended for legitimate business communication purposes only. Users are responsible for complying with applicable data protection and privacy laws including IT Act 2000 and GDPR where applicable.</p>
  </div>
  <div style="padding:14px;background:#f0fdf4;border:1px solid rgba(34,197,94,0.15);border-radius:8px;border-left:4px solid #22c55e;">
    <h3 style="margin:0 0 6px;font-size:15px;color:#1a1a1a;">🔄 Refund & Updates</h3>
    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">We offer a 7-day replacement guarantee if the database is defective or doesn\'t match the description. Since this is a digital product, all sales are final after 7 days. Free lifetime updates are included — we\'ll notify you when refreshed data is available.</p>
  </div>
  <div style="padding:14px;background:#fafafa;border:1px solid #eef0f4;border-radius:8px;">
    <h3 style="margin:0 0 6px;font-size:15px;color:#1a1a1a;">⚖️ Usage Rights</h3>
    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">This product is licensed for <strong>commercial use</strong>. You may use the contacts for your own marketing campaigns, client projects, and business development. Reselling or redistributing the raw database as-is is strictly prohibited.</p>
  </div>
  <p style="margin-top:0.5rem;font-size:12px;color:#888;text-align:center;">For questions, contact <a href="mailto:marketing@digisharkscommunications.com" style="color:#FF5B2E;">marketing@digisharkscommunications.com</a></p>
</div>`,
            isHtml: true,
          })

          // 5. Reviews (placeholder link — actual reviews section is below)
          tabEntries.push({
            label: 'Reviews',
            content: `<p style="color:#666;font-size:14px;">⭐ <strong>Scroll down</strong> to read genuine customer reviews and ratings for this product. <a href="#reviews" style="color:#FF5B2E;font-weight:600;">Jump to reviews ↓</a></p>`,
            isHtml: true,
          })

          if (tabEntries.length === 0) return null

          // Clamp activeTab to valid range
          const safeIdx = activeTab >= tabEntries.length ? 0 : activeTab

          return (
            <div className="dp-tabs">
              <div className="dp-tabs-inner">
              <div className="dp-tabs-nav" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', flexWrap: 'nowrap' }}>
                {tabEntries.map((tab, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dp-tab ${safeIdx === i ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="dp-content">
                {tabEntries.map((tab, i) => (
                  <div key={i} style={{ display: safeIdx === i ? 'block' : 'none' }}>
                    {tab.isVideo ? (
                      <div className="dp-video-wrap" style={{ maxWidth: 700, marginTop: 0 }}>
                        {isYouTubeUrl(tab.content) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(tab.content) || tab.content}
                            title={tab.label}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        ) : (
                          <video src={tab.content} controls preload="metadata" />
                        )}
                      </div>
                    ) : tab.isHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: tab.content }} />
                    ) : (
                      <div>{tab.content}</div>
                    )}
                  </div>
                ))}
              </div>
              </div>{/* end dp-tabs-inner */}
            </div>
          )
        })()}

        {/* ══ What's Included (dynamic) ══ */}
        {includedItems.length > 0 && (
          <>
          <hr className="dp-section-divider" />
          <section className="dp-whats-included">
            <h2>📦 What's Included</h2>
            <div className="dp-included-grid">
              {includedItems.map((item, i) => (
                <div key={i} className="dp-included-item">
                  <span className="dp-included-icon">{item.icon}</span>
                  <span className="dp-included-text"><strong>{item.title}</strong>{item.description ? ` — ${item.description}` : ''}</span>
                </div>
              ))}
            </div>
          </section>
          </>
        )}

        {/* ══ Coverage / Trust (dynamic) ══ */}
        {coverageStats.length > 0 && (
          <>
          <hr className="dp-section-divider" />
          <section className="dp-coverage-section">
            <h2>🌍 Coverage & Trust</h2>
            <div className="dp-coverage-card">
              {coverageStats.map((stat, i) => (
                <div key={i} className="dp-coverage-stat">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
          </>
        )}

        {/* ── FAQ Accordion ── */}
        {(() => {
          // Use product.faq from DB, fall back to static content, then default FAQs
          const fallbackContent = getProductContent(product.slug)
          const dbFaq = product.faq
          const staticFaq = fallbackContent?.faq
          let faqItems: { q: string; a: string }[]
          if (dbFaq && dbFaq.length > 0) {
            faqItems = [...dbFaq].sort((a, b) => a.order - b.order)
          } else if (staticFaq && staticFaq.length > 0) {
            faqItems = staticFaq
          } else {
            faqItems = [
              { q: 'When will I receive my product?', a: 'You\'ll get instant access to download your product right after your payment. A confirmation email with download instructions is also sent to your registered email within minutes.' },
              { q: 'How long do I have access to the product?', a: 'Lifetime access — including all future updates and revisions at no extra cost. The download link remains active for 30 days.' },
              { q: 'What if I need help using the product?', a: 'Our support team is available via email at marketing@digisharkscommunications.com. We typically respond within 24 hours on business days.' },
              { q: 'Are there any hidden charges or subscriptions?', a: 'No. You pay once and get full access — no recurring fees, no hidden charges. All taxes are included in the displayed price.' },
              { q: 'Can I get a refund if I\'m not satisfied?', a: 'Yes! We offer a 7-day refund guarantee if the product is defective or doesn\'t match the description. See our Refund Policy for full details.' },
            ]
          }

          return (
            <section className="dp-faq-section" aria-label="Frequently asked questions">
              <div className="dp-faq-section-inner">
              <h2>Frequently Asked Questions</h2>
              <div className="dp-faq-list">
                {faqItems.map((item, i) => {
                  const isOpen = faqOpenIdx === i
                  const panelId = `faq-panel-${i}`
                  return (
                    <div key={i} className={`dp-faq-item ${isOpen ? 'open' : ''}`}>
                      <button
                        type="button"
                        id={`faq-btn-${i}`}
                        className="dp-faq-q"
                        onClick={() => setFaqOpenIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                      >
                        <span>{item.q}</span>
                        <span className={`dp-faq-arrow ${isOpen ? 'open' : ''}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </button>
                      <div
                        id={panelId}
                        className={`dp-faq-a-wrap ${isOpen ? 'open' : ''}`}
                        role="region"
                        aria-labelledby={`faq-btn-${i}`}
                      >
                        <div className="dp-faq-a">
                          <p>{item.a}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              </div>{/* end dp-faq-section-inner */}
            </section>
          )
        })()}

        {/* ── Customer Reviews / Testimonials ── */}
        {(() => {
          // Use product.testimonials from DB, fall back to static content
          const fallbackContent = getProductContent(product.slug)
          const reviews = (product.testimonials && product.testimonials.length > 0)
            ? product.testimonials
            : fallbackContent?.testimonials
          if (!reviews || reviews.length === 0) {
          return (
            <section className="dp-reviews" id="reviews" aria-label="Customer reviews">
              <div className="dp-reviews-inner">
              <div className="dp-reviews-header">
                <h2>⭐ Customer Reviews</h2>
              </div>
              <div className="dp-reviews-empty">
                  <span className="dp-reviews-empty-icon">💬</span>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
                </div>{/* end dp-reviews-inner */}
              </section>
            )
          }

          const totalRating = reviews.reduce((s, r) => s + r.stars, 0)
          const avgRating = (totalRating / reviews.length).toFixed(1)

          return (
            <section className="dp-reviews" id="reviews" aria-label="Customer reviews">
              <div className="dp-reviews-inner">
              <div className="dp-reviews-header">
                <h2>⭐ Customer Reviews</h2>
                <div className="dp-reviews-summary">
                  <span className="dp-reviews-avg">{avgRating}</span>
                  <div className="dp-reviews-stars-row">
                    {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                  </div>
                  <span className="dp-reviews-count">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="dp-reviews-grid">
                {reviews.map((r, i) => {
                  const initials = r.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  const colors = ['#FF5B2E', '#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ec4899']
                  const avatarColor = colors[i % colors.length]

                  return (
                    <div key={i} className="dp-review-card" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="dp-review-avatar" style={{ background: avatarColor }}>
                        {initials}
                      </div>
                      <div className="dp-review-body">
                        <div className="dp-review-stars">
                          {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                        </div>
                        <p className="dp-review-text">{r.text}</p>
                        <span className="dp-review-name">- {r.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              </div>{/* end dp-reviews-inner */}
            </section>
          )
        })()}

        {product.downloadUrl && (
          <div className="dp-download-row">
            <a
              href={product.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dp-cta-btn"
              style={{ display: 'inline-flex', width: 'auto', padding: '14px 32px' }}
            >
              ⬇️ Download Now
            </a>
          </div>
        )}

        {/* Sticky mobile bottom bar */}
        <div className="dp-mobile-bar">
          <div>
            <span className="dp-mob-price">{formatINR(effectivePrice)}</span>
            {effectiveComparePrice > effectivePrice && (
              <span className="dp-mob-original">{formatINR(effectiveComparePrice)}</span>
            )}
          </div>
          <div className="dp-mob-actions">
            <button
              type="button"
              className="dp-mob-cart"
              onClick={handleAddToCart}
              style={(product?.cartButtonBg || product?.cartButtonTextColor) ? {
                ...(product?.cartButtonBg ? { background: product.cartButtonBg } : {}),
                ...(product?.cartButtonTextColor ? { color: product.cartButtonTextColor, border: `1px solid ${product.cartButtonTextColor}` } : {}),
              } as React.CSSProperties : {}}
            >{cartBtnText}</button>
            <button
              type="button"
              className="dp-mob-buy"
              onClick={handleBuyNow}
              style={(product?.buyButtonBg || product?.buyButtonTextColor) ? {
                ...(product?.buyButtonBg ? { background: product.buyButtonBg } : {}),
                ...(product?.buyButtonTextColor ? { color: product.buyButtonTextColor } : {}),
              } as React.CSSProperties : {}}
            >{buyBtnText}</button>
          </div>
        </div>
      </main>
    </div>
  )
}
