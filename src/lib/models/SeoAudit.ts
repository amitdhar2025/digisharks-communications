import mongoose, { Schema, Document, Model } from 'mongoose'

export interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  score?: number
  details: string
  raw?: any
}

export interface ISeoAudit extends Document {
  url: string
  domain: string
  overall: 'pass' | 'warn' | 'fail' | 'pending'
  checks: CheckResult[]
  pagespeed?: {
    mobile?: Record<string, any>
    desktop?: Record<string, any>
  }
  userName: string
  userEmail: string
  userPhone?: string
  createdAt: Date
}

const CheckResultSchema = new Schema<CheckResult>(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ['pass', 'warn', 'fail'], required: true },
    score: { type: Number },
    details: { type: String, default: '' },
    raw: { type: Schema.Types.Mixed },
  },
  { _id: false }
)

const SeoAuditSchema = new Schema<ISeoAudit>(
  {
    url: { type: String, required: true, trim: true },
    domain: { type: String, required: true, index: true },
    overall: { type: String, enum: ['pass', 'warn', 'fail', 'pending'], required: true },
    checks: { type: [CheckResultSchema], default: [] },
    pagespeed: { type: Schema.Types.Mixed },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true },
    userPhone: { type: String, trim: true },
  },
  { timestamps: true }
)

SeoAuditSchema.index({ createdAt: -1 })
SeoAuditSchema.index({ domain: 1, createdAt: -1 })

// Force recompile with the latest schema — prevents stale cached models
// from stripping newly-added fields like userName/userEmail/userPhone
if (mongoose.models.SeoAudit) {
  delete mongoose.models.SeoAudit
}
if ((mongoose as any).modelSchemas?.SeoAudit) {
  delete (mongoose as any).modelSchemas.SeoAudit
}
const SeoAudit: Model<ISeoAudit> = mongoose.model<ISeoAudit>('SeoAudit', SeoAuditSchema)

export default SeoAudit
