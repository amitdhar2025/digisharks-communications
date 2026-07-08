/**
 * Unit tests for the chatbot matching algorithm.
 *
 * Tests are pure functions and do NOT require MongoDB or a test framework.
 * Run with: npx tsx src/__tests__/chatbot-match.test.ts
 * Or:       npx tsx --test src/__tests__/chatbot-match.test.ts (Node 22+)
 * Basic:    node --experimental-strip-types src/__tests__/chatbot-match.test.ts
 */

import {
  meaningfulWords,
  escapeRegex,
  wordBoundaryTest,
  findExactMatch,
  findFuseBest,
  scoreItems,
  findBestScored,
  wordsMatch,
  countOverlap,
  ACRONYM_WHITELIST,
  type QAPlain,
} from '../lib/chatbot-match'

// ── Helpers ────────────────────────────────────────────────────────────

function makeItem(
  question: string,
  answer: string = 'Test answer.',
  category: string = 'test',
): QAPlain {
  return {
    _id: String(Math.random()),
    question,
    answer,
    category,
    isActive: true,
    hitCount: 0,
  }
}

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

function assertDeepEqual<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a === b) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: ${b}`)
    console.error(`     actual:   ${a}`)
  }
}

// ── Tests: meaningfulWords ─────────────────────────────────────────────

console.log('\n📋 meaningfulWords')

// Basic extraction
assertDeepEqual(
  meaningfulWords('What services do you offer'),
  ['services', 'offer'],
  'extracts meaningful words, filters stop words',
)

// Handles short words
assertDeepEqual(
  meaningfulWords('SEO cost'),
  ['seo', 'cost'],
  'keeps 3+ char words',
)

assertDeepEqual(
  meaningfulWords('a an is at'),
  [],
  'filters all stop / short words',
)

// Strips non-alphanumeric and handles stop words like "hello"
assertDeepEqual(
  meaningfulWords('Hello!!! (world)'),
  ['world'],
  '"hello" is a stop word, "world" is kept after stripping parentheses',
)

// Empty / edge cases
assertDeepEqual(meaningfulWords(''), [], 'empty string returns []')
assertDeepEqual(meaningfulWords('   '), [], 'whitespace-only returns []')
assertDeepEqual(meaningfulWords('hi there'), ['there'], 'short word "hi" filtered')

// Domain-specific words preserved
assertDeepEqual(
  meaningfulWords('blockchain SEO website PR'),
  ['blockchain', 'seo', 'website', 'pr'],
  'domain words like seo/website are preserved; pr now kept via acronym whitelist',
)

// Short acronym whitelist
assertDeepEqual(
  meaningfulWords('PR and AI services'),
  ['pr', 'ai', 'services'],
  'keeps pr and ai via ACRONYM_WHITELIST',
)

assert(ACRONYM_WHITELIST.has('pr'), 'pr is in acronym whitelist')
assert(ACRONYM_WHITELIST.has('ai'), 'ai is in acronym whitelist')
assert(!ACRONYM_WHITELIST.has('seo'), 'seo is not in whitelist (already ≥3 chars)')

// ── Tests: escapeRegex ─────────────────────────────────────────────────

console.log('\n📋 escapeRegex')

assertEqual(escapeRegex('hello world'), 'hello world', 'normal text unchanged')
assertEqual(escapeRegex('.'), '\\.', 'escapes dot')
assertEqual(escapeRegex('*'), '\\*', 'escapes asterisk')
assertEqual(escapeRegex('?'), '\\?', 'escapes question mark')
assertEqual(escapeRegex('(test)'), '\\(test\\)', 'escapes parentheses')
assertEqual(escapeRegex('[abc]'), '\\[abc\\]', 'escapes brackets')
assertEqual(escapeRegex('cost$'), 'cost\\$', 'escapes dollar sign')
assertEqual(escapeRegex(''), '', 'empty string returns empty')

// ── Tests: wordsMatch ──────────────────────────────────────────────────

console.log('\n📋 wordsMatch')

assert(wordsMatch('hello', 'hello'), 'exact match same word')
assert(wordsMatch('service', 'services'), 'matches singular to regular plural')
assert(wordsMatch('services', 'service'), 'matches regular plural to singular')
assert(wordsMatch('campaign', 'campaigns'), 'matches campaign to campaigns')
assert(wordsMatch('campaigns', 'campaign'), 'matches campaigns to campaign')
assert(wordsMatch('box', 'boxes'), 'matches -es plural')
assert(wordsMatch('boxes', 'box'), 'matches -es plural reverse')
assert(wordsMatch('city', 'cities'), 'matches -ies plural (y → ies)')
assert(wordsMatch('cities', 'city'), 'matches -ies plural reverse')
assert(!wordsMatch('cat', 'category'), 'does not match unrelated words')
assert(wordsMatch('cat', 'cats'), 'matches cat to cats')  // 3-char root + s strips correctly
assert(wordsMatch('press', 'press'), 'ss-ending word matches itself')
assert(!wordsMatch('press', 'pressed'), 'ss word does not match -ed variant')

// ── Tests: countOverlap ────────────────────────────────────────────────

console.log('\n📋 countOverlap')

// Exact matches
assertEqual(countOverlap(['seo', 'cost'], ['seo', 'cost']), 2, 'exact overlap counts both')
// Singular/plural matches
assertEqual(countOverlap(['service', 'campaign'], ['services', 'campaigns']), 2, 'plural-aware overlap')
assertEqual(countOverlap(['services', 'campaigns'], ['service', 'campaign']), 2, 'reverse plural-aware overlap')
// No overlap
assertEqual(countOverlap(['pizza'], ['seo']), 0, 'no overlap returns 0')
// Empty
assertEqual(countOverlap([], ['seo']), 0, 'empty qWords returns 0')
assertEqual(countOverlap(['seo'], []), 0, 'empty userWords returns 0')

// ── Tests: wordBoundaryTest ────────────────────────────────────────────

console.log('\n📋 wordBoundaryTest')

assert(wordBoundaryTest('seo', 'we offer seo services'), 'matches "seo" in middle of text')
assert(wordBoundaryTest('seo', 'SEO is great'), 'case insensitive: "SEO" matches')
assert(wordBoundaryTest('cost', 'what is the cost?'), 'matches "cost" before punctuation')
assert(wordBoundaryTest('offer', 'what do you offer'), 'matches "offer" at end of text')
assert(wordBoundaryTest('services', 'Services'), 'matches "Services" at start')
assert(!wordBoundaryTest('cos', 'cost'), 'does NOT match partial word "cos" in "cost"')
assert(!wordBoundaryTest('off', 'offer'), 'does NOT match partial word "off" in "offer"')
assert(!wordBoundaryTest('xyz', 'nothing here'), 'does NOT match absent word')

// ── Tests: findExactMatch ──────────────────────────────────────────────

console.log('\n📋 findExactMatch')

const sampleItems = [
  makeItem('What services do you offer?', 'We offer many services.'),
  makeItem('What is the cost of SEO services?', 'SEO package is Rs 2,40,000.'),
  makeItem('Do you build websites?', 'Yes we build websites.'),
  makeItem('Contact us', 'Call +91 96273 32332.'),
]

// Exact match with trailing "?" — user omits punctuation
const match1 = findExactMatch(sampleItems, 'What services do you offer')
assert(match1 !== undefined, 'finds exact match when user omits trailing "?"')
assertEqual(match1?.question, 'What services do you offer?', 'returns correct item')

// Exact match identical
const match2 = findExactMatch(sampleItems, 'Do you build websites?')
assert(match2 !== undefined, 'finds exact match with identical text')
assertEqual(match2?.question, 'Do you build websites?', 'returns correct item')

// Case insensitive
const match3 = findExactMatch(sampleItems, 'what services do you offer?')
assert(match3 !== undefined, 'case insensitive exact match')
assertEqual(match3?.question, 'What services do you offer?', 'returns correct item')

// DB question contained in user query (user asks longer question)
const match4 = findExactMatch(sampleItems, 'How can I Contact us please?')
assert(match4 !== undefined, 'finds match when DB question is substring of user query')
assertEqual(match4?.question, 'Contact us', 'returns the shorter question')

// No match
const match5 = findExactMatch(sampleItems, 'pizza delivery')
assert(match5 === undefined, 'returns undefined for unrelated query')

// Empty items
const match6 = findExactMatch([], 'test')
assert(match6 === undefined, 'returns undefined for empty items array')

// ── Tests: findFuseBest ────────────────────────────────────────────────

console.log('\n📋 findFuseBest')

// Simulate Fuse.js results
const fuseItems = [
  { item: makeItem('What services do you offer?', 'Many services.'), score: 0.05 },
  { item: makeItem('What is SEO?', 'SEO is...'), score: 0.35 },
  { item: makeItem('Do you build websites?', 'Yes.'), score: 0.45 },
]

const userWords = meaningfulWords('services offer')

// Best match has good score and shared words
const best1 = findFuseBest(fuseItems, userWords)
assert(best1 !== undefined, 'finds best Fuse match')
assertEqual(best1?.question, 'What services do you offer?', 'returns highest-scoring relevant item')

// All items have scores above threshold
const bad = findFuseBest(
  [
    { item: makeItem('Test'), score: 0.6 },
    { item: makeItem('Test two'), score: 0.7 },
  ],
  ['test'],
)
assert(bad === undefined, 'returns undefined if all scores exceed threshold')

// Prefers higher overlap over first result with lower Fuse score
const overlapResults = [
  // Fuse rank #1: "pause campaign" — 1 word overlap (campaign), best Fuse score (0.2)
  { item: makeItem('Can I pause my campaign?', 'We can pause campaigns.'), score: 0.2 },
  // Fuse rank #2: "campaign service election" — 3 words overlap, worse Fuse score (0.4)
  { item: makeItem('What campaign service election do you offer?', 'Our political services include...'), score: 0.4 },
  // Fuse rank #3: "election campaigns" — 2 words overlap (campaigns ↔ campaign), worst Fuse score (0.45)
  { item: makeItem('Do you offer election campaigns?', 'Yes we serve elections.'), score: 0.45 },
]
const bestOverlap = findFuseBest(overlapResults, ['election', 'campaign', 'service'])
assert(bestOverlap !== undefined, 'finds best overlap match')
assertEqual(bestOverlap?.question, 'What campaign service election do you offer?', 'prefers higher overlap (3 shared words) over lower Fuse score')

// No shared words
const noOverlap = findFuseBest(
  [
    { item: makeItem('What is the weather?'), score: 0.1 },
  ],
  ['services', 'offer'],
)
assert(noOverlap === undefined, 'returns undefined if no shared meaningful words')

// When overlap is equal, prefers better (lower) Fuse score
// Both items share exactly 1 word ("services") with user words
const tiebreak = [
  { item: makeItem('services and marketing', 'Answer.'), score: 0.3 },
  { item: makeItem('services and branding', 'Answer.'), score: 0.2 },
]
const tieBest = findFuseBest(tiebreak, ['services', 'seo'])
assert(tieBest !== undefined, 'finds tiebreak match')
assertEqual(tieBest?.question, 'services and branding', 'tiebreak by lower fuse score when overlap equal')

// Empty results
const empty = findFuseBest([], ['test'])
assert(empty === undefined, 'returns undefined for empty results')

// Undefined score
const undefScore = findFuseBest(
  [{ item: makeItem('Test'), score: undefined }],
  ['test'],
)
assert(undefScore === undefined, 'handles undefined score gracefully')

// Plural-aware: "campaigns" matches "campaign" via wordsMatch
const pluralOverlap = findFuseBest(
  [
    { item: makeItem('What campaign service do you offer?', 'Answer.'), score: 0.3 },
  ],
  ['campaigns', 'services'],
)
assert(pluralOverlap !== undefined, 'finds match with plural user word')
assertEqual(pluralOverlap?.question, 'What campaign service do you offer?', 'plural "campaigns" matches singular "campaign"')

// ── Tests: scoreItems ──────────────────────────────────────────────────

console.log('\n📋 scoreItems')

const scoringItems = [
  makeItem('What services do you offer?', 'We offer SEO and marketing services.'),
  makeItem('What is the cost of SEO services?', 'SEO package is Rs 2,40,000'),
  makeItem('Do you build websites?', 'Yes, we build responsive websites.'),
  makeItem('How to contact DigiSharks', 'Call +91 96273 32332'),
]

// "What services do you offer" → userWords = ["services", "offer"]
const sw = meaningfulWords('What services do you offer')
const s1 = scoreItems(scoringItems, sw)

assert(s1.length === 4, 'scores all items')
assert(s1[0].score >= 0, 'score is non-negative')

const first = s1.find((s) => s.item.question === 'What services do you offer?')
assert(first !== undefined, 'services question is scored')
assertEqual(first!.questionMatches, 2, 'both "services" and "offer" match in question')
assertEqual(first!.answerMatches, 2, 'both words match in answer too')
assertEqual(first!.score, 10, 'score = 2*4 + 2*1 = 10')
assertEqual(first!.sharedTokens, 2, '2 shared tokens')
assert(first!.sharedTokens >= 1 && first!.questionMatches >= 1 && first!.score >= 3, 'passes quality gate')

// "SEO cost" → userWords = ["seo", "cost"]
const sw2 = meaningfulWords('SEO cost')
const s2 = scoreItems(scoringItems, sw2)

const seoCost = s2.find((s) => s.item.question === 'What is the cost of SEO services?')
assert(seoCost !== undefined, 'seo cost question is scored')
assertEqual(seoCost!.questionMatches, 2, 'both "seo" and "cost" match in question')
assertEqual(seoCost!.score, 9, 'score = 2*4 + 1*1 = 9 (cost not in answer)')
assert(seoCost!.sharedTokens >= 1 && seoCost!.questionMatches >= 1 && seoCost!.score >= 3, 'passes quality gate')

// Unrelated query → low scores
const sw3 = meaningfulWords('pizza delivery food')
const s3 = scoreItems(scoringItems, sw3)
const allZero = s3.every((s) => s.score < 3)
assert(allZero, 'unrelated query scores below quality gate for all items')

// ── Tests: findBestScored ──────────────────────────────────────────────

console.log('\n📋 findBestScored')

// Returns best match from scored items
const scored1 = scoreItems(scoringItems, meaningfulWords('services offer'))
const bestScored1 = findBestScored(scored1)
assert(bestScored1 !== undefined, 'finds best scored match')
assertEqual(bestScored1!.item.question, 'What services do you offer?', 'returns highest scoring item')

// Returns undefined when no candidates pass the gate
const scored2 = scoreItems(scoringItems, meaningfulWords('pizza delivery'))
const bestScored2 = findBestScored(scored2)
assert(bestScored2 === undefined, 'returns undefined when no candidates pass quality gate')

// Returns undefined for empty array
const bestScored3 = findBestScored([])
assert(bestScored3 === undefined, 'returns undefined for empty array')

// Sorts by score desc, then sharedTokens desc
const items = [
  makeItem('A', 'answer here'),
  makeItem('B', 'answer here'),
]
const customScores = [
  { item: items[0], score: 10, questionMatches: 2, answerMatches: 2, sharedTokens: 2 },
  { item: items[1], score: 10, questionMatches: 2, answerMatches: 2, sharedTokens: 3 },
]
const bestScored4 = findBestScored(customScores)
assert(bestScored4 !== undefined, 'finds best with tiebreak')
assertEqual(bestScored4!.item.question, 'B', 'higher sharedTokens wins tiebreak')

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
