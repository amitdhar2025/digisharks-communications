/**
 * Public Init API — Combined endpoint (reduces 7+ API calls to 1)
 *
 * GET /api/public/init
 *
 * Returns all public data needed by AlertBar, Navigation, and ChatWidget
 * in a single response. This eliminates the waterfall of separate API
 * calls that each independently connect to the database.
 *
 * Data returned:
 *   - alertBar     → menu items with type='alert-bar'
 *   - alertTicker  → menu items with type='alert-ticker'
 *   - mainNav      → menu items with type='main-nav'
 *   - servicesSub  → menu items with type='services-sub'
 *   - settings     → site settings (phone, social links, logos, etc.)
 *   - chatbot      → chatbot settings + services
 */

import { NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import MenuItem from '@/models/MenuItem'
import SiteSettings from '@/models/SiteSettings'
import ChatbotSettings from '@/lib/models/ChatbotSettings'
import { TTLCache } from '@/lib/cache'
import type { ServiceItem } from '@/lib/service-types'

// 30-second in-memory cache for instant page loads
type InitData = {
  alertBar: any[]; alertTicker: any[]; mainNav: any[]; servicesSub: any[]
  settings: Record<string, any>; chatbot: Record<string, any>; services: ServiceItem[]
}
const initCache = new TTLCache<InitData>(30_000) // 30 seconds
export const dynamic = 'force-dynamic'

// ── Defaults (matching each standalone endpoint) ───────────────────

const DEFAULT_SETTINGS = {
  phone: '+91 96273 32332',
  email: 'marketing@digisharkscommunications.com',
  address: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
  businessHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  headerSocialLinks: [],
  footerSocialLinks: [],
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
  maintenanceMessage: "We're giving our website a performance upgrade. Our team is working on it and we'll be back shortly. For urgent inquiries, contact us at marketing@digisharkscommunications.com.",
}

const DEFAULT_CHATBOT_SETTINGS = {
  botName: 'DigiSharks ChatBot',
  welcomeMessage: 'Hi! How can I help you today?',
  fallbackMessage: "Sorry, I don't have an answer for that.",
  primaryColor: '#FF5B2E',
  accentColor: '#0F1628',
  closeButtonColor: '#ffffff',
  bubbleBgColor: '#20B486',
  bubbleBorderColor: '#ffffff',
  bubbleShadowColor: 'rgba(32, 180, 134, 0.45)',
  faceStrokeColor: '#ffffff',
  faceFillColor: '#ffffff',
  faceCheekColor: '#FF8FA3',
  antennaColor: '#FF5B2E',
  pillLabel: 'Talk to us',
  pillBgColor: '#1E2336',
  pillTextColor: '#ffffff',
  pillBorderColor: 'transparent',
  pillShadowColor: 'rgba(15, 22, 40, 0.35)',
  bubbleSize: 72,
  pillFontSize: 15,
  pillPaddingX: 22,
  pillPaddingY: 10,
  isEnabled: true,
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'digital-pr', label: 'Digital PR & Media', icon: '📰', path: '/press-release/', pageUrl: '/press-release/', keywords: ['pr', 'press release', 'media coverage'] },
  { id: 'seo-ppc', label: 'SEO & PPC', icon: '📈', path: '/digital-marketing-agency/', pageUrl: '/digital-marketing-agency/', keywords: ['seo', 'ppc', 'google ads'] },
  { id: 'ai-seo-aeo-geo', label: 'AI SEO, AEO & GEO', icon: '🤖', path: '/digital-marketing-agency/', pageUrl: '/digital-marketing-agency/', keywords: ['ai seo', 'aeo', 'geo', 'answer engine'] },
  { id: 'social-media', label: 'Social Media', icon: '📱', path: '/social-media/', pageUrl: '/social-media/', keywords: ['social media', 'instagram'] },
  { id: 'web-dev', label: 'Web Development', icon: '💻', path: '/web-development/', pageUrl: '/web-development/', keywords: ['web development', 'website'] },
  { id: 'brand-promotion', label: 'Brand Promotion', icon: '🏆', path: '/brand-promotion/', pageUrl: '/brand-promotion/', keywords: ['brand promotion', 'branding'] },
  { id: 'political', label: 'Political Campaigns', icon: '🗳️', path: '/services-top-pr-digital-marketing/', pageUrl: '/services-top-pr-digital-marketing/', keywords: ['political', 'campaign', 'election'] },
  { id: 'about', label: 'About Us', icon: '🏢', path: '/about-us/', pageUrl: '/about-us/', keywords: ['about', 'company', 'team'] },
]

export async function GET() {
  const headers = {
    'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60',
    'Pragma': 'cache',
  }

  // ── Check cache first ──────────────────────────────────────────────
  const cached = initCache.get('init_data')
  if (cached) {
    return NextResponse.json(cached, {
      headers: { ...headers, 'X-Cache': 'HIT' },
    })
  }

  try {
    // Connect to Mongoose (connectCMSDb calls connectMongoose internally)
    await connectCMSDb()

    // Fetch all data in parallel
    const [menuItems, settings, chatbotSettings] = await Promise.all([
      MenuItem.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).select('label href order icon type').lean(),
      SiteSettings.findOne({ key: 'global' }).select('-_id -__v -key -createdAt -updatedAt').lean(),
      ChatbotSettings.findOne().lean(),
    ])

    // Group menu items by type
    const byType: Record<string, any[]> = { 'alert-bar': [], 'alert-ticker': [], 'main-nav': [], 'services-sub': [] }
    for (const item of menuItems || []) {
      const t = item.type as string
      if (byType[t]) byType[t].push(item)
    }

    // Build chatbot settings with defaults
    let chatbot = { ...DEFAULT_CHATBOT_SETTINGS }
    if (chatbotSettings) {
      chatbot = { ...chatbot, ...chatbotSettings }
    }

    const responseData: InitData = {
      alertBar: byType['alert-bar'],
      alertTicker: byType['alert-ticker'],
      mainNav: byType['main-nav'],
      servicesSub: byType['services-sub'],
      settings: settings || DEFAULT_SETTINGS,
      chatbot,
      services: DEFAULT_SERVICES,
    }

    // ── Store in cache ───────────────────────────────────────────────
    initCache.set('init_data', responseData)

    return NextResponse.json(responseData, {
      headers: { ...headers, 'X-Cache': 'MISS' },
    })
  } catch (err) {
    console.error('[public] GET /api/public/init error:', err)
    // Return defaults on error so the frontend doesn't break
    return NextResponse.json(
      {
        alertBar: [],
        alertTicker: [],
        mainNav: [],
        servicesSub: [],
        settings: DEFAULT_SETTINGS,
        chatbot: DEFAULT_CHATBOT_SETTINGS,
        services: DEFAULT_SERVICES,
      },
      { headers: { ...headers, 'X-Cache': 'ERROR' } },
    )
  }
}
