import { NextRequest, NextResponse } from 'next/server'
import { clearAllCaches } from '@/lib/clear-caches'
import { getAdminFromCookies } from '@/lib/auth'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'

/**
 * POST /api/admin/cache/clear
 * Clears all in-memory caches and invalidates Next.js data cache.
 * Accessible to authenticated admin users (both old admin & CMS admin).
 */

export async function POST(req: NextRequest) {
  // Auth check — verify admin session (supports both old admin & CMS admin)
  const admin = await getAdminFromCookies()
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = clearAllCaches()

  return NextResponse.json({
    success: true,
    message: 'All caches cleared successfully!',
    details: results,
    timestamp: new Date().toISOString(),
  })
}
