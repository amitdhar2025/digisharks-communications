/**
 * Career Page — Content & Data
 *
 * Centralised content defaults used by the career page.
 * Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface IconTitleDesc {
  icon: string
  title: string
  desc: string
  iconBg?: string
  iconColor?: string
}

export interface CareerContent {
  heroHeading: string
  heroDescription: string
  heroImage: string
  heroMobileImage: string
  valuesLabel: string
  valuesHeading: string
  valuesSubtitle: string
  values: IconTitleDesc[]
  ctaHeading: string
  ctaDescription: string
  ctaEmail: string
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: CareerContent = {
  heroHeading: 'Join the DigiSharks Team',
  heroDescription: 'We are always looking for passionate, creative, and driven individuals to help us deliver exceptional digital PR and marketing solutions.',
  heroImage: '/career-hero-image.avif',
  heroMobileImage: '/career-hero-mobile-image.avif',
  valuesLabel: 'Why Work With Us',
  valuesHeading: 'Why Work at <span class="career-values-accent">Digisharks</span>?',
  valuesSubtitle: 'We foster a culture of innovation, growth, and collaboration.',
  values: [
    { icon: '🚀', title: 'Growth', desc: 'Continuous learning & career advancement opportunities.', iconBg: '#FFF1EB', iconColor: '#FF5B2E' },
    { icon: '💡', title: 'Innovation', desc: 'Work with cutting-edge tools and creative strategies.', iconBg: '#EEF4FF', iconColor: '#3B82F6' },
    { icon: '🤝', title: 'Culture', desc: 'Collaborative, supportive, and inclusive environment.', iconBg: '#FFF8E5', iconColor: '#E0A91D' },
    { icon: '🎯', title: 'Impact', desc: 'Make a real difference for 500+ clients.', iconBg: '#E8F8EE', iconColor: '#22A565' },
  ],
  ctaHeading: 'Ready to Make Waves With Us?',
  ctaDescription: 'Send your resume to {email} and we will get back to you when the right opportunity opens up.',
  ctaEmail: 'marketing@digisharkscommunications.com',
}
