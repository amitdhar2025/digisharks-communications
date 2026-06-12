export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import FloatingContact from "../../../components/FloatingContact";

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
              India's Leading <span className="gradient-text">Digital Marketing Agency</span>
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
        <section>
          <div className="container">
            <div className="section-label fade-up">Digital Marketing Experts</div>
            <h2 className="fade-up stagger-1">Built on Three <span className="gradient-text">Core Pillars</span></h2>
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
        <section id="services">
          <div className="container">
            <div className="section-label fade-up">Our Digital Marketing Services</div>
            <h2 className="fade-up stagger-1">End-to-End <span className="gradient-text">Performance Marketing</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              From search to social, content to conversion — explore the full suite of services that power your digital growth.
            </p>

            <div className="detail-block fade-up">
              <h3><span className="d-num">A</span>SEO (Search Engine Optimization)</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Dominate search rankings with a full-spectrum SEO strategy built for the Indian market and beyond.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Keyword Research</li>
                    <li>On-Page Optimization</li>
                    <li>Technical SEO</li>
                    <li>Link Building</li>
                    <li>Content Optimization</li>
                    <li>Performance Monitoring</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Higher Rankings</li>
                    <li>Organic Traffic</li>
                    <li>User Experience</li>
                    <li>Brand Visibility</li>
                    <li>Long-Term Growth</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">B</span>Google Ads</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Drive immediate, measurable results with pay-per-click campaigns optimized for maximum ROI.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Search Ads</li>
                    <li>Display Ads</li>
                    <li>Shopping Ads</li>
                    <li>YouTube Ads</li>
                    <li>Remarketing</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Qualified Leads</li>
                    <li>Website Traffic</li>
                    <li>Conversion Rates</li>
                    <li>Faster Results</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">C</span>Website Design & Development</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Build a powerful digital storefront that turns visitors into customers.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Custom Design</li>
                    <li>Responsive & Mobile</li>
                    <li>UI/UX Design</li>
                    <li>Landing Pages</li>
                    <li>Corporate Websites</li>
                    <li>E-commerce</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>User Experience</li>
                    <li>Performance</li>
                    <li>Brand Representation</li>
                    <li>Lead Generation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">D</span>Link Building</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Earn high-quality backlinks that power your search engine authority and visibility.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>High-Authority Backlinks</li>
                    <li>Guest Posting</li>
                    <li>PR Mentions</li>
                    <li>Citation Building</li>
                    <li>Directory Listings</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Domain Authority</li>
                    <li>Search Rankings</li>
                    <li>Organic Visibility</li>
                    <li>Brand Credibility</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">E</span>Hyperlocal Social Media Marketing</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Reach customers in your neighborhood, city, or region with hyper-targeted social campaigns.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Strategies</h4>
                  <ul className="db-list">
                    <li>Location-Based Campaigns</li>
                    <li>Community Engagement</li>
                    <li>Local Promotions</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Local Reach</li>
                    <li>Engagement</li>
                    <li>Awareness</li>
                    <li>Conversions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">F</span>Graphic Design Services</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Anything to everything — graphic design that makes your brand stand out with the right concept and execution.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Logo Design</li>
                    <li>Social Media Creatives</li>
                    <li>Brand Identity</li>
                    <li>Marketing Materials</li>
                    <li>Infographics</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Professional Image</li>
                    <li>Engagement</li>
                    <li>Visual Identity</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">G</span>Content Creation</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Compelling content that attracts, engages, and converts your target audience.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Content Types</h4>
                  <ul className="db-list">
                    <li>Website Content</li>
                    <li>Blog Articles</li>
                    <li>Social Media Content</li>
                    <li>Marketing Copy</li>
                    <li>Video Scripts</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Engagement</li>
                    <li>Brand Authority</li>
                    <li>SEO</li>
                    <li>Lead Generation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">H</span>Local SEO</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Capture high-intent local customers searching for your products and services nearby.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Google Business Profile</li>
                    <li>Local Citations</li>
                    <li>Review Management</li>
                    <li>Location Keywords</li>
                    <li>Local Link Building</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Local Visibility</li>
                    <li>Customer Inquiries</li>
                    <li>Local Rankings</li>
                    <li>Reputation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY DIGISHARKS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why Choose Digisharks?</div>
            <h2 className="fade-up stagger-1">Strategy Backed by <span className="gradient-text">Demographic Intelligence</span></h2>
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
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <h2>Ready for <span className="gradient-text">Instant Growth?</span></h2>
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

      <FloatingContact />
    </>
  );
}
