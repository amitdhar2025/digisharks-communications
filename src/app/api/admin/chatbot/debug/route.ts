import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 })
    }

    // 1) Count total entries
    const totalCount = await ChatbotQA.countDocuments({})
    const activeCount = await ChatbotQA.countDocuments({ isActive: true })

    // 2) Try to find the exact question
    const exactMatch = await ChatbotQA.findOne({
      question: { $regex: `^${escapeRegex(message.trim())}$`, $options: 'i' },
    })

    // 3) Search for questions containing the user's words
    const words = message.toLowerCase().split(/\s+/).filter((w: string) => w.length >= 3)
    const wordRegex = words.map((w: string) => `(?=.*${escapeRegex(w)})`).join('')
    const regexResults: Array<{ question: string; category: string }> = words.length > 0
      ? await ChatbotQA.find({
          isActive: true,
          question: { $regex: wordRegex, $options: 'i' },
        })
          .limit(5)
          .lean()
      : []

    // 4) Get 3 sample entries to verify data exists
    const samples = await ChatbotQA.find({ isActive: true }).limit(3).lean()

    // 5) Try to find the most relevant by word overlap
    const allActive = await ChatbotQA.find({ isActive: true }).lean()
    const userWords = meaningfulWords(message)
    const userWordsSet = new Set(userWords)

    const scored = allActive.map((item: Record<string, any>) => {
      const qWords = meaningfulWords(item.question)
      const sharedTokens = qWords.filter((w: string) => userWordsSet.has(w)).length
      const questionMatches = userWords.filter((w: string) => item.question.toLowerCase().includes(w)).length
      const answerMatches = userWords.filter((w: string) => item.answer.toLowerCase().includes(w)).length
      const score = questionMatches * 4 + answerMatches * 1
      return {
        question: item.question,
        category: item.category,
        sharedTokens,
        questionMatches,
        answerMatches,
        score,
        passesFilter: sharedTokens >= 1 && questionMatches >= 1 && score >= 3,
      }
    }).filter(s => s.passesFilter)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return NextResponse.json({
      totalCount,
      activeCount,
      userWords,
      searchedWords: words,
      exactMatchFound: !!exactMatch,
      exactMatchQuestion: exactMatch?.question || null,
      regexResultsCount: regexResults.length,
      regexResults: regexResults.map((r: any) => ({ question: r.question, category: r.category })),
      topScored: scored,
      samples: samples.map((s: any) => ({ question: s.question, category: s.category })),
    })
  } catch (err) {
    return NextResponse.json({
      error: `Debug failed: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 })
  }
}

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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
