/**
 * BackupRecord Model — stores metadata about each backup operation.
 *
 * Records are created by the backup script (scripts/backup.js) after a
 * successful backup upload to Backblaze B2. The admin dashboard reads
 * these records to display backup history.
 *
 * Retention cleanup automatically deletes records older than:
 *   - 7 days for daily backups
 *   - 12 months for monthly archives
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBackupRecord extends Document {
  /** 'full' | 'database' | 'media' */
  type: 'full' | 'database' | 'media'

  /** 'daily' | 'monthly' */
  period: 'daily' | 'monthly'

  /** ISO date string of when the backup was taken */
  date: string

  /** File name in B2 (e.g. 2026-07-13_full.zip) */
  fileName: string

  /** File size in bytes */
  fileSizeBytes: number

  /** Human-readable file size (e.g. "45.2 MB") */
  fileSize: string

  /** Download URL from Backblaze B2 */
  downloadUrl: string

  /** Duration of the backup process in seconds */
  durationSeconds: number

  /** Number of database collections exported (if applicable) */
  collectionsCount?: number

  /** Number of media assets downloaded (if applicable) */
  mediaCount?: number

  /** Status of the backup */
  status: 'success' | 'failed' | 'partial'

  /** Error message if failed */
  errorMessage?: string

  /** Timestamps handled by mongoose */
  createdAt: Date
  updatedAt: Date
}

const BackupRecordSchema = new Schema<IBackupRecord>(
  {
    type: {
      type: String,
      enum: ['full', 'database', 'media'],
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['daily', 'monthly'],
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
    downloadUrl: {
      type: String,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
    },
    collectionsCount: {
      type: Number,
    },
    mediaCount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Composite index for efficient history queries
BackupRecordSchema.index({ period: 1, createdAt: -1 })
BackupRecordSchema.index({ type: 1, period: 1, createdAt: -1 })
// Index for retention cleanup
BackupRecordSchema.index({ period: 1, date: 1 })

const BackupRecord: Model<IBackupRecord> =
  mongoose.models.BackupRecord ||
  mongoose.model<IBackupRecord>('BackupRecord', BackupRecordSchema)

export default BackupRecord
