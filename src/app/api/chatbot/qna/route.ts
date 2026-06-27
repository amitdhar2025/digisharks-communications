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
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || ''

    const filter: Record<string, unknown> = {}
    if (status === 'active') filter.isActive = true
    else if (status === 'inactive') filter.isActive = false
    if (category) filter.category = category

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    const [items, total] = await Promise.all([
      ChatbotQA.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ChatbotQA.countDocuments(filter),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Chatbot Q&A list error:', err)
    return NextResponse.json({ error: 'Failed to load Q&A entries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const body = await req.json()
    const { question, answer, category } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const qa = await ChatbotQA.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category?.trim() || '',
    })

    return NextResponse.json({ item: qa }, { status: 201 })
  } catch (err) {
    console.error('Chatbot Q&A create error:', err)
    return NextResponse.json({ error: 'Failed to create Q&A entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const confirm = searchParams.get('confirm')

    if (confirm !== 'yes') {
      return NextResponse.json({ error: 'confirm=yes required' }, { status: 400 })
    }

    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const filter: Record<string, unknown> = {}
    if (status === 'active') filter.isActive = true
    else if (status === 'inactive') filter.isActive = false
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ]
    }

    const result = await ChatbotQA.deleteMany(filter)
    return NextResponse.json({ message: `Deleted ${result.deletedCount} Q&A entries` })
  } catch (err) {
    console.error('Chatbot Q&A bulk delete error:', err)
    return NextResponse.json({ error: 'Failed to delete Q&A entries' }, { status: 500 })
  }
}
