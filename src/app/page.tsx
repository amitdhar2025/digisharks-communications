export const dynamic = "force-dynamic";
import MediaCarousel from "@/components/MediaCarousel";
import PortfolioSection from "@/components/PortfolioSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import SeoAuditWidget from "@/components/SeoAuditWidget";
import Footer from "@/components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'
import SiteSettings from '@/models/SiteSettings'
import { connectCMSDb } from '@/lib/db-cms'
import "./home.css";
import "./multi-color.css";
import Image from "next/image";

// ── Hardcoded default content (used when no CMS data exists) ──────────
const DEFAULT_CONTENT = {
  // Hero
  heroEyebrow: 'AI-Powered Digital Growth',
  heroHeading: '<span class="orange-text">AI-Driven</span><br />for Your Digital Brand',
  heroDescription: 'Digisharks Communications is a next-gen digital PR, marketing, and AI-powered web development agency. We fuse data, design, and AI to help brands achieve measurable growth, top-tier media presence, and 10x ROI across 50+ publications.',
  heroPrimaryCta: { text: 'Get Free Consultation →', href: '#' },
  heroSecondaryCta: { text: 'Our Services', href: '#' },
  heroStats: [
    { number: '500+', suffix: '', label: 'Projects Delivered' },
    { number: '10+', suffix: '', label: 'Years of Experience' },
    { number: '50+', suffix: '', label: 'Media Partners' },
    { number: '98%', suffix: '', label: 'Client Satisfaction' },
  ],
  // Hero
  heroVideo: '',
  // Brand Logos
  brandLogosHeading: 'Check Out <span class="orange-text-num">Our Work</span>',
  brandLogosImages: [],
  mediaHouseItems: [],
  // AI Growth Metrics
  metricsLabel: 'AI-Powered Insights',
  metricsHeading: 'Real-Time <span class="orange-text">AI Growth Metrics</span>',
  metricsDescription: 'We track everything—visibility, engagement, conversions, AI-driven insights—and show you the numbers that matter in real time.',
  metrics: [
    { icon: '🤖', title: 'AI-Optimised ROI', desc: 'Our AI engine optimises campaigns in real time to deliver ten times the return on your marketing spend.', number: '10x', suffix: '' },
    { icon: '📰', title: 'Brand Stories Published', desc: 'Media features across top-tier publications including Forbes, Inc42, YourStory, and 50+ outlets.', number: '500+', suffix: '' },
    { icon: '🚀', title: 'Average Traffic Growth', desc: 'Websites we manage see a 320% average traffic uplift within the first 6 months of partnership.', number: '320%', suffix: '' },
    { icon: '💎', title: 'Client Retention Rate', desc: 'Our clients stick with us because we consistently deliver measurable, compounding growth.', number: '98%', suffix: '' },
  ],
  // Awards
  awardsLabel: 'Awards and Recognition',
  awardsHeading: 'Awards That Recognise <span class="orange-text">Digital Excellence</span>',
  awardsDescription: 'Our work has been recognised by the worlds most respected platforms — a testament to the results we deliver for our clients.',
  awardsItems: [],
  // Services
  servicesLabel: 'Our Services',
  servicesHeading: 'What We Do <span class="orange-text">Best</span>',
  servicesSubtitle: 'From AI-powered digital PR to full-stack marketing, we deliver end-to-end brand growth solutions that combine creativity, technology, and data-driven insights.',
  services: [
    { icon: '🤖', title: 'AI-Driven Digital PR', desc: 'Strategic media coverage across 50+ top publications in India.' },
    { icon: '📺', title: 'Media Management', desc: 'Brand visibility campaigns with high-impact media collaborations.' },
    { icon: '📈', title: 'AI Digital Marketing', desc: 'Full-stack campaigns from SEO to PPC with measurable ROI.' },
    { icon: '🎯', title: 'Smart Lead Generation', desc: 'High-intent pipelines powered by AI performance marketing.' },
    { icon: '✍️', title: 'AI Content Strategy', desc: 'SEO-optimized blogs, scripts, and brand narratives that convert.' },
    { icon: '🏆', title: 'Political Campaign Mgmt', desc: 'Strategic voter outreach with measurable on-ground impact.' },
  ],
  // Why Choose Us
  whyChooseLabel: 'Why Choose Us',
  whyChooseHeading: 'We Deliver <span class="orange-text">Measurable Results</span>',
  whyChooseSubtitle: '10+ years of experience, 500+ successful campaigns, and a team dedicated to your brand growth.',
  whyChooseItems: [
    '100% Transparency in Reporting and Pricing',
    'AI-Powered Campaign Optimization',
    'Dedicated Account Manager for Every Client',
    '50+ Media House Partnerships Across India',
    'Proven 10x ROI Track Record',
    'Free AI Strategy Audit to Get You Started',
  ],
  whyChooseIcons: [
    { icon: '🤖', title: 'AI Strategy' },
    { icon: '📰', title: 'Digital PR' },
    { icon: '📈', title: 'SEO and PPC' },
    { icon: '📱', title: 'Social Media' },
    { icon: '💻', title: 'Web Dev' },
    { icon: '🏆', title: 'Branding' },
  ],
  // Testimonials
  testimonialsLabel: 'Client Testimonials',
  testimonialsHeading: 'What Our <span class="orange-text">Clients Say</span>',
  testimonialsSubtitle: 'Real reviews from real clients. We measure our success by the growth and satisfaction of the brands we partner with.',
  // CTA
  ctaBadge: '🚀 Let us Build Something Great',
  ctaHeading: 'Start Your <span class="orange-text">AI Growth</span> Journey Today',
  ctaDescription: 'Your customers are online right now. Let us help you reach them with the right message, on the right platform, at the right moment. Do not let competitors take what is yours.',
  ctaFeatures: ['Free Growth Audit', 'AI-Powered Insights', 'Dedicated Manager', 'Transparent Reporting'],
  ctaButton: { text: 'Get Free Consultation →', href: '#' },
  // Footer
  footerTagline: 'Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.',
  footerPhone: '+91 96273 32332',
  footerEmail: 'marketing@digisharkscommunications.com',
  footerAddress: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',

  // Legal Links
  privacyPolicyUrl: '#',
  termsUrl: '#',
  refundPolicyUrl: '#',
}

