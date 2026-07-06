import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import ChatbotSettings from '@/lib/models/ChatbotSettings'
import Fuse from 'fuse.js'
import { stripHtml } from '@/lib/sanitize'
import { checkSecurity } from '@/lib/anti-spam'
import {
  meaningfulWords,
  findExactMatch,
  findFuseBest,
  scoreItems,
  findBestScored,
  type QAPlain,
} from '@/lib/chatbot-match'

export const dynamic = 'force-dynamic'

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

    const items: QAPlain[] = JSON.parse(JSON.stringify(qaItems))

    // Tokens we extracted from the user's question (used both for
    // Fuse scoring AND the strict overlap check below).
    const userWords = meaningfulWords(trimmed)
    const userWordsSet = new Set(userWords)

    // ── 1) Exact / near-exact match ──
    const exactPhraseMatch = findExactMatch(items, trimmed)
    if (exactPhraseMatch) {
      ChatbotQA.findByIdAndUpdate(exactPhraseMatch._id, { $inc: { hitCount: 1 } }).catch(() => {})
      return NextResponse.json({ answer: exactPhraseMatch.answer, matched: exactPhraseMatch.question })
    }

    // ── 2) Fuzzy match (Fuse.js) ──
    const fuse = new Fuse(items, {
      keys: ['question'],
      threshold: 0.5,
      distance: 100,
      minMatchCharLength: 3,
      ignoreLocation: true,
      findAllMatches: true,
    })

    const fuseItem = findFuseBest(fuse.search(trimmed), userWordsSet, 0.5)
    if (fuseItem) {
      ChatbotQA.findByIdAndUpdate(fuseItem._id, { $inc: { hitCount: 1 } }).catch(() => {})
      return NextResponse.json({ answer: fuseItem.answer, matched: fuseItem.question })
    }

    // ── 3) Score-based overlap match ──
    const scored = scoreItems(items, userWords, userWordsSet)
    const best = findBestScored(scored)
    if (best) {
      ChatbotQA.findByIdAndUpdate(best.item._id, { $inc: { hitCount: 1 } }).catch(() => {})
      return NextResponse.json({ answer: best.item.answer, matched: best.item.question })
    }

    return NextResponse.json({ answer: fallback })
  } catch (err) {
    console.error('Chatbot query error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
