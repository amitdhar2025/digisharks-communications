export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'

// ── Hardcoded default content (used when no CMS data exists) ──────────
const DEFAULT_CONTENT = {
  heroEyebrow: '✦ One of India\'s Most Trusted PR Agencies',
  heroHeading: 'Digital PR & <span class="orange-text">Press Release</span> Services',
  heroDescription: 'Build a powerful digital presence through strategic media house partnerships. We craft compelling brand stories, distribute them across India\'s leading publications, and amplify your message to the audiences that matter most.',
  heroPrimaryCta: { text: 'Apply for PR →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'View Pricing', href: '/services-top-pr-digital-marketing/' },
  digitalPrLabel: 'Why Digital PR?',
  digitalPrHeading: 'Earned Media That <span class="orange-text">Builds Authority</span>',
  digitalPrSubtitle: 'Digital PR blends the credibility of traditional public relations with the measurability of online marketing — generating brand awareness, stronger search visibility, and lasting reputation.',
  whyDigisharksLabel: 'Why Digisharks Communications?',
  whyDigisharksHeading: 'Outcomes That <span class="orange-text">Move the Needle</span>',
  mediaNetworkLabel: 'Our Media Network',
  mediaNetworkHeading: 'Featured on <span class="orange-text">India\'s Top Publications</span>',
  mediaNetworkSubtitle: 'Your story deserves to be told on the platforms that move industries. Our media partners include some of the most respected names in journalism.',
  reasonsLabel: 'Why It Works',
  reasonsHeading: 'Ten Reasons to <span class="orange-text">Use Digital PR</span>',
  benefitsLabel: 'Why Press Releases Matter',
  benefitsHeading: 'Tangible <span class="orange-text">Benefits of Press Releases</span>',
  ctaHeading: 'Start <span class="orange-text">Growing Your Brand</span> Today',
  ctaDescription: 'Our demographic analysis approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. By leads, you can see who buys your products and services — also you can see who your brand appeals to the most by age, location, gender, job title, income, and hundreds of other variables.',
  ctaPrimaryCta: { text: 'Apply for PR →', href: '/contact-us/' },
  ctaSecondaryCta: { text: 'View Pricing', href: '/services-top-pr-digital-marketing/' },
}

const siteUrl = "https://digisharks-communications.vercel.app/press-release/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Press Release & Digital PR Agency | Digisharks Communications",
  description:
    "One of India's most trusted PR agencies. Strategic press release distribution, media relations, and digital PR services that build brand authority and visibility.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    type: "website",
    title: "Press Release & Digital PR | Digisharks Communications",
    description:
      "Strategic press release distribution, media relations, and digital PR services for ambitious brands.",
  },
};

