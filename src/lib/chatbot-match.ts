/**
 * Pure matching functions for the chatbot Q&A algorithm.
 * Extracted from the query route for independent unit testing.
 */

// ── Stop words ─────────────────────────────────────────────────────────
export const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was',
  'one', 'our', 'out', 'has', 'have', 'been', 'some', 'them', 'than', 'what', 'when',
  'who', 'will', 'your', 'about', 'into', 'over', 'like', 'just', 'also', 'very',
  'with', 'from', 'that', 'this', 'they', 'were', 'does', 'their', 'which', 'would',
  'could', 'should', 'make', 'made', 'more', 'most', 'other', 'after', 'then', 'such',
  'only', 'own', 'same', 'too', 'may', 'get', 'got', 'can', 'want', 'need', 'help',
  'do', 'does', 'doing', 'please', 'tell', 'know', 'hi', 'hello', 'hey', 'thanks',
])

// ── Short acronyms that are meaningful even at 2 characters ────────────
export const ACRONYM_WHITELIST = new Set(['pr', 'ai'])

// ── Types ──────────────────────────────────────────────────────────────
export interface QAPlain {
  _id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  hitCount: number
}

export interface Scored {
  item: QAPlain
  score: number
  questionMatches: number
  answerMatches: number
  sharedTokens: number
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Extract meaningful (non-stop, >=3 chars) words from a string.
 * Short industry acronyms in ACRONYM_WHITELIST (e.g. "pr", "ai") are
 * kept even though they are only 2 characters.
 */
export function meaningfulWords(s: string): string[] {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => (w.length >= 3 || ACRONYM_WHITELIST.has(w)) && !STOP_WORDS.has(w))
}

/**
 * Escape all special regex characters so a plain-text string can be
 * safely interpolated into a `new RegExp()` constructor.
 */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Match two lowercase words allowing for simple English plurals.
 * Handles:
 *   - Regular plural:  "services" ↔ "service"
 *   - -es plural:      "boxes" ↔ "box"
 *   - -ies plural:     "cities" ↔ "city"
 *   - Same word:       "campaign" ↔ "campaign"
 */
export function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true
  const singular = (w: string): string => {
    if (w.endsWith('sses') && w.length > 4) return w.slice(0, -2)   // businesses → business
    if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y'  // companies → company
    if (w.endsWith('xes') && w.length > 4) return w.slice(0, -2)   // boxes → box
    if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1)  // services → service
    return w
  }
  return singular(a) === singular(b)
}

/**
 * Count how many of the question's meaningful words match any user word,
 * using the plural-aware `wordsMatch` helper.
 */
export function countOverlap(qWords: string[], userWords: string[]): number {
  return qWords.filter((qw) => userWords.some((uw) => wordsMatch(uw, qw))).length
}

/**
 * Test whether a single meaningful word (alphanumeric only) appears
 * as a whole word (word-boundary-delimited) inside `text`.
 */
export function wordBoundaryTest(word: string, text: string): boolean {
  return new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(text)
}

// ── Matching steps ────────────────────────────────────────────────────

/**
 * Step 1: Exact / near-exact match.
 * Returns the first item whose question matches the user's message
 * as a whole phrase (with word boundaries), or where the DB question
 * is fully contained in the user's message.
 */
export function findExactMatch(items: QAPlain[], query: string): QAPlain | undefined {
  const lowerMsg = query.toLowerCase()
  return items.find((item) => {
    const q = item.question.toLowerCase()
    if (q === lowerMsg) return true
    if (
      new RegExp(`\\b${escapeRegex(lowerMsg)}\\b`, 'i').test(q) &&
      lowerMsg.length / q.length >= 0.3
    )
      return true
    if (q.length >= 5 && lowerMsg.includes(q)) return true
    return false
  })
}

/**
 * Step 2: Fuse.js fuzzy match.
 * Finds the best Fuse result where the score <= threshold AND
 * the matched question shares at least one meaningful word with the query.
 */
export function findFuseBest(
  results: Array<{ item: QAPlain; score?: number }>,
  userWords: string[],
  threshold: number = 0.5,
): QAPlain | undefined {
  let best: QAPlain | undefined
  let bestOverlap = 0
  let bestScore = Infinity

  for (const r of results) {
    if (r.score === undefined || r.score > threshold) continue
    const qWords = meaningfulWords(r.item.question)
    if (qWords.length === 0) continue
    const overlap = countOverlap(qWords, userWords)
    if (overlap === 0) continue

    // Prefer higher overlap; tiebreak by lower (better) Fuse score
    if (overlap > bestOverlap || (overlap === bestOverlap && r.score < bestScore)) {
      best = r.item
      bestOverlap = overlap
      bestScore = r.score
    }
  }

  return best
}

/**
 * Step 3: Score-based overlap match.
 * Scores every item by how many of the user's words appear in the
 * question (weighted 4x) and answer (weighted 1x). Then filters by
 * quality gate: ≥1 shared token, ≥1 question match, score ≥ 3.
 */
export function scoreItems(
  items: QAPlain[],
  userWords: string[],
): Scored[] {
  return items.map((item) => {
    const qLower = item.question.toLowerCase()
    const aLower = item.answer.toLowerCase()
    const qWords = meaningfulWords(item.question)

    const questionMatches = userWords.filter((w) => wordBoundaryTest(w, qLower)).length
    const answerMatches = userWords.filter((w) => wordBoundaryTest(w, aLower)).length
    const score = questionMatches * 4 + answerMatches * 1
    // Use wordsMatch for plural-aware shared token counting
    const sharedTokens = countOverlap(qWords, userWords)

    return { item, score, questionMatches, answerMatches, sharedTokens }
  })
}

/**
 * Filter scored items by the quality gate and return the best match,
 * or undefined if none qualify.
 */
export function findBestScored(scored: Scored[]): Scored | undefined {
  const candidates = scored.filter((s) => s.sharedTokens >= 1 && s.questionMatches >= 1 && s.score >= 3)
  if (candidates.length === 0) return undefined
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.sharedTokens - a.sharedTokens
  })
  return candidates[0]
}
