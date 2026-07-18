/**
 * Contact Us Page — Default Content
 *
 * Centralised content defaults for the contact-us page.
 * Extracted for testability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Types ─────────────────────────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface ContactContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  contactHeading: string
  contactAddress: string
  contactPhone: string
  contactEmail: string
  contactHours: string
  ctaEyebrow: string
  ctaHeading: string
  ctaDescription: string
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: ContactContent = {
  heroEyebrow: '📞 Get In Touch',
  heroHeading: 'Let\'s Build Your <span class="orange-text">Next Big Win</span>',
  heroDescription: 'Have a project in mind? Want to scale your brand with data-driven digital PR and marketing? Our team is ready to craft a custom strategy that delivers measurable, compounding growth.',
  heroPrimaryCta: { text: 'Send Us a Message →', href: '#contact-form' },
  heroSecondaryCta: { text: '📞 +91 96273 32332', href: 'tel:+919627332332' },
  contactHeading: 'Three Ways to <span class="orange-text">Connect</span>',
  contactAddress: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301',
  contactPhone: '+91 96273 32332',
  contactEmail: 'marketing@digisharkscommunications.com',
  contactHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  ctaEyebrow: '💼 Let\'s Start a Conversation',
  ctaHeading: 'Ready to <span class="orange-text">Grow With Us</span>?',
  ctaDescription: 'Whether you\'re a startup looking to launch, a growing brand aiming to scale, or an established company seeking fresh digital momentum — we have the expertise, team, and proven strategies to make it happen.',
}
