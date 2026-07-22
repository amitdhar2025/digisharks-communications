// ISR: revalidate every 60 seconds instead of hitting the server on every request
// This dramatically reduces TTFB — from 825ms to ~50ms for cached responses
export const revalidate = 60;

import HeroMediaCarousel from "@/components/HeroMediaCarousel";
import SeoAuditWidget from "@/components/SeoAuditWidget";
import BelowFoldContent from "@/components/BelowFoldContent";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'
import { DEFAULT_CONTENT } from '@/lib/home-content'
import SiteSettings from '@/models/SiteSettings'
import { connectCMSDb } from '@/lib/db-cms'
import { getFromCache, setInCache } from '@/lib/cms-cache'
import "./home.css";
import "./multi-color.css";

export default async function Home() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('home')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }

  // Fetch site settings for legal link URLs (cached for 60s)
  try {
    let settings = getFromCache<any>('site-settings')
    if (!settings) {
      await connectCMSDb()
      settings = await SiteSettings.findOne({ key: 'global' }).lean()
      setInCache('site-settings', settings, 60_000)
    }
    if (settings) {
      content.privacyPolicyUrl = settings.privacyPolicyUrl || '#'
      content.termsUrl = settings.termsUrl || '#'
      content.refundPolicyUrl = settings.refundPolicyUrl || '#'
    }
  } catch (err) {
    console.error('[page.tsx] Failed to fetch site settings:', err)
  }

  // ── Preload the first hero carousel image for LCP ──
  const heroMediaItems = (content.heroMedia || [])
    .filter((m: any) => m.isActive !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  const firstHeroImage = heroMediaItems.length > 0 ? heroMediaItems[0].image || null : null

  return (
    <>
      {/* Preload first hero carousel image for faster LCP */}
      {firstHeroImage && (
        <link rel="preload" href={firstHeroImage} as="image" fetchPriority="high" />
      )}
      {/* Preload poster image — shown immediately while video loads */}
      <link rel="preload" href="/Video-poster.webp" as="image" fetchPriority="high" />
      <div className="content">

        {/* ===== HERO SECTION ===== */}
        <section className="hero-section">
          <div className="hero-inner">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="section-label-orange fade-up">
                  <span className="label-dot"></span>
                  {content.heroEyebrow}
                </div>
                <h1 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.heroHeading }} />
                <p className="fade-up stagger-2">
                  {content.heroDescription}
                </p>
                <div className="hero-ctas fade-up stagger-3">
                  <a href={content.heroPrimaryCta.href || '#'} className="btn-primary">{content.heroPrimaryCta.text}</a>
                  <a href={content.heroSecondaryCta.href || '#'} className="btn-secondary">{content.heroSecondaryCta.text}</a>
                </div>
              </div>
              <div className="seo-audit-promo-section">
                <SeoAuditWidget />
              </div>
            </div>
            <div className="stats-row fade-up stagger-4">
              {(content.heroStats || []).map((stat, i) => (
                <div className="stat-item" key={i}>
                  <span className="stat-num" data-target={stat.number}>{stat.number}{stat.suffix}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HERO MEDIA (Carousel if multiple, single display otherwise) ===== */}
        {(() => {
          const mediaItems = (content.heroMedia || []).filter((m: any) => m.isActive !== false)
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
          if (mediaItems.length > 0) {
            return (
              <div style={{ padding: '0 5vw', marginTop: 24 }}>
                <HeroMediaCarousel items={mediaItems} />
              </div>
            )
          }
          // Fallback: show the heroVideo single video
          return (
            <div style={{position:"relative",left:"50%",right:"50%",marginLeft:"-50vw",marginRight:"-50vw",width:"100vw",lineHeight:0,overflow:"hidden"}}>
              <video autoPlay muted loop playsInline disablePictureInPicture preload="none" poster="/Video-poster.webp" style={{width:"100vw",display:"block",pointerEvents:"none"}}>
                <source src={content.heroVideo || '/Video.webm'} type="video/webm" />
                <source src={content.heroVideo || '/Video.mp4'} type="video/mp4" />
              </video>
            </div>
          )
        })()}

        {/* ===== BRAND LOGOS ===== */}
        <section className="brand-logos-section">
          <div className="brand-logos-inner">
            <h2 className="brand-cards-heading fade-up" dangerouslySetInnerHTML={{ __html: content.brandLogosHeading }} />
            <div className="brand-carousel">
              <div className="brand-carousel-track-overflow">
                <div className="brand-carousel-track">
                  {(() => {
                    // Use CMS images if available, otherwise fallback to hardcoded
                    const cmsImages = (content.brandLogosImages || []).filter((img: any) => img.isActive !== false)
                      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                    if (cmsImages.length > 0) {
                      // Duplicate the images to create a seamless infinite scroll
                      const doubled = [...cmsImages, ...cmsImages]
                      return doubled.map((img: any, i: number) => (
                        <div className="brand-carousel-item" key={i}>
                          {img.link ? (
                            <a href={img.link} target="_blank" rel="noopener noreferrer">
                              <img src={img.image} alt={img.alt || img.caption || ''} width="160" height="94" loading="lazy" className="brand-carousel-img" />
                            </a>
                          ) : (
                            <img src={img.image} alt={img.alt || img.caption || ''} width="160" height="94" loading="lazy" className="brand-carousel-img" />
                          )}
                        </div>
                      ))
                    }
                    // Fallback: hardcoded 1-8 images
                    return [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8].map((n, i) => (
                      <div className="brand-carousel-item" key={n + "-" + i}>
                        <img src={"/one-card-" + n + ".avif"} alt={"Project " + n} width="160" height="94" loading="lazy" className="brand-carousel-img" />
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AI GROWTH METRICS ===== */}
        <section className="metrics-section-orange">
          <div className="container">
            <div className="metrics-header fade-up">
              <div className="section-label-orange centered-label">
                <span className="label-dot"></span>
                {content.metricsLabel}
              </div>
              <h2 style={{textAlign:"center",marginBottom:"0.75rem"}} dangerouslySetInnerHTML={{ __html: content.metricsHeading }} />
              <p style={{textAlign:"center",maxWidth:"700px",margin:"0 auto",fontSize:"1.05rem",lineHeight:1.75,color:"var(--color-body)"}}>{content.metricsDescription}</p>
            </div>
            <div className="metrics-grid-home">
              {(content.metrics || []).map((m, i) => (
                <div className={`metric-card-orange fade-up stagger-${(i % 4) + 1}`} key={i}>
                  <div className="metric-icon-orange">{m.icon}</div>
                  <div className="metric-big-num" data-target={m.number}>{m.number}{m.suffix}</div>
                  <div className="metric-name">{m.title}</div>
                  <p className="metric-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== BELOW-FOLD SECTIONS (lazy loaded via IntersectionObserver) ===== */}
        <BelowFoldContent content={content} />

      </div>
      <QuickEditButton slug="home" />
    </>
  );
}