export default async function Home() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('home')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }

  // Fetch site settings for legal link URLs
  try {
    await connectCMSDb()
    const settings = await SiteSettings.findOne({ key: 'global' }).lean()
    if (settings) {
      content.privacyPolicyUrl = settings.privacyPolicyUrl || '#'
      content.termsUrl = settings.termsUrl || '#'
      content.refundPolicyUrl = settings.refundPolicyUrl || '#'
    }
  } catch (err) {
    console.error('[page.tsx] Failed to fetch site settings:', err)
  }
  return (
    <>
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

        {/* ===== FULL-WIDTH VIDEO ===== */}
        <div style={{position:"relative",left:"50%",right:"50%",marginLeft:"-50vw",marginRight:"-50vw",width:"100vw",lineHeight:0,overflow:"hidden"}}>
          <video autoPlay muted loop playsInline disablePictureInPicture style={{width:"100vw",display:"block",pointerEvents:"none"}}>
            <source src={content.heroVideo || '/Video.mp4'} type="video/mp4" />
          </video>
        </div>

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
                              <img src={img.image} alt={img.alt || img.caption || ''} width="160" height="94" className="brand-carousel-img" />
                            </a>
                          ) : (
                            <img src={img.image} alt={img.alt || img.caption || ''} width="160" height="94" className="brand-carousel-img" />
                          )}
                        </div>
                      ))
                    }
                    // Fallback: hardcoded 1-8 images
                    return [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8].map((n, i) => (
                      <div className="brand-carousel-item" key={n + "-" + i}>
                        <img src={"/one card (" + n + ").webp"} alt={"Project " + n} width="160" height="94" className="brand-carousel-img" />
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

        {/* ===== AWARDS ===== */}
        <section className="awards-section-light">
          <div className="container">
            <div className="metrics-header fade-up">
              <div className="section-label-orange centered-label">
                <span className="label-dot"></span>
                {content.awardsLabel}
              </div>
              <h2 style={{textAlign:"center",marginBottom:"0.75rem"}} dangerouslySetInnerHTML={{ __html: content.awardsHeading }} />
              <p style={{textAlign:"center",maxWidth:"700px",margin:"0 auto",fontSize:"1.05rem",lineHeight:1.75,color:"var(--color-body)"}}>{content.awardsDescription}</p>
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
                          src={award.image || '/google partner.webp'}
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
                  { src: '/google partner.webp', alt: 'Google Partner', title: 'Google Partner', sub: 'Premier 2026' },
                  { src: '/meta partner.webp', alt: 'Meta Business Partner', title: 'Meta Business Partner', sub: 'Certified 2025' },
                  { src: '/clutch award.webp', alt: 'Clutch Award', title: 'Clutch Award', sub: 'Top PPC Company 2026' },
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

        {/* ===== SERVICES ===== */}
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
                  {(content.services || []).map((s,i)=>(
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
                      <span style={{height:"45%"}}></span><span style={{height:"65%"}}></span><span style={{height:"50%"}}></span><span style={{height:"80%"}}></span><span style={{height:"60%"}}></span><span style={{height:"90%"}}></span><span style={{height:"75%"}}></span>
                    </div>
                    <div className="dash-footer">AI + PR + Digital Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ===== WHY CHOOSE US ===== */}
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
                  {(content.whyChooseItems || []).map((item,i)=>(
                    <li key={i}><span className="check-icon-orange">✓</span><span>{item}</span></li>
                  ))}
                </ul>
                <a href="#" className="btn-primary">Work With Us →</a>
              </div>
              <div className="why-choose-right fade-up stagger-1">
                <div className="why-icons-grid">
                  {(content.whyChooseIcons || []).map((item,i)=>(
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

        {/* ===== TESTIMONIALS ===== */}
        <section className="testimonials-section">
          <div className="container">
            <div className="section-label-orange centered-label fade-up">
              <span className="label-dot"></span>
              {content.testimonialsLabel}
            </div>
            <h2 className="fade-up stagger-1" style={{textAlign:"center"}} dangerouslySetInnerHTML={{ __html: content.testimonialsHeading }} />
            <p className="testi-sub fade-up stagger-2">{content.testimonialsSubtitle}</p>
            <div className="testi-grid desktop-only fade-up stagger-3">
              {[
                {quote:"They have excellent media coverage capabilities and provide great exposure for brands. Truly one of the best in the business. Our visibility grew 4x in just 3 months.",initials:"YM",name:"Yassmin Mistry",role:"Founder, Verified Client",bg:"#FF5B2E"},
                {quote:"It was great working with Digisharks Communications. They provided valuable opportunities and helped enhance my knowledge. Highly recommended PR and Digital Marketing agency.",initials:"UK",name:"Uday Kumar",role:"CEO, Verified Client",bg:"#0F1628"},
                {quote:"Digisharks Communications is one of the best PR and digital marketing agencies in Delhi NCR. Their team is highly professional, experienced, and supportive throughout.",initials:"PP",name:"Preeti Packer",role:"Director, Verified Client",bg:"#6366F1"}
              ].map((t,i)=>(
                <div className="testi-card-light" key={i}>
                  <div className="testi-stars">★★★★★</div>
                  <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="testi-author">
                    <div className="testi-avatar" style={{background:t.bg}}>{t.initials}</div>
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

        {/* ===== MEDIA CAROUSEL + PORTFOLIO ===== */}
        <MediaCarousel items={content.mediaHouseItems || []} />
        <PortfolioSection />

        {/* ===== FINAL CTA ===== */}
        <section className="cta-dark-section">
          <div className="container">
            <div className="cta-dark-box fade-up">
              <div className="cta-dark-badge">{content.ctaBadge}</div>
              <h2 dangerouslySetInnerHTML={{ __html: content.ctaHeading }} />
              <p className="cta-dark-text">{content.ctaDescription}</p>
              <div className="cta-dark-tags">
                {(content.ctaFeatures || []).map((tag,i)=>(
                  <span className="cta-dark-tag" key={i}><span className="cta-tag-icon">✓</span> {tag}</span>
                ))}
              </div>
              <a href={content.ctaButton.href || '#'} className="btn-primary btn-large">{content.ctaButton.text}</a>
            </div>
          </div>
        </section>

        {/* ===== FOOTER (dynamic from CMS) ===== */}
        <Footer />

      </div>
      <QuickEditButton slug="home" />
    </>
  );
}
