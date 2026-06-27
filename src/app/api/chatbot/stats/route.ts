import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import { getAdminFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()

    const [total, active, inactive, topQuestions] = await Promise.all([
      ChatbotQA.countDocuments(),
      ChatbotQA.countDocuments({ isActive: true }),
      ChatbotQA.countDocuments({ isActive: false }),
      ChatbotQA.find({ isActive: true })
        .sort({ hitCount: -1 })
        .limit(10)
        .select('question hitCount')
        .lean(),
    ])

    return NextResponse.json({
      stats: {
        total,
        active,
        inactive,
        topQuestions,
      },
    })
  } catch (err) {
    console.error('Chatbot stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
