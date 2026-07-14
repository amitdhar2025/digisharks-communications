/**
 * Activity Log Helper
 *
 * Server-side utility for logging admin actions to the ActivityLog collection.
 * Call this from any API route or server action to record an audit trail entry.
 *
 * Usage:
 *   import { logActivity } from '@/lib/activity-log'
 *   await logActivity({
 *     event: 'login',
 *     description: 'Admin user logged in',
 *     username: 'admin',
 *     dashboard: 'admin',
 *     ip: '127.0.0.1',
 *   })
 */

import { connectCMSDb } from '@/lib/db-cms'
import ActivityLog from '@/lib/models/ActivityLog'

export interface LogActivityParams {
  /** Event type identifier (login, logout, page_edit, etc.) */
  event: string
  /** Human-readable description of the action */
  description: string
  /** Username of the admin */
  username: string
  /** Which dashboard: 'admin' or 'cms' */
  dashboard: 'admin' | 'cms'
  /** Optional — targeted page/entity slug or ID */
  target?: string
  /** Optional — additional metadata */
  metadata?: Record<string, any>
  /** Optional — IP address */
  ip?: string
}

/**
 * Log an activity entry to the database.
 * Fire-and-forget — never throws, logs errors to console.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await connectCMSDb()
    await ActivityLog.create({
      event: params.event,
      description: params.description,
      username: params.username,
      dashboard: params.dashboard,
      target: params.target || '',
      metadata: params.metadata || {},
      ip: params.ip || '',
    })
  } catch (err) {
    console.error('[activity-log] Failed to log activity:', err)
  }
}
