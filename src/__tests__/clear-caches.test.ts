/**
 * Unit tests for the cache clearing logic.
 *
 * Tests the pure function `clearAllCaches` behavior.
 * Does NOT require MongoDB or a test framework.
 * Run: npx tsx src/__tests__/clear-caches.test.ts
 */

import { clearAllCaches } from '../lib/clear-caches'

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

// ── Tests: clearAllCaches ────────────────────────────────────────────────

console.log('\n📋 clearAllCaches')

// Returns an array of result messages
const results1 = clearAllCaches()
assert(Array.isArray(results1), 'returns an array')
assert(results1.length > 0, 'returns at least one result message')

// All results are strings
results1.forEach((r, i) => {
  assert(typeof r === 'string', `result[${i}] is a string`)
  assert(r.length > 0, `result[${i}] is non-empty`)
})

// Should contain a Next.js cache revalidation message
const hasRevalidation = results1.some(r => r.includes('Next.js') || r.includes('cache'))
assert(hasRevalidation, 'includes cache-related message')

// Should contain a global cache message
const hasGlobal = results1.some(r => r.includes('cache'))
assert(hasGlobal, 'includes global cache message')

// ── Twice: idempotent ──────────────────────────────────────────────────

console.log('\n📋 clearAllCaches (idempotency)')

// Running twice should work without errors
const results2a = clearAllCaches()
const results2b = clearAllCaches()
assert(Array.isArray(results2a), 'first call returns array')
assert(Array.isArray(results2b), 'second call returns array')
assert(results2a.length > 0, 'first call has results')
assert(results2b.length > 0, 'second call has results')

// ── Global cache registry ──────────────────────────────────────────────

console.log('\n📋 clearAllCaches (global cache registry)')

// Register a test cache with data
if (!global.__appCaches) {
  global.__appCaches = new Map()
}
const testCache = new Map<string, string>()
testCache.set('test-key', 'test-value')
global.__appCaches.set('test-bucket', testCache)

// Verify it's there before clearing
assert(global.__appCaches.has('test-bucket'), 'test cache registered before clearing')
assert(global.__appCaches.get('test-bucket')?.size === 1, 'test cache has 1 entry before clear')

// Clear and verify
const results3 = clearAllCaches()
assert(!global.__appCaches || global.__appCaches.size === 0,
  'outer registry map is cleared')
assert(testCache.size === 0, 'individual cache store is also cleared (not just the registry)')

// Should report the cleared count
const clearedMsg = results3.find(r => r.includes('Cleared'))
assert(clearedMsg !== undefined, 'reports cleared cache count')
assert(typeof clearedMsg === 'string' && clearedMsg.length > 0, 'cleared message is non-empty')
assert(clearedMsg!.includes('stores emptied'), 'message confirms individual stores were emptied')

// New cache instances registered after clearing
global.__appCaches = new Map()
const secondCache = new Map<string, number>()
secondCache.set('data', 42)
global.__appCaches.set('second-bucket', secondCache)

const results4 = clearAllCaches()
assert(!global.__appCaches || global.__appCaches.size === 0,
  'clears subsequently registered caches too')
assert(secondCache.size === 0, 'second cache store is also cleared')

// ── No global caches registered ────────────────────────────────────────

console.log('\n📋 clearAllCaches (no caches)')

// Remove global caches
delete (global as any).__appCaches

const results5 = clearAllCaches()
assert(Array.isArray(results5), 'returns array even with no caches')
assert(results5.length > 0, 'returns results even with no caches')

// ── Summary ────────────────────────────────────────────────────────────

console.log('')
console.log('='.repeat(50))
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📊 Total:  ${passed + failed}`)
console.log('='.repeat(50))

if (failed > 0) {
  process.exit(1)
}
