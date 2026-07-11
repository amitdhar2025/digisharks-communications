/**
 * Unit tests for the chatbot "Learn More" link feature.
 *
 * Tests the pure function `appendLearnMore` and the `CATEGORY_URLS` mapping.
 * Does NOT require MongoDB or a test framework.
 * Run: npx tsx src/__tests__/chatbot-learn-more.test.ts
 */

import { appendLearnMore, CATEGORY_URLS } from '../lib/chatbot-learn-more'

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

function assertEqual<T>(actual: T, expected: T, label: string) {
  if (actual === expected) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: ${JSON.stringify(expected)}`)
    console.error(`     actual:   ${JSON.stringify(actual)}`)
  }
}

function assertIncludes(actual: string, expectedSubstring: string, label: string) {
  if (actual.includes(expectedSubstring)) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected to include: ${JSON.stringify(expectedSubstring)}`)
    console.error(`     actual:              ${JSON.stringify(actual)}`)
  }
}

// ── Tests: CATEGORY_URLS mapping ───────────────────────────────────────

console.log('\nCATEGORY_URLS mapping')

assert(typeof CATEGORY_URLS === 'object', 'CATEGORY_URLS is an object')
assert(Object.keys(CATEGORY_URLS).length > 0, 'CATEGORY_URLS has entries')

// Check key categories exist
assert('digital-pr' in CATEGORY_URLS, 'contains digital-pr category')
assert('seo-ppc' in CATEGORY_URLS, 'contains seo-ppc category')
assert('social-media' in CATEGORY_URLS, 'contains social-media category')
assert('web-development' in CATEGORY_URLS, 'contains web-development category')
assert('pricing' in CATEGORY_URLS, 'contains pricing category')
assert('about' in CATEGORY_URLS, 'contains about category')
assert('contact' in CATEGORY_URLS, 'contains contact category')
assert('services' in CATEGORY_URLS, 'contains services category')
assert('products' in CATEGORY_URLS, 'contains products category')

// Each entry has label and url
for (const [key, entry] of Object.entries(CATEGORY_URLS)) {
  assert(typeof entry.label === 'string' && entry.label.length > 0, `${key} has a non-empty label`)
  assert(typeof entry.url === 'string' && entry.url.startsWith('/'), `${key} has a URL starting with /`)
}

// Specific URL values
assertEqual(CATEGORY_URLS['digital-pr'].url, '/press-release/', 'digital-pr maps to /press-release/')
assertEqual(CATEGORY_URLS['seo-ppc'].url, '/digital-marketing-agency/', 'seo-ppc maps to /digital-marketing-agency/')
assertEqual(CATEGORY_URLS['about'].url, '/about-us/', 'about maps to /about-us/')
assertEqual(CATEGORY_URLS['contact'].url, '/contact-us/', 'contact maps to /contact-us/')

// ── Tests: appendLearnMore ─────────────────────────────────────────────

console.log('\nappendLearnMore')

// Appends correctly for known category — uses relative URL
const result1 = appendLearnMore('We offer SEO services.', 'seo-ppc')
assertIncludes(result1, 'Learn more about SEO & PPC Services', 'appends learn-more link for seo-ppc category')
assertIncludes(result1, '(/digital-marketing-agency/)', 'URL is relative path')
assertIncludes(result1, 'We offer SEO services', 'original answer text preserved (period removed by trim)')

// Unknown category falls back to default services page
const result2 = appendLearnMore('Some answer.', 'unknown-category')
assertIncludes(result2, 'Some answer', 'unknown category preserves answer text')
assertIncludes(result2, 'Learn more about DigiSharks Services', 'unknown category uses default fallback')
assertIncludes(result2, '(/services-top-pr-digital-marketing/)', 'default fallback URL is services page')

