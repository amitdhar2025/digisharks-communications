export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'

// ── Hardcoded default content (used when no CMS data exists) ──────────
const DEFAULT_CONTENT = {
  heroEyebrow: '✦ Top PR Agency in India',
  heroHeading: 'Our <span class="orange-text">Services & Pricing</span>',
  heroDescription: 'Digisharks Communications provides top PR and digital marketing services. We firmly believe in transparency and high-quality standards through contemporary and creative Digital Press Release and digital marketing tactics. We offer a wide range of digital marketing and conventional marketing services including social media services, SEO, Website Design, Political Campaigns, Digital PR, Corporate Events, Road Shows, Award Shows, and Pricing.',
  heroPrimaryCta: { text: 'Get Free Consultation →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'View Pricing', href: '#pricing' },
  pricingLabel: 'Transparent Pricing',
  pricingHeading: 'Choose the Right <span class="orange-text">Growth Package</span>',
  pricingSubtitle: 'Pick a service that aligns with your brand goals. Every plan is built for measurable outcomes, transparent deliverables, and dedicated support.',
  aiToolsLabel: 'AI-Powered Market Edge',
  aiToolsHeading: 'New <span class="orange-text">AI Launch Tools</span> for 2026',
  aiToolsSubtitle: 'Digisharks has launched a suite of AI-powered marketing tools designed to give your brand a competitive edge. From AI content generation to predictive audience targeting — get ahead of the market.',
  aiTools: [
    { icon: '🤖', title: 'AI Content Studio', desc: 'Generate SEO-optimised blogs, press releases, and social media copy in seconds with our proprietary AI engine — trained on 500+ successful campaigns.' },
    { icon: '🎯', title: 'Predictive Audience Targeting', desc: 'Our AI analyses demographic, psychographic, and behavioral data to predict which audience segments will convert — before you spend a rupee on ads.' },
    { icon: '📊', title: 'Real-Time Campaign Dashboard', desc: 'Track every campaign metric in real time with AI-powered insights, anomaly detection, and automated optimization suggestions delivered to your inbox daily.' },
    { icon: '🔍', title: 'AI SEO Auditor', desc: 'Get instant SEO health scores, competitor backlink analysis, and content gap recommendations — all powered by machine learning models updated weekly.' },
    { icon: '📰', title: 'Smart Media Matchmaker', desc: 'Our AI automatically matches your brand story with the right journalists and publications — increasing pitch acceptance rates by up to 3x versus traditional outreach.' },
    { icon: '📈', title: 'AI Performance Optimizer', desc: 'Continuous A/B testing and creative iteration powered by AI — your campaigns improve automatically based on real-time performance data and market trends.' },
  ],
  capabilitiesHeading: 'End-to-End <span class="orange-text">Digital Services</span>',
  capabilitiesSubtitle: 'From strategic PR to performance marketing, design to development — explore the full range of services we offer to help your brand grow with measurable results.',
  ctaHeading: 'Would You Like to <span class="orange-text">Start?</span>',
  ctaDescription: 'Digisharks Communications is known for its high-quality brand promotions. Representing your brand communicates with the world. Our demographic approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. By leads, you can see who buys your products and services — also you can see who your brand appeals to the most by age, location, gender, job title, income, and hundreds of other variables. With the right PR agency by your side, growth becomes measurable and consistent.',
  ctaPrimaryCta: { text: 'Apply for PR →', href: '/contact-us/' },
  ctaSecondaryCta: { text: 'Talk to an Expert', href: '#' },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'
const siteUrl = `${SITE_URL}/services-top-pr-digital-marketing/`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + '/'),
  title: "Services & Pricing | Top PR & Digital Marketing Agency | Digisharks",
  description:
    "Transparent pricing for Press Release, Web Design, Online Marketing, Events Management, Brand Promotions & Social Media Marketing. Top PR and digital marketing services from Digisharks Communications.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    type: "website",
    title: "Services & Pricing | Digisharks Communications",
    description:
      "Transparent pricing for Press Release, Web Design, Online Marketing, Events Management, Brand Promotions & Social Media Marketing from Digisharks Communications.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services & Pricing | Digisharks Communications",
    description:
      "Top Digital PR and Digital Marketing Agency with transparent pricing.",
  },
};

