import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { autoCleanupTrash } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Only super admin can trigger auto-cleanup' }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const days = body.days ? Number(body.days) : undefined

    const cleaned = await autoCleanupTrash(days)
    return NextResponse.json({
      message: `Auto-cleanup complete. ${cleaned} expired item(s) permanently deleted.`,
      cleaned,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to auto-cleanup trash'
    console.error('POST auto-cleanup error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
