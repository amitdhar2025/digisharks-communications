import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const DEFAULT_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.digisharkscommunications.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

export async function GET() {
  try {
    // Try reading from public/sitemap.xml first
    const filePath = join(process.cwd(), 'public', 'sitemap.xml')
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      })
    }

    // Return minimal default sitemap
    return new NextResponse(DEFAULT_SITEMAP, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (err) {
    console.error('GET /sitemap.xml error:', err)
    return new NextResponse(DEFAULT_SITEMAP, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }
}
