export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import FloatingContact from "../../../components/FloatingContact";

const siteUrl = "https://digisharks-communications.vercel.app/web-development/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Web Development Company in India | Digisharks Communications",
  description:
    "Build a powerful digital presence for your business with modern, responsive, conversion-focused website development. Business websites, e-commerce, WordPress, and more.",
  alternates: { canonical: siteUrl },
};

export default function WebDevelopmentPage() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">✦ Web Development Company in India</div>
            <h1 className="fade-up stagger-1">
              Build a Powerful <span className="gradient-text">Digital Presence</span> for Your Business
            </h1>
            <p className="fade-up stagger-2">
              We design and develop modern, responsive, conversion-focused websites that look great, load fast, and turn visitors into customers. From business sites to complex e-commerce platforms — we build for performance.
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href="/contact-us/" className="btn-primary">Get Started Today →</a>
              <a href="#services" className="btn-outline">Explore Services</a>
            </div>
          </div>
        </section>

        {/* PROFESSIONAL COMPANY */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Professional Web Development</div>
            <h2 className="fade-up stagger-1">Built Right. <span className="gradient-text">From Day One.</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Every site we build is engineered around the qualities that actually move the needle.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">⚡</div>
                <h3>Fast Loading</h3>
                <p>Optimized for speed so your visitors stay engaged and Google rewards you with higher rankings.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">📱</div>
                <h3>Mobile Responsive</h3>
                <p>Pixel-perfect experiences across every device, screen size, and platform.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🔍</div>
                <h3>SEO Friendly</h3>
                <p>Clean code, semantic markup, and best practices built in from the start.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🔒</div>
                <h3>Secure</h3>
                <p>Hardened against common threats with regular updates and security monitoring.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">😊</div>
                <h3>User-Friendly</h3>
                <p>Intuitive navigation and clear calls-to-action that guide visitors to convert.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🎯</div>
                <h3>Conversion Focused</h3>
                <p>Every element is designed to move visitors closer to becoming customers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services">
          <div className="container">
            <div className="section-label fade-up">Our Web Development Services</div>
            <h2 className="fade-up stagger-1">Solutions for <span className="gradient-text">Every Stage of Growth</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              From your first business site to a full e-commerce platform, we have the team and technology to build it right.
            </p>

            <div className="detail-block fade-up">
              <h3><span className="d-num">A</span>Business Website Development</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                A professional online presence that showcases your services and converts visitors into leads.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Features</h4>
                  <ul className="db-list">
                    <li>Responsive Design</li>
                    <li>Lead Forms</li>
                    <li>Contact Integration</li>
                    <li>Service Showcase</li>
                    <li>Blog Management</li>
                    <li>SEO Optimization</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">B</span>E-Commerce Website Development</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Sell online with a powerful e-commerce platform that handles products, payments, and customers at scale.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Features</h4>
                  <ul className="db-list">
                    <li>Product Management</li>
                    <li>Payment Gateway</li>
                    <li>Shopping Cart</li>
                    <li>Order Tracking</li>
                    <li>Customer Accounts</li>
                    <li>Inventory Management</li>
                  </ul>
                </div>
                <div>
                  <h4>Platforms</h4>
                  <ul className="db-list">
                    <li>WooCommerce</li>
                    <li>Shopify</li>
                    <li>Custom Solutions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">C</span>WordPress Development</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Custom WordPress sites that are easy to manage, fast, secure, and built for growth.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Services</h4>
                  <ul className="db-list">
                    <li>Custom Theme</li>
                    <li>Plugin Integration</li>
                    <li>Speed Optimization</li>
                    <li>Security Hardening</li>
                    <li>Migration</li>
                    <li>Maintenance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">D</span>Landing Page Development</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                High-converting landing pages designed to support specific campaigns and offers.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Benefits</h4>
                  <ul className="db-list">
                    <li>Higher Conversions</li>
                    <li>Better UX</li>
                    <li>Lead Capture</li>
                    <li>Campaign Support</li>
                    <li>Mobile-Friendly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">E</span>Website Redesign Services</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Transform your existing site into a modern, conversion-focused experience.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Improvements</h4>
                  <ul className="db-list">
                    <li>Modern UI/UX</li>
                    <li>Better Performance</li>
                    <li>Mobile Optimization</li>
                    <li>SEO Enhancements</li>
                    <li>Navigation</li>
                    <li>Speed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="detail-block fade-up">
              <h3><span className="d-num">F</span>Custom Web Application Development</h3>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                Powerful custom web applications that solve complex business problems and scale with your growth.
              </p>
              <div className="db-cols">
                <div>
                  <h4>Solutions</h4>
                  <ul className="db-list">
                    <li>CRM Systems</li>
                    <li>Customer Portals</li>
                    <li>Dashboards</li>
                    <li>Booking Systems</li>
                    <li>Membership Platforms</li>
                    <li>Enterprise Applications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why Choose Digisharks?</div>
            <h2 className="fade-up stagger-1">Web Development That <span className="gradient-text">Drives Business</span></h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">👨‍💻</div>
                <h3>Experienced Team</h3>
                <p>Developers, designers, and strategists with years of experience building sites that work.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🔍</div>
                <h3>SEO-Friendly Development</h3>
                <p>Every site is built with technical SEO best practices baked in from day one.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📱</div>
                <h3>Mobile Responsive</h3>
                <p>Every site is mobile-first, ensuring perfect experiences on phones, tablets, and desktops.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🔒</div>
                <h3>Secure Development</h3>
                <p>Best-in-class security practices to keep your site and your customers safe.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🤝</div>
                <h3>Ongoing Support</h3>
                <p>Maintenance, updates, and support plans to keep your site running smoothly for years.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">⏱️</div>
                <h3>On-Time Delivery</h3>
                <p>Clear timelines, milestone-based delivery, and zero surprises along the way.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Why It Matters</div>
            <h2 className="fade-up stagger-1">Benefits of <span className="gradient-text">Professional Web Development</span></h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🌐</div>
                <h3>24/7 Online Presence</h3>
                <p>Your website works for you around the clock, even when you sleep.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🎯</div>
                <h3>Lead Generation</h3>
                <p>Capture qualified leads through forms, chatbots, and conversion-optimized flows.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">💎</div>
                <h3>Brand Credibility</h3>
                <p>A professional website builds instant trust with new visitors and customers.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📈</div>
                <h3>Higher Search Rankings</h3>
                <p>SEO-optimized sites rank better and attract more organic traffic.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">⚙️</div>
                <h3>Scalable Foundation</h3>
                <p>Built to grow with you as your business expands and evolves.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📊</div>
                <h3>Data & Insights</h3>
                <p>Track every visitor, click, and conversion to keep improving.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Industries We Serve</div>
            <h2 className="fade-up stagger-1">Trusted Across <span className="gradient-text">Every Industry</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              We've delivered digital solutions for organizations across a wide range of industries.
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
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <h2>Ready to Build <span className="gradient-text">Something Great?</span></h2>
            <p>
              Tell us about your project and we'll get back within 24 hours with a clear plan, transparent pricing, and a timeline you can count on.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href="/contact-us/" className="btn-primary">Request Free Consultation →</a>
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
