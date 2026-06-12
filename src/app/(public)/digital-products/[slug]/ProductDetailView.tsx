'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

/**
 * PanIndiaProductPage
 * ------------------------------------------------------------------
 * Full Next.js recreation of the WordPress / WooCommerce product page
 * "PAN INDIA UPDATED DATABASE 2020-2025".
 *
 * STYLING NOTE:
 * Styles use `<style jsx global>` with every selector namespaced under
 * the root `.pi-product-page` class. This is deliberate:
 *   - global rules reach <Link>'s rendered <a> (plain styled-jsx
 *     scoping does NOT, which is why button backgrounds disappeared);
 *   - descendant selectors (.pi-product-page .faq) have enough
 *     specificity to override a global/dark app theme leaking in;
 *   - the namespace keeps these styles from polluting the rest of
 *     your app.
 *
 * Replace the placeholder image URLs in `product.images` with your
 * real assets.
 *
 * MOBILE FIX NOTES:
 *   - .desc-grid now forces flex-direction: column on <=900px with
 *     !important to beat any higher-specificity / later-loaded
 *     global app styles.
 *   - .desc-main and .faq get flex: 1 1 100% / width: 100% /
 *     max-width: 100% on mobile so they don't retain their desktop
 *     64% / 36% basis and overflow.
 *   - .faq position switches from sticky to static on mobile.
 *   - Make sure your app/layout.tsx has the viewport meta export
 *     (width: 'device-width', initialScale: 1) or these media
 *     queries will never fire on real devices.
 */

type Testimonial = { name: string; avatar: string; stars: number; text: string }
type FaqItem = { q: string; a: string }

const product = {
  slug: 'pan-india-updated-database-2020-2025',
  title: 'PAN INDIA UPDATED DATABASE 2020-2025',
  price: 299,
  compareAtPrice: 3999,
  rating: 5,

  // Real product images.
  images: [
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/DB2.jpeg',
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/DB1.jpeg',
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/DB.jpeg',
  ],
  videoUrl:
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4',

  whyChoose: [
    { label: 'Verified Information', text: 'Delivers dependable and accurate data across all categories.' },
    { label: 'Flexible Use', text: 'Customize the database to match your specific business goals.' },
    { label: 'Cost-Effective & All-Inclusive', text: 'Achieve higher ROI with an affordable, all-round solution.' },
  ],
  deliveryFormat:
    'Provided in CSV or Excel format for seamless integration with your CRM or marketing systems. Securely delivered via email or cloud download link.',

  // ---- Long description (Description tab) ----
  intro:
    'Boost your marketing success with our powerful and extensively curated PAN INDIA UPDATED DATABASE. Ideal for B2B, B2C, and niche targeting, this resource empowers your sales and outreach campaigns with unmatched accuracy and coverage.',
  contactsIncluded: [
    'Entrepreneurs & Business Owners',
    'CEOs, CMOs, CFOs, Directors',
    'Government Officials',
    'Students, Job Seekers, and Working Professionals',
  ],
  features: [
    'Coverage of 40+ Industries',
    'Nationwide Reach Across PAN India',
    'Highly Accurate & Regularly Updated',
    'Available in CSV, Excel, and PDF formats',
    'Suitable for Email, SMS, WhatsApp, and Direct Marketing Campaigns',
  ],
  categoriesCovered:
    'Startups, SMEs, MSMEs, Retailers, Importers, Exporters, Event Planners, Marketing Firms, CA/CS, Doctors, Architects, Builders, Real Estate Agents, Educators, Pharma Companies, Freelancers, Consultants, E-commerce Sellers, and more.',
  dataFormat: 'CSV, PDF, XLS – Easily compatible with your CRM or email tools',
  useCase:
    'Ideal for Email Marketing, SMS/WhatsApp Campaigns, Lead Generation, Cold Outreach, B2B Sales, Freelancing, and Direct Business Engagements',
  whyChooseUs: [
    'Reliable Data: Verified and up-to-date contacts',
    'Instant Delivery: Download immediately after purchase',
    'Cost-Effective',
    '24×7 Customer Support',
  ],
  whoBenefits:
    'Perfect for Startups, Entrepreneurs, Freelancers, Sales Professionals, Marketing Agencies, and Business Development Teams',
  whatsIncluded: [
    { head: 'Business Contacts', tail: 'Name, Company, Role, Industry, Email, Phone, City' },
    { head: 'Consumer Data', tail: 'Name, Age, Gender, Email, Phone, City' },
    { head: 'Professional Segments', tail: 'CA, Doctors, Architects, Builders, etc.' },
    { head: 'Student Leads', tail: 'Exam Aspirants, Course Enquiries' },
    { head: 'Geographic Details', tail: 'Region-wise segmentation' },
  ],

  cartUrl: '/shopping-cart', // both CTAs navigate here (resolves to localhost:3000/shopping-cart in dev)
  supportEmail: 'marketing@digisharkscommunications.com',

  testimonials: [
    {
      name: 'Amit Khurana',
      avatar: 'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/69.jpg',
      stars: 5,
      text: 'Incredible results! I received over 100 quality B2B leads in just 48 hours. Truly worth the investment.',
    },
    {
      name: 'Neha Verma',
      avatar: 'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/15.jpg',
      stars: 5,
      text: 'The data is super clean and 100% verified. It helped me triple my ROI on Instagram ad campaigns.',
    },
    {
      name: 'Sachin Mehta',
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      stars: 5,
      text: 'Kudos to the team! They delivered exactly what they promised. Having 145+ categories is a huge advantage.',
    },
    {
      name: 'Kavita Iyer',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      stars: 5,
      text: 'Perfect tool for nationwide outreach. Got access to both student and business data, neatly organized and easy to use.',
    },
  ] as Testimonial[],

  faq: [
    { q: 'When will I receive my product?', a: "You'll get instant access to download the database right after your payment. A copy will also be sent to your email." },
    { q: 'What if I need help or have questions?', a: 'Our support team is always available via email to assist you.' },
    { q: 'How long do I have access to the database?', a: 'Lifetime access, including free future updates.' },
    { q: 'Are there any hidden charges or subscriptions?', a: 'No. You pay once and get full access—no recurring fees.' },
  ] as FaqItem[],

  securePaymentImg:
    'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/Fortix_Secure_Payment.png.webp',
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n)
}

