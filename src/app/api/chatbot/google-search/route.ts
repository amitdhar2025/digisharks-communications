import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 20
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

interface SearchResult {
  title: string
  snippet: string
  url: string
}

export async function POST(req: NextRequest) {
  let searchQuery = ''

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

    const trimmed = message.trim()
    searchQuery = trimmed
    if (trimmed.length < 2 || trimmed.length > 500) {
      return NextResponse.json({ error: 'Message must be between 2 and 500 characters' }, { status: 400 })
    }

    const apiKey = process.env.SERPER_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        results: [],
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
        message: 'Web search is not configured.',
      })
    }

    // Call Serper API (Google search results)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: trimmed,
        gl: 'in',
        hl: 'en',
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error('Serper API error:', response.status, errText)
      return NextResponse.json({
        results: [],
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
        message: 'Search API returned an error. Try searching on Google directly.',
      })
    }

    const data = await response.json()

    // Extract organic search results
    const results: SearchResult[] = (data.organic || [])
      .slice(0, 4)
      .map((r: any) => ({
        title: r.title || '',
        snippet: r.snippet || '',
        url: r.link || '',
      }))
      .filter((r: SearchResult) => r.title && r.url)

    // Also grab the knowledge graph title if available for extra context
    const kgTitle = data.knowledgeGraph?.title || ''
    const kgDescription = data.knowledgeGraph?.description || ''

    if (results.length === 0 && !kgTitle) {
      return NextResponse.json({
        results: [],
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
        message: 'No search results found.',
      })
    }

    // Prepend knowledge graph info as a bonus context if available
    if (kgTitle && results.length > 0) {
      results.unshift({
        title: kgTitle,
        snippet: kgDescription || 'Overview information',
        url: `https://www.google.com/search?q=${encodeURIComponent(kgTitle)}`,
      })
    }

    return NextResponse.json({
      results,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
      message: `Here are some Google results for "${trimmed}":`,
    })
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({
        results: [],
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(searchQuery || '')}`,
        message: 'Search timed out.',
      })
    }
    console.error('Google search error:', err)
    return NextResponse.json({
      results: [],
      googleSearchUrl: searchQuery ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}` : 'https://www.google.com/',
      message: 'Something went wrong with the search.',
    })
  }
}
