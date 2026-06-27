import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import connectMongoose from '@/lib/mongoose'
import SeoAuditConfig from '@/lib/models/SeoAuditConfig'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    let config = await SeoAuditConfig.findOne().lean()

    if (!config) {
      config = await SeoAuditConfig.create({})
      config = config.toObject()
    }

    // Mask API key for display
    const maskedKey = (config as any).googleApiKey
      ? (config as any).googleApiKey.substring(0, 6) + '…' + (config as any).googleApiKey.slice(-4)
      : ''

    return NextResponse.json({
      config: {
        ...(config as any),
        googleApiKey: (config as any).googleApiKey || '',
        googleApiKeyMasked: maskedKey,
      },
    })
  } catch (err: any) {
    console.error('GET audit config error:', err)
    return NextResponse.json({ error: 'Failed to load config.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    await connectMongoose()

    const update: Record<string, any> = {}

    if (body.googleApiKey !== undefined) {
      update.googleApiKey = body.googleApiKey
    }

    if (body.checkToggles !== undefined && Array.isArray(body.checkToggles)) {
      update.checkToggles = body.checkToggles
    }

    const config = await SeoAuditConfig.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    ).lean()

    return NextResponse.json({
      success: true,
      config: {
        ...(config as any),
        googleApiKeyMasked: (config as any).googleApiKey
          ? (config as any).googleApiKey.substring(0, 6) + '…' + (config as any).googleApiKey.slice(-4)
          : '',
      },
    })
  } catch (err: any) {
    console.error('PUT audit config error:', err)
    return NextResponse.json({ error: 'Failed to update config.' }, { status: 500 })
  }
}
