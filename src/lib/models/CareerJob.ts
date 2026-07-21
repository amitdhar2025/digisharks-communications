import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICareerJob extends Document {
  title: string
  slug: string
  category: string        // e.g. 'full-time', 'part-time', 'internship', 'contract'
  department: string
  numberOfPositions: number
  salaryPackage: string   // e.g. '₹3L – ₹6L PA' or 'Negotiable'
  experienceRequired: string // e.g. '0–2 years' or 'Fresher'
  workProfile: string
  jobDescription: string
  location: string
  status: 'active' | 'inactive' | 'filled'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CareerJobSchema = new Schema<ICareerJob>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    numberOfPositions: { type: Number, default: 1 },
    salaryPackage: { type: String, default: 'Negotiable' },
    experienceRequired: { type: String, default: 'Fresher' },
    workProfile: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'filled'], default: 'active' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

CareerJobSchema.index({ status: 1, isActive: 1, category: 1 })

const CareerJob: Model<ICareerJob> =
  mongoose.models.CareerJob || mongoose.model<ICareerJob>('CareerJob', CareerJobSchema)

export default CareerJob
