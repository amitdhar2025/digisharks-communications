'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import LazySection from './LazySection'
import Footer from './Footer'

// ── Dynamically imported (code-split) — JS fetched only when needed ──
const MediaCarousel = dynamic(() => import('./MediaCarousel'), {
  ssr: false,
  loading: () => <div style={{ minHeight: 120 }} />,
})
const PortfolioSection = dynamic(() => import('./PortfolioSection'), {
  ssr: false,
  loading: () => <div style={{ minHeight: 200 }} />,
})
const TestimonialSlider = dynamic(() => import('./TestimonialSlider'), {
  ssr: false,
  loading: () => <div style={{ minHeight: 100 }} />,
})

interface BelowFoldContentProps {
  content: Record<string, any>
}

/**
 * Renders all sections below the visible viewport fold.
 * Each section is code-split (dynamic import) and deferred
 * via IntersectionObserver (LazySection) until the user
 * scrolls near it.
 */
export default function BelowFoldContent({ content }: BelowFoldContentProps) {
  return (
    <>
      {/* ===== AWARDS ===== */}
      <LazySection minHeight={300} rootMargin={100}>
        <section className="awards-section-light">
          <div className="container">
            <div className="metrics-header fade-up">
              <div className="section-label-orange centered-label">
                <span className="label-dot"></span>
                {content.awardsLabel}
              </div>
              <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }} dangerouslySetInnerHTML={{ __html: content.awardsHeading }} />
              <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.75, color: 'var(--color-body)' }}>{content.awardsDescription}</p>
            </div>
            <div className="awards-grid-home">
              {(() => {
                const awards = (content.awardsItems || []).filter((a: any) => a.isActive !== false)
                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                if (awards.length > 0) {
                  return awards.map((award: any, i: number) => (
                    <div className={`award-card-light fade-up stagger-${(i % 3) + 1}`} key={i}>
                      <div className="award-img-wrap">
                        <Image
                          src={award.image || '/google-partner.avif'}
                          alt={award.title || 'Award'}
                          width={160}
                          height={80}
                          className="award-partner-img"
                          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                        />
                      </div>
                      <h3 className="award-card-name">{award.title || 'Award'}</h3>
                      <span className="award-card-subtitle">{award.subtitle || ''}</span>
                    </div>
                  ))
                }
                // Fallback: hardcoded awards
                return [
                  { src: '/google-partner.avif', alt: 'Google Partner', title: 'Google Partner', sub: 'Premier 2026' },
                  { src: '/meta-partner.avif', alt: 'Meta Business Partner', title: 'Meta Business Partner', sub: 'Certified 2025' },
                  { src: '/clutch-award.avif', alt: 'Clutch Award', title: 'Clutch Award', sub: 'Top PPC Company 2026' },
                ].map((award, i) => (
                  <div className={`award-card-light fade-up stagger-${i + 1}`} key={i}>
                    <div className="award-img-wrap">
                      <Image src={award.src} alt={award.alt} width={160} height={80} className="award-partner-img" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                    </div>
                    <h3 className="award-card-name">{award.title}</h3>
                    <span className="award-card-subtitle">{award.sub}</span>
                  </div>
                ))
              })()}
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== SERVICES ===== */}
      <LazySection minHeight={400} rootMargin={100}>
        <section className="services-section">
          <div className="container">
            <div className="services-layout">
              <div className="services-left">
                <div className="section-label-orange fade-up">
                  <span className="label-dot"></span>
                  {content.servicesLabel}
                </div>
                <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.servicesHeading }} />
                <p className="services-subtitle fade-up stagger-2">{content.servicesSubtitle}</p>
                <div className="services-items-grid fade-up stagger-3">
                  {(content.services || []).map((s: any, i: number) => (
                    <div className="service-item" key={i}>
                      <div className="service-item-icon">{s.icon}</div>
                      <div className="service-item-text">
                        <h4>{s.title}</h4>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="services-right fade-up stagger-2">
                <div className="services-dashboard-card">
                  <div className="dash-top-bar">
                    <span className="dash-dot red"></span>
                    <span className="dash-dot yellow"></span>
                    <span className="dash-dot green"></span>
                  </div>
                  <div className="dash-content">
                    <div className="dash-header-bar">
                      <span className="dash-badge">AI Dashboard</span>
                      <span className="dash-live">● Live</span>
                    </div>
                    <div className="dash-metrics-row">
                      <div className="dash-metric-cell"><span className="dash-metric-value">2.4M</span><span className="dash-metric-label">Impressions</span></div>
                      <div className="dash-metric-cell"><span className="dash-metric-value">156K</span><span className="dash-metric-label">Clicks</span></div>
                      <div className="dash-metric-cell"><span className="dash-metric-value">8.2%</span><span className="dash-metric-label">Conv. Rate</span></div>
                    </div>
                    <div className="dash-chart-bars">
                      <span style={{ height: '45%' }}></span><span style={{ height: '65%' }}></span><span style={{ height: '50%' }}></span><span style={{ height: '80%' }}></span><span style={{ height: '60%' }}></span><span style={{ height: '90%' }}></span><span style={{ height: '75%' }}></span>
                    </div>
                    <div className="dash-footer">AI + PR + Digital Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== WHY CHOOSE US ===== */}
      <LazySection minHeight={300} rootMargin={100}>
        <section className="why-choose-section">
          <div className="container">
            <div className="why-choose-layout">
              <div className="why-choose-left fade-up">
                <div className="section-label-orange">
                  <span className="label-dot"></span>
                  {content.whyChooseLabel}
                </div>
                <h2 dangerouslySetInnerHTML={{ __html: content.whyChooseHeading }} />
                <p className="why-choose-sub">{content.whyChooseSubtitle}</p>
                <ul className="why-choose-list">
                  {(content.whyChooseItems || []).map((item: string, i: number) => (
                    <li key={i}><span className="check-icon-orange">✓</span><span>{item}</span></li>
                  ))}
                </ul>
                <a href="#" className="btn-primary">Work With Us →</a>
              </div>
              <div className="why-choose-right fade-up stagger-1">
                <div className="why-icons-grid">
                  {(content.whyChooseIcons || []).map((item: any, i: number) => (
                    <div className="why-icon-card" key={i}>
                      <span className="why-icon">{item.icon}</span>
                      <span className="why-icon-label">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== TESTIMONIALS ===== */}
      <LazySection minHeight={350} rootMargin={100}>
        <section className="testimonials-section">
          <div className="container">
            <div className="section-label-orange centered-label fade-up">
              <span className="label-dot"></span>
              {content.testimonialsLabel}
            </div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: content.testimonialsHeading }} />
            <p className="testi-sub fade-up stagger-2">{content.testimonialsSubtitle}</p>
            <div className="testi-grid desktop-only fade-up stagger-3">
              {[
                { quote: 'They have excellent media coverage capabilities and provide great exposure for brands. Truly one of the best in the business. Our visibility grew 4x in just 3 months.', initials: 'YM', name: 'Yassmin Mistry', role: 'Founder, Verified Client', bg: '#FF5B2E' },
                { quote: 'It was great working with Digisharks Communications. They provided valuable opportunities and helped enhance my knowledge. Highly recommended PR and Digital Marketing agency.', initials: 'UK', name: 'Uday Kumar', role: 'CEO, Verified Client', bg: '#0F1628' },
                { quote: 'Digisharks Communications is one of the best PR and digital marketing agencies in Delhi NCR. Their team is highly professional, experienced, and supportive throughout.', initials: 'PP', name: 'Preeti Packer', role: 'Director, Verified Client', bg: '#6366F1' },
              ].map((t, i) => (
                <div className="testi-card-light" key={i}>
                  <div className="testi-stars">★★★★★</div>
                  <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="testi-author">
                    <div className="testi-avatar" style={{ background: t.bg }}>{t.initials}</div>
                    <div className="testi-author-info">
                      <div className="testi-author-name">{t.name}</div>
                      <div className="testi-author-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mobile-only"><TestimonialSlider /></div>
          </div>
        </section>
      </LazySection>

      {/* ===== MEDIA CAROUSEL + PORTFOLIO ===== */}
      <LazySection minHeight={250} rootMargin={100}>
        <MediaCarousel items={content.mediaHouseItems || []} />
        <PortfolioSection />
      </LazySection>

      {/* ===== FINAL CTA ===== */}
      <LazySection minHeight={300} rootMargin={100}>
        <section className="cta-dark-section">
          <div className="container">
            <div className="cta-dark-box fade-up">
              <div className="cta-dark-badge">{content.ctaBadge}</div>
              <h2 dangerouslySetInnerHTML={{ __html: content.ctaHeading }} />
              <p className="cta-dark-text">{content.ctaDescription}</p>
              <div className="cta-dark-tags">
                {(content.ctaFeatures || []).map((tag: string, i: number) => (
                  <span className="cta-dark-tag" key={i}><span className="cta-tag-icon">✓</span> {tag}</span>
                ))}
              </div>
              <a href={content.ctaButton?.href || '#'} className="btn-primary btn-large">{content.ctaButton?.text || 'Get Started'}</a>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ===== FOOTER ===== */}
      <LazySection minHeight={200} rootMargin={50}>
        <Footer />
      </LazySection>
    </>
  )
}
