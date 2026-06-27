import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import { getAdminFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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

    const item = await ChatbotQA.findByIdAndUpdate(
      id,
      {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || '',
      },
      { new: true }
    )

    if (!item) {
      return NextResponse.json({ error: 'Q&A entry not found' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (err) {
    console.error('Chatbot Q&A update error:', err)
    return NextResponse.json({ error: 'Failed to update Q&A entry' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const body = await req.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive boolean required' }, { status: 400 })
    }

    const item = await ChatbotQA.findByIdAndUpdate(id, { isActive }, { new: true })

    if (!item) {
      return NextResponse.json({ error: 'Q&A entry not found' }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (err) {
    console.error('Chatbot Q&A toggle error:', err)
    return NextResponse.json({ error: 'Failed to toggle Q&A entry' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const item = await ChatbotQA.findByIdAndDelete(id)

    if (!item) {
      return NextResponse.json({ error: 'Q&A entry not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error('Chatbot Q&A delete error:', err)
    return NextResponse.json({ error: 'Failed to delete Q&A entry' }, { status: 500 })
  }
}
