import mongoose, { Schema, Document, Model } from 'mongoose'

export interface CheckToggle {
  key: string
  label: string
  enabled: boolean
}

export interface ISeoAuditConfig extends Document {
  googleApiKey: string
  checkToggles: CheckToggle[]
  updatedAt: Date
}

const CheckToggleSchema = new Schema<CheckToggle>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
)

const SeoAuditConfigSchema = new Schema<ISeoAuditConfig>(
  {
    googleApiKey: { type: String, default: '' },
    checkToggles: {
      type: [CheckToggleSchema],
      default: [
        { key: 'pagespeed', label: 'PageSpeed Insights', enabled: true },
        { key: 'ssl', label: 'SSL Certificate', enabled: true },
        { key: 'safebrowsing', label: 'Safe Browsing', enabled: true },
        { key: 'robotstxt', label: 'Robots.txt', enabled: true },
        { key: 'sitemap', label: 'Sitemap', enabled: true },
        { key: 'metatags', label: 'Meta Tags', enabled: true },
        { key: 'structureddata', label: 'Structured Data', enabled: true },
        { key: 'htmlvalidation', label: 'HTML Validation', enabled: true },
      ],
    },
  },
  { timestamps: true }
)

const SeoAuditConfig: Model<ISeoAuditConfig> =
  mongoose.models.SeoAuditConfig ||
  mongoose.model<ISeoAuditConfig>('SeoAuditConfig', SeoAuditConfigSchema)

export default SeoAuditConfig
