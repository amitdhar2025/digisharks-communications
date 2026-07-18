/**
 * Home Page — Content & Data
 *
 * Centralised content defaults used by the home page. Extracted for
 * maintainability; the page imports from here and optionally overrides
 * via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface StatItem {
  number: string
  suffix: string
  label: string
}

export interface IconTitleDesc {
  icon: string
  title: string
  desc: string
}

export interface MetricItem extends IconTitleDesc {
  number: string
  suffix: string
}

export interface IconTitle {
  icon: string
  title: string
}

export interface CtaAction {
  text: string
  href: string
}

export interface HomeContent {
  // Hero
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  heroStats: StatItem[]
  heroVideo: string
  heroMedia: any[]
  // Brand Logos
  brandLogosHeading: string
  brandLogosImages: any[]
  mediaHouseItems: any[]
  // AI Growth Metrics
  metricsLabel: string
  metricsHeading: string
  metricsDescription: string
  metrics: MetricItem[]
  // Awards
  awardsLabel: string
  awardsHeading: string
  awardsDescription: string
  awardsItems: any[]
  // Services
  servicesLabel: string
  servicesHeading: string
  servicesSubtitle: string
  services: IconTitleDesc[]
  // Why Choose Us
  whyChooseLabel: string
  whyChooseHeading: string
  whyChooseSubtitle: string
  whyChooseItems: string[]
  whyChooseIcons: IconTitle[]
  // Testimonials
  testimonialsLabel: string
  testimonialsHeading: string
  testimonialsSubtitle: string
  // CTA
  ctaBadge: string
  ctaHeading: string
  ctaDescription: string
  ctaFeatures: string[]
  ctaButton: CtaAction
  // Footer
  footerTagline: string
  footerPhone: string
  footerEmail: string
  footerAddress: string
  // Legal Links
  privacyPolicyUrl: string
  termsUrl: string
  refundPolicyUrl: string
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: HomeContent = {
  // Hero
  heroEyebrow: 'AI-Powered Digital Growth',
  heroHeading: '<span class="orange-text">AI-Driven</span><br />for Your Digital Brand',
  heroDescription: 'Digisharks Communications is a next-gen digital PR, marketing, and AI-powered web development agency. We fuse data, design, and AI to help brands achieve measurable growth, top-tier media presence, and 10x ROI across 50+ publications.',
  heroPrimaryCta: { text: 'Get Free Consultation →', href: '#' },
  heroSecondaryCta: { text: 'Our Services', href: '#' },
  heroStats: [
    { number: '500+', suffix: '', label: 'Projects Delivered' },
    { number: '10+', suffix: '', label: 'Years of Experience' },
    { number: '50+', suffix: '', label: 'Media Partners' },
    { number: '98%', suffix: '', label: 'Client Satisfaction' },
  ],
  // Hero
  heroVideo: '',
  heroMedia: [],
  // Brand Logos
  brandLogosHeading: 'Check Out <span class="orange-text-num">Our Work</span>',
  brandLogosImages: [],
  mediaHouseItems: [],
  // AI Growth Metrics
  metricsLabel: 'AI-Powered Insights',
  metricsHeading: 'Real-Time <span class="orange-text">AI Growth Metrics</span>',
  metricsDescription: 'We track everything—visibility, engagement, conversions, AI-driven insights—and show you the numbers that matter in real time.',
  metrics: [
    { icon: '🤖', title: 'AI-Optimised ROI', desc: 'Our AI engine optimises campaigns in real time to deliver ten times the return on your marketing spend.', number: '10x', suffix: '' },
    { icon: '📰', title: 'Brand Stories Published', desc: 'Media features across top-tier publications including Forbes, Inc42, YourStory, and 50+ outlets.', number: '500+', suffix: '' },
    { icon: '🚀', title: 'Average Traffic Growth', desc: 'Websites we manage see a 320% average traffic uplift within the first 6 months of partnership.', number: '320%', suffix: '' },
    { icon: '💎', title: 'Client Retention Rate', desc: 'Our clients stick with us because we consistently deliver measurable, compounding growth.', number: '98%', suffix: '' },
  ],
  // Awards
  awardsLabel: 'Awards and Recognition',
  awardsHeading: 'Awards That Recognise <span class="orange-text">Digital Excellence</span>',
  awardsDescription: 'Our work has been recognised by the worlds most respected platforms — a testament to the results we deliver for our clients.',
  awardsItems: [],
  // Services
  servicesLabel: 'Our Services',
  servicesHeading: 'What We Do <span class="orange-text">Best</span>',
  servicesSubtitle: 'From AI-powered digital PR to full-stack marketing, we deliver end-to-end brand growth solutions that combine creativity, technology, and data-driven insights.',
  services: [
    { icon: '🤖', title: 'AI-Driven Digital PR', desc: 'Strategic media coverage across 50+ top publications in India.' },
    { icon: '📺', title: 'Media Management', desc: 'Brand visibility campaigns with high-impact media collaborations.' },
    { icon: '📈', title: 'AI Digital Marketing', desc: 'Full-stack campaigns from SEO to PPC with measurable ROI.' },
    { icon: '🎯', title: 'Smart Lead Generation', desc: 'High-intent pipelines powered by AI performance marketing.' },
    { icon: '✍️', title: 'AI Content Strategy', desc: 'SEO-optimized blogs, scripts, and brand narratives that convert.' },
    { icon: '🏆', title: 'Political Campaign Mgmt', desc: 'Strategic voter outreach with measurable on-ground impact.' },
  ],
  // Why Choose Us
  whyChooseLabel: 'Why Choose Us',
  whyChooseHeading: 'We Deliver <span class="orange-text">Measurable Results</span>',
  whyChooseSubtitle: '10+ years of experience, 500+ successful campaigns, and a team dedicated to your brand growth.',
  whyChooseItems: [
    '100% Transparency in Reporting and Pricing',
    'AI-Powered Campaign Optimization',
    'Dedicated Account Manager for Every Client',
    '50+ Media House Partnerships Across India',
    'Proven 10x ROI Track Record',
    'Free AI Strategy Audit to Get You Started',
  ],
  whyChooseIcons: [
    { icon: '🤖', title: 'AI Strategy' },
    { icon: '📰', title: 'Digital PR' },
    { icon: '📈', title: 'SEO and PPC' },
    { icon: '📱', title: 'Social Media' },
    { icon: '💻', title: 'Web Dev' },
    { icon: '🏆', title: 'Branding' },
  ],
  // Testimonials
  testimonialsLabel: 'Client Testimonials',
  testimonialsHeading: 'What Our <span class="orange-text">Clients Say</span>',
  testimonialsSubtitle: 'Real reviews from real clients. We measure our success by the growth and satisfaction of the brands we partner with.',
  // CTA
  ctaBadge: '🚀 Let us Build Something Great',
  ctaHeading: 'Start Your <span class="orange-text">AI Growth</span> Journey Today',
  ctaDescription: 'Your customers are online right now. Let us help you reach them with the right message, on the right platform, at the right moment. Do not let competitors take what is yours.',
  ctaFeatures: ['Free Growth Audit', 'AI-Powered Insights', 'Dedicated Manager', 'Transparent Reporting'],
  ctaButton: { text: 'Get Free Consultation →', href: '#' },
  // Footer
  footerTagline: 'Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.',
  footerPhone: '+91 96273 32332',
  footerEmail: 'marketing@digisharkscommunications.com',
  footerAddress: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',

  // Legal Links
  privacyPolicyUrl: '#',
  termsUrl: '#',
  refundPolicyUrl: '#',
}
