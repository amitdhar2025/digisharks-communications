import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import ChatbotSettings from '@/lib/models/ChatbotSettings'
import Fuse from 'fuse.js'
import { stripHtml } from '@/lib/sanitize'
import { checkSecurity } from '@/lib/anti-spam'

export const dynamic = 'force-dynamic'

// Words we ignore when judging whether two questions actually overlap.
// Keeping this fairly conservative so we don't silently filter
// meaningful domain words like "blockchain", "seo", "website".
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was',
  'one', 'our', 'out', 'has', 'have', 'been', 'some', 'them', 'than', 'what', 'when',
  'who', 'will', 'your', 'about', 'into', 'over', 'like', 'just', 'also', 'very',
  'with', 'from', 'that', 'this', 'they', 'were', 'does', 'their', 'which', 'would',
  'could', 'should', 'make', 'made', 'more', 'most', 'other', 'after', 'then', 'such',
  'only', 'own', 'same', 'too', 'may', 'get', 'got', 'can', 'want', 'need', 'help',
  'do', 'does', 'doing', 'please', 'tell', 'know', 'hi', 'hello', 'hey', 'thanks',
])

function meaningfulWords(s: string): string[] {
  return s.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length >= 3 && !STOP_WORDS.has(w))
}

/**
 * Escape all special regex characters so a plain-text string can be
 * safely interpolated into a `new RegExp()` constructor.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function POST(req: NextRequest) {
  try {
    // ── Anti-spam check ──
    const body = await req.json()
    const { message } = body

    const securityResult = await checkSecurity({
      req,
      formType: 'chatbot',
      pageUrl: req.headers.get('referer') || '/chatbot',
    })
    if (!securityResult.allowed) {
      return NextResponse.json({ error: securityResult.message || 'Access denied.' }, { status: 403 })
    }

    await connectMongoose()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const trimmed = stripHtml(message).trim()
    if (trimmed.length < 2 || trimmed.length > 500) {
      return NextResponse.json({ error: 'Message must be between 2 and 500 characters' }, { status: 400 })
    }

    const [qaItems, settings] = await Promise.all([
      ChatbotQA.find({ isActive: true }).lean(),
      ChatbotSettings.findOne().lean(),
    ])

    const fallback = settings?.fallbackMessage || "Sorry, I don't have an answer for that."

    if (!qaItems || qaItems.length === 0) {
      return NextResponse.json({ answer: fallback })
    }

    type QAPlain = { _id: string; question: string; answer: string; category: string; isActive: boolean; hitCount: number }

    const items: QAPlain[] = JSON.parse(JSON.stringify(qaItems))

    // Tokens we extracted from the user's question (used both for
    // Fuse scoring AND the strict overlap check below).
    const userWords = meaningfulWords(trimmed)
    const userWordsSet = new Set(userWords)

    // ── 1) Exact / near-exact match (whole-phrase or token overlap) ──
    const lowerMsg = trimmed.toLowerCase()

    const exactPhraseMatch = items.find((item) => {
      const q = item.question.toLowerCase()
      if (q === lowerMsg) return true
      // Input is sanitised (stripHtml) and regex-escaped — safe for RegExp
      // eslint-disable-next-line security/detect-non-literal-regexp
      if (new RegExp(`\\b${escapeRegex(lowerMsg)}\\b`, 'i').test(q) && lowerMsg.length / q.length >= 0.5) return true
      if (q.length >= 5 && lowerMsg.includes(q)) return true
      return false
    })
    if (exactPhraseMatch) {
      ChatbotQA.findByIdAndUpdate(exactPhraseMatch._id, { $inc: { hitCount: 1 } }).catch(() => {})
      return NextResponse.json({ answer: exactPhraseMatch.answer, matched: exactPhraseMatch.question })
    }

    // ── 2) Fuzzy match (Fuse.js) — STRICT: score ≤ 0.2 AND shared keywords ──
    const fuse = new Fuse(items, {
      keys: ['question'],
      threshold: 0.2,        // tightened from 0.3 to drop fuzzy false positives
      distance: 100,
      minMatchCharLength: 4,
      ignoreLocation: true,
    })

    const results = fuse.search(trimmed)
    const fuseBest = results.find(r => {
      if (r.score === undefined || r.score > 0.2) return false
      const qWords = meaningfulWords(r.item.question)
      if (qWords.length === 0) return false
      // Require at least one meaningful (non-stop) word in common.
      const overlap = qWords.filter(w => userWordsSet.has(w)).length
      return overlap >= 1
    })
    if (fuseBest) {
      ChatbotQA.findByIdAndUpdate(fuseBest.item._id, { $inc: { hitCount: 1 } }).catch(() => {})
      return NextResponse.json({ answer: fuseBest.item.answer, matched: fuseBest.item.question })
    }

    // ── 3) Score-based overlap match ──
    // Require the matched question to share AT LEAST 2 meaningful
    // words with the user's query, AND the question itself must contain
    // the majority of the user's meaningful tokens. This stops
    // "I want a node + blockchain website" from matching "Do you offer
    // e-commerce website development?" (only one shared word: website).
    type Scored = { item: QAPlain; score: number; questionMatches: number; answerMatches: number; sharedTokens: number }

    const scored: Scored[] = items.map((item) => {
      const qLower = item.question.toLowerCase()
      const aLower = item.answer.toLowerCase()
      const qWords = meaningfulWords(item.question)

      const wordBoundaryTest = (word: string, text: string): boolean => {
        // Input is a single meaningful word (alphanumeric only via meaningfulWords)
        // and additionally regex-escaped — safe for RegExp
        // eslint-disable-next-line security/detect-non-literal-regexp
        return new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(text)
      }
      const questionMatches = userWords.filter(w => wordBoundaryTest(w, qLower)).length
      const answerMatches = userWords.filter(w => wordBoundaryTest(w, aLower)).length

      const score = questionMatches * 4 + answerMatches * 1
      const sharedTokens = qWords.filter(w => userWordsSet.has(w)).length
      return { item, score, questionMatches, answerMatches, sharedTokens }
    })

    // Quality gate: require ≥2 shared meaningful tokens AND ≥1 question-word
    // match AND score ≥ 5 (so even a single strong match with the answer
    // helps, but a single weak match doesn't).
    const candidates = scored.filter(s =>
      s.sharedTokens >= 2 &&
      s.questionMatches >= 1 &&
      s.score >= 5
    )

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.sharedTokens - a.sharedTokens
      })
      const best = candidates[0]
      ChatbotQA.findByIdAndUpdate(best.item._id, { $inc: { hitCount: 1 } }).catch(() => {})
      return NextResponse.json({ answer: best.item.answer, matched: best.item.question })
    }

    return NextResponse.json({ answer: fallback })
  } catch (err) {
    console.error('Chatbot query error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
