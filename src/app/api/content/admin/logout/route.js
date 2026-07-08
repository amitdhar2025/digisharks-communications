/**
 * CMS Admin Logout API
 *
 * POST /api/content/admin/logout
 *
 * Clears the httpOnly session cookie, effectively logging the admin out.
 */

import { NextResponse } from 'next/server'
import { clearCMSCookie } from '@/lib/auth-cms'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await clearCMSCookie()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/logout error:', err)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