export default async function ServicesPricingPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('services-top-pr-digital-marketing')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO SECTION */}
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

        {/* PRICING CARDS SECTION */}
        <section id="pricing" style={{ paddingTop: "2rem" }} className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.pricingLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.pricingHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.pricingSubtitle}
            </p>

            <div className="pricing-grid">
              {/* CARD 1 — Press Release */}
              <div className="pricing-card featured fade-up stagger-1">
                <span className="pc-label">Most Popular</span>
                <h3>Press Release</h3>
                <p className="pc-desc">We have tie-up with leading media houses for exclusive coverage for highly engaging contents to target various segments and assure more visibility through our PR services.</p>
                <ul className="pc-features">
                  <li>2 Press Releases – includes Press Release Proof Reading</li>
                  <li>Up to 800 Words – 2 PRs</li>
                  <li>Reaches 500+ industry-specific Indian reporters</li>
                  <li>Coverage from 80+ websites assured</li>
                  <li>Distribution across leading media houses</li>
                </ul>
                <div className="pc-bottom-wrapper">
                  <div className="pc-price">
                    <span className="currency">INR</span>
                    <span className="amount">Rs 8,500</span>
                  </div>
                  <p className="pc-note">One-time fee | For Indian Clients</p>
                  <div className="pc-cta">
                    <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                  </div>
                </div>
              </div>

              {/* CARD 2 — Web Design */}
              <div className="pricing-card fade-up stagger-2">
                <h3>Web Design</h3>
                <p className="pc-desc">At Digisharks Communication we have dedicated teams to build customised websites with attractive design, layout, and content.</p>
                <ul className="pc-features">
                  <li>10 Pages with WordPress CMS</li>
                  <li>Mobile Responsive Layout</li>
                  <li>Image Slider, Gallery & Contact Form</li>
                  <li>Newsletter Subscription & Google Map</li>
                  <li>SEO Friendly + Social Media Integration</li>
                  <li>2 Design Concepts + Unlimited Revisions</li>
                  <li>FREE Search Engine Submission</li>
                </ul>
                <div className="pc-bottom-wrapper">
                  <div className="pc-price">
                    <span className="currency">INR</span>
                    <span className="amount">Rs 10,500</span>
                    <span className="period">/ website</span>
                  </div>
                  <div className="pc-cta">
                    <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                  </div>
                </div>
              </div>

              {/* CARD 3 — Online Marketing */}
              <div className="pricing-card fade-up stagger-3">
                <h3>Online Marketing</h3>
                <p className="pc-desc">Our Digital marketing is built across three main pillars — focused targets, affordable budget, and high potential returns. On-page & Off-page SEO for your website.</p>
                <ul className="pc-features">
                  <li>Extensive keyword research</li>
                  <li>Site Link Building</li>
                  <li>Natural listings on Google, Bing</li>
                  <li>Article Submission to News & PR sites</li>
                  <li>Local directories & industry authority listings</li>
                  <li>Blogs & Social Media Networks</li>
                  <li>Online & Social Media reputation monitoring</li>
                </ul>
                <div className="pc-bottom-wrapper">
                  <div className="pc-price">
                    <span className="amount" style={{ fontSize: "1.6rem" }}>SEO for 5 Keywords</span>
                  </div>
                  <p className="pc-note">INR Rs 2,40,000 /-</p>
                  <div className="pc-cta">
                    <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                  </div>
                </div>
              </div>

              {/* CARD 4 — Events Management */}
              <div className="pricing-card fade-up stagger-1">
                <h3>Events Management</h3>
                <p className="pc-desc">We believe in exceeding business through the most innovative way, to accelerate your business to the next level we deal in various events.</p>
                <ul className="pc-features">
                  <li>Celebrity Event Management</li>
                  <li>Home & Industry Event Management</li>
                  <li>New Year Party & Wedding Events</li>
                  <li>Live Concerts & Movie Promotions</li>
                  <li>Fashion Show & Modeling Agency Events</li>
                  <li>Bollywood & Advertising Agency Events</li>
                </ul>
                <div className="pc-bottom-wrapper">
                  <div className="pc-price">
                    <span className="currency">INR</span>
                    <span className="amount">Rs 50,000</span>
                    <span className="period">/ day</span>
                  </div>
                  <div className="pc-cta">
                    <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                  </div>
                </div>
              </div>

              {/* CARD 5 — Brand Promotions */}
              <div className="pricing-card fade-up stagger-2">
                <h3>Brand Promotions</h3>
                <p className="pc-desc">Over the years we had helped many companies with strategic brand promotion. Our brand promotion campaign along with digital marketing strategies had empowered many clients.</p>
                <p style={{ color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.7, position: "relative", zIndex: 1 }}>
                  Backed by skillful experts, we are proficient in rendering Brand Promotion Services. These services are enormously appreciated in the market due to their timely completion. Our professionals render our offered service employing advanced techniques. Offered services are rendered in varied forms and terms that meet on customer's demand.
                </p>
                <div className="pc-bottom-wrapper">
                  <div className="pc-price">
                    <span className="currency">INR</span>
                    <span className="amount">Rs 50,000</span>
                  </div>
                  <div className="pc-cta">
                    <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                  </div>
                </div>
              </div>

              {/* CARD 6 — Social Media Marketing */}
              <div className="pricing-card fade-up stagger-3">
                <span className="pc-label">SMO Plan</span>
                <h3>Social Media Marketing</h3>
                <p className="pc-desc">Digisharks Communication has successfully tapped online networks through its wide-ranging strategies. We promote business on social media.</p>
                <div className="pc-plan">
                  <div className="row"><span>No. of Sites/Business</span><span>1</span></div>
                  <div className="row"><span>Platform</span><span>Facebook + Instagram</span></div>
                  <div className="row"><span>Budget (monthly)</span><span>Up to Rs 1.5 Lac</span></div>
                  <div className="row"><span>No. of Campaigns</span><span>2–4</span></div>
                  <div className="row"><span>Max. Adsets</span><span>4–10</span></div>
                  <div className="row"><span>No. of Ads</span><span>2 Per Adset</span></div>
                  <div className="row"><span>Reports</span><span>Weekly</span></div>
                  <div className="row"><span>Support</span><span>Email</span></div>
                  <div className="row"><span>Monthly Fee</span><span>Contact Us</span></div>
                  <div className="row"><span>Quarterly</span><span className="save">Save 10%</span></div>
                </div>
                <div className="pc-bottom-wrapper">
                  <div className="pc-price">
                    <span className="currency">INR</span>
                    <span className="amount">Rs 20,000</span>
                  </div>
                  <div className="pc-cta">
                    <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* AI POWERED MARKET EDGE */}
        <section className="section-bg-white" style={{ paddingTop: '2rem' }}>
          <div className="container">
            <div className="section-label-orange centered-label fade-up">
              <span className="label-dot"></span>
              {content.aiToolsLabel}
            </div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: content.aiToolsHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem", textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
              {content.aiToolsSubtitle}
            </p>
            <div className="benefits-grid" style={{ marginTop: '2.5rem' }}>
              {(content.aiTools || []).map((tool, i) => (
                <div className={`benefit-card fade-up stagger-${(i % 3) + 1}`} key={i}>
                  <div className="b-icon">{tool.icon}</div>
                  <h3>{tool.title}</h3>
                  <p>{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES OVERVIEW - CAPABILITIES CARD GRID */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">Our Capabilities</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.capabilitiesHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.capabilitiesSubtitle}
            </p>

            <div className="svc-cap-grid">
              {/* CARD 1 — Press Release */}
              <div className="svc-cap-card fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">📰</div>
                <h3>Press Release</h3>
                <p className="svc-cap-desc">Exclusive coverage via leading media houses for highly engaging content targeting various segments with assured visibility.</p>
                <ul className="svc-cap-list">
                  <li>Timeline Graphics</li>
                  <li>Brand Awareness</li>
                  <li>High Engagement</li>
                  <li>Quality Contents</li>
                  <li>Increased Reach</li>
                </ul>
                <div className="svc-cap-media-label">Media Partners</div>
                <div className="svc-cap-partners">
                  <span>Times of India</span>
                  <span>Mid Day</span>
                  <span>News 18</span>
                  <span>Hindustan Times</span>
                  <span>Live Mint</span>
                  <span>Forbes India</span>
                  <span>Yahoo News</span>
                </div>
              </div>

              {/* CARD 2 — Digital Marketing */}
              <div className="svc-cap-card fade-up stagger-2" style={{ "--card-accent": "#6366F1", "--card-accent-bg": "rgba(99,102,241,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">📈</div>
                <h3>Digital Marketing</h3>
                <p className="svc-cap-desc">Built on focused targets, affordable budgets, and high ROI. Strategies that drive higher conversion rates and more traffic.</p>
                <ul className="svc-cap-list">
                  <li>SEO (Search Engine Optimization)</li>
                  <li>SEM (Search Engine Marketing)</li>
                  <li>SMO (Social Media Optimization)</li>
                  <li>Pay-Per-Click (PPC)</li>
                  <li>Content Marketing</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 3 — Social Media Marketing */}
              <div className="svc-cap-card fade-up stagger-3" style={{ "--card-accent": "#EC4899", "--card-accent-bg": "rgba(236,72,153,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">💬</div>
                <h3>Social Media Marketing</h3>
                <p className="svc-cap-desc">Drive brand engagement across top platforms through live streaming, marketing posts, and strategic content distribution.</p>
                <ul className="svc-cap-list">
                  <li>Facebook</li>
                  <li>Twitter (X)</li>
                  <li>YouTube</li>
                  <li>Instagram</li>
                  <li>Pinterest & more</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 4 — Website Design & Graphics */}
              <div className="svc-cap-card fade-up stagger-4" style={{ "--card-accent": "#0EA5E9", "--card-accent-bg": "rgba(14,165,233,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">🎨</div>
                <h3>Website Design &amp; Graphics</h3>
                <p className="svc-cap-desc">Customised websites with attractive design, layout, and content. From template design to full graphic services.</p>
                <ul className="svc-cap-list">
                  <li>Template & Visual Design</li>
                  <li>Content Writing</li>
                  <li>Custom Animations & Videos</li>
                  <li>Logo & Brand Identity</li>
                  <li>Flyers, Brochures & More</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 5 — Event Management */}
              <div className="svc-cap-card fade-up stagger-1" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">🎤</div>
                <h3>Event Management</h3>
                <p className="svc-cap-desc">Innovative event planning and execution — from corporate events to fashion shows and exhibitions that accelerate business growth.</p>
                <ul className="svc-cap-list">
                  <li>Corporate Events & Seminars</li>
                  <li>Conferences & Tradeshows</li>
                  <li>Workshops & Theme Parties</li>
                  <li>Virtual & Hybrid Events</li>
                  <li>Fashion Shows & Exhibitions</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 6 — Brand Promotion */}
              <div className="svc-cap-card fade-up stagger-2" style={{ "--card-accent": "#F59E0B", "--card-accent-bg": "rgba(245,158,11,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">🚀</div>
                <h3>Brand Promotion</h3>
                <p className="svc-cap-desc">Strategic brand promotion campaigns empowered with digital marketing strategies to establish and amplify your brand presence.</p>
                <ul className="svc-cap-list">
                  <li>Online & Offline Advertising</li>
                  <li>Sales Promotion Strategies</li>
                  <li>Media & Graphic Promotions</li>
                  <li>360° Integrated Marketing</li>
                  <li>Public Events & Surveys</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 7 — Motion Picture Marketing */}
              <div className="svc-cap-card fade-up stagger-3" style={{ "--card-accent": "#8B5CF6", "--card-accent-bg": "rgba(139,92,246,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">🎬</div>
                <h3>Motion Picture Marketing</h3>
                <p className="svc-cap-desc">Thriving in motion picture marketing with competitor-oriented, realistic marketing approaches that shape brands powerfully.</p>
                <ul className="svc-cap-list">
                  <li>Short Films & Still Shoots</li>
                  <li>Animated Videos</li>
                  <li>Publicity Stunts</li>
                  <li>Advertisement Campaigns</li>
                  <li>Merchandising & Media Interviews</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>

              {/* CARD 8 — Online Reputation Management */}
              <div className="svc-cap-card fade-up stagger-4" style={{ "--card-accent": "#14B8A6", "--card-accent-bg": "rgba(20,184,166,0.08)" } as React.CSSProperties}>
                <div className="svc-cap-icon">🛡️</div>
                <h3>Online Reputation Management</h3>
                <p className="svc-cap-desc">Protect and enhance your brand's digital footprint with proactive monitoring, strategic response, and positive narrative amplification.</p>
                <ul className="svc-cap-list">
                  <li>Brand Mention Monitoring</li>
                  <li>Review Management</li>
                  <li>Crisis Communication</li>
                  <li>Sentiment Analysis</li>
                  <li>Positive Content Amplification</li>
                </ul>
                <div className="svc-cap-cta">
                  <a href="/contact-us/">Learn More →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING CTA SECTION */}
        <section className="final-cta section-bg-warm">
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
      <QuickEditButton slug="services-top-pr-digital-marketing" />
    </>
  );
}
