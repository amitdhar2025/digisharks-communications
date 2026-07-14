/**
 * CMS Admin Logout API
 *
 * POST /api/content/admin/logout
 *
 * Clears the httpOnly session cookie, effectively logging the admin out.
 */

import { NextResponse } from 'next/server'
import { clearCMSCookie } from '@/lib/auth-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const admin = await getCMSAdminFromCookies()
    await clearCMSCookie()
    if (admin?.username) {
      logActivity({ event: 'logout', description: `CMS admin logged out: ${admin.username}`, username: admin.username, dashboard: 'cms' }).catch(() => {})
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/logout error:', err)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
