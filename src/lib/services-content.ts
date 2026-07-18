/**
 * Services & Pricing Page — Content & Data
 *
 * Centralised content defaults used by the services-top-pr-digital-marketing
 * page. Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface IconTitleDesc {
  icon: string
  title: string
  desc: string
}

export interface CtaAction {
  text: string
  href: string
}

export interface ServicesContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  pricingLabel: string
  pricingHeading: string
  pricingSubtitle: string
  aiToolsLabel: string
  aiToolsHeading: string
  aiToolsSubtitle: string
  aiTools: IconTitleDesc[]
  capabilitiesHeading: string
  capabilitiesSubtitle: string
  ctaHeading: string
  ctaDescription: string
  ctaPrimaryCta: CtaAction
  ctaSecondaryCta: CtaAction
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: ServicesContent = {
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
