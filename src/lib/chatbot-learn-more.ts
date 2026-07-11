/**
 * Chatbot Learn More — category-to-service URL mapping and link appending logic.
 * Extracted from the query route for independent unit testing.
 */

/** Category → Service URL mapping */
export const CATEGORY_URLS: Record<string, { label: string; url: string }> = {
  'digital-pr': { label: 'Digital PR & Media Coverage', url: '/press-release/' },
  'seo-ppc': { label: 'SEO & PPC Services', url: '/digital-marketing-agency/' },
  'social-media': { label: 'Social Media Marketing', url: '/social-media/' },
  'web-development': { label: 'Web Development Services', url: '/web-development/' },
  'political': { label: 'Political Campaign Management', url: '/contact-us/' },
  'reputation-management': { label: 'Reputation Management', url: '/contact-us/' },
  'pricing': { label: 'Services & Pricing', url: '/services-top-pr-digital-marketing/' },
  'products': { label: 'Digital Products', url: '/digital-products/' },
  'about': { label: 'About DigiSharks', url: '/about-us/' },
  'contact': { label: 'Contact Us', url: '/contact-us/' },
  'services': { label: 'All Services', url: '/services-top-pr-digital-marketing/' },
  'career': { label: 'Careers at DigiSharks', url: '/contact-us/' },
  'ai-seo-aeo-geo': { label: 'AI SEO & AEO Services', url: '/digital-marketing-agency/' },
  'seo-audit': { label: 'Free SEO Audit', url: '/contact-us/' },
  'brand-promotion': { label: 'Brand Promotion', url: '/brand-promotion/' },
  'default': { label: 'DigiSharks Services', url: '/services-top-pr-digital-marketing/' },
}

/**
 * Append a "Learn more" markdown link to the end of the answer
 * based on the Q&A item's category. Returns the original answer unchanged
 * if the category has no mapping or if a "learn more" link is already present.
 *
 * @param answer - The original answer text
 * @param category - The category of the Q&A item
 * @returns The answer with a "Learn more" link appended, or the original answer
 */
export function appendLearnMore(answer: string, category: string): string {
  // Look up the category mapping; fall back to the default entry
  const service = CATEGORY_URLS[category] || CATEGORY_URLS['default']
  if (!service) return answer
  // Check if a learn more link is already present (with at least one space between words)
  if (/learn\s+more/i.test(answer)) return answer
  // Remove trailing whitespace/punctuation
  const trimmed = answer.replace(/[\s.]+$/, '')
  return `${trimmed}\n\n👉 [Learn more about ${service.label}](${service.url})`
}
