/**
 * Digital Products Page — Content & Data
 *
 * Centralised content defaults used by the digital-products page.
 * Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface DigitalProductsContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  featuresHeading: string
  featuresDescription: string
  ctaHeading: string
  ctaDescription: string
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: DigitalProductsContent = {
  heroEyebrow: '✦ Digital Products',
  heroHeading: 'Verified Business & Consumer <span class="orange-text">Databases</span>',
  heroDescription: 'Browse our collection of verified, ready-to-use digital databases covering PAN India contacts across 40+ industries. Perfect for lead generation, email marketing, and business growth campaigns.',
  heroPrimaryCta: { text: 'Browse All Products ↓', href: '#products' },
  heroSecondaryCta: { text: 'Contact Support', href: '/contact-us/' },
  featuresHeading: 'Why Choose Our <span class="orange-text">Databases</span>',
  featuresDescription: 'Every database is verified, regularly updated, and formatted for seamless integration with your CRM, email, or marketing automation tools.',
  ctaHeading: 'Need a Custom <span class="orange-text">Database</span>?',
  ctaDescription: 'Contact us for custom data requirements, bulk orders, or enterprise pricing. Our team will create a tailored dataset for your specific needs.',
}
