import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatbotSettings extends Document {
  botName: string
  welcomeMessage: string
  fallbackMessage: string

  // Legacy chat-window colors (kept for back-compat with the in-window UI)
  primaryColor: string
  accentColor: string
  closeButtonColor: string

  // ===== NEW: Bubble-icon colors (the chat button at the corner) =====
  bubbleBgColor: string        // Outer circle background (e.g. teal #20B486)
  bubbleBorderColor: string    // Outer circle border (e.g. white #ffffff)
  bubbleShadowColor: string    // Drop shadow under the circle (rgba)
  faceStrokeColor: string      // Robot face outline (e.g. white)
  faceFillColor: string        // Eyes / antenna dot fill
  faceCheekColor: string       // Cheek blush accent
  antennaColor: string         // Antenna dot color

  // ===== NEW: "Talk to us" pill colors =====
  pillLabel: string            // Text shown on the pill (e.g. "Talk to us")
  pillBgColor: string          // Pill background (e.g. dark navy #1E2336)
  pillTextColor: string        // Pill text color (e.g. white)
  pillBorderColor: string      // Pill border color
  pillShadowColor: string      // Pill drop shadow

  // ===== NEW: Size controls (changeable from admin) =====
  bubbleSize: number           // Diameter of the round chat bubble in px (40–160)
  pillFontSize: number         // Font size of the pill label in px (10–28)
  pillPaddingX: number         // Pill horizontal padding in px (8–48)
  pillPaddingY: number         // Pill vertical padding in px (4–28)

  // Mobile positioning
  mobileBottomOffset: number   // Extra bottom offset on mobile product pages (px)

  isEnabled: boolean
  updatedAt: Date
}

const ChatbotSettingsSchema = new Schema<IChatbotSettings>(
  {
    botName: { type: String, default: 'DigiSharks ChatBot' },
    welcomeMessage: { type: String, default: 'Hi! How can I help you today?' },
    fallbackMessage: { type: String, default: 'Sorry, for more details connect with us. Thank you' },

    // Legacy
    primaryColor: { type: String, default: '#FF5B2E' },
    accentColor: { type: String, default: '#0F1628' },
    closeButtonColor: { type: String, default: '#ffffff' },

    // Bubble icon defaults — these mirror the reference image
    bubbleBgColor: { type: String, default: '#20B486' },
    bubbleBorderColor: { type: String, default: '#ffffff' },
    bubbleShadowColor: { type: String, default: 'rgba(32, 180, 134, 0.45)' },
    faceStrokeColor: { type: String, default: '#ffffff' },
    faceFillColor: { type: String, default: '#ffffff' },
    faceCheekColor: { type: String, default: '#FF8FA3' },
    antennaColor: { type: String, default: '#FF5B2E' },

    // Pill defaults — dark navy pill, white text, matching the reference
    pillLabel: { type: String, default: 'Talk to us' },
    pillBgColor: { type: String, default: '#1E2336' },
    pillTextColor: { type: String, default: '#ffffff' },
    pillBorderColor: { type: String, default: 'transparent' },
    pillShadowColor: { type: String, default: 'rgba(15, 22, 40, 0.35)' },

    // Size defaults
    bubbleSize: { type: Number, default: 72 },
    pillFontSize: { type: Number, default: 15 },
    pillPaddingX: { type: Number, default: 22 },
    pillPaddingY: { type: Number, default: 10 },

    // Mobile positioning defaults
    mobileBottomOffset: { type: Number, default: 110 },

    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const ChatbotSettings: Model<IChatbotSettings> =
  mongoose.models.ChatbotSettings ||
  mongoose.model<IChatbotSettings>('ChatbotSettings', ChatbotSettingsSchema)

export async function getSettings(): Promise<IChatbotSettings> {
  const settings = await ChatbotSettings.findOne().lean()
  if (!settings) {
    return {
      botName: 'DigiSharks ChatBot',
      welcomeMessage: 'Hi! How can I help you today?',
      fallbackMessage: 'Sorry, for more details connect with us. Thank you',
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
      mobileBottomOffset: 110,
      isEnabled: true,
    } as unknown as IChatbotSettings
  }
  return settings as IChatbotSettings
}

export default ChatbotSettings
