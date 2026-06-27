import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotSettings from '@/lib/models/ChatbotSettings'
import { getAdminFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
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
}

// Clamp helpers for the size controls
const clamp = (v: any, min: number, max: number, fallback: number) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

function withDefaults(s: any) {
  return {
    ...DEFAULTS,
    ...s,
    closeButtonColor: s?.closeButtonColor || DEFAULTS.closeButtonColor,
    bubbleBorderColor: s?.bubbleBorderColor || DEFAULTS.bubbleBorderColor,
    bubbleShadowColor: s?.bubbleShadowColor || DEFAULTS.bubbleShadowColor,
    faceStrokeColor: s?.faceStrokeColor || DEFAULTS.faceStrokeColor,
    faceFillColor: s?.faceFillColor || DEFAULTS.faceFillColor,
    faceCheekColor: s?.faceCheekColor || DEFAULTS.faceCheekColor,
    antennaColor: s?.antennaColor || DEFAULTS.antennaColor,
    pillLabel: s?.pillLabel || DEFAULTS.pillLabel,
    pillBgColor: s?.pillBgColor || DEFAULTS.pillBgColor,
    pillTextColor: s?.pillTextColor || DEFAULTS.pillTextColor,
    pillBorderColor:
      s?.pillBorderColor === '' || s?.pillBorderColor === undefined
        ? DEFAULTS.pillBorderColor
        : s.pillBorderColor,
    pillShadowColor: s?.pillShadowColor || DEFAULTS.pillShadowColor,
  }
}

export async function GET() {
  // Disable any edge/middleware caching so admin changes reflect immediately
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
  try {
    await connectMongoose()
    let settings = await ChatbotSettings.findOne().lean()

    if (!settings) {
      settings = await ChatbotSettings.create({
        botName: 'DigiSharks ChatBot',
        welcomeMessage: 'Hi! How can I help you today?',
        fallbackMessage: 'Sorry, for more details connect with us. Thank you',
        ...DEFAULTS,
        isEnabled: true,
      })
    }

    return NextResponse.json({ settings: withDefaults(settings) }, { headers })
  } catch (err) {
    console.error('Chatbot settings GET error:', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500, headers })
  }
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()
    const body = await req.json()
    const {
      botName,
      welcomeMessage,
      fallbackMessage,
      primaryColor,
      accentColor,
      closeButtonColor,
      bubbleBgColor,
      bubbleBorderColor,
      bubbleShadowColor,
      faceStrokeColor,
      faceFillColor,
      faceCheekColor,
      antennaColor,
      pillLabel,
      pillBgColor,
      pillTextColor,
      pillBorderColor,
      pillShadowColor,
      bubbleSize,
      pillFontSize,
      pillPaddingX,
      pillPaddingY,
      isEnabled,
    } = body

    let settings = await ChatbotSettings.findOne()
    if (!settings) {
      settings = new ChatbotSettings()
    }

    if (botName !== undefined) settings.botName = botName.trim()
    if (welcomeMessage !== undefined) settings.welcomeMessage = welcomeMessage.trim()
    if (fallbackMessage !== undefined) settings.fallbackMessage = fallbackMessage.trim()

    if (primaryColor !== undefined) settings.primaryColor = primaryColor
    if (accentColor !== undefined) settings.accentColor = accentColor
    if (closeButtonColor !== undefined) settings.closeButtonColor = closeButtonColor

    if (bubbleBgColor !== undefined) settings.bubbleBgColor = bubbleBgColor
    if (bubbleBorderColor !== undefined) settings.bubbleBorderColor = bubbleBorderColor
    if (bubbleShadowColor !== undefined) settings.bubbleShadowColor = bubbleShadowColor
    if (faceStrokeColor !== undefined) settings.faceStrokeColor = faceStrokeColor
    if (faceFillColor !== undefined) settings.faceFillColor = faceFillColor
    if (faceCheekColor !== undefined) settings.faceCheekColor = faceCheekColor
    if (antennaColor !== undefined) settings.antennaColor = antennaColor

    if (pillLabel !== undefined) settings.pillLabel = pillLabel.trim() || 'Talk to us'
    if (pillBgColor !== undefined) settings.pillBgColor = pillBgColor
    if (pillTextColor !== undefined) settings.pillTextColor = pillTextColor
    if (pillBorderColor !== undefined) settings.pillBorderColor = pillBorderColor
    if (pillShadowColor !== undefined) settings.pillShadowColor = pillShadowColor

    // Sizes — clamp to safe ranges so admin can never break the layout
    if (bubbleSize !== undefined)   settings.bubbleSize   = clamp(bubbleSize,   40, 160, DEFAULTS.bubbleSize)
    if (pillFontSize !== undefined) settings.pillFontSize = clamp(pillFontSize, 10, 28,  DEFAULTS.pillFontSize)
    if (pillPaddingX !== undefined) settings.pillPaddingX = clamp(pillPaddingX,  8, 48,  DEFAULTS.pillPaddingX)
    if (pillPaddingY !== undefined) settings.pillPaddingY = clamp(pillPaddingY,  4, 28,  DEFAULTS.pillPaddingY)

    if (isEnabled !== undefined) settings.isEnabled = isEnabled

    await settings.save()

    return NextResponse.json({ settings: withDefaults(settings.toObject()) })
  } catch (err) {
    console.error('Chatbot settings PUT error:', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
