import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICareerApplication extends Document {
  jobId: mongoose.Types.ObjectId
  applicantName: string
  email: string
  phone: string
  coverLetter: string
  resumeUrl: string        // Cloudinary URL of the uploaded CV
  resumePublicId: string   // Cloudinary public ID for deletion
  status: 'under-review' | 'shortlisted' | 'under-process' | 'selected' | 'not-selected'
  adminNotes: string
  statusUpdatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const CareerApplicationSchema = new Schema<ICareerApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'CareerJob', required: true, index: true },
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    coverLetter: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumePublicId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['under-review', 'shortlisted', 'under-process', 'selected', 'not-selected'],
      default: 'under-review',
    },
    adminNotes: { type: String, default: '' },
    statusUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

CareerApplicationSchema.index({ jobId: 1, status: 1 })
CareerApplicationSchema.index({ email: 1 })
CareerApplicationSchema.index({ createdAt: -1 })

const CareerApplication: Model<ICareerApplication> =
  mongoose.models.CareerApplication ||
  mongoose.model<ICareerApplication>('CareerApplication', CareerApplicationSchema)

export default CareerApplication
