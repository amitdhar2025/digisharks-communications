import { NextRequest, NextResponse } from 'next/server'
import { clearAllCaches } from '@/lib/clear-caches'

/**
 * POST /api/admin/cache/clear
 * Clears all in-memory caches and invalidates Next.js data cache.
 * Accessible only to authenticated admin users.
 */

export async function POST(req: NextRequest) {
  // Simple auth check — verify admin session
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const meRes = await fetch(new URL('/api/admin/me', req.url), {
      headers: { cookie: cookieHeader },
    })
    const meData = await meRes.json()
    if (!meData?.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 401 })
  }

  const results = clearAllCaches()

  return NextResponse.json({
    success: true,
    message: 'All caches cleared successfully!',
    details: results,
    timestamp: new Date().toISOString(),
  })
}
