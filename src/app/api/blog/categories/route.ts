import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Category from '@/lib/models/Category'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectMongoose()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return NextResponse.json({ categories })
  } catch (err) {
    console.error('GET /api/blog/categories error', err)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
