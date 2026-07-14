/**
 * ActivityLog Model — stores a detailed audit trail of admin actions.
 *
 * Tracks who did what, when, where (IP), and optionally what changed.
 * Used by the debug/activity-log page to show admins a timeline of
 * all actions performed across both dashboards.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IActivityLog extends Document {
  /** Event type identifier (login, logout, page_edit, form_edit, etc.) */
  event: string

  /** Human-readable description of the action */
  description: string

  /** Username of the admin who performed the action */
  username: string

  /** Which dashboard: 'admin' (main) or 'cms' (content) */
  dashboard: 'admin' | 'cms'

  /** Optional — targeted page/entity slug or ID */
  target?: string

  /** Optional — additional metadata (changed fields, old/new values, etc.) */
  metadata?: Record<string, any>

  /** IP address of the admin */
  ip?: string

  /** Timestamps handled by mongoose */
  createdAt: Date
  updatedAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    dashboard: {
      type: String,
      enum: ['admin', 'cms'],
      required: true,
      index: true,
    },
    target: {
      type: String,
      default: '',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient date-range queries
ActivityLogSchema.index({ createdAt: -1 })
ActivityLogSchema.index({ event: 1, createdAt: -1 })
ActivityLogSchema.index({ username: 1, createdAt: -1 })

// Prevent model re-compilation in development (hot reload)
const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog
