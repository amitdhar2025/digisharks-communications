/**
 * Site Settings API — Get & Update
 *
 * GET  /api/content/admin/settings  — get current settings (auth required)
 * PUT  /api/content/admin/settings  — update settings
 */

import { NextResponse } from 'next/server'
import SiteSettings from '@/models/SiteSettings'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

// Default settings (used when no document exists yet)
const DEFAULT_SETTINGS = {
  phone: '+91 96273 32332',
  email: 'marketing@digisharkscommunications.com',
  address: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
  businessHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  socialFacebook: 'https://www.facebook.com/digisharks',
  socialTwitter: 'https://twitter.com/digisharks',
  socialInstagram: 'https://www.instagram.com/digisharks',
  socialLinkedin: 'https://www.linkedin.com/company/digisharks',
  socialYoutube: 'https://www.youtube.com/@digisharks',
  siteName: 'Digisharks Communications',
  footerTagline: 'Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.',
  copyrightText: '© {year} Digisharks Communications. All Rights Reserved. Made with 💙 in India.',
  privacyPolicyUrl: '/privacy-policy',
  termsUrl: '/terms-and-conditions',
  refundPolicyUrl: '/refund-policy',
  headerLogo: '',
  headerLogoAlt: 'DigiSharks Logo',
  footerLogo: '',
  footerLogoAlt: 'DigiSharks Logo',
  favicon: '',
  maintenanceMode: false,
  maintenanceMessage: 'We\'re giving our website a performance upgrade. Our team is working on it and we\'ll be back shortly. For urgent inquiries, contact us at marketing@digisharkscommunications.com.',
}

// ── GET: Fetch settings ───────────────────────────────────────────────
export async function GET() {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()

    let settings = await SiteSettings.findOne({ key: 'global' }).lean()

    if (!settings) {
      return NextResponse.json({ settings: { ...DEFAULT_SETTINGS } })
    }

    // Remove Mongoose internals
    const { _id, __v, key, createdAt, updatedAt, ...data } = settings
    return NextResponse.json({ settings: data })
  } catch (err) {
    console.error('[cms] GET /api/content/admin/settings error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// ── PUT: Update settings ──────────────────────────────────────────────
export async function PUT(req) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const body = await req.json()

    // Whitelist of allowed fields
    const allowedFields = [
      'phone', 'email', 'address', 'businessHours',
      'socialFacebook', 'socialTwitter', 'socialInstagram',
      'socialLinkedin', 'socialYoutube', 'socialLinks',
      'siteName', 'footerTagline', 'copyrightText',
      'footerLinkColumns',
      'privacyPolicyUrl', 'termsUrl', 'refundPolicyUrl',
      'headerLogo', 'headerLogoAlt', 'footerLogo', 'footerLogoAlt', 'favicon',
      'maintenanceMode', 'maintenanceMessage',
    ]

    const updateData = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updated = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: updateData },
      { upsert: true, new: true }
    ).lean()

    const { _id, __v, key, createdAt, updatedAt, ...data } = updated

    logActivity({ event: 'settings_update', description: `Updated site settings (${Object.keys(updateData).length} fields)`, username: admin.username, dashboard: 'cms' }).catch(() => {})
    return NextResponse.json({ settings: data })
  } catch (err) {
    console.error('[cms] PUT /api/content/admin/settings error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
