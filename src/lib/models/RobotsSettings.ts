import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRobotsRule {
  bot: string
  type: 'allow' | 'disallow'
  path: string
}

export interface IRobotsSettings extends Document {
  rules: IRobotsRule[]
  sitemapUrl: string
  crawlDelay: number | null
  blockAIBots: boolean
  rawContent: string
  lastSaved: Date | null
  fileSize: number
  createdAt: Date
  updatedAt: Date
}

const RobotsRuleSchema = new Schema<IRobotsRule>(
  {
    bot: { type: String, required: true },
    type: { type: String, enum: ['allow', 'disallow'], required: true },
    path: { type: String, required: true },
  },
  { _id: false },
)

const RobotsSettingsSchema = new Schema<IRobotsSettings>(
  {
    rules: { type: [RobotsRuleSchema], default: [] },
    sitemapUrl: {
      type: String,
      default: 'https://www.digisharkscommunications.com/sitemap.xml',
    },
    crawlDelay: { type: Number, default: null },
    blockAIBots: { type: Boolean, default: false },
    rawContent: { type: String, default: '' },
    lastSaved: { type: Date, default: null },
    fileSize: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const RobotsSettings: Model<IRobotsSettings> =
  mongoose.models.RobotsSettings ||
  mongoose.model<IRobotsSettings>('RobotsSettings', RobotsSettingsSchema)

export default RobotsSettings