// Empty category falls back to default services page
const result3 = appendLearnMore('Answer.', '')
assertIncludes(result3, 'Learn more about DigiSharks Services', 'empty category uses default fallback')
assertIncludes(result3, '(/services-top-pr-digital-marketing/)', 'empty category fallback URL is services page')

// Answer already contains "learn more" — should NOT append again
const result4 = appendLearnMore('Click here to learn more about our services.', 'seo-ppc')
assertEqual(result4, 'Click here to learn more about our services.', 'already has learn more, does not append again')

// "Learn More" in various casings
const result5 = appendLearnMore('Check out Learn More on our site.', 'digital-pr')
assertEqual(result5, 'Check out Learn More on our site.', 'Learn More (capitalized) prevents duplicate')

// Answer with trailing punctuation is cleaned
const result6 = appendLearnMore('Call us today!', 'contact')
assertIncludes(result6, 'Call us today!', 'exclamation mark preserved')
assertIncludes(result6, 'Learn more about Contact Us', 'learn more link appended')

// Answer with trailing spaces — regex [\\s.]+$ removes period + spaces
const result7 = appendLearnMore('Thanks for asking.   ', 'services')
assertIncludes(result7, 'Thanks for asking', 'trailing spaces + period removed from answer')
assertIncludes(result7, 'Learn more about All Services', 'learn more link appended after trimmed text')

// Answer ending with newlines — regex [\\s.]+$ removes period + newlines
const result8 = appendLearnMore('Yes we can help.\n\n', 'web-development')
assertIncludes(result8, 'Yes we can help', 'trailing newlines + period removed')
assertIncludes(result8, 'Learn more about Web Development Services', 'learn more link appended')

// Category mapping for all defined categories produces a valid result
for (const category of Object.keys(CATEGORY_URLS)) {
  const r = appendLearnMore(`This is the answer for ${category}.`, category)
  assertIncludes(r, `Learn more about ${CATEGORY_URLS[category].label}`, `category "${category}" appends correct label`)
  assertIncludes(r, `(${CATEGORY_URLS[category].url})`, `category "${category}" appends correct URL`)
}

// Empty answer
const result9 = appendLearnMore('', 'about')
assertIncludes(result9, 'Learn more about About DigiSharks', 'empty answer still gets learn more link')

// Answer with just whitespace
const result10 = appendLearnMore('   ', 'about')
assertIncludes(result10, 'Learn more about About DigiSharks', 'whitespace-only answer still gets learn more link')

// Answer containing "learnmore" (no space) — should NOT be treated as matching
const result11 = appendLearnMore('Visit our learnmore page.', 'seo-ppc')
assertIncludes(result11, 'Learn more about SEO & PPC Services', 'learnmore (no space) does not prevent appending')

// Answer with "Learn More" at the end
const result12 = appendLearnMore('Contact us to Learn More', 'contact')
assertEqual(result12, 'Contact us to Learn More', '"Learn More" at end still detected')

// Answer with no trailing period stays unchanged before learn more link
const result13 = appendLearnMore('Get in touch', 'contact')
assertIncludes(result13, 'Get in touch', 'no-trailing-period answer preserved')
assertIncludes(result13, 'Learn more about Contact Us', 'link appended after no-period answer')

// Answer with only a period
const result14 = appendLearnMore('.', 'about')
assertIncludes(result14, 'Learn more about About DigiSharks', 'period-only answer gets link (period trimmed)')
// The period is trimmed by [\\s.]+$, so the answer becomes empty + link

// Multiple periods at end
const result15 = appendLearnMore('Read more...', 'about')
assertIncludes(result15, 'Read more', 'multiple periods trimmed')
assertIncludes(result15, 'Learn more about About DigiSharks', 'link appended after trimmed answer')

// Answer with newlines then period
const result16 = appendLearnMore('Answer\n.', 'about')
assertIncludes(result16, 'Learn more about About DigiSharks', 'newline-then-period trimmed')
assertIncludes(result16, 'Answer', 'answer text preserved')

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
