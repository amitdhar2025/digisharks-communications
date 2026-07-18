export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'
import { DEFAULT_CONTENT } from '@/lib/social-media-content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'
const siteUrl = `${SITE_URL}/social-media/`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + '/'),
  title: "Social Media Marketing Agency | Digisharks Communications",
  description:
    "Get instant growth results for your business with our Social Media Experts. Strategy, content, ads, and community management for measurable ROI.",
  alternates: { canonical: siteUrl },
};

export default async function SocialMediaPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('social-media')
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
            <p className="fade-up stagger-2">
              {content.heroDescription}
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href={content.heroPrimaryCta.href || '#'} className="btn-primary">{content.heroPrimaryCta.text}</a>
              <a href={content.heroSecondaryCta.href || '#'} className="btn-outline">{content.heroSecondaryCta.text}</a>
            </div>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section id="services" className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.servicesLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.servicesHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.servicesSubtitle}
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
            <div className="section-label fade-up">{content.solutionsLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.solutionsHeading }} />
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
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🎯</div>
                <h3>Influencer Marketing</h3>
                <p>Collaborate with key voices to extend your brand&apos;s reach and build authentic connections.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📱</div>
                <h3>Social Commerce</h3>
                <p>Enable seamless shopping experiences directly within social media platforms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL ADVERTISING */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.advertisingLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.advertisingHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.advertisingSubtitle}
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
              <div className="reason-card fade-up stagger-1">
                <div className="b-icon" style={{ margin: "0 auto 0.85rem" }}>🤖</div>
                <h4>AI-Powered Optimization</h4>
                <p>Machine learning algorithms that continuously improve your ad performance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* GLOBAL INSIGHTS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">{content.globalLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.globalHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.globalSubtitle}
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
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.investLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.investHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.investSubtitle}
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
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🎓</div>
                <h3>Startups & Scaleups</h3>
                <p>Build traction and brand awareness with cost-effective social strategies designed for fast growth.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🏪</div>
                <h3>Local Businesses</h3>
                <p>Dominate your local market with hyper-targeted social campaigns and community engagement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">{content.benefitsLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.benefitsHeading }} />
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
        <section className="final-cta section-bg-white">
          <div className="cta-box fade-up container">
            <h2 dangerouslySetInnerHTML={{ __html: content.ctaHeading }} />
            <p>{content.ctaDescription}</p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href={content.ctaPrimaryCta.href || '#'} className="btn-primary">{content.ctaPrimaryCta.text}</a>
              <a href={content.ctaSecondaryCta.href || '#'} className="btn-outline">{content.ctaSecondaryCta.text}</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      <QuickEditButton slug="social-media" />
    </>
  );
}
