export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";

const siteUrl = "https://digisharks-communications.vercel.app/brand-promotion/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Brand Promotion Agency in India | Digisharks Communications",
  description:
    "Build a powerful brand that customers trust. Strategic brand promotion services combining creativity, market research, digital marketing, and PR.",
  alternates: { canonical: siteUrl },
};

export default function BrandPromotionPage() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">✦ Build a Brand Customers Trust</div>
            <h1 className="fade-up stagger-1">
              Strategic <span className="gradient-text">Brand Promotion</span> That Stands Out
            </h1>
            <p className="fade-up stagger-2">
              In today's competitive market, brand recognition is everything. We help you cut through the noise with brand promotion strategies that combine creativity, market research, digital marketing, and public relations.
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href="/contact-us/" className="btn-primary">Promote Your Brand Today →</a>
              <a href="#process" className="btn-outline">Our Process</a>
            </div>
          </div>
        </section>

        {/* BRAND PROMOTION EXPERTS */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Brand Promotion Experts</div>
            <h2 className="fade-up stagger-1">A <span className="gradient-text">360-Degree Approach</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Great brands are built at the intersection of creativity, data, and storytelling. We bring all three together for every client engagement.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🎨</div>
                <h3>Creativity</h3>
                <p>Award-winning creative work that captures attention and stays in memory.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">📊</div>
                <h3>Market Research</h3>
                <p>Deep audience, competitor, and category research that informs every move.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">💻</div>
                <h3>Digital Marketing</h3>
                <p>Performance media, content, and SEO to amplify your brand across every channel.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📰</div>
                <h3>Public Relations</h3>
                <p>Strategic media outreach that earns third-party validation and trust.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services">
          <div className="container">
            <div className="section-label fade-up">Our Brand Promotion Services</div>
            <h2 className="fade-up stagger-1">Solutions for <span className="gradient-text">Every Brand Goal</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Whether you're launching a new brand or reinvigorating an established one, our services scale to fit.
            </p>

            <div className="detail-block fade-up">
              <h3><span className="d-num">A</span>Digital Brand Promotion</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Amplify your brand across every digital channel that matters.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Social Media Promotion</li>
                    <li>Search Engine Marketing</li>
                    <li>Content Marketing</li>
                    <li>Influencer Marketing</li>
                    <li>Digital PR</li>
                    <li>ORM</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Awareness</li>
                    <li>Engagement</li>
                    <li>Visibility</li>
                    <li>Lead Generation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">B</span>Media Promotion</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Earned media coverage that builds credibility and market positioning.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Press Release Distribution</li>
                    <li>Media Coverage</li>
                    <li>News Publications</li>
                    <li>Interview Opportunities</li>
                    <li>Brand Storytelling</li>
                    <li>PR Campaigns</li>
                  </ul>
                </div>
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Credibility</li>
                    <li>Market Positioning</li>
                    <li>Public Trust</li>
                    <li>Audience Reach</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">C</span>Social Media Brand Building</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Build an engaged brand presence across the platforms your customers live on.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Platforms</h4>
                  <ul className="db-list">
                    <li>Facebook</li>
                    <li>Instagram</li>
                    <li>LinkedIn</li>
                    <li>Twitter (X)</li>
                    <li>YouTube</li>
                  </ul>
                </div>
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Content Creation</li>
                    <li>Campaign Management</li>
                    <li>Audience Engagement</li>
                    <li>Advertising</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">D</span>Influencer Marketing</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Authentic promotion through trusted voices in your industry.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Advantages</h4>
                  <ul className="db-list">
                    <li>Authentic Promotion</li>
                    <li>Increased Reach</li>
                    <li>Higher Engagement</li>
                    <li>Brand Trust</li>
                    <li>Targeted Audience Access</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">E</span>Corporate Branding</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Build a cohesive brand identity system that works across every touchpoint.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Elements</h4>
                  <ul className="db-list">
                    <li>Logo Design</li>
                    <li>Brand Guidelines</li>
                    <li>Marketing Collateral</li>
                    <li>Presentations</li>
                    <li>Brochures</li>
                    <li>Company Profiles</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">F</span>Event & Promotional Marketing</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Memorable in-person experiences that build deeper brand connections.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Corporate Events</li>
                    <li>Product Launches</li>
                    <li>Road Shows</li>
                    <li>Award Ceremonies</li>
                    <li>Brand Activation</li>
                    <li>Exhibitions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY BRAND PROMOTION MATTERS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why It Matters</div>
            <h2 className="fade-up stagger-1">Why <span className="gradient-text">Brand Promotion</span> Matters</h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🌟</div>
                <h3>Increase Brand Awareness</h3>
                <p>Get your brand in front of more of the right people, more often.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">❤️</div>
                <h3>Build Customer Trust</h3>
                <p>Consistent, authentic promotion earns long-term customer loyalty.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📈</div>
                <h3>Improve Market Position</h3>
                <p>Stand out from competitors and own your category narrative.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📥</div>
                <h3>Generate More Leads</h3>
                <p>Strong brands convert more visitors into qualified leads and sales.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🔁</div>
                <h3>Strengthen Customer Loyalty</h3>
                <p>Promoted brands earn repeat business and word-of-mouth referrals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE DIGISHARKS */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Why Choose Digisharks?</div>
            <h2 className="fade-up stagger-1">A <span className="gradient-text">Trusted Partner</span> for Brand Growth</h2>
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
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Industries We Serve</div>
            <h2 className="fade-up stagger-1">Brand Promotion <span className="gradient-text">Across Industries</span></h2>
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
        <section id="process">
          <div className="container">
            <div className="section-label fade-up">Our Process</div>
            <h2 className="fade-up stagger-1">Our <span className="gradient-text">Brand Promotion Process</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              A proven five-step framework for building, executing, and optimizing brand promotion campaigns that deliver.
            </p>
            <div className="process-grid">
              <div className="process-step fade-up stagger-1">
                <div className="step-num">1</div>
                <h4>Brand Analysis</h4>
                <p>Deep research into your brand, audience, competitors, and market positioning.</p>
              </div>
              <div className="process-step fade-up stagger-2">
                <div className="step-num">2</div>
                <h4>Strategy Development</h4>
                <p>Custom strategy built around your goals, audience, and budget.</p>
              </div>
              <div className="process-step fade-up stagger-3">
                <div className="step-num">3</div>
                <h4>Campaign Execution</h4>
                <p>Creative production, media buying, and campaign launch across channels.</p>
              </div>
              <div className="process-step fade-up stagger-4">
                <div className="step-num">4</div>
                <h4>Performance Monitoring</h4>
                <p>Real-time tracking of every metric that matters to your goals.</p>
              </div>
              <div className="process-step fade-up stagger-5">
                <div className="step-num">5</div>
                <h4>Optimization</h4>
                <p>Continuous testing and refinement to maximize return on investment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <h2>Get Your <span className="gradient-text">Free Brand Promotion</span> Consultation</h2>
            <p>
              Book a complimentary consultation with our brand promotion experts. We'll analyze your brand, identify growth opportunities, and recommend a custom strategy — at zero cost.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href="/contact-us/" className="btn-primary">Get Free Brand Promotion Consultation →</a>
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
