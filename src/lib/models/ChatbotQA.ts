import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatbotQA extends Document {
  question: string
  answer: string
  category: string
  isActive: boolean
  hitCount: number
  createdAt: Date
  updatedAt: Date
}

const ChatbotQASchema = new Schema<IChatbotQA>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

ChatbotQASchema.index({ question: 'text', answer: 'text', category: 'text' })
ChatbotQASchema.index({ isActive: 1, hitCount: -1 })

const ChatbotQA: Model<IChatbotQA> =
  mongoose.models.ChatbotQA || mongoose.model<IChatbotQA>('ChatbotQA', ChatbotQASchema)

export default ChatbotQA
