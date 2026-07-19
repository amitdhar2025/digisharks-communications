/**
 * Page Defaults
 *
 * Maps page slugs to their hardcoded default content objects.
 * Used by the CMS admin API to pre-populate the editor form when
 * no CMS content has been saved yet.
 *
 * The frontend page.tsx files already do { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
 * in their own server components, but the CMS editor needs defaults
 * too so the admin doesn't see empty fields.
 */

import { DEFAULT_CONTENT as homeContent } from './home-content'
import { DEFAULT_CONTENT as aboutContent } from './about-us-content'
import { DEFAULT_CONTENT as servicesContent } from './services-content'
import { DEFAULT_CONTENT as brandPromotionContent } from './brand-promotion-content'
import { DEFAULT_CONTENT as contactContent } from './contact-content'
import { DEFAULT_CONTENT as digitalMarketingContent } from './digital-marketing-content'
import { DEFAULT_CONTENT as socialMediaContent } from './social-media-content'
import { DEFAULT_CONTENT as webDevelopmentContent } from './web-development-content'
import { DEFAULT_CONTENT as pressReleaseContent } from './press-release-content'
import { DEFAULT_CONTENT as portfolioContent } from './portfolio-content'
import { DEFAULT_CONTENT as digitalProductsContent } from './digital-products-content'
import { privacyContent, termsContent, refundContent } from './legal-content'
import { DEFAULT_CONTENT as careerContent } from './career-content'
import { DEFAULT_CONTENT as blogContent } from './blog-content'

/** Map of slug -> default content object */
const DEFAULTS = {
  'home': homeContent,
  'about-us': aboutContent,
  'services-top-pr-digital-marketing': servicesContent,
  'brand-promotion': brandPromotionContent,
  'contact-us': contactContent,
  'digital-marketing-agency': digitalMarketingContent,
  'social-media': socialMediaContent,
  'web-development': webDevelopmentContent,
  'press-release': pressReleaseContent,
  'portfolio': portfolioContent,
  'digital-products': digitalProductsContent,
  'privacy-policy': privacyContent,
  'terms-and-conditions': termsContent,
  'refund-policy': refundContent,
  'career': careerContent,
  'blog': blogContent,
}

/**
 * Get the default content for a page slug.
 * Returns null if no default is registered.
 *
 * @param {string} slug - Page slug
 * @returns {object|null}
 */
export function getPageDefaults(slug) {
  return DEFAULTS[slug] || null
}

/**
 * Get all registered page slugs that have defaults.
 * @returns {string[]}
 */
export function getAllDefaultSlugs() {
  return Object.keys(DEFAULTS)
}
