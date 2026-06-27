import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import { getAdminFromRequest } from '@/lib/auth'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: 'Excel file has no sheets' }, { status: 400 })
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 })
    }

    const preview: { question: string; answer: string; category: string }[] = []
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const question = String(row['Question'] || '').trim()
      const answer = String(row['Answer'] || '').trim()
      const category = String(row['Category'] || '').trim()

      if (!question || !answer) {
        errors.push(`Row ${i + 2}: Missing Question or Answer`)
        continue
      }

      preview.push({ question, answer, category })
    }

    return NextResponse.json({ preview, errors, total: preview.length + errors.length, validCount: preview.length })
  } catch (err) {
    console.error('Chatbot upload error:', err)
    return NextResponse.json({ error: 'Failed to process Excel file' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items to save' }, { status: 400 })
    }

    await connectMongoose()

    const qaDocs = items.map((item: { question: string; answer: string; category?: string }) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
      category: item.category?.trim() || '',
      isActive: true,
      hitCount: 0,
    }))

    const result = await ChatbotQA.insertMany(qaDocs)

    return NextResponse.json({ message: `Saved ${result.length} Q&A entries`, count: result.length })
  } catch (err) {
    console.error('Chatbot upload confirm error:', err)
    return NextResponse.json({ error: 'Failed to save Q&A entries' }, { status: 500 })
  }
}
