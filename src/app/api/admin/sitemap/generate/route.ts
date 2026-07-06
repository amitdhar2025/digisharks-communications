import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import SitemapSettings from '@/lib/models/SitemapSettings'
import BlogPost from '@/lib/models/BlogPost'
import Category from '@/lib/models/Category'
import Tag from '@/lib/models/Tag'
import { getProductsCollection } from '@/lib/products'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.digisharkscommunications.com'

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
  images: string[]
}

const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/about-us', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact-us', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.7', changefreq: 'monthly' },
  { path: '/career', priority: '0.7', changefreq: 'monthly' },
  { path: '/portfolio', priority: '0.7', changefreq: 'monthly' },
  { path: '/digital-products', priority: '0.7', changefreq: 'monthly' },
  { path: '/digital-marketing-agency', priority: '0.7', changefreq: 'monthly' },
  { path: '/web-development', priority: '0.7', changefreq: 'monthly' },
  { path: '/social-media', priority: '0.7', changefreq: 'monthly' },
  { path: '/press-release', priority: '0.7', changefreq: 'monthly' },
  { path: '/brand-promotion', priority: '0.7', changefreq: 'monthly' },
  { path: '/services-top-pr-digital-marketing', priority: '0.7', changefreq: 'monthly' },
  { path: '/seo-audit', priority: '0.7', changefreq: 'monthly' },
  { path: '/news', priority: '0.7', changefreq: 'monthly' },
  { path: '/shopping-cart', priority: '0.7', changefreq: 'monthly' },
]

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemapXml(urls: SitemapUrl[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ]

  for (const u of urls) {
    lines.push('  <url>')
    lines.push(`    <loc>${escapeXml(u.loc)}</loc>`)
    lines.push(`    <lastmod>${u.lastmod}</lastmod>`)
    lines.push(`    <changefreq>${u.changefreq}</changefreq>`)
    lines.push(`    <priority>${u.priority}</priority>`)

    if (u.images.length > 0) {
      for (const img of u.images) {
        lines.push('    <image:image>')
        lines.push(`      <image:loc>${escapeXml(img)}</image:loc>`)
        lines.push('    </image:image>')
      }
    }

    lines.push('  </url>')
  }

  lines.push('</urlset>')
  return lines.join('\n')
}

function buildSitemapIndex(fileNames: string[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]

  for (const name of fileNames) {
    lines.push('  <sitemap>')
    lines.push(`    <loc>${SITE_URL}/${name}</loc>`)
    lines.push(`    <lastmod>${todayStr()}</lastmod>`)
    lines.push('  </sitemap>')
  }

  lines.push('</sitemapindex>')
  return lines.join('\n')
}

