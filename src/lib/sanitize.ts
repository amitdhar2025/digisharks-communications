/**
 * Strip all HTML tags from a user-supplied text string before it reaches
 * the database. This is a defence-in-depth measure against XSS attacks
 * in fields that should only contain plain text (names, messages, etc.).
 *
 * For rich-text / HTML content (e.g. blog post bodies) use a dedicated
 * library such as DOMPurify (isomorphic-dompurify) instead.
 */

/**
 * Remove every HTML tag from `input`, returning only the raw text content.
 *
 * - Handles edge-cases like `&lt;` entities, broken tags, and script
 *   injection attempts.
 * - Returns an empty string for falsy / non-string input.
 */
export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') return ''

  // Step 1: Decode common HTML entities so text like "&lt;script&gt;"
  //         becomes "<script>" before stripping.
  let text = input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')

  // Step 2: Remove all HTML tags (including self-closing, broken, etc.)
  text = text.replace(/<[^>]*>/g, '')

  // Step 3: Collapse multiple whitespace characters into a single space
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

/**
 * Sanitize all common plain-text fields in a body object.
 * Returns a new object with sanitized values.
 */
export function sanitizePlainTextFields<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[],
): T {
  const sanitized = { ...body }
  for (const field of fields) {
    const value = sanitized[field]
    if (typeof value === 'string') {
      sanitized[field] = stripHtml(value) as any
    }
  }
  return sanitized
}
