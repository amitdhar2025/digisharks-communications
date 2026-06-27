export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";

const siteUrl = "https://digisharks-communications.vercel.app/digital-marketing-agency/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Digital Marketing Agency in India | SEO, Google Ads & PPC | Digisharks",
  description:
    "Get instant growth results for your business. As a leading digital marketing agency, we deliver SEO, Google Ads, web design, content marketing, and more.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    type: "website",
    title: "Digital Marketing Agency | Digisharks Communications",
    description: "SEO, Google Ads, content marketing, and more for measurable ROI.",
  },
};

export default function DigitalMarketingPage() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">✦ Get Instant Growth Results for Your Business</div>
            <h1 className="fade-up stagger-1">
              India's Leading <span className="orange-text">Digital Marketing Agency</span>
            </h1>
            <p className="fade-up stagger-2">
              We are a leading digital marketing agency helping brands grow through data-driven strategies, performance media, and high-quality content. Our campaigns are designed to deliver measurable ROI and long-term business outcomes.
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href="/contact-us/" className="btn-primary">Start Now →</a>
              <a href="#services" className="btn-outline">Explore Services</a>
            </div>
          </div>
        </section>

        {/* THREE PILLARS */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">Digital Marketing Experts</div>
            <h2 className="fade-up stagger-1">Built on Three <span className="orange-text">Core Pillars</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Every campaign we run is designed around the three pillars that drive real digital growth.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🎯</div>
                <h3>Focused Target Audience</h3>
                <p>Precision audience research and targeting ensures your message reaches the people most likely to convert.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">💰</div>
                <h3>Affordable Marketing Budget</h3>
                <p>Smart allocation of marketing spend with full transparency and continuous optimization for maximum value.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📈</div>
                <h3>High ROI</h3>
                <p>Performance-driven strategies that turn every rupee spent into measurable, trackable business growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section-bg-soft">
          <div className="container">
            <div className="section-label fade-up">Our Digital Marketing Services</div>
            <h2 className="fade-up stagger-1">End-to-End <span className="orange-text">Performance Marketing</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              From search to social, content to conversion — explore the full suite of services that power your digital growth.
            </p>

            <div className="dm-cap-grid">
              {/* CARD 1 — SEO */}
              <div className="dm-cap-card fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">🔍</div>
                <h3>SEO</h3>
                <p className="dm-cap-desc">Dominate search rankings with a full-spectrum SEO strategy built for the Indian market and beyond.</p>
                <ul className="dm-cap-features">
                  <li>Keyword Research</li>
                  <li>On-Page Optimization</li>
                  <li>Technical SEO</li>
                  <li>Link Building</li>
                  <li>Content Optimization</li>
                  <li>Performance Monitoring</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Higher Rankings</span>
                  <span>Organic Traffic</span>
                  <span>Brand Visibility</span>
                  <span>Long-Term Growth</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 2 — Google Ads */}
              <div className="dm-cap-card fade-up stagger-2" style={{ "--card-accent": "#3B82F6", "--card-accent-bg": "rgba(59,130,246,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">📊</div>
                <h3>Google Ads</h3>
                <p className="dm-cap-desc">Drive immediate, measurable results with pay-per-click campaigns optimized for maximum ROI.</p>
                <ul className="dm-cap-features">
                  <li>Search Ads</li>
                  <li>Display Ads</li>
                  <li>Shopping Ads</li>
                  <li>YouTube Ads</li>
                  <li>Remarketing</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Qualified Leads</span>
                  <span>Website Traffic</span>
                  <span>Conversion Rates</span>
                  <span>Faster Results</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 3 — Web Design */}
              <div className="dm-cap-card fade-up stagger-3" style={{ "--card-accent": "#8B5CF6", "--card-accent-bg": "rgba(139,92,246,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">🎨</div>
                <h3>Website Design &amp; Development</h3>
                <p className="dm-cap-desc">Build a powerful digital storefront that turns visitors into customers with custom design and UX.</p>
                <ul className="dm-cap-features">
                  <li>Custom Design</li>
                  <li>Responsive &amp; Mobile</li>
                  <li>UI/UX Design</li>
                  <li>Landing Pages</li>
                  <li>Corporate Websites</li>
                  <li>E-commerce</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>User Experience</span>
                  <span>Performance</span>
                  <span>Brand Representation</span>
                  <span>Lead Generation</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 4 — Link Building */}
              <div className="dm-cap-card fade-up stagger-4" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">🔗</div>
                <h3>Link Building</h3>
                <p className="dm-cap-desc">Earn high-quality backlinks that power your search engine authority, domain rank, and visibility.</p>
                <ul className="dm-cap-features">
                  <li>High-Authority Backlinks</li>
                  <li>Guest Posting</li>
                  <li>PR Mentions</li>
                  <li>Citation Building</li>
                  <li>Directory Listings</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Domain Authority</span>
                  <span>Search Rankings</span>
                  <span>Organic Visibility</span>
                  <span>Brand Credibility</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 5 — Hyperlocal Social */}
              <div className="dm-cap-card fade-up stagger-1" style={{ "--card-accent": "#EC4899", "--card-accent-bg": "rgba(236,72,153,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">📍</div>
                <h3>Hyperlocal Social Media</h3>
                <p className="dm-cap-desc">Reach customers in your neighborhood, city, or region with hyper-targeted social campaigns.</p>
                <ul className="dm-cap-features">
                  <li>Location-Based Campaigns</li>
                  <li>Community Engagement</li>
                  <li>Local Promotions</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Local Reach</span>
                  <span>Engagement</span>
                  <span>Awareness</span>
                  <span>Conversions</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 6 — Graphic Design */}
              <div className="dm-cap-card fade-up stagger-2" style={{ "--card-accent": "#F59E0B", "--card-accent-bg": "rgba(245,158,11,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">✏️</div>
                <h3>Graphic Design</h3>
                <p className="dm-cap-desc">Anything to everything — graphic design that makes your brand stand out with the right concept and execution.</p>
                <ul className="dm-cap-features">
                  <li>Logo Design</li>
                  <li>Social Media Creatives</li>
                  <li>Brand Identity</li>
                  <li>Marketing Materials</li>
                  <li>Infographics</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Professional Image</span>
                  <span>Engagement</span>
                  <span>Visual Identity</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 7 — Content Creation */}
              <div className="dm-cap-card fade-up stagger-3" style={{ "--card-accent": "#06B6D4", "--card-accent-bg": "rgba(6,182,212,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">📝</div>
                <h3>Content Creation</h3>
                <p className="dm-cap-desc">Compelling content that attracts, engages, and converts your target audience across every channel.</p>
                <ul className="dm-cap-features">
                  <li>Website Content</li>
                  <li>Blog Articles</li>
                  <li>Social Media Content</li>
                  <li>Marketing Copy</li>
                  <li>Video Scripts</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Engagement</span>
                  <span>Brand Authority</span>
                  <span>SEO</span>
                  <span>Lead Generation</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 8 — Local SEO */}
              <div className="dm-cap-card fade-up stagger-4" style={{ "--card-accent": "#6366F1", "--card-accent-bg": "rgba(99,102,241,0.08)" } as React.CSSProperties}>
                <div className="dm-cap-icon">🏪</div>
                <h3>Local SEO</h3>
                <p className="dm-cap-desc">Capture high-intent local customers searching for your products and services nearby.</p>
                <ul className="dm-cap-features">
                  <li>Google Business Profile</li>
                  <li>Local Citations</li>
                  <li>Review Management</li>
                  <li>Location Keywords</li>
                  <li>Local Link Building</li>
                </ul>
                <div className="dm-cap-tags">
                  <span>Local Visibility</span>
                  <span>Customer Inquiries</span>
                  <span>Local Rankings</span>
                  <span>Reputation</span>
                </div>
                <div className="dm-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY DIGISHARKS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why Choose Digisharks?</div>
            <h2 className="fade-up stagger-1">Strategy Backed by <span className="orange-text">Demographic Intelligence</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Our demographic analysis approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. We map your audience by age, location, gender, job title, income, interests, and behaviors — so every campaign hits the right target.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🔍</div>
                <h3>Audience Research</h3>
                <p>Deep customer insights and psychographic analysis to inform every strategy decision.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">📊</div>
                <h3>Data-Driven Decisions</h3>
                <p>Real-time analytics and reporting to keep your campaigns on the path to growth.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">💡</div>
                <h3>Creative Excellence</h3>
                <p>Award-winning creative work that captures attention and drives action.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">⚙️</div>
                <h3>Technical Expertise</h3>
                <p>Deep technical know-how across SEO, ads, analytics, and marketing automation.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🤝</div>
                <h3>Dedicated Support</h3>
                <p>A team that treats your brand like their own, with personal attention and care.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📈</div>
                <h3>Transparent Reporting</h3>
                <p>Clear, regular reports that show exactly how your campaigns are performing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta section-bg-white">
          <div className="cta-box fade-up container">
            <h2>Ready for <span className="orange-text">Instant Growth?</span></h2>
            <p>
              Let's build a digital marketing strategy that compounds your growth month over month. From SEO to Google Ads, content to conversion — we handle the heavy lifting so you can focus on running your business.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href="/contact-us/" className="btn-primary">Start Now →</a>
              <a href="/services-top-pr-digital-marketing/" className="btn-outline">View Pricing</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>

    </>
  );
}
