import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Tag from '@/lib/models/Tag'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectMongoose()
    const tags = await Tag.find().sort({ name: 1 }).lean()
    return NextResponse.json({ tags })
  } catch (err) {
    console.error('GET /api/blog/tags error', err)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}
