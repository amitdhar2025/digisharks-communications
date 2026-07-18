/**
 * Press Release Page — Default Content
 *
 * Centralised content defaults for the press-release page.
 * Extracted for testability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Types ─────────────────────────────────────────────────────────────

export interface CtaAction {
  text: string
  href: string
}

export interface PressReleaseContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  digitalPrLabel: string
  digitalPrHeading: string
  digitalPrSubtitle: string
  whyDigisharksLabel: string
  whyDigisharksHeading: string
  mediaNetworkLabel: string
  mediaNetworkHeading: string
  mediaNetworkSubtitle: string
  reasonsLabel: string
  reasonsHeading: string
  benefitsLabel: string
  benefitsHeading: string
  ctaHeading: string
  ctaDescription: string
  ctaPrimaryCta: CtaAction
  ctaSecondaryCta: CtaAction
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: PressReleaseContent = {
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
