/**
 * CMS Admin Me API
 *
 * GET /api/content/admin/me
 *
 * Returns the current admin user info if logged in,
 * or 401 if not authenticated.
 * Used by QuickEditButton to show/hide edit controls.
 */

import { NextResponse } from 'next/server'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await getCMSAdminFromCookies()

    if (!admin) {
      return NextResponse.json(
        { loggedIn: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      loggedIn: true,
      username: admin.username,
    })
  } catch (err) {
    console.error('[cms] GET /api/content/admin/me error:', err)
    return NextResponse.json(
      { loggedIn: false },
      { status: 500 }
    )
  }
}