// Shown if an image URL fails to load (so the gallery never goes blank).
const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#999" text-anchor="middle" dominant-baseline="middle">Add product image</text></svg>'
  )

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG
}

export default function PanIndiaProductPage() {
  const { add } = useCart()
  const router = useRouter()
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomedIn, setZoomedIn] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const handleAddToCart = () => {
    add(
      {
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.images[0],
      },
      qty
    )
    // Redirect the user to the shopping cart page after adding the product.
    router.push(product.cartUrl)
  }

  const openZoom = () => {
    setZoomedIn(false)
    setZoomOpen(true)
  }

  // Close on Escape and lock body scroll while the lightbox is open.
  useEffect(() => {
    if (!zoomOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [zoomOpen])

  const hasImages = product.images.length > 0
  const discount =
    product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0

  return (
    <div className="pi-product-page">
      {/* ===================== TOP: GALLERY + SUMMARY ===================== */}
      <div className="top">
        {/* ---- Gallery ---- */}
        <div className="gallery">
          {discount > 0 && <span className="sale-badge">Sale!</span>}
          <button
            type="button"
            className="search-icon"
            onClick={openZoom}
            aria-label="Zoom image"
          >
            🔍
          </button>

          <div className="gallery-main">
            {hasImages ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[activeImg]}
                alt={product.title}
                onError={handleImgError}
                onClick={openZoom}
              />
            ) : (
              <div className="img-placeholder">📦</div>
            )}
          </div>

          {hasImages && product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === activeImg ? 'active' : ''}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" onError={handleImgError} />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ---- Summary ---- */}
        <div className="summary">
          <h1>{product.title}</h1>

          <div className="price-row">
            {product.compareAtPrice > product.price && (
              <span className="old-price">{formatINR(product.compareAtPrice)}</span>
            )}
            <span className="price">{formatINR(product.price)}</span>
          </div>

          {product.videoUrl && (
            <>
              <p className="video-label">Watch the video for complete insights</p>
              <div className="video-wrap">
                <video src={product.videoUrl} controls preload="metadata" />
              </div>
            </>
          )}

          <div className="stars" aria-label={`${product.rating} stars`}>
            {'★'.repeat(product.rating)}
          </div>

          <p className="why-heading">Why Choose Our Database?</p>
          <ul className="why-list">
            {product.whyChoose.map((w) => (
              <li key={w.label}>
                ✅ <strong>{w.label}:</strong> {w.text}
              </li>
            ))}
          </ul>

          <p className="delivery-heading">Delivery Format:</p>
          <p className="delivery-text">{product.deliveryFormat}</p>

          <div className="add-row">
            <div className="qty">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
                aria-label="Quantity"
              />
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button type="button" className="add-to-cart" onClick={handleAddToCart}>
              Add to cart
            </button>
          </div>
        </div>
      </div>

      {/* ===================== DESCRIPTION TAB ===================== */}
      <div className="tabs">
        <button type="button" className="tab active">
          Description
        </button>
      </div>

      <h2 className="section-title">Description</h2>

      <div className="desc-panel">
        <div className="desc-grid">
          {/* ---- Left: long description ---- */}
          <div className="desc-main">
            <h2 className="desc-title">PAN INDIA UPDATED DATABASE 2.0</h2>

            <h3>Product Description</h3>
            <p>{product.intro}</p>

            <h3>Key Features:</h3>
            <ul>
              <li>
                Access to thousands of verified, active contacts, including:
                <ul>
                  {product.contactsIncluded.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </li>
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <h3>Categories Covered:</h3>
            <p>{product.categoriesCovered}</p>

            <h3>Data Format:</h3>
            <p>{product.dataFormat}</p>

            <h3>Use Case:</h3>
            <p>{product.useCase}</p>

            <h3>Why Choose Us?</h3>
            <ul>
              {product.whyChooseUs.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>

            <h3>Who Can Benefit?</h3>
            <p>{product.whoBenefits}</p>

            <h3>What&apos;s Included:</h3>
            <ul>
              {product.whatsIncluded.map((item) => (
                <li key={item.head}>
                  <strong>{item.head}:</strong> {item.tail}
                </li>
              ))}
            </ul>

            <div className="sale-banner">LIMITED TIME OFFER – SALE ENDS TODAY ⏳</div>

            <div className="cta-wrap">
              <button
                type="button"
                className="download-btn"
                onClick={() => {
                  handleAddToCart()
                  router.push(product.cartUrl)
                }}
              >
                ⬇️ Get Instant Access To Database at {formatINR(product.price).replace('.00', '')}
              </button>
            </div>

            <div className="query-box">
              If you have any query regarding our product, please mail us at{' '}
              <a href={`mailto:${product.supportEmail}`}>{product.supportEmail}</a>
            </div>

            <div className="testimonials">
              <h3 className="testimonials-heading">Testimonials</h3>
              {product.testimonials.map((t) => (
                <div className="testimonial-card" key={t.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <div className="testimonial-stars" aria-label={`${t.stars} stars`}>
                      {'★'.repeat(t.stars)}
                    </div>
                    <p className="testimonial-text">{t.text}</p>
                    <strong>{t.name}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Right: FAQ ---- */}
          <aside className="faq">
            <h3>Frequent Asked Questions:</h3>
            {product.faq.map((item) => (
              <p key={item.q} className="faq-item">
                <strong>{item.q}</strong>
                <br />
                {item.a}
              </p>
            ))}
            <p className="related">
              <em>Related Products:</em>
              <br />
              Video Courses | Marketing Tools
            </p>
          </aside>
        </div>
      </div>

      {/* ===================== SECURE PAYMENT ===================== */}
      <div className="footer-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.securePaymentImg} alt="100% Secure Payment by Razorpay" />
      </div>

      {/* ===================== ZOOM LIGHTBOX ===================== */}
      {zoomOpen && hasImages && (
        <div
          className="pi-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            className="pi-lightbox-close"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          >
            ×
          </button>

          <div className="pi-lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[activeImg]}
              alt={product.title}
              onError={handleImgError}
              className={zoomedIn ? 'zoomed' : ''}
              style={zoomedIn ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
              onClick={() => setZoomedIn((z) => !z)}
              onMouseMove={(e) => {
                if (!zoomedIn) return
                const r = e.currentTarget.getBoundingClientRect()
                setOrigin({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                })
              }}
            />
          </div>

          {product.images.length > 1 && (
            <div className="pi-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === activeImg ? 'active' : ''}
                  onClick={() => {
                    setActiveImg(i)
                    setZoomedIn(false)
                  }}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" onError={handleImgError} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== STYLES (namespaced global) ===================== */}
      <style jsx global>{`
        .pi-product-page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 1.5rem;
          font-family: Arial, 'Hind Madurai', sans-serif;
          color: #2b2b2b;
          line-height: 1.6;
          background: #ffffff;
          margin-top: 80px !important;
        }
        .pi-product-page * {
          box-sizing: border-box;
        }

        /* ---------- TOP ---------- */
        .pi-product-page .top {
          display: flex;
          gap: 2.5rem;
          align-items: flex-start;
        }
        .pi-product-page .gallery {
          flex: 1 1 45%;
          min-width: 0;
          position: relative;
        }
        .pi-product-page .sale-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          background: #82851f;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
        }
        .pi-product-page .search-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e3e3e3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          padding: 0;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .pi-product-page .search-icon:hover {
          background: #f3f3f3;
        }
        .pi-product-page .gallery-main {
          border: 1px solid #eee;
          border-radius: 6px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f7f7;
        }
        .pi-product-page .gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: zoom-in;
        }
        .pi-product-page .img-placeholder {
          font-size: 3rem;
          color: #ccc;
        }
        .pi-product-page .thumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 0.75rem;
        }
        .pi-product-page .thumbs button {
          flex: 0 0 70px;
          width: 70px;
          height: 70px;
          padding: 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
        }
        .pi-product-page .thumbs button.active {
          border-color: #2db5d8;
        }
        .pi-product-page .thumbs img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* ---------- SUMMARY ---------- */
        .pi-product-page .summary {
          flex: 1 1 55%;
          min-width: 0;
        }
        .pi-product-page .summary h1 {
          font-size: 1.7rem;
          font-weight: 700;
          margin: 0 0 0.6rem;
          color: #3a3a3a;
        }
        .pi-product-page .price-row {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          margin-bottom: 0.75rem;
        }
        .pi-product-page .old-price {
          color: #c8a24a;
          text-decoration: line-through;
          font-size: 1rem;
        }
        .pi-product-page .price {
          color: #2b2b2b;
          font-size: 1.35rem;
          font-weight: 700;
        }
        .pi-product-page .video-label {
          font-size: 0.9rem;
          color: #555;
          margin: 0.4rem 0;
        }
        .pi-product-page .video-wrap {
          border-radius: 6px;
          overflow: hidden;
          background: #000;
        }
        .pi-product-page .video-wrap video {
          width: 100%;
          display: block;
        }
        .pi-product-page .stars {
          color: #fbc02d;
          font-size: 1.15rem;
          margin: 0.75rem 0;
          letter-spacing: 2px;
        }
        .pi-product-page .why-heading,
        .pi-product-page .delivery-heading {
          font-weight: 600;
          margin: 0.75rem 0 0.4rem;
          color: #2b2b2b;
        }
        .pi-product-page .why-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .pi-product-page .why-list li {
          margin: 0.35rem 0;
          font-size: 0.95rem;
          color: #333;
        }
        .pi-product-page .delivery-text {
          font-size: 0.95rem;
          color: #444;
          margin: 0 0 1rem;
        }

        /* ---------- QUANTITY + ADD TO CART ---------- */
        .pi-product-page .add-row {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .pi-product-page .qty {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: hidden;
        }
        .pi-product-page .qty button {
          width: 38px;
          height: 44px;
          border: none;
          background: #8a5cf6;
          font-size: 1.2rem;
          cursor: pointer;
          color: #fff;
        }
        .pi-product-page .qty button:hover {
          background: #7c4ef0;
        }
        .pi-product-page .qty input {
          width: 48px;
          height: 44px;
          border: none;
          border-left: 1px solid #ddd;
          border-right: 1px solid #ddd;
          text-align: center;
          font-size: 1rem;
          color: #2b2b2b;
          background: #fff;
          -moz-appearance: textfield;
        }
        .pi-product-page .qty input::-webkit-outer-spin-button,
        .pi-product-page .qty input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .pi-product-page .add-to-cart {
          flex: 0 0 auto;
          background: #8a5cf6;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0 1.6rem;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease;
        }
        .pi-product-page .add-to-cart:hover {
          background: #7c4ef0;
          color: #fff;
        }

        /* ---------- TABS ---------- */
        .pi-product-page .tabs {
          margin-top: 2.5rem;
          border-bottom: 1px solid #e3e3e3;
        }
        .pi-product-page .tab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          cursor: pointer;
          color: #555;
        }
        .pi-product-page .tab.active {
          color: #1a1a1a;
          border-bottom-color: #1a1a1a;
          font-weight: 600;
        }
        .pi-product-page .section-title {
          font-size: 1.8rem;
          font-weight: 400;
          margin: 1.5rem 0 1rem;
          color: #2b2b2b;
        }

        /* ---------- DESCRIPTION PANEL ---------- */
        .pi-product-page .desc-panel {
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 2rem;
          overflow: hidden;
        }
        .pi-product-page .desc-grid {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          width: 100%;
        }
        .pi-product-page .desc-main {
          flex: 1 1 64%;
          min-width: 0;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1.75rem;
          color: #2b2b2b;
        }
        .pi-product-page .desc-title {
          color: #d32f2f;
          margin: 0 0 1rem;
          font-size: 1.45rem;
        }
        .pi-product-page .desc-main h3 {
          margin: 1.4rem 0 0.5rem;
          font-size: 1.05rem;
          color: #2b2b2b;
        }
        .pi-product-page .desc-main p {
          color: #2b2b2b;
        }
        .pi-product-page .desc-main ul {
          margin: 0.4rem 0 0.4rem 1.2rem;
          padding: 0;
          color: #2b2b2b;
        }
        .pi-product-page .desc-main ul ul {
          margin-top: 0.3rem;
        }
        .pi-product-page .desc-main li {
          margin: 0.25rem 0;
        }

        .pi-product-page .sale-banner {
          background: #81d4fa;
          color: #003b63;
          padding: 10px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          border-radius: 4px;
          margin-top: 1.5rem;
        }
        .pi-product-page .cta-wrap {
          text-align: center;
          margin-top: 20px;
        }
        .pi-product-page .download-btn {
          background: #e53935;
          color: #fff;
          font-size: 20px;
          font-weight: bold;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          display: inline-block;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .pi-product-page .download-btn:hover {
          background: #c62828;
          color: #fff;
          transform: translateY(-1px);
        }
        .pi-product-page .query-box {
          text-align: center;
          margin-top: 10px;
          font-size: 16px;
          background: #ffeb3b;
          color: #000;
          padding: 10px;
          border-radius: 4px;
        }
        .pi-product-page .query-box a {
          color: #000;
          font-weight: bold;
          text-decoration: underline;
        }

        /* ---------- TESTIMONIALS ---------- */
        .pi-product-page .testimonials {
          max-width: 600px;
          margin: 2rem auto 0;
        }
        .pi-product-page .testimonials-heading {
          font-weight: 600;
          margin-bottom: 8px;
          padding-top: 15px;
          color: #2b2b2b;
        }
        .pi-product-page .testimonial-card {
          display: flex;
          gap: 15px;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
          align-items: center;
          background: #fff;
          color: #2b2b2b;
        }
        .pi-product-page .testimonial-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .pi-product-page .testimonial-stars {
          color: #fbc02d;
          font-size: 20px;
          line-height: 1;
        }
        .pi-product-page .testimonial-text {
          margin: 5px 0;
          color: #2b2b2b;
        }

        /* ---------- FAQ (forced light to beat a dark global theme) ---------- */
        .pi-product-page .faq {
          flex: 1 1 36%;
          min-width: 0;
          background: #ffffff !important;
          border: 1px solid #eee !important;
          border-radius: 8px;
          padding: 1.5rem;
          position: sticky;
          top: 1rem;
          color: #2b2b2b !important;
          box-shadow: none !important;
        }
        .pi-product-page .faq h3 {
          color: #1a1a1a !important;
          background: transparent !important;
          margin-top: 0;
        }
        .pi-product-page .faq-item {
          margin: 0 0 0.9rem !important;
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          color: #444 !important;
        }
        .pi-product-page .faq-item strong {
          color: #1a1a1a !important;
          background: transparent !important;
        }
        .pi-product-page .related {
          margin-top: 1.25rem;
          background: transparent !important;
          color: #444 !important;
        }

        /* ---------- ZOOM LIGHTBOX ---------- */
        .pi-product-page .pi-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.88);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }
        .pi-product-page .pi-lightbox-stage {
          max-width: 92vw;
          max-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pi-product-page .pi-lightbox-stage img {
          max-width: 92vw;
          max-height: 80vh;
          object-fit: contain;
          cursor: zoom-in;
          transition: transform 0.2s ease;
          user-select: none;
          -webkit-user-drag: none;
        }
        .pi-product-page .pi-lightbox-stage img.zoomed {
          transform: scale(2.2);
          cursor: zoom-out;
        }
        .pi-product-page .pi-lightbox-close {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.92);
          color: #222;
          font-size: 1.7rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pi-product-page .pi-lightbox-close:hover {
          background: #fff;
        }
        .pi-product-page .pi-lightbox-thumbs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pi-product-page .pi-lightbox-thumbs button {
          width: 58px;
          height: 58px;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          opacity: 0.7;
        }
        .pi-product-page .pi-lightbox-thumbs button.active {
          border-color: #fff;
          opacity: 1;
        }
        .pi-product-page .pi-lightbox-thumbs img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ---------- FOOTER ---------- */
        .pi-product-page .footer-image {
          text-align: center;
          margin-top: 2.5rem;
        }
        .pi-product-page .footer-image img {
          max-width: 100%;
          height: auto;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 900px) {
          .pi-product-page .top {
            flex-direction: column;
            gap: 1.75rem;
          }
          .pi-product-page .desc-grid {
            flex-direction: column !important;
          }
          .pi-product-page .desc-main,
          .pi-product-page .faq {
            flex: 1 1 100% !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .pi-product-page .faq {
            position: static !important;
            top: auto;
          }
        }
        @media (max-width: 768px) {
          .pi-product-page {
            padding: 1rem;
          }
          .pi-product-page .desc-panel {
            padding: 1rem;
          }
          .pi-product-page .desc-main {
            padding: 1.1rem;
          }
          .pi-product-page .summary h1 {
            font-size: 1.4rem;
          }
          .pi-product-page .add-to-cart {
            flex: 1 1 auto;
            justify-content: center;
            padding: 0.75rem 1.2rem;
          }
          .pi-product-page .sale-banner,
          .pi-product-page .download-btn {
            font-size: 17px;
          }
          .pi-product-page .download-btn {
            display: block;
            padding: 14px 16px;
          }
          .pi-product-page .testimonial-card {
            flex-direction: column;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .pi-product-page {
            padding: 0.75rem;
          }
          .pi-product-page .thumbs button {
            flex: 0 0 56px;
            width: 56px;
            height: 56px;
          }
          .pi-product-page .summary h1 {
            font-size: 1.25rem;
          }
          .pi-product-page .price {
            font-size: 1.2rem;
          }
          .pi-product-page .sale-banner,
          .pi-product-page .download-btn {
            font-size: 15px;
          }
          .pi-product-page .section-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  )
}