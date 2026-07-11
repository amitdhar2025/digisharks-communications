import { NextRequest, NextResponse } from 'next/server'
import type { ServiceItem } from '@/lib/service-types'

export const dynamic = 'force-dynamic'

const serviceList: ServiceItem[] = [
  {
    id: 'digital-pr',
    label: 'Digital PR & Media',
    icon: '📰',
    path: '/press-release/',
    pageUrl: '/press-release/',
    keywords: ['pr', 'press release', 'media coverage', 'public relations', 'digital pr'],
  },
  {
    id: 'seo-ppc',
    label: 'SEO & PPC',
    icon: '📈',
    path: '/digital-marketing-agency/',
    pageUrl: '/digital-marketing-agency/',
    keywords: ['seo', 'ppc', 'google ads', 'search engine', 'digital marketing'],
  },
  {
    id: 'ai-seo-aeo-geo',
    label: 'AI SEO, AEO & GEO',
    icon: '🤖',
    path: '/digital-marketing-agency/',
    pageUrl: '/digital-marketing-agency/',
    keywords: ['ai seo', 'aeo', 'geo', 'answer engine', 'generative engine', 'ai optimization'],
  },
  {
    id: 'social-media',
    label: 'Social Media',
    icon: '📱',
    path: '/social-media/',
    pageUrl: '/social-media/',
    keywords: ['social media', 'instagram', 'facebook', 'content', 'smo'],
  },
  {
    id: 'web-dev',
    label: 'Web Development',
    icon: '💻',
    path: '/web-development/',
    pageUrl: '/web-development/',
    keywords: ['web development', 'website', 'ecommerce', 'landing page', 'web design'],
  },
  {
    id: 'brand-promotion',
    label: 'Brand Promotion',
    icon: '🏆',
    path: '/brand-promotion/',
    pageUrl: '/brand-promotion/',
    keywords: ['brand promotion', 'branding', 'influencer', 'corporate branding'],
  },
  {
    id: 'political',
    label: 'Political Campaigns',
    icon: '🗳️',
    path: '/services-top-pr-digital-marketing/',
    pageUrl: '/services-top-pr-digital-marketing/',
    keywords: ['political', 'campaign', 'election', 'booth', 'voter'],
  },
  {
    id: 'about',
    label: 'About Us',
    icon: '🏢',
    path: '/about-us/',
    pageUrl: '/about-us/',
    keywords: ['about', 'company', 'team', 'vansh', 'who we are'],
  },
]

export async function GET(req: NextRequest) {
  try {
    // Fall back to host header if origin is empty (same-origin requests)
    const origin = req.headers.get('origin') || `https://${req.headers.get('host') || 'localhost:3000'}`
    const services = serviceList.map((s) => ({
      ...s,
      pageUrl: `${origin}${s.path}`,
    }))

    return NextResponse.json({ services })
  } catch (err) {
    console.error('Chatbot services error:', err)
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
  }
}

/**
 * Fetch live content from a website page and extract meaningful text.
 * The request origin is passed from the client so we can construct
 * the correct internal URL regardless of environment.
 */
export async function POST(req: NextRequest) {
  try {
    const { path, origin } = await req.json()

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Use origin from the client, or fall back to request headers
    const baseUrl = origin || req.headers.get('origin') || ''
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

    // Use AbortController for timeout (compatible with Node 16+)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DigiSharks-Chatbot/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const html = await response.text()

    // Strip unwanted blocks: script, style, nav, footer, header, hero sections
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<section[^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')

    // Known alert/fraud keywords to filter out from results
    // (alert bar content is in <span> tags so it won't match the heading/p/li extraction below,
    //  this is a safety net for any remaining content that might slip through)
    const alertKeywords = ['beware of fraudulent', 'fake invoices', 'impersonation scams', 'do not offer any jobs', 'whatsapp or telegram', 'by clutch', 'top digital pr agency', 'ticker', 'digisharks does not']

    function isAlertContent(text: string): boolean {
      const lower = text.toLowerCase()
      return alertKeywords.some((kw) => lower.includes(kw))
    }

    // Extract text from heading and paragraph tags first (these are the main content)
    const contentBlocks: string[] = []
    const headingPRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>|<p[^>]*>(.*?)<\/p>|<li[^>]*>(.*?)<\/li>/gi
    let match
    while ((match = headingPRegex.exec(text)) !== null) {
      const content = (match[1] || match[2] || match[3] || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim()
      if (content && content.length > 10 && !isAlertContent(content)) {
        contentBlocks.push(content)
      }
    }

    // If we found content blocks, join them; otherwise fall back to full text
    let summary = ''
    if (contentBlocks.length > 0) {
      summary = contentBlocks
        .join('. ')
        .trim()
        // Clean up double periods (some elements already end with periods)
        .replace(/\.\.+/g, '.')
        // Clean up fragmented leading periods like ". Online"
        .replace(/^\.\s*/, '')
        // Remove any leading/trailing whitespace around periods
        .replace(/\s+\./g, '.')
        .trim()
    }

    if (!summary) {
      // Fallback: strip all remaining tags and extract first meaningful section
      text = text
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Split into paragraphs and skip alert content
      const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 40 && !isAlertContent(p))
      summary = paragraphs.length > 0 ? paragraphs[0].trim() : text.substring(0, 800).trim()
    }

    // Truncate to a reasonable chat response length
    if (summary.length > 900) {
      const truncated = summary.substring(0, 900)
      const lastPeriod = truncated.lastIndexOf('.')
      if (lastPeriod > 200) {
        summary = truncated.substring(0, lastPeriod + 1)
      } else {
        summary = truncated + '…'
      }
    }

    const serviceInfo = serviceList.find((s) => path === s.path || path.startsWith(s.path))

    return NextResponse.json({
      summary,
      service: serviceInfo ? { label: serviceInfo.label, icon: serviceInfo.icon } : null,
      pageUrl: url,
    })
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 })
    }
    console.error('Chatbot service fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 })
  }
}
