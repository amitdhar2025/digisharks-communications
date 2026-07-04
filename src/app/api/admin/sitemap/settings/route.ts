import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import SitemapSettings from '@/lib/models/SitemapSettings'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    let settings = await SitemapSettings.findOne().lean()

    if (!settings) {
      const created = await SitemapSettings.create({})
      settings = created.toObject()
    }

    return NextResponse.json({
      settings: {
        ...settings,
        _id: String(settings._id),
        lastGenerated: settings.lastGenerated?.toISOString?.() ?? null,
        lastPingGoogle: settings.lastPingGoogle?.toISOString?.() ?? null,
        lastPingBing: settings.lastPingBing?.toISOString?.() ?? null,
        createdAt: settings.createdAt?.toISOString?.() ?? null,
        updatedAt: settings.updatedAt?.toISOString?.() ?? null,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load settings'
    console.error('GET sitemap settings error:', err)
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

    const update: Record<string, unknown> = {}
    const allowedFields = [
      'includeBlogPosts',
      'includePages',
      'includeCategories',
      'includeTags',
      'includeImages',
      'autoPing',
      'includeProducts',
      'maxUrls',
      'excludeIds',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field]
      }
    }

    const settings = await SitemapSettings.findOneAndUpdate({}, { $set: update }, { upsert: true, new: true, runValidators: true }).lean()

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        _id: String(settings._id),
        lastGenerated: settings.lastGenerated?.toISOString?.() ?? null,
        lastPingGoogle: settings.lastPingGoogle?.toISOString?.() ?? null,
        lastPingBing: settings.lastPingBing?.toISOString?.() ?? null,
        createdAt: settings.createdAt?.toISOString?.() ?? null,
        updatedAt: settings.updatedAt?.toISOString?.() ?? null,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save settings'
    console.error('POST sitemap settings error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
