/**
 * Social Media Page — Content & Data
 *
 * Centralised content defaults used by the social-media page.
 * Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface SocialMediaContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  servicesLabel: string
  servicesHeading: string
  servicesSubtitle: string
  solutionsLabel: string
  solutionsHeading: string
  advertisingLabel: string
  advertisingHeading: string
  advertisingSubtitle: string
  globalLabel: string
  globalHeading: string
  globalSubtitle: string
  investLabel: string
  investHeading: string
  investSubtitle: string
  benefitsLabel: string
  benefitsHeading: string
  ctaHeading: string
  ctaDescription: string
  ctaPrimaryCta: CtaAction
  ctaSecondaryCta: CtaAction
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: SocialMediaContent = {
  heroEyebrow: '✦ Get Instant Growth Results for Your Business',
  heroHeading: 'Social Media Marketing <span class="orange-text">That Scales Brands</span>',
  heroDescription: 'Our Social Media Experts build engaged communities, scroll-stopping content, and performance-driven campaigns that turn followers into customers — across every platform that matters.',
  heroPrimaryCta: { text: 'Start Now →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Explore Services', href: '#services' },
  servicesLabel: 'What We Do For Your Business',
  servicesHeading: 'Full-Funnel <span class="orange-text">Social Media Management</span>',
  servicesSubtitle: 'From strategy to execution, we handle everything that goes into making your brand win on social media.',
  solutionsLabel: 'Social Media Marketing Solutions',
  solutionsHeading: 'Outcomes That <span class="orange-text">Drive Real Growth</span>',
  advertisingLabel: 'Social Advertising Services',
  advertisingHeading: 'Paid Social That <span class="orange-text">Performs</span>',
  advertisingSubtitle: 'Strategic paid campaigns across Meta, LinkedIn, YouTube, Twitter (X), and TikTok — with targeting, creative, and budgets tuned to your goals.',
  globalLabel: 'Global Insights',
  globalHeading: 'Social Media Marketing <span class="orange-text">Across the Globe</span>',
  globalSubtitle: 'Our social media marketing services reach audiences across key global markets — combining cultural insight with platform expertise.',
  investLabel: 'Why Invest',
  investHeading: 'Why Businesses Invest in <span class="orange-text">Social Media Marketing</span>',
  investSubtitle: 'Social media is no longer optional — it\'s where your customers live, work, and make buying decisions. Every segment of your business benefits from a strong social presence.',
  benefitsLabel: 'Benefits of Social Media Marketing',
  benefitsHeading: 'Why <span class="orange-text">Social Media Marketing</span> Works',
  ctaHeading: 'Start Your <span class="orange-text">Growth Journey</span>',
  ctaDescription: 'Our demographic analysis approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. We map your audience by age, location, gender, job title, income, interests, and behaviors — so every social campaign hits the right people with the right message.',
  ctaPrimaryCta: { text: 'Get Free Consultation →', href: '/contact-us/' },
  ctaSecondaryCta: { text: 'View Pricing', href: '/services-top-pr-digital-marketing/' },
}
