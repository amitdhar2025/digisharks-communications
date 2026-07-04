import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISitemapSettings extends Document {
  includeBlogPosts: boolean
  includePages: boolean
  includeCategories: boolean
  includeTags: boolean
  includeImages: boolean
  autoPing: boolean
  includeProducts: boolean
  maxUrls: number
  excludeIds: string
  lastGenerated: Date | null
  lastPingGoogle: Date | null
  lastPingBing: Date | null
  totalUrls: number
  fileSize: number
  createdAt: Date
  updatedAt: Date
}

const SitemapSettingsSchema = new Schema<ISitemapSettings>(
  {
    includeBlogPosts: { type: Boolean, default: true },
    includePages: { type: Boolean, default: true },
    includeCategories: { type: Boolean, default: true },
    includeTags: { type: Boolean, default: false },
    includeImages: { type: Boolean, default: true },
    autoPing: { type: Boolean, default: true },
    includeProducts: { type: Boolean, default: true },
    maxUrls: { type: Number, default: 1000 },
    excludeIds: { type: String, default: '' },
    lastGenerated: { type: Date, default: null },
    lastPingGoogle: { type: Date, default: null },
    lastPingBing: { type: Date, default: null },
    totalUrls: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const SitemapSettings: Model<ISitemapSettings> =
  mongoose.models.SitemapSettings ||
  mongoose.model<ISitemapSettings>('SitemapSettings', SitemapSettingsSchema)

export default SitemapSettings
