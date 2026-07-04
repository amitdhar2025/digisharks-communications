import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import RobotsSettings from '@/lib/models/RobotsSettings'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const DEFAULT_CONTENT = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /order-success/
Disallow: /_next/
Sitemap: https://www.digisharkscommunications.com/sitemap.xml`

function generateRobotsTxt(
  rules: { bot: string; type: 'allow' | 'disallow'; path: string }[],
  sitemapUrl: string,
  crawlDelay: number | null,
  blockAIBots: boolean,
): string {
  const lines: string[] = []

  // Group rules by bot
  const grouped: Record<string, { type: 'allow' | 'disallow'; path: string }[]> = {}

  for (const rule of rules) {
    if (!grouped[rule.bot]) grouped[rule.bot] = []
    grouped[rule.bot].push({ type: rule.type, path: rule.path })
  }

  // Add AI bot rules if enabled
  if (blockAIBots) {
    const aiBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Google-Extended', 'Amazonbot']
    for (const bot of aiBots) {
      if (!grouped[bot]) grouped[bot] = []
      grouped[bot].push({ type: 'disallow', path: '/' })
    }
  }

  // Build output
  const entries = Object.entries(grouped)
  for (let i = 0; i < entries.length; i++) {
    const [bot, botRules] = entries[i]
    if (i > 0) lines.push('')

    lines.push(`User-agent: ${bot}`)
    for (const r of botRules) {
      lines.push(`${r.type === 'allow' ? 'Allow' : 'Disallow'}: ${r.path}`)
    }

    // Add crawl delay if this is the * bot and delay is set
    if (bot === '*' && crawlDelay && crawlDelay > 0) {
      lines.push(`Crawl-delay: ${crawlDelay}`)
    }
  }

  // Add sitemap at the end
  if (sitemapUrl) {
    if (entries.length > 0) lines.push('')
    lines.push(`Sitemap: ${sitemapUrl}`)
  }

  return lines.join('\n') + '\n'
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    let settings = await RobotsSettings.findOne().lean()

    if (!settings) {
      // Create with defaults
      const created = await RobotsSettings.create({
        rules: [
          { bot: '*', type: 'allow', path: '/' },
          { bot: '*', type: 'disallow', path: '/admin/' },
          { bot: '*', type: 'disallow', path: '/api/' },
          { bot: '*', type: 'disallow', path: '/checkout/' },
          { bot: '*', type: 'disallow', path: '/cart/' },
          { bot: '*', type: 'disallow', path: '/order-success/' },
          { bot: '*', type: 'disallow', path: '/_next/' },
        ],
        rawContent: DEFAULT_CONTENT,
      })
      settings = created.toObject()
    }

    // Generate preview content
    const previewContent = generateRobotsTxt(
      settings.rules || [],
      settings.sitemapUrl || 'https://www.digisharkscommunications.com/sitemap.xml',
      settings.crawlDelay,
      settings.blockAIBots,
    )

    return NextResponse.json({
      settings: {
        ...settings,
        _id: String(settings._id),
        lastSaved: settings.lastSaved?.toISOString?.() ?? null,
        createdAt: settings.createdAt?.toISOString?.() ?? null,
        updatedAt: settings.updatedAt?.toISOString?.() ?? null,
      },
      previewContent,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load settings'
    console.error('GET robots settings error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const body = await req.json()

    const { rules, sitemapUrl, crawlDelay, blockAIBots } = body as {
      rules?: { bot: string; type: 'allow' | 'disallow'; path: string }[]
      sitemapUrl?: string
      crawlDelay?: number | null
      blockAIBots?: boolean
    }

    // Generate the robots.txt content
    const finalSitemapUrl = sitemapUrl || 'https://www.digisharkscommunications.com/sitemap.xml'
    const rawContent = generateRobotsTxt(rules || [], finalSitemapUrl, crawlDelay ?? null, blockAIBots ?? false)

    const update: Record<string, unknown> = {
      rules: rules || [],
      sitemapUrl: finalSitemapUrl,
      crawlDelay: crawlDelay ?? null,
      blockAIBots: blockAIBots ?? false,
      rawContent,
      lastSaved: new Date(),
      fileSize: Buffer.byteLength(rawContent, 'utf-8'),
    }

    const settings = await RobotsSettings.findOneAndUpdate({}, { $set: update }, { upsert: true, new: true, runValidators: true }).lean()

    // Write to public/robots.txt
    try {
      const publicDir = join(process.cwd(), 'public')
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true })
      }
      writeFileSync(join(publicDir, 'robots.txt'), rawContent, 'utf-8')
    } catch {
      // Filesystem write may fail on serverless — MongoDB is the source of truth
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        _id: String(settings._id),
        lastSaved: settings.lastSaved?.toISOString?.() ?? null,
        createdAt: settings.createdAt?.toISOString?.() ?? null,
        updatedAt: settings.updatedAt?.toISOString?.() ?? null,
      },
      previewContent: rawContent,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save settings'
    console.error('POST robots settings error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
