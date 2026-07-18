/**
 * Portfolio Page — Default Content
 *
 * Centralised content defaults for the portfolio page.
 * Extracted for testability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Types ─────────────────────────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface PortfolioContent {
  heroEyebrow: string
  heroHeading: string
  heroSubtitle: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  aboutLabel: string
  aboutHeading: string
  aboutDescription: string
  aboutCta: CtaAction
  teamLabel: string
  teamHeading: string
  teamIntro: string
  portfolioLabel: string
  portfolioHeading: string
  portfolioDescription: string
  portfolioCta: CtaAction
  clientsLabel: string
  clientsHeading: string
  clients: string[]
  ctaEyebrow: string
  ctaHeading: string
  ctaDescription: string
  ctaPrimaryCta: CtaAction
  ctaSecondaryCta: CtaAction
  mapLabel: string
  mapAddress: string
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: PortfolioContent = {
  heroEyebrow: '#1 Rated PR & Digital Marketing Agency',
  heroHeading: 'Top PR Agency <span style="color: var(--color-orange)">in India</span>',
  heroSubtitle: 'Get instant growth results for your business.',
  heroDescription: 'Digisharks Communications is one of the top PR agencies in India — we provide the best quality services through creative and innovative ideas.',
  heroPrimaryCta: { text: 'Start Now →', href: '/contact-us' },
  heroSecondaryCta: { text: '📞 Get a Free Consultation', href: '/contact-us' },
  aboutLabel: 'About Us',
  aboutHeading: 'Why <span class="orange-text">Digisharks Communications</span>',
  aboutDescription: 'Digisharks Communications is known for high-quality brand promotions and representing your brand to the world. We help you understand who buys your products and services — by age, location, gender, job title, income, and more — so you spend your marketing on your most enthusiastic customers.',
  aboutCta: { text: 'Apply for PR →', href: '/contact-us' },
  teamLabel: 'Our Team',
  teamHeading: 'Meet Our <span class="orange-text">Professionals</span>',
  teamIntro: 'Our team is highly professional and experienced. A skilled digital marketing and PR team that drives brand visibility, engagement, and conversions through compelling storytelling, media relations, SEO, and strategic campaigns that deliver measurable results.',
  portfolioLabel: 'Our Portfolio',
  portfolioHeading: 'Work That <span class="orange-text">Speaks Volumes</span>',
  portfolioDescription: 'A showcase of our award-winning projects and campaigns that have made an impact.',
  portfolioCta: { text: 'Start Your Project →', href: '/contact-us' },
  clientsLabel: 'Our Clients',
  clientsHeading: 'Trusted by <span class="orange-text">Industry Leaders</span>',
  clients: ['Patanjali', 'Fitlivs', 'PTC Punjab Network', 'Shivanshi Tarot', 'Ascleplus', 'Digisharks'],
  ctaEyebrow: '🚀 Would you like to start?',
  ctaHeading: 'Ready to <span class="orange-text">Transform</span> Your Brand?',
  ctaDescription: "Let's create something extraordinary together. Our team of experts is ready to help you achieve measurable growth and build a brand that stands out.",
  ctaPrimaryCta: { text: 'Contact Us Today →', href: '/contact-us' },
  ctaSecondaryCta: { text: '📞 +91 96273 32332', href: 'tel:+919627332332' },
  mapLabel: 'Find Us',
  mapAddress: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301',
}
