/**
 * URL Validation Utilities
 *
 * Shared module for validating URLs before rendering them as clickable links.
 * Guards against undefined/null/, the literal strings "undefined"/"null"/"NaN",
 * bare protocol prefixes, and dangerous URL schemes (javascript:, data:, vbscript:).
 */

/** Returns true if a URL is safe to render as a clickable link. */
export function isValidUrl(url: string | undefined | null): url is string {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false
  // Guard against literal "undefined"/"null"/"NaN" strings
  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN') return false
  // Guard against bare protocol prefixes (case-insensitive)
  const lower = trimmed.toLowerCase()
  if (lower === 'http://' || lower === 'https://' || trimmed === '/') return false
  // Guard against dangerous URL schemes
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false
  return true
}
