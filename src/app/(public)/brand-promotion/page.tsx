export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'
import { DEFAULT_CONTENT } from '@/lib/brand-promotion-content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'
const siteUrl = `${SITE_URL}/brand-promotion/`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + '/'),
  title: "Brand Promotion Agency in India | Digisharks Communications",
  description:
    "Build a powerful brand that customers trust. Strategic brand promotion services combining creativity, market research, digital marketing, and PR.",
  alternates: { canonical: siteUrl },
};

export default async function BrandPromotionPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('brand-promotion')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">{content.heroEyebrow}</div>
            <h1 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.heroHeading }} />
            <p className="fade-up stagger-2">{content.heroDescription}</p>
            <div className="hero-ctas fade-up stagger-3">
              <a href={content.heroPrimaryCta.href || '#'} className="btn-primary">{content.heroPrimaryCta.text}</a>
              <a href={content.heroSecondaryCta.href || '#'} className="btn-outline">{content.heroSecondaryCta.text}</a>
            </div>
          </div>
        </section>

        {/* BRAND PROMOTION EXPERTS */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.approachLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.approachHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.approachSubtitle}
            </p>
            <div className="bp-approach-grid">
              {(content.approachCards || []).map((card, i) => (
                <div className={`bp-approach-card fade-up stagger-${(i % 4) + 1}`} key={i} style={{ "--card-accent": i === 0 ? '#FF5B2E' : i === 1 ? '#3B82F6' : i === 2 ? '#EC4899' : '#10B981', "--card-accent-bg": `rgba(${i === 0 ? '255,91,46' : i === 1 ? '59,130,246' : i === 2 ? '236,72,153' : '16,185,129'},0.08)` } as React.CSSProperties}>
                <div className="bp-approach-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p className="bp-approach-desc">{card.desc}</p>
              </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section-bg-soft">
          <div className="container">
            <div className="section-label fade-up">{content.servicesLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.servicesHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.servicesSubtitle}
            </p>

            <div className="bp-cap-grid">
              {/* CARD 1 — Digital Brand Promotion */}
              <div className="bp-cap-card fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="bp-cap-icon">📱</div>
                <h3>Digital Brand Promotion</h3>
                <p className="bp-cap-desc">Amplify your brand across every digital channel that matters.</p>
                <ul className="bp-cap-features">
                  <li>Social Media Promotion</li>
                  <li>Search Engine Marketing</li>
                  <li>Content Marketing</li>
                  <li>Influencer Marketing</li>
                  <li>Digital PR</li>
                  <li>ORM</li>
                </ul>
                <div className="bp-cap-tags">
                  <span>Awareness</span>
                  <span>Engagement</span>
                  <span>Visibility</span>
                  <span>Lead Generation</span>
                </div>
                <div className="bp-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 2 — Media Promotion */}
              <div className="bp-cap-card fade-up stagger-2" style={{ "--card-accent": "#3B82F6", "--card-accent-bg": "rgba(59,130,246,0.08)" } as React.CSSProperties}>
                <div className="bp-cap-icon">📰</div>
                <h3>Media Promotion</h3>
                <p className="bp-cap-desc">Earned media coverage that builds credibility and market positioning.</p>
                <ul className="bp-cap-features">
                  <li>Press Release Distribution</li>
                  <li>Media Coverage</li>
                  <li>News Publications</li>
                  <li>Interview Opportunities</li>
                  <li>Brand Storytelling</li>
                  <li>PR Campaigns</li>
                </ul>
                <div className="bp-cap-tags">
                  <span>Credibility</span>
                  <span>Market Positioning</span>
                  <span>Public Trust</span>
                  <span>Audience Reach</span>
                </div>
                <div className="bp-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 3 — Social Media Brand Building */}
              <div className="bp-cap-card fade-up stagger-3" style={{ "--card-accent": "#EC4899", "--card-accent-bg": "rgba(236,72,153,0.08)" } as React.CSSProperties}>
                <div className="bp-cap-icon">💬</div>
                <h3>Social Media Brand Building</h3>
                <p className="bp-cap-desc">Build an engaged brand presence across the platforms your customers live on.</p>
                <ul className="bp-cap-features">
                  <li>Facebook</li>
                  <li>Instagram</li>
                  <li>LinkedIn</li>
                  <li>Twitter (X)</li>
                  <li>YouTube</li>
                </ul>
                <div className="bp-cap-tags">
                  <span>Content Creation</span>
                  <span>Campaign Management</span>
                  <span>Audience Engagement</span>
                  <span>Advertising</span>
                </div>
                <div className="bp-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 4 — Influencer Marketing */}
              <div className="bp-cap-card fade-up stagger-1" style={{ "--card-accent": "#8B5CF6", "--card-accent-bg": "rgba(139,92,246,0.08)" } as React.CSSProperties}>
                <div className="bp-cap-icon">⭐</div>
                <h3>Influencer Marketing</h3>
                <p className="bp-cap-desc">Authentic promotion through trusted voices in your industry.</p>
                <ul className="bp-cap-features">
                  <li>Authentic Promotion</li>
                  <li>Increased Reach</li>
                  <li>Higher Engagement</li>
                  <li>Brand Trust</li>
                  <li>Targeted Audience Access</li>
                </ul>
                <div className="bp-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 5 — Corporate Branding */}
              <div className="bp-cap-card fade-up stagger-2" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="bp-cap-icon">🏢</div>
                <h3>Corporate Branding</h3>
                <p className="bp-cap-desc">Build a cohesive brand identity system that works across every touchpoint.</p>
                <ul className="bp-cap-features">
                  <li>Logo Design</li>
                  <li>Brand Guidelines</li>
                  <li>Marketing Collateral</li>
                  <li>Presentations</li>
                  <li>Brochures</li>
                  <li>Company Profiles</li>
                </ul>
                <div className="bp-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 6 — Event & Promotional Marketing */}
              <div className="bp-cap-card fade-up stagger-3" style={{ "--card-accent": "#F59E0B", "--card-accent-bg": "rgba(245,158,11,0.08)" } as React.CSSProperties}>
                <div className="bp-cap-icon">🎪</div>
                <h3>Event &amp; Promotional Marketing</h3>
                <p className="bp-cap-desc">Memorable in-person experiences that build deeper brand connections.</p>
                <ul className="bp-cap-features">
                  <li>Corporate Events</li>
                  <li>Product Launches</li>
                  <li>Road Shows</li>
                  <li>Award Ceremonies</li>
                  <li>Brand Activation</li>
                  <li>Exhibitions</li>
                </ul>
                <div className="bp-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY BRAND PROMOTION MATTERS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why It Matters</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.benefitsHeading }} />
            <div className="benefits-grid">
              {(content.benefits || []).map((b, i) => (
                <div className={`benefit-card fade-up stagger-${(i % 3) + 1}`} key={i}>
                  <div className="b-icon">{b.icon}</div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE DIGISHARKS */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">Why Choose Digisharks?</div>
            <h2 className="fade-up stagger-1">A <span className="orange-text">Trusted Partner</span> for Brand Growth</h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🧭</div>
                <h3>Strategic Planning</h3>
                <p>Every campaign starts with research, insights, and a clear strategic roadmap.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🎨</div>
                <h3>Creative Execution</h3>
                <p>Beautiful, on-brand creative that earns attention and engagement.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📡</div>
                <h3>Media Network</h3>
                <p>Direct relationships with journalists, influencers, and platforms across India.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📊</div>
                <h3>Measurable Results</h3>
                <p>Clear KPIs, transparent reporting, and continuous optimization for outcomes.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">⚡</div>
                <h3>Rapid Execution</h3>
                <p>Agile campaign delivery with quick turnaround times and milestone-based progress tracking.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">💡</div>
                <h3>Innovation First</h3>
                <p>Cutting-edge tools, AI-driven insights, and fresh creative approaches for modern brands.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Industries We Serve</div>
            <h2 className="fade-up stagger-1">Brand Promotion <span className="orange-text">Across Industries</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              We've helped brands stand out across a wide range of industries and customer segments.
            </p>
            <div className="industries-grid">
              <div className="industry-tile">Healthcare</div>
              <div className="industry-tile">Education</div>
              <div className="industry-tile">Real Estate</div>
              <div className="industry-tile">E-Commerce</div>
              <div className="industry-tile">Manufacturing</div>
              <div className="industry-tile">Hospitality</div>
              <div className="industry-tile">Finance</div>
              <div className="industry-tile">Startups</div>
              <div className="industry-tile">Corporate</div>
              <div className="industry-tile">FMCG</div>
              <div className="industry-tile">Fashion</div>
              <div className="industry-tile">Entertainment</div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">Our Process</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.processHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.processSubtitle}
            </p>
            <div className="process-grid">
              {(content.processSteps || []).map((step, i) => (
                <div className={`process-step fade-up stagger-${(i % 3) + 1}`} key={i}>
                  <div className="step-num">{step.icon}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta section-bg-white">
          <div className="cta-box fade-up container">
            <h2 dangerouslySetInnerHTML={{ __html: content.ctaHeading }} />
            <p>{content.ctaDescription}</p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href={content.ctaPrimaryCta.href || '#'} className="btn-primary">{content.ctaPrimaryCta.text}</a>
              <a href="/services-top-pr-digital-marketing/" className="btn-outline">View Pricing</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      <QuickEditButton slug="brand-promotion" />
    </>
  );
}
