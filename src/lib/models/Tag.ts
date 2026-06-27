import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITag extends Document {
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema)

export default Tag
