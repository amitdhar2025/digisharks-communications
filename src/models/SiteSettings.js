/**
 * SiteSettings Model — stores global site configuration
 *
 * This is a singleton model (single document) that holds all
 * global site settings: phone, email, address, social links,
 * business hours, and other site-wide config values.
 *
 * Frontend components (AlertBar, Footer, etc.) fetch these
 * from the public API to avoid hardcoding.
 */

import mongoose from 'mongoose'

const SiteSettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always 'global'
    key: {
      type: String,
      default: 'global',
      unique: true,
    },

    // ── Contact Info ──────────────────────────────────────────────
    phone: {
      type: String,
      default: '+91 96273 32332',
    },
    email: {
      type: String,
      default: 'marketing@digisharkscommunications.com',
    },
    address: {
      type: String,
      default: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
    },
    businessHours: {
      type: String,
      default: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
    },

    // ── Social Links ──────────────────────────────────────────────
    socialFacebook: {
      type: String,
      default: 'https://www.facebook.com/digisharks',
    },
    socialTwitter: {
      type: String,
      default: 'https://twitter.com/digisharks',
    },
    socialInstagram: {
      type: String,
      default: 'https://www.instagram.com/digisharks',
    },
    socialLinkedin: {
      type: String,
      default: 'https://www.linkedin.com/company/digisharks',
    },
    socialYoutube: {
      type: String,
      default: 'https://www.youtube.com/@digisharks',
    },

    // ── Branding ──────────────────────────────────────────────────
    siteName: {
      type: String,
      default: 'Digisharks Communications',
    },
    footerTagline: {
      type: String,
      default: 'Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.',
    },
    copyrightText: {
      type: String,
      default: '© {year} Digisharks Communications. All Rights Reserved. Made with 💙 in India.',
    },

    // ── Legal Links ────────────────────────────────────────────────
    privacyPolicyUrl: {
      type: String,
      default: '/privacy-policy',
    },
    termsUrl: {
      type: String,
      default: '/terms-and-conditions',
    },
    refundPolicyUrl: {
      type: String,
      default: '/refund-policy',
    },

    // ── Logos & Favicon ──────────────────────────────────────────────
    headerLogo: {
      type: String,
      default: '',
    },
    headerLogoAlt: {
      type: String,
      default: 'DigiSharks Logo',
    },
    footerLogo: {
      type: String,
      default: '',
    },
    footerLogoAlt: {
      type: String,
      default: 'DigiSharks Logo',
    },
    favicon: {
      type: String,
      default: '',
    },

    // ── Maintenance Mode ────────────────────────────────────────────
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'We\'re giving our website a performance upgrade. Our team is working on it and we\'ll be back shortly. For urgent inquiries, contact us at marketing@digisharkscommunications.com.',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', SiteSettingsSchema)
