/**
 * Seed Default Site Settings
 *
 * Creates a global site settings document with default contact info,
 * social links, and branding text.
 *
 * Usage:
 *   npm run seed:settings
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local')
  process.exit(1)
}

const DEFAULT_SETTINGS = {
  key: 'global',
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

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║       Seed Default Site Settings                   ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')

  console.log('📦 Connecting to MongoDB...')
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')
  } catch (err) {
    console.error('❌ Failed to connect:', err.message)
    process.exit(1)
  }

  const SiteSettingsSchema = new mongoose.Schema(
    {
      key: { type: String, default: 'global', unique: true },
      phone: String,
      email: String,
      address: String,
      businessHours: String,
      socialFacebook: String,
      socialTwitter: String,
      socialInstagram: String,
      socialLinkedin: String,
      socialYoutube: String,
      siteName: String,
      footerTagline: String,
      copyrightText: String,
      privacyPolicyUrl: String,
      termsUrl: String,
      refundPolicyUrl: String,
      maintenanceMode: Boolean,
      headerLogo: String,
      headerLogoAlt: String,
      footerLogo: String,
      footerLogoAlt: String,
      favicon: String,
      maintenanceMessage: String,
    },
    { timestamps: true }
  )

  const SiteSettings =
    mongoose.models.SiteSettings ||
    mongoose.model('SiteSettings', SiteSettingsSchema)

  const existing = await SiteSettings.findOne({ key: 'global' })

  if (existing) {
    // Merge any missing default fields into the existing document so
    // newly added fields (e.g. maintenanceMode) get populated without
    // overwriting values the user has already set via the CMS.
    const { key: _k, ...defaults } = DEFAULT_SETTINGS
    const updateFields = {}
    for (const [field, value] of Object.entries(defaults)) {
      if (existing[field] === undefined) {
        updateFields[field] = value
      }
    }

    // Migrate any legal URLs still set to placeholder '#' to the actual paths
    const LEGAL_URL_MIGRATIONS = {
      privacyPolicyUrl: '/privacy-policy',
      termsUrl: '/terms-and-conditions',
      refundPolicyUrl: '/refund-policy',
    }
    for (const [field, url] of Object.entries(LEGAL_URL_MIGRATIONS)) {
      if (existing[field] === '#') {
        updateFields[field] = url
      }
    }
    const keys = Object.keys(updateFields)
    if (keys.length > 0) {
      await SiteSettings.updateOne(
        { key: 'global' },
        { $set: updateFields }
      )
      console.log(`✅ Added ${keys.length} missing field(s): ${keys.join(', ')}`)
    } else {
      console.log('⏭️  All fields already present, skipping')
    }
  } else {
    await SiteSettings.create(DEFAULT_SETTINGS)
    console.log('✅ Global settings created with default values')
  }

  console.log('')
  console.log('You can now manage these settings from the CMS:')
  console.log('   http://localhost:3000/content/admin/settings')
  console.log('')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
