/**
 * Blog Page — Content & Data
 *
 * Centralised content defaults used by the blog listing page.
 * Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface BlogContent {
  heroHeading: string
  heroDescription: string
  heroImage: string
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: BlogContent = {
  heroHeading: 'Digisharks Blog',
  heroDescription: 'Insights, analysis, and stories on digital PR, marketing, technology, and business growth.',
  heroImage: '/blog.webp',
}
