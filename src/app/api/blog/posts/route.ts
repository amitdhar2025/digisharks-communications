import { NextRequest, NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '9', 10)))
    const category = searchParams.get('category') || undefined
    const tag = searchParams.get('tag') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getPublishedPosts(page, limit, category, tag, search)
    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/blog/posts error', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
