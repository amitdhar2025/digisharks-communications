import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const related = await getRelatedPosts(
      post._id,
      post.categories.map((c) => c._id)
    )

    return NextResponse.json({ post, related })
  } catch (err) {
    console.error('GET /api/blog/posts/[slug] error', err)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
