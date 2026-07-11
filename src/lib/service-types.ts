/**
 * Service Item Types
 *
 * Shared type definition for service items used across the chatbot,
 * admin init endpoint, and services API route. Includes a runtime
 * type guard and a safe-coercion helper that ensures `pageUrl`
 * is always present at compile time and runtime.
 */

export interface ServiceItem {
  id: string
  label: string
  icon: string
  path: string
  pageUrl: string
  keywords: string[]
}

/**
 * Runtime type guard — returns true if the given value is a valid ServiceItem
 * with a non-empty `pageUrl`.
 */
export function isValidServiceItem(obj: unknown): obj is ServiceItem {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  return (
    typeof o.id === 'string' && o.id.trim().length > 0 &&
    typeof o.label === 'string' && o.label.trim().length > 0 &&
    typeof o.icon === 'string' && o.icon.trim().length > 0 &&
    typeof o.path === 'string' && o.path.trim().length > 0 &&
    typeof o.pageUrl === 'string' &&
    o.pageUrl.trim().length > 0 &&
    Array.isArray(o.keywords)
  )
}

/**
 * Coerce a raw object into a valid ServiceItem.
 * Uses `isValidServiceItem` for field validation, then falls back
 * `pageUrl` to `path` if the strict guard rejects it for missing pageUrl.
 * If required fields are missing entirely, returns null.
 */
export function toServiceItem(raw: unknown): ServiceItem | null {
  if (isValidServiceItem(raw)) return raw
  // If the strict guard fails, try filling in a missing pageUrl from path
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = o.id as string | undefined
  const label = o.label as string | undefined
  const icon = o.icon as string | undefined
  const path = o.path as string | undefined
  const keywords = o.keywords as string[] | undefined
  if (!id || !label || !icon || !path || !Array.isArray(keywords)) return null
  const rawUrl = o.pageUrl as string | undefined
  const pageUrl = rawUrl?.trim() || path
  return { id, label, icon, path, pageUrl, keywords }
}

/**
 * Map an array of raw objects into ServiceItem[], dropping invalid entries
 * and ensuring every item has a `pageUrl` (falling back to `path`).
 */
export function toServiceItems(raw: unknown[]): ServiceItem[] {
  return raw.map(toServiceItem).filter((s): s is ServiceItem => s !== null)
}
