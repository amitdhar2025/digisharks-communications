import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { connectMongoose } from '@/lib/mongoose'
import RobotsSettings from '@/lib/models/RobotsSettings'

export const dynamic = 'force-dynamic'

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /order-success/
Disallow: /_next/
Sitemap: https://www.digisharkscommunications.com/sitemap.xml
`

export async function GET() {
  try {
    // Try reading from public/robots.txt first
    const filePath = join(process.cwd(), 'public', 'robots.txt')
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }

    // Fallback: try reading from MongoDB
    try {
      await connectMongoose()
      const settings = await RobotsSettings.findOne().lean()
      if (settings?.rawContent) {
        return new NextResponse(settings.rawContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      }
    } catch {
      // DB unavailable — fall through to default
    }

    // Return default robots.txt
    return new NextResponse(DEFAULT_ROBOTS, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (err) {
    console.error('GET /robots.txt error:', err)
    return new NextResponse(DEFAULT_ROBOTS, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
