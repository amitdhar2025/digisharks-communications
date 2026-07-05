/**
 * Maps trash section names (used in the trash_items collection) to the
 * actual MongoDB collection name where the original document lives.
 *
 * When an item is soft-deleted it either:
 *   1. Gets moved to `trash_items` with the section stored as `collectionName`
 *   2. Stays in its original collection with `isDeleted: true`
 *
 * This map lets the restore / permanent-delete APIs locate the original
 * document regardless of which path was used.
 */

/* ── Native MongoDB collections (accessed via getDb()) ── */

export const SECTION_TO_COLLECTION: Record<string, string> = {
  queries: 'queries',
  orders: 'orders',
  blogposts: 'blogposts',
  rss: 'rssfeeds',
  careerjobs: 'careerjobs',
  careerapplications: 'careerapplications',
  subadmins: 'sub_admins',
  seoaudits: 'seoaudits',
  chatbotqa: 'chatbotqas',
  loginlogs: 'login_logs',
  securityattacks: 'security_attacks',
}

/**
 * Human-readable labels for each section (used in toast messages etc.)
 */
export const SECTION_LABELS: Record<string, string> = {
  queries: 'Contact Queries',
  orders: 'Digital Products / Orders',
  blogposts: 'Blog Posts',
  rss: 'RSS Feeds',
  careerjobs: 'Career / Job Listings',
  careerapplications: 'Job Applications',
  subadmins: 'Sub-Admins',
  seoaudits: 'SEO Audits',
  loginlogs: 'Login Logs',
  securityattacks: 'Security Attacks',
  chatbotqa: 'Chatbot Q&A',
}

/**
 * Get the MongoDB collection name for a given section.
 * Returns null if the section is unknown.
 */
export function getCollectionForSection(section: string): string | null {
  return SECTION_TO_COLLECTION[section] ?? null
}

/**
 * Get all known section names.
 */
export function getAllSections(): string[] {
  return Object.keys(SECTION_TO_COLLECTION)
}
