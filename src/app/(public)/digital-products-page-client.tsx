'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'

interface Product {
  _id?: string
  slug: string
  title: string
  category: string
  price: number
  compareAtPrice: number
  currency: string
  shortPitch: string
  images: string[]
  featuredImage?: string
  rating: number
  isActive: boolean
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function discountPercent(price: number, original: number): number {
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 100)
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'

const SORT_LABELS: Record<SortOption, string> = {
  'newest': 'Newest',
  'price-asc': 'Price: Low → High',
  'price-desc': 'Price: High → Low',
  'name-asc': 'Name: A → Z',
  'name-desc': 'Name: Z → A',
}

export default function DigitalProductsPageClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { add } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const router = useRouter()

  function handleAddToCart(p: Product) {
    add(
      {
        slug: p.slug,
        title: p.title,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: p.featuredImage || (p.images && p.images.length > 0 ? p.images[0] : undefined),
      },
      1
    )
    router.push('/shopping-cart')
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/products', { cache: 'default' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load products')
        return r.json()
      })
      .then((data: Product[]) => {
        if (cancelled) return
        setProducts(Array.isArray(data) ? data.filter((p) => p.isActive) : [])
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message ?? 'Failed to load products')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Derive unique categories and count per category
  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      map.set(p.category, (map.get(p.category) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [products])

  // Derive unique price range for display
  const allPrices = useMemo(() => products.map((p) => p.price), [products])
  const minPriceAll = useMemo(() => allPrices.length > 0 ? Math.min(...allPrices) : 0, [allPrices])
  const maxPriceAll = useMemo(() => allPrices.length > 0 ? Math.max(...allPrices) : 0, [allPrices])

  // Filter products by search, category and price range
  const filteredProducts = useMemo(() => {
    let result = products
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.shortPitch && p.shortPitch.toLowerCase().includes(q))
      )
    }
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory)
    }
    const min = priceMin ? Number(priceMin) : 0
    const max = priceMax ? Number(priceMax) : Infinity
    if (min > 0 || max < Infinity) {
      result = result.filter((p) => p.price >= min && p.price <= max)
    }
    return result
  }, [products, searchQuery, activeCategory, priceMin, priceMax])

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'newest':
      default:
        // Keep original order (newest first from API)
        break
    }
    return sorted
  }, [filteredProducts, sort])

  // Count active filters
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (activeCategory !== 'all' ? 1 : 0) +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0)

  function clearFilters() {
    setSearchQuery('')
    setActiveCategory('all')
    setPriceMin('')
    setPriceMax('')
    setSort('newest')
  }

  return (
    <div className="dp-page">
      <div className="dp-container">
        <h1 className="dp-title">Digital Products</h1>
        <p className="dp-listing-intro">
           Choose a product to view details and add to cart.
        </p>

        {loading ? (
          <p style={{ color: '#666' }}>Loading products…</p>
        ) : error ? (
          <div className="dp-error-banner">{error}</div>
        ) : products.length === 0 ? (
          <div className="dp-empty-state">
            <h2>No products available</h2>
            <p>Check back soon — we&#39;re launching new digital products regularly.</p>
          </div>
        ) : (
          <>
            {/* Category filter chips (always visible) */}
            {categories.length > 1 && (
              <div className="dp-category-filter">
                <button
                  type="button"
                  className={`dp-cat-chip ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  All ({products.length})
                </button>
                {categories.map(([cat, count]) => (
                  <button
                    key={cat}
                    type="button"
                    className={`dp-cat-chip ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat} ({count})
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar: search, toggle sidebar, results count, sort */}
            <div className="dp-toolbar">
              <button
                type="button"
                className={`dp-sidebar-toggle${activeFilterCount > 0 ? ' has-filters' : ''}`}
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle filters"
              >
                <span className="dp-filter-icon">⚙</span>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="dp-filter-badge">{activeFilterCount}</span>
                )}
              </button>

              <div className="dp-search-wrap">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="dp-search-input"
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="dp-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="dp-toolbar-spacer" />

              <span className="dp-result-count">
                {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
              </span>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="dp-sort-select"
                aria-label="Sort products"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>{SORT_LABELS[key]}</option>
                ))}
              </select>
            </div>

            {/* Main content: sidebar + grid */}
            <div className="dp-layout-with-sidebar">
              {/* Sidebar */}
              <aside className={`dp-filter-sidebar${sidebarOpen ? ' open' : ''}`}>
                <div className="dp-sidebar-header">
                  <h3>Filters</h3>
                  {activeFilterCount > 0 && (
                    <button type="button" className="dp-clear-filters" onClick={clearFilters}>
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category section */}
                <div className="dp-filter-section">
                  <h4>Category</h4>
                  <div className="dp-filter-options">
                    <label className={`dp-filter-radio${activeCategory === 'all' ? ' checked' : ''}`}>
                      <input
                        type="radio"
                        name="category"
                        checked={activeCategory === 'all'}
                        onChange={() => setActiveCategory('all')}
                      />
                      All ({products.length})
                    </label>
                    {categories.map(([cat, count]) => (
                      <label key={cat} className={`dp-filter-radio${activeCategory === cat ? ' checked' : ''}`}>
                        <input
                          type="radio"
                          name="category"
                          checked={activeCategory === cat}
                          onChange={() => setActiveCategory(cat)}
                        />
                        {cat} ({count})
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price range section */}
                <div className="dp-filter-section">
                  <h4>Price Range (₹)</h4>
                  <div className="dp-price-inputs">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder={`Min ₹${minPriceAll}`}
                      min={0}
                      className="dp-price-input"
                    />
                    <span className="dp-price-sep">—</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder={`Max ₹${maxPriceAll}`}
                      min={0}
                      className="dp-price-input"
                    />
                  </div>
                </div>
              </aside>

              {/* Sidebar backdrop for mobile */}
              {sidebarOpen && (
                <div className="dp-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
              )}

              {/* Product grid */}
              <div className="dp-products-area">
                {sortedProducts.length === 0 ? (
                  <div className="dp-empty-state">
                    <h2>No products match your filters</h2>
                    <p>Try adjusting your category or price range.</p>
                    <button type="button" className="dp-product-btn" onClick={clearFilters} style={{ margin: '0 auto', display: 'inline-flex' }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="dp-product-grid">
                    {sortedProducts.map((p) => {
                      const cover = p.featuredImage || (p.images && p.images.length > 0 ? p.images[0] : null)
                      const discount = discountPercent(p.price, p.compareAtPrice)
                      return (
                        <article key={p.slug} className="dp-product-card">
                          <div className="dp-product-image">
                            <Link
                              href={`/digital-products/${p.slug}`}
                              aria-label={p.title}
                            >
                              {cover ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={cover} alt={p.title} loading="lazy" />
                              ) : (
                                <div className="placeholder">📦</div>
                              )}
                              {discount > 0 ? (
                                <span className="dp-product-sale-badge">Sale!</span>
                              ) : null}
                            </Link>
                            <button
                              type="button"
                              className={`dp-wishlist-btn${isWishlisted(p.slug) ? ' wishlisted' : ''}`}
                              onClick={() => toggle({
                                slug: p.slug,
                                title: p.title,
                                price: p.price,
                                compareAtPrice: p.compareAtPrice,
                                image: cover || undefined,
                              })}
                              aria-label={isWishlisted(p.slug) ? 'Remove from wishlist' : 'Add to wishlist'}
                              title={isWishlisted(p.slug) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              {isWishlisted(p.slug) ? '❤️' : '🤍'}
                            </button>
                          </div>
                          <div className="dp-product-body">
                            <h2 className="dp-product-title">
                              <Link href={`/digital-products/${p.slug}`}>{p.title}</Link>
                            </h2>
                            <div className="dp-product-category-badge">{p.category}</div>
                            <div className="dp-product-price-row">
                              <span className="dp-product-price">{formatINR(p.price)}</span>
                              {p.compareAtPrice > p.price ? (
                                <span className="dp-product-original">{formatINR(p.compareAtPrice)}</span>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className="dp-product-btn"
                              onClick={() => handleAddToCart(p)}
                            >
                              Add to cart
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
