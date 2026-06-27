import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'
import { listActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 30
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
    }

    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const trimmed = message.trim().toLowerCase()
    if (trimmed.length < 2 || trimmed.length > 500) {
      return NextResponse.json({ error: 'Message must be between 2 and 500 characters' }, { status: 400 })
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 2)

    // Search blog posts
    let blogResults: { title: string; excerpt: string; slug: string; url: string; score: number }[] = []

    try {
      await connectMongoose()

      // Try MongoDB text search first
      const posts = await BlogPost.find(
        {
          status: { $in: ['published', 'active', 'featured'] },
          $or: [
            { title: { $regex: words.join('|'), $options: 'i' } },
            { excerpt: { $regex: words.join('|'), $options: 'i' } },
            { shortDescription: { $regex: words.join('|'), $options: 'i' } },
            { content: { $regex: words.join('|'), $options: 'i' } },
          ],
        },
        { title: 1, slug: 1, excerpt: 1, shortDescription: 1, content: 1, _id: 1 }
      )
        .sort({ publishedAt: -1 })
        .limit(5)
        .lean()

      const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`

      blogResults = posts.map((p) => {
        // Calculate a simple relevance score based on how many words match
        const contentText = `${p.title} ${p.excerpt || p.shortDescription || ''}`.toLowerCase()
        const matchedWords = words.filter(w => contentText.includes(w))
        const score = matchedWords.length / words.length

        return {
          title: p.title,
          excerpt: p.excerpt || p.shortDescription || '',
          slug: p.slug,
          url: `${origin}/blog/${p.slug}`,
          score,
        }
      })

      // Sort by relevance score descending
      blogResults.sort((a, b) => b.score - a.score)
    } catch {
      // Blog search failed — skip gracefully
    }

    // Search products
    let productResults: { title: string; shortPitch: string; slug: string; url: string; score: number }[] = []

    try {
      const products = await listActiveProducts()
      const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`

      productResults = products
        .filter((p) => {
          const text = `${p.title} ${p.shortPitch || ''}`.toLowerCase()
          return words.some(w => text.includes(w))
        })
        .map((p) => {
          const text = `${p.title} ${p.shortPitch || ''}`.toLowerCase()
          const matchedWords = words.filter(w => text.includes(w))
          const score = matchedWords.length / words.length
          return {
            title: p.title,
            shortPitch: p.shortPitch || '',
            slug: p.slug,
            url: `${origin}/digital-products/${p.slug}`,
            score,
          }
        })

      productResults.sort((a, b) => b.score - a.score)
    } catch {
      // Product search failed — skip gracefully
    }

    // Combine results
    const results = [...blogResults, ...productResults].sort((a, b) => b.score - a.score).slice(0, 3)

    if (results.length === 0) {
      return NextResponse.json({ results: [], message: 'No relevant content found on our website.' })
    }

    return NextResponse.json({
      results,
      message: `I found ${results.length} relevant article(s) on our website that might help.`,
    })
  } catch (err) {
    console.error('Website search error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