export default async function PressReleasePage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('press-release')
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

        {/* WHY CHOOSE DIGITAL PR */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.digitalPrLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.digitalPrHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.digitalPrSubtitle}
            </p>

            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🌐</div>
                <h3>Online Presence</h3>
                <p>Strategic content placement across high-authority publications to put your brand in front of millions of targeted readers every month.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🛡️</div>
                <h3>Reputation Management</h3>
                <p>Build and protect your brand narrative. We monitor mentions, address concerns, and amplify positive stories that shape public perception.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📰</div>
                <h3>Media Relations</h3>
                <p>Direct access to journalists, media houses, bloggers, influencers, news platforms, and industry publications across India and beyond.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🤝</div>
                <h3>Influencer Collaboration</h3>
                <p>Strategic partnerships with key opinion leaders and industry influencers to amplify your brand message authentically.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">📡</div>
                <h3>Real-Time Monitoring</h3>
                <p>Track mentions, sentiment, and coverage across all media channels with live analytics.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📋</div>
                <h3>Media Kit Creation</h3>
                <p>Professional press kits that tell your brand story and make journalists want to cover you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY DIGISHARKS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">{content.whyDigisharksLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.whyDigisharksHeading }} />
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📈</div>
                <h3>Increased Brand Awareness</h3>
                <p>Get featured on the publications your audience already trusts — and the ones they're about to discover.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🔍</div>
                <h3>Strong Media Visibility</h3>
                <p>Premium placements across online and offline media outlets that put your brand on the map — literally.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">💬</div>
                <h3>High Audience Engagement</h3>
                <p>Stories crafted for the right audience at the right moment — driving shares, comments, and meaningful conversations.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📝</div>
                <h3>Quality Content Distribution</h3>
                <p>Editorial-grade content that journalists love to publish and readers love to consume.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🌍</div>
                <h3>Greater Reach</h3>
                <p>Tap into a curated network of national, regional, and niche media outlets spanning every industry.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">⭐</div>
                <h3>Enhanced Brand Credibility</h3>
                <p>Earned media coverage lends third-party validation that paid ads simply cannot match.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEDIA PARTNERS */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.mediaNetworkLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.mediaNetworkHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.mediaNetworkSubtitle}
            </p>
            <div className="media-partners" style={{ marginTop: "2.5rem" }}>
              <div className="mp">Forbes India</div>
              <div className="mp">Yahoo News</div>
              <div className="mp">Dailyhunt</div>
              <div className="mp">DD News</div>
              <div className="mp">Times of India</div>
              <div className="mp">Mid-Day</div>
              <div className="mp">News18</div>
              <div className="mp">Hindustan Times</div>
              <div className="mp">LiveMint</div>
            </div>
          </div>
        </section>

        {/* TEN REASONS */}
        <section className="section-bg-soft">
          <div className="container">
            <div className="section-label fade-up">{content.reasonsLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.reasonsHeading }} />
            <div className="reasons-list reasons-list-4">
              <div className="reason-card fade-up stagger-1">
                <span className="r-num">01</span>
                <h4>Increased Online Visibility</h4>
                <p>Get discovered by search engines and real readers on trusted platforms.</p>
              </div>
              <div className="reason-card fade-up stagger-2">
                <span className="r-num">02</span>
                <h4>Enhanced Brand Reputation</h4>
                <p>Position yourself as a thought leader in your industry.</p>
              </div>
              <div className="reason-card fade-up stagger-3">
                <span className="r-num">03</span>
                <h4>Improved SEO Performance</h4>
                <p>High-quality backlinks, media mentions, and domain authority boosts.</p>
              </div>
              <div className="reason-card fade-up stagger-4">
                <span className="r-num">04</span>
                <h4>Greater Audience Engagement</h4>
                <p>Reach readers who actually care about your story.</p>
              </div>
              <div className="reason-card fade-up stagger-1">
                <span className="r-num">05</span>
                <h4>Effective Crisis Management</h4>
                <p>Protect your brand with proactive communication strategies.</p>
              </div>
              <div className="reason-card fade-up stagger-2">
                <span className="r-num">06</span>
                <h4>Scalable PR Campaigns</h4>
                <p>Expand your reach with campaigns that grow alongside your business goals.</p>
              </div>
              <div className="reason-card fade-up stagger-3">
                <span className="r-num">07</span>
                <h4>Cost-Effective Marketing</h4>
                <p>Earned media delivers higher ROI than paid advertising with lasting organic value.</p>
              </div>
              <div className="reason-card fade-up stagger-4">
                <span className="r-num">08</span>
                <h4>Targeted Audience Reach</h4>
                <p>Connect with niche demographics through carefully curated media and influencer channels.</p>
              </div>
              <div className="reason-card fade-up stagger-1">
                <span className="r-num">09</span>
                <h4>Long-Lasting Impact</h4>
                <p>Press releases and media mentions remain discoverable online, building your brand equity over time.</p>
              </div>
              <div className="reason-card fade-up stagger-2">
                <span className="r-num">10</span>
                <h4>Competitive Advantage</h4>
                <p>Stay ahead of competitors with consistent media presence and thought leadership positioning.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS OF PRESS RELEASES */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">{content.benefitsLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.benefitsHeading }} />
            <div className="benefits-grid">
              <div className="benefit-card benefit-card-enhanced fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="b-icon">👁️</div>
                <h3>Brand Visibility</h3>
                <p>Amplify brand presence across India and global media outlets.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-2" style={{ "--card-accent": "#6366F1", "--card-accent-bg": "rgba(99,102,241,0.08)" } as React.CSSProperties}>
                <div className="b-icon">📰</div>
                <h3>Media Coverage</h3>
                <p>Get featured in leading newspapers, magazines, and online platforms.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-3" style={{ "--card-accent": "#0EA5E9", "--card-accent-bg": "rgba(14,165,233,0.08)" } as React.CSSProperties}>
                <div className="b-icon">🛡️</div>
                <h3>Online Reputation</h3>
                <p>Shape public perception with strategic, positive brand storytelling.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-1" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="b-icon">🔍</div>
                <h3>SEO Benefits</h3>
                <p>Earn powerful backlinks that boost your search rankings.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-2" style={{ "--card-accent": "#EC4899", "--card-accent-bg": "rgba(236,72,153,0.08)" } as React.CSSProperties}>
                <div className="b-icon">📊</div>
                <h3>Lead Generation</h3>
                <p>Convert media exposure into qualified business leads.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-3" style={{ "--card-accent": "#F59E0B", "--card-accent-bg": "rgba(245,158,11,0.08)" } as React.CSSProperties}>
                <div className="b-icon">🏆</div>
                <h3>Industry Recognition</h3>
                <p>Build authority and credibility within your industry.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-1" style={{ "--card-accent": "#8B5CF6", "--card-accent-bg": "rgba(139,92,246,0.08)" } as React.CSSProperties}>
                <div className="b-icon">🚨</div>
                <h3>Crisis Communication</h3>
                <p>Address issues quickly with controlled, strategic messaging.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-2" style={{ "--card-accent": "#14B8A6", "--card-accent-bg": "rgba(20,184,166,0.08)" } as React.CSSProperties}>
                <div className="b-icon">🤝</div>
                <h3>Influencer Partnerships</h3>
                <p>Collaborate with key voices to extend your brand&apos;s trust and reach.</p>
              </div>
              <div className="benefit-card benefit-card-enhanced fade-up stagger-3" style={{ "--card-accent": "#F97316", "--card-accent-bg": "rgba(249,115,22,0.08)" } as React.CSSProperties}>
                <div className="b-icon">🎯</div>
                <h3>Targeted Distribution</h3>
                <p>Reach the right journalists and publications with precision-targeted press release campaigns.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
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
      <QuickEditButton slug="press-release" />
    </>
  );
}
