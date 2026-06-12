export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import FloatingContact from "../../../components/FloatingContact";

const siteUrl = "https://digisharks-communications.vercel.app/social-media/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Social Media Marketing Agency | Digisharks Communications",
  description:
    "Get instant growth results for your business with our Social Media Experts. Strategy, content, ads, and community management for measurable ROI.",
  alternates: { canonical: siteUrl },
};

export default function SocialMediaPage() {
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
              Social Media Marketing <span className="gradient-text">That Scales Brands</span>
            </h1>
            <p className="fade-up stagger-2">
              Our Social Media Experts build engaged communities, scroll-stopping content, and performance-driven campaigns that turn followers into customers — across every platform that matters.
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href="/contact-us/" className="btn-primary">Start Now →</a>
              <a href="#services" className="btn-outline">Explore Services</a>
            </div>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section id="services">
          <div className="container">
            <div className="section-label fade-up">What We Do For Your Business</div>
            <h2 className="fade-up stagger-1">Full-Funnel <span className="gradient-text">Social Media Management</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              From strategy to execution, we handle everything that goes into making your brand win on social media.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🧭</div>
                <h3>Strategy Development</h3>
                <p>Custom social media strategies built around your business goals, audience, and competitive landscape.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🎨</div>
                <h3>Content Creation</h3>
                <p>Scroll-stopping visuals, copy, and video content tailored to each platform's unique style and audience.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📣</div>
                <h3>Campaign Management</h3>
                <p>End-to-end campaign execution with continuous optimization for maximum impact.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">💬</div>
                <h3>Audience Engagement</h3>
                <p>Active community management that builds relationships and earns brand advocates.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">👥</div>
                <h3>Community Management</h3>
                <p>Moderation, response management, and community programming that keeps your audience engaged.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📊</div>
                <h3>Performance Analysis</h3>
                <p>Detailed reporting and analytics to measure what matters and inform next steps.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">⚙️</div>
                <h3>Optimization</h3>
                <p>Continuous A/B testing and creative iteration to improve performance over time.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🎯</div>
                <h3>Lead Generation Campaigns</h3>
                <p>Conversion-focused social campaigns that turn engagement into qualified leads and sales.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🚀</div>
                <h3>Brand Awareness Campaigns</h3>
                <p>Wide-reach campaigns that put your brand in front of the audiences that matter most.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTIONS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Social Media Marketing Solutions</div>
            <h2 className="fade-up stagger-1">Outcomes That <span className="gradient-text">Drive Real Growth</span></h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🏗️</div>
                <h3>Brand Building</h3>
                <p>Establish a recognizable, trusted brand voice across every social platform your audience uses.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🤝</div>
                <h3>Audience Engagement</h3>
                <p>Spark meaningful conversations, replies, and shares that grow your organic reach.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📥</div>
                <h3>Lead Generation</h3>
                <p>Conversion-optimized funnels that turn social engagement into pipeline and revenue.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">⚡</div>
                <h3>Performance Optimization</h3>
                <p>Constantly test, learn, and improve every part of your social funnel.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL ADVERTISING */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Social Advertising Services</div>
            <h2 className="fade-up stagger-1">Paid Social That <span className="gradient-text">Performs</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Strategic paid campaigns across Meta, LinkedIn, YouTube, Twitter (X), and TikTok — with targeting, creative, and budgets tuned to your goals.
            </p>
            <div className="reasons-list">
              <div className="reason-card fade-up stagger-1">
                <div className="b-icon" style={{ margin: "0 auto 0.85rem" }}>👁️</div>
                <h4>Increased Brand Visibility</h4>
                <p>Get discovered by your ideal customers with precision targeting.</p>
              </div>
              <div className="reason-card fade-up stagger-2">
                <div className="b-icon" style={{ margin: "0 auto 0.85rem" }}>🎯</div>
                <h4>Better Audience Targeting</h4>
                <p>Reach the right people based on behavior, interests, and intent.</p>
              </div>
              <div className="reason-card fade-up stagger-3">
                <div className="b-icon" style={{ margin: "0 auto 0.85rem" }}>💬</div>
                <h4>Higher Engagement</h4>
                <p>Compelling ad creative that earns attention and engagement.</p>
              </div>
              <div className="reason-card fade-up stagger-4">
                <div className="b-icon" style={{ margin: "0 auto 0.85rem" }}>📥</div>
                <h4>Improved Lead Generation</h4>
                <p>Optimized landing pages and forms that convert clicks to customers.</p>
              </div>
              <div className="reason-card fade-up stagger-5">
                <div className="b-icon" style={{ margin: "0 auto 0.85rem" }}>📈</div>
                <h4>Faster Growth & Measurable ROI</h4>
                <p>Track every rupee, every click, and every conversion in real time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* GLOBAL INSIGHTS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Global Insights</div>
            <h2 className="fade-up stagger-1">Social Media Marketing <span className="gradient-text">Across the Globe</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Our social media marketing services reach audiences across key global markets — combining cultural insight with platform expertise.
            </p>
            <div className="industries-grid">
              <div className="industry-tile">USA</div>
              <div className="industry-tile">UK</div>
              <div className="industry-tile">Germany</div>
              <div className="industry-tile">France</div>
              <div className="industry-tile">India</div>
              <div className="industry-tile">Australia</div>
              <div className="industry-tile">Canada</div>
              <div className="industry-tile">UAE</div>
              <div className="industry-tile">Singapore</div>
            </div>
          </div>
        </section>

        {/* WHY INVEST */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Why Invest</div>
            <h2 className="fade-up stagger-1">Why Businesses Invest in <span className="gradient-text">Social Media Marketing</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Social media is no longer optional — it's where your customers live, work, and make buying decisions. Every segment of your business benefits from a strong social presence.
            </p>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">👔</div>
                <h3>Business Owners & Entrepreneurs</h3>
                <p>Build brand authority, generate leads, and grow your customer base with content that converts.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🏛️</div>
                <h3>Government & Industry</h3>
                <p>Communicate initiatives, gather public feedback, and shape public discourse across regions.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📊</div>
                <h3>Investors & Analysts</h3>
                <p>Track brand sentiment, market conversation, and competitive positioning in real time.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📣</div>
                <h3>Marketing Professionals</h3>
                <p>Stay ahead of trends, run multi-channel campaigns, and prove ROI with detailed analytics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Benefits of Social Media Marketing</div>
            <h2 className="fade-up stagger-1">Why <span className="gradient-text">Social Media Marketing</span> Works</h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🌟</div>
                <h3>Brand Awareness</h3>
                <p>Put your brand in front of millions of targeted users every day.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">💬</div>
                <h3>Engagement</h3>
                <p>Spark conversations, replies, and shares that grow your organic reach.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🎯</div>
                <h3>Targeting</h3>
                <p>Reach exactly the people who are most likely to buy from you.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🌐</div>
                <h3>Traffic</h3>
                <p>Drive qualified visitors to your website, landing pages, and offers.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">❤️</div>
                <h3>Relationships</h3>
                <p>Build genuine, long-lasting relationships with your customers.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">⭐</div>
                <h3>Reputation</h3>
                <p>Strengthen public perception and earn lasting trust.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">💰</div>
                <h3>Conversions</h3>
                <p>Turn followers and fans into paying customers.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">👥</div>
                <h3>Community Building</h3>
                <p>Cultivate a loyal community that champions your brand.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📈</div>
                <h3>Measurable ROI</h3>
                <p>Every campaign is tracked, measured, and optimized for return.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <h2>Start Your <span className="gradient-text">Growth Journey</span></h2>
            <p>
              Our demographic analysis approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. We map your audience by age, location, gender, job title, income, interests, and behaviors — so every social campaign hits the right people with the right message.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href="/contact-us/" className="btn-primary">Get Free Consultation →</a>
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
