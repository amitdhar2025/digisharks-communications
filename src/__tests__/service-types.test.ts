/**
 * Unit tests for `isValidServiceItem`, `toServiceItem`, and `toServiceItems`
 * from `src/lib/service-types.ts`.
 *
 * Tests the runtime type guard, the safe-coercion helper (including the
 * `pageUrl` → `path` fallback), and the array mapper.
 *
 * Run: npx tsx src/__tests__/service-types.test.ts
 */

import {
  isValidServiceItem,
  toServiceItem,
  toServiceItems,
  type ServiceItem,
} from '../lib/service-types'

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
  }
}

function assertTrue(value: boolean, label: string) {
  assert(value === true, label)
}

function assertFalse(value: boolean, label: string) {
  assert(value === false, label)
}

function assertNull(value: unknown, label: string) {
  assert(value === null, label)
}

function assertNonNull(value: unknown, label: string) {
  assert(value !== null, label)
}

function assertDeepEqual<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`       expected: ${e}`)
    console.error(`       actual:   ${a}`)
  }
}

// ── Valid service item fixture ───────────────────────────────────────

const VALID_SERVICE: Record<string, unknown> = {
  id: 'test-service',
  label: 'Test Service',
  icon: '🔬',
  path: '/test-service/',
  pageUrl: '/test-service/',
  keywords: ['test', 'service'],
}

const VALID_SERVICE_NO_PAGEURL: Record<string, unknown> = {
  id: 'no-page',
  label: 'No PageUrl',
  icon: '🚫',
  path: '/fallback-service/',
  keywords: ['no', 'pageurl'],
}

// ── isValidServiceItem ───────────────────────────────────────────────

console.log('\nisValidServiceItem — invalid inputs (should return false)')

assertFalse(isValidServiceItem(undefined), 'undefined returns false')
assertFalse(isValidServiceItem(null), 'null returns false')
assertFalse(isValidServiceItem(42), 'number returns false')
assertFalse(isValidServiceItem('string'), 'string returns false')
assertFalse(isValidServiceItem(true), 'boolean returns false')
assertFalse(isValidServiceItem([]), 'empty array returns false')

console.log('\nisValidServiceItem — missing fields (should return false)')

assertFalse(isValidServiceItem({ ...VALID_SERVICE, id: undefined }), 'missing id returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, id: '' }), 'empty id returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, label: undefined }), 'missing label returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, icon: undefined }), 'missing icon returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, path: undefined }), 'missing path returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, pageUrl: undefined }), 'missing pageUrl returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, pageUrl: '' }), 'empty pageUrl returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, pageUrl: '   ' }), 'whitespace-only pageUrl returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, keywords: undefined }), 'missing keywords returns false')
assertFalse(isValidServiceItem({ ...VALID_SERVICE, keywords: 'not-an-array' }), 'keywords as string returns false')

console.log('\nisValidServiceItem — valid input (should return true)')

assertTrue(isValidServiceItem({ ...VALID_SERVICE }), 'complete valid service returns true')

// ── toServiceItem ────────────────────────────────────────────────────

console.log('\ntoServiceItem — invalid inputs (should return null)')

assertNull(toServiceItem(undefined), 'undefined returns null')
assertNull(toServiceItem(null), 'null returns null')
assertNull(toServiceItem(42), 'number returns null')
assertNull(toServiceItem('string'), 'string returns null')
assertNull(toServiceItem(true), 'boolean returns null')
assertNull(toServiceItem([]), 'empty array returns null')
assertNull(toServiceItem({}), 'empty object returns null')
assertNull(toServiceItem({ id: 'partial' }), 'partial object (only id) returns null')

console.log('\ntoServiceItem — missing required fields (should return null)')

assertNull(toServiceItem({ ...VALID_SERVICE, id: undefined }), 'missing id returns null')
assertNull(toServiceItem({ ...VALID_SERVICE, label: undefined }), 'missing label returns null')
assertNull(toServiceItem({ ...VALID_SERVICE, icon: undefined }), 'missing icon returns null')
assertNull(toServiceItem({ ...VALID_SERVICE, path: undefined }), 'missing path returns null')
assertNull(toServiceItem({ ...VALID_SERVICE, keywords: undefined }), 'missing keywords returns null')
assertNull(toServiceItem({ ...VALID_SERVICE, keywords: 'not-array' }), 'keywords as string returns null')

console.log('\ntoServiceItem — valid item with pageUrl (should return as-is)')

const withPageUrl = toServiceItem(VALID_SERVICE)
assertNonNull(withPageUrl, 'returns non-null for valid item with pageUrl')
if (withPageUrl) {
  assert(withPageUrl.pageUrl === '/test-service/', 'pageUrl is preserved when present')
  assert(withPageUrl.id === 'test-service', 'id is preserved')
  assert(withPageUrl.path === '/test-service/', 'path is preserved')
  assertDeepEqual(withPageUrl.keywords, ['test', 'service'], 'keywords are preserved')
}

console.log('\ntoServiceItem — valid item without pageUrl (should fall back to path)')

const withFallback = toServiceItem(VALID_SERVICE_NO_PAGEURL)
assertNonNull(withFallback, 'returns non-null for valid item without pageUrl')
if (withFallback) {
  assert(withFallback.pageUrl === '/fallback-service/', 'pageUrl falls back to path')
  assert(withFallback.id === 'no-page', 'id is preserved')
  assert(withFallback.path === '/fallback-service/', 'path is preserved')
  assertDeepEqual(withFallback.keywords, ['no', 'pageurl'], 'keywords are preserved')
}

console.log('\ntoServiceItem — item with empty pageUrl (should fall back to path)')