function pingSearchEngine(url: string): Promise<'success' | 'failed'> {
  return fetch(url)
    .then((res) => (res.ok ? 'success' as const : 'failed' as const))
    .catch(() => 'failed' as const)
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()

    // Load or create settings
    let settings = await SitemapSettings.findOne()
    if (!settings) {
      settings = await SitemapSettings.create({})
    }

    const excludeIds = settings.excludeIds
      ? settings.excludeIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : []

    const urls: SitemapUrl[] = []
    const today = todayStr()

    // ── Static pages ──
    if (settings.includePages) {
      for (const page of STATIC_PAGES) {
        urls.push({
          loc: `${SITE_URL}${page.path}`,
          lastmod: today,
          changefreq: page.changefreq,
          priority: page.priority,
          images: [],
        })
      }
    }

    // ── Blog posts ──
    if (settings.includeBlogPosts) {
      const posts = await BlogPost.find({
        status: { $in: ['published', 'active', 'featured'] },
      })
        .select('slug featuredImage bannerImage updatedAt publishedAt createdAt')
        .lean()

      for (const post of posts) {
        if (excludeIds.includes(String(post._id))) continue

        const images: string[] = []
        if (settings.includeImages) {
          if (post.featuredImage?.url) images.push(post.featuredImage.url)
          if (post.bannerImage?.url && !images.includes(post.bannerImage.url)) {
            images.push(post.bannerImage.url)
          }
        }

        const lastmod = (
          post.updatedAt || post.publishedAt || post.createdAt
        )?.toISOString?.()
          ? (post.updatedAt || post.publishedAt || post.createdAt)!.toISOString().split('T')[0]
          : today

        urls.push({
          loc: `${SITE_URL}/blog/${post.slug}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.8',
          images,
        })
      }
    }

    // ── Products ──
    if (settings.includeProducts) {
      const productsCol = await getProductsCollection()
      const products = await productsCol.find({ isActive: true }).toArray()

      for (const product of products) {
        if (excludeIds.includes(String(product._id))) continue

        const images =
          settings.includeImages && product.images?.length
            ? product.images.slice(0, 5)
            : []

        urls.push({
          loc: `${SITE_URL}/digital-products/${product.slug}`,
          lastmod: product.createdAt?.toISOString?.().split('T')[0] ?? today,
          changefreq: 'weekly',
          priority: '0.8',
          images,
        })
      }
    }

    // ── Categories ──
    if (settings.includeCategories) {
      const categories = await Category.find({ isActive: true })
        .select('slug updatedAt createdAt')
        .lean()

      for (const cat of categories) {
        if (excludeIds.includes(String(cat._id))) continue

        const lastmod = (cat.updatedAt || cat.createdAt)?.toISOString?.()
          ? (cat.updatedAt || cat.createdAt)!.toISOString().split('T')[0]
          : today

        urls.push({
          loc: `${SITE_URL}/blog/category/${cat.slug}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.6',
          images: [],
        })
      }
    }

    // ── Tags ──
    if (settings.includeTags) {
      const tags = await Tag.find({ isActive: true })
        .select('slug updatedAt createdAt')
        .lean()

      for (const tag of tags) {
        if (excludeIds.includes(String(tag._id))) continue

        const lastmod = (tag.updatedAt || tag.createdAt)?.toISOString?.()
          ? (tag.updatedAt || tag.createdAt)!.toISOString().split('T')[0]
          : today

        urls.push({
          loc: `${SITE_URL}/blog/tag/${tag.slug}`,
          lastmod,
          changefreq: 'monthly',
          priority: '0.4',
          images: [],
        })
      }
    }

    // ── Build XML files ──
    const maxUrls = settings.maxUrls || 1000
    const filePayloads: { name: string; content: string }[] = []

    if (urls.length <= maxUrls) {
      filePayloads.push({ name: 'sitemap.xml', content: buildSitemapXml(urls) })
    } else {
      // Split into chunks
      for (let i = 0; i < urls.length; i += maxUrls) {
        const chunk = urls.slice(i, i + maxUrls)
        filePayloads.push({
          name: `sitemap-${filePayloads.length + 1}.xml`,
          content: buildSitemapXml(chunk),
        })
      }
      // Prepend sitemap index
      const indexXml = buildSitemapIndex(filePayloads.map((f) => f.name))
      filePayloads.unshift({ name: 'sitemap.xml', content: indexXml })
    }

    // ── Write files to public/ ──
    let writeWarning: string | null = null

    // Calculate total size from generated content (no disk I/O needed)
    let totalFileSize = 0
    for (const file of filePayloads) {
      totalFileSize += Buffer.byteLength(file.content, 'utf-8')
    }

    // In serverless environments (Vercel), the filesystem is read-only.
    // Sitemap XML is still generated and metadata saved to MongoDB — the
    // GET /sitemap.xml route falls back to a default when the file is missing.
    const isServerless = !!process.env.VERCEL
    if (!isServerless) {
      try {
        const publicDir = join(process.cwd(), 'public')
        if (!existsSync(publicDir)) {
          mkdirSync(publicDir, { recursive: true })
        }

        for (const file of filePayloads) {
          const filePath = join(publicDir, file.name)
          writeFileSync(filePath, file.content, 'utf-8')
        }
      } catch (fsErr) {
        writeWarning = `Could not write sitemap files to disk: ${fsErr instanceof Error ? fsErr.message : String(fsErr)}`
        console.error('[sitemap] filesystem write failed:', fsErr)
      }
    } else {
      writeWarning = 'Running on serverless — sitemap XML not written to disk. Metadata saved to database.'
    }

    // ── Update settings ──
    settings.lastGenerated = new Date()
    settings.totalUrls = urls.length
    settings.fileSize = totalFileSize
    await settings.save()

    // ── Ping search engines ──
    let googlePing: 'success' | 'failed' | 'skipped' = 'skipped'
    let bingPing: 'success' | 'failed' | 'skipped' = 'skipped'

    if (settings.autoPing) {
      const sitemapPingUrl = `${SITE_URL}/sitemap.xml`
      ;[googlePing, bingPing] = await Promise.all([
        pingSearchEngine(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapPingUrl)}`),
        pingSearchEngine(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapPingUrl)}`),
      ])

      if (googlePing === 'success') settings.lastPingGoogle = new Date()
      if (bingPing === 'success') settings.lastPingBing = new Date()
      await settings.save()
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUrls: urls.length,
        files: filePayloads.length,
        fileSize: totalFileSize,
        googlePing,
        bingPing,
        lastGenerated: settings.lastGenerated?.toISOString() ?? null,
      },
      ...(writeWarning ? { warning: writeWarning } : {}),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate sitemap'
    console.error('POST sitemap generate error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
