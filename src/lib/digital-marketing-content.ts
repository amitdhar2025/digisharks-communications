/**
 * Digital Marketing Agency Page — Content & Data
 *
 * Centralised content defaults used by the digital-marketing-agency page.
 * Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface DigitalMarketingContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  pillarsLabel: string
  pillarsHeading: string
  pillarsSubtitle: string
  servicesLabel: string
  servicesHeading: string
  servicesSubtitle: string
  whyLabel: string
  whyHeading: string
  whyDescription: string
  ctaHeading: string
  ctaDescription: string
  ctaPrimaryCta: CtaAction
  ctaSecondaryCta: CtaAction
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: DigitalMarketingContent = {
  heroEyebrow: '✦ Get Instant Growth Results for Your Business',
  heroHeading: 'India\'s Leading <span class="orange-text">Digital Marketing Agency</span>',
  heroDescription: 'We are a leading digital marketing agency helping brands grow through data-driven strategies, performance media, and high-quality content. Our campaigns are designed to deliver measurable ROI and long-term business outcomes.',
  heroPrimaryCta: { text: 'Start Now →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Explore Services', href: '#services' },
  pillarsLabel: 'Digital Marketing Experts',
  pillarsHeading: 'Built on Three <span class="orange-text">Core Pillars</span>',
  pillarsSubtitle: 'Every campaign we run is designed around the three pillars that drive real digital growth.',
  servicesLabel: 'Our Digital Marketing Services',
  servicesHeading: 'End-to-End <span class="orange-text">Performance Marketing</span>',
  servicesSubtitle: 'From search to social, content to conversion — explore the full suite of services that power your digital growth.',
  whyLabel: 'Why Choose Digisharks?',
  whyHeading: 'Strategy Backed by <span class="orange-text">Demographic Intelligence</span>',
  whyDescription: 'Our demographic analysis approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. We map your audience by age, location, gender, job title, income, interests, and behaviors — so every campaign hits the right target.',
  ctaHeading: 'Ready for <span class="orange-text">Instant Growth?</span>',
  ctaDescription: 'Let\'s build a digital marketing strategy that compounds your growth month over month. From SEO to Google Ads, content to conversion — we handle the heavy lifting so you can focus on running your business.',
  ctaPrimaryCta: { text: 'Start Now →', href: '/contact-us/' },
  ctaSecondaryCta: { text: 'View Pricing', href: '/services-top-pr-digital-marketing/' },
}