const withEmptyPageUrl = toServiceItem({
  ...VALID_SERVICE,
  id: 'empty-url',
  label: 'Empty Url',
  icon: '🕳️',
  path: '/empty-url/',
  pageUrl: '',
  keywords: ['empty'],
})
assertNonNull(withEmptyPageUrl, 'returns non-null for item with empty pageUrl')
if (withEmptyPageUrl) {
  assert(withEmptyPageUrl.pageUrl === '/empty-url/', 'empty pageUrl falls back to path')
  assert(withEmptyPageUrl.id === 'empty-url', 'id is preserved')
}

console.log('\ntoServiceItem — item with whitespace-only pageUrl (should fall back to path)')

const withWhitespaceUrl = toServiceItem({
  ...VALID_SERVICE,
  id: 'whitespace-url',
  label: 'Whitespace Url',
  icon: '⬜',
  path: '/whitespace-url/',
  pageUrl: '   ',
  keywords: ['whitespace'],
})
assertNonNull(withWhitespaceUrl, 'returns non-null for item with whitespace pageUrl')
if (withWhitespaceUrl) {
  assert(withWhitespaceUrl.pageUrl === '/whitespace-url/', 'whitespace pageUrl falls back to path')
}

console.log('\ntoServiceItem — item with explicit pageUrl matching path')

const sameAsPath = toServiceItem({
  id: 'same',
  label: 'Same',
  icon: '🔄',
  path: '/same/',
  pageUrl: '/same/',
  keywords: ['same'],
})
assertNonNull(sameAsPath, 'returns non-null for item with matching pageUrl')
if (sameAsPath) {
  assert(sameAsPath.pageUrl === '/same/', 'pageUrl matches path when explicitly set')
}

// ── toServiceItems ───────────────────────────────────────────────────

console.log('\ntoServiceItems — edge cases')

assertDeepEqual(toServiceItems([]), [], 'empty array returns []')

const allInvalid = toServiceItems([undefined, null, {}, { id: 'partial' }] as unknown[])
assertDeepEqual(allInvalid, [], 'all invalid items returns []')

console.log('\ntoServiceItems — mixed valid and invalid')

const mixed = toServiceItems([
  VALID_SERVICE,
  null,
  VALID_SERVICE_NO_PAGEURL,
  { id: 'incomplete' },
  {
    id: 'another',
    label: 'Another',
    icon: '➕',
    path: '/another/',
    pageUrl: '/another/',
    keywords: ['another'],
  },
] as unknown[])

assert(mixed.length === 3, `mixed array returns 3 valid items (got ${mixed.length})`)
if (mixed.length >= 3) {
  // First item — complete with pageUrl
  assert(mixed[0].pageUrl === '/test-service/', 'first item has original pageUrl')
  assert(mixed[0].id === 'test-service', 'first item has original id')

  // Second item — fell back to path
  assert(mixed[1].pageUrl === '/fallback-service/', 'second item has pageUrl from path fallback')
  assert(mixed[1].id === 'no-page', 'second item has original id')

  // Third item — complete with pageUrl
  assert(mixed[2].pageUrl === '/another/', 'third item has original pageUrl')
  assert(mixed[2].id === 'another', 'third item has original id')
}

console.log('\ntoServiceItems — all valid items with pageUrl')

const allValid = toServiceItems([
  VALID_SERVICE,
  {
    id: 'service-2',
    label: 'Service 2',
    icon: '2️⃣',
    path: '/service-2/',
    pageUrl: '/service-2/',
    keywords: ['two'],
  },
] as unknown[])

assert(allValid.length === 2, 'all valid returns 2 items')
if (allValid.length >= 2) {
  assert(allValid[0].pageUrl === '/test-service/', 'first valid item retains pageUrl')
  assert(allValid[1].pageUrl === '/service-2/', 'second valid item retains pageUrl')
}

console.log('\ntoServiceItems — all items missing pageUrl')

const allFallback = toServiceItems([
  { ...VALID_SERVICE_NO_PAGEURL },
  {
    id: 'second-no-url',
    label: 'Second No Url',
    icon: '2️⃣',
    path: '/second-no-url/',
    keywords: ['second', 'no-url'],
  },
] as unknown[])

assert(allFallback.length === 2, 'all no-pageUrl returns 2 items')
if (allFallback.length >= 2) {
  assert(allFallback[0].pageUrl === '/fallback-service/', 'first fallback uses path')
  assert(allFallback[1].pageUrl === '/second-no-url/', 'second fallback uses path')
}

console.log('\ntoServiceItems — should not mutate the original array')

const original = [
  { ...VALID_SERVICE_NO_PAGEURL },
  { ...VALID_SERVICE },
] as unknown[]
const originalJsonBefore = JSON.stringify(original)
const mapped = toServiceItems(original)
const originalJsonAfter = JSON.stringify(original)
assert(originalJsonBefore === originalJsonAfter, 'original array is not mutated')
assert(mapped.length === 2, 'mapped returns correct count')

// ── Type guard check ─────────────────────────────────────────────────

console.log('\ntoServiceItem — type guard narrows correctly')

const raw: unknown = { ...VALID_SERVICE }
const coerced = toServiceItem(raw)
if (coerced !== null) {
  // TypeScript should narrow `coerced` to `ServiceItem` inside this block
  const serviceItem: ServiceItem = coerced
  assertTrue(true, 'type guard narrows unknown to ServiceItem')
  assert(serviceItem.pageUrl === '/test-service/', 'narrowed ServiceItem has pageUrl')
}

// ── Summary ──────────────────────────────────────────────────────────

console.log('')
console.log('='.repeat(50))
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)
console.log('='.repeat(50))

if (failed > 0) {
  process.exit(1)
}
