/**
 * Unit tests for the `isValidUrl` function.
 *
 * Tests all edge cases: falsy inputs, literal dangerous strings,
 * bare protocol prefixes, dangerous URL schemes, and valid URLs.
 * No test framework required.
 * Run: npx tsx src/__tests__/url-utils.test.ts
 */

import { isValidUrl } from '../lib/url-utils'

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

// ── Tests: Invalid inputs ─────────────────────────────────────────────

console.log('\nisValidUrl — invalid inputs (should return false)')

// undefined / null / non-string
assertFalse(isValidUrl(undefined as any), 'undefined returns false')
assertFalse(isValidUrl(null as any), 'null returns false')
assertFalse(isValidUrl(42 as any), 'number returns false')
assertFalse(isValidUrl(true as any), 'boolean returns false')
assertFalse(isValidUrl({} as any), 'object returns false')
assertFalse(isValidUrl([] as any), 'array returns false')

// Empty / whitespace
assertFalse(isValidUrl(''), 'empty string returns false')
assertFalse(isValidUrl('   '), 'whitespace-only returns false')
assertFalse(isValidUrl(' \t\n '), 'mixed whitespace returns false')

// Literal dangerous strings
assertFalse(isValidUrl('undefined'), "literal 'undefined' returns false")
assertFalse(isValidUrl('null'), "literal 'null' returns false")
assertFalse(isValidUrl('NaN'), "literal 'NaN' returns false")
assertFalse(isValidUrl('  undefined  '), "whitespace-wrapped 'undefined' returns false")
assertFalse(isValidUrl('  null  '), "whitespace-wrapped 'null' returns false")

// Bare protocol prefixes
assertFalse(isValidUrl('http://'), 'bare http:// returns false')
assertFalse(isValidUrl('https://'), 'bare https:// returns false')
assertFalse(isValidUrl('/'), 'bare / returns false')
assertFalse(isValidUrl(' HTTP:// '), 'whitespace-wrapped HTTP:// returns false')
assertFalse(isValidUrl(' HTTPS:// '), 'whitespace-wrapped HTTPS:// returns false')

// Dangerous URL schemes
assertFalse(isValidUrl('javascript:alert(1)'), 'javascript: scheme returns false')
assertFalse(isValidUrl('JavaScript:alert(1)'), 'JavaScript: (capital J) returns false')
assertFalse(isValidUrl('JAVASCRIPT:alert(1)'), 'JAVASCRIPT: (all caps) returns false')
assertFalse(isValidUrl('javascript:void(0)'), 'javascript:void(0) returns false')
assertFalse(isValidUrl('data:text/html,<script>alert("xss")</script>'), 'data: scheme returns false')
assertFalse(isValidUrl('Data:text/plain,hello'), 'Data: (capital D) returns false')
assertFalse(isValidUrl('vbscript:msgbox("xss")'), 'vbscript: scheme returns false')
assertFalse(isValidUrl('VBScript:msgbox("xss")'), 'VBScript: (mixed case) returns false')
assertFalse(isValidUrl('  javascript:alert(1)  '), 'whitespace-wrapped javascript: returns false')

// ── Tests: Valid inputs ────────────────────────────────────────────────

console.log('\nisValidUrl — valid inputs (should return true)')

// Absolute HTTPS URLs
assertTrue(isValidUrl('https://example.com'), 'https://example.com returns true')
assertTrue(isValidUrl('https://www.digisharkscommunications.com'), 'full digisharks URL returns true')
assertTrue(isValidUrl('https://example.com/path/to/page'), 'HTTPS with path returns true')
assertTrue(isValidUrl('https://example.com?query=param&key=value'), 'HTTPS with query params returns true')
assertTrue(isValidUrl('https://example.com/page#section'), 'HTTPS with hash returns true')
assertTrue(isValidUrl('https://example.com:8080/path'), 'HTTPS with port returns true')

// Absolute HTTP URLs
assertTrue(isValidUrl('http://example.com'), 'http://example.com returns true')

// Relative paths
assertTrue(isValidUrl('/about-us'), '/about-us returns true')
assertTrue(isValidUrl('/contact-us/'), '/contact-us/ (with trailing slash) returns true')
assertTrue(isValidUrl('/digital-marketing-agency/'), '/digital-marketing-agency/ returns true')
assertTrue(isValidUrl('/press-release/'), '/press-release/ returns true')
assertTrue(isValidUrl('/services-top-pr-digital-marketing/'), 'services page path returns true')
assertTrue(isValidUrl('/blog/some-post-title'), 'blog post path returns true')
assertTrue(isValidUrl('/digital-products/some-product'), 'product path returns true')

// Special valid URL schemes
assertTrue(isValidUrl('tel:+919627332332'), 'tel: scheme returns true')
assertTrue(isValidUrl('mailto:test@example.com'), 'mailto: scheme returns true')
assertTrue(isValidUrl('mailto:marketing@digisharkscommunications.com'), 'mailto digisharks returns true')

// URLs with special characters
assertTrue(isValidUrl('https://example.com/path%20with%20spaces'), 'URL with percent-encoding returns true')
assertTrue(isValidUrl('https://example.com/path-with-dashes'), 'URL with dashes returns true')
assertTrue(isValidUrl('https://example.com/path_with_underscores'), 'URL with underscores returns true')

// ── Type guard check ───────────────────────────────────────────────────

console.log('\nisValidUrl — type guard')

// Verify the type guard narrows correctly
function acceptStringOnly(_: string) {}

const testUrl: string | undefined = 'https://example.com'
if (isValidUrl(testUrl)) {
  // TypeScript should narrow this to `string`
  acceptStringOnly(testUrl)
  assertTrue(true, 'type guard narrows string | undefined to string')
}

const testUrl2: string | null | undefined = null
if (!isValidUrl(testUrl2)) {
  assertTrue(true, 'type guard rejects null')
}

// ── Summary ────────────────────────────────────────────────────────────

console.log('')
console.log('='.repeat(50))
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)
console.log('='.repeat(50))

if (failed > 0) {
  process.exit(1)
}
