/**
 * Public Site Settings API — No auth required
 *
 * GET /api/public/settings
 *
 * Frontend components (AlertBar, Footer, etc.) call this to get
 * global site configuration like phone number, social links, etc.
 */

import { NextResponse } from 'next/server'
import SiteSettings from '@/models/SiteSettings'
import { connectCMSDb } from '@/lib/db-cms'

export const dynamic = 'force-dynamic'

const DEFAULT_SETTINGS = {
  phone: '+91 96273 32332',
  email: 'marketing@digisharkscommunications.com',
  address: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
  businessHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  socialLinks: [
    { platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/digisharks', iconSvg: '', iconEmoji: '📘' },
    { platform: 'twitter', label: 'X / Twitter', url: 'https://twitter.com/digisharks', iconSvg: '', iconEmoji: '🐦' },
    { platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/digisharks', iconSvg: '', iconEmoji: '📸' },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/digisharks', iconSvg: '', iconEmoji: '💼' },
    { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@digisharks', iconSvg: '', iconEmoji: '▶️' },
  ],
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

export async function GET() {
  try {
    await connectCMSDb()

    const settings = await SiteSettings.findOne({ key: 'global' })
      .select('-_id -__v -key -createdAt -updatedAt')
      .lean()

    if (!settings) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('[public] GET /api/public/settings error:', err)
    // Return defaults on error so frontend doesn't break
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}
