import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRssFeed extends Document {
  name: string
  url: string
  category: string
  status: 'active' | 'inactive'
  location: 'homepage' | 'news-page' | 'both'
  createdAt: Date
  updatedAt: Date
  lastFetchedAt: Date | null
  lastArticleCount: number
}

const RssFeedSchema = new Schema<IRssFeed>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: 'General' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    location: {
      type: String,
      enum: ['homepage', 'news-page', 'both'],
      default: 'both',
    },
    lastFetchedAt: { type: Date, default: null },
    lastArticleCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

RssFeedSchema.index({ status: 1, location: 1 })
RssFeedSchema.index({ category: 1 })
RssFeedSchema.index({ name: 1 })

const RssFeed: Model<IRssFeed> =
  mongoose.models.RssFeed || mongoose.model<IRssFeed>('RssFeed', RssFeedSchema)

export default RssFeed
