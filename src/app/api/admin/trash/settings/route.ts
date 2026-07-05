import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { getTrashSettings, updateTrashSettings } from '@/lib/trash'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/trash/settings
 * Returns the current trash retention settings.
 */
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getTrashSettings()
    return NextResponse.json({ settings })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load settings'
    console.error('GET trash settings error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * PUT /api/admin/trash/settings
 * Updates trash retention settings. Super admin only.
 */
export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Only super admin can change trash settings' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { globalRetentionDays, perSectionRetentionDays } = body

    // Validate
    if (globalRetentionDays !== undefined) {
      const days = Number(globalRetentionDays)
      if (!Number.isFinite(days) || days < 1 || days > 365) {
        return NextResponse.json({ error: 'Retention days must be between 1 and 365' }, { status: 400 })
      }
    }

    if (perSectionRetentionDays !== undefined && typeof perSectionRetentionDays !== 'object') {
      return NextResponse.json({ error: 'perSectionRetentionDays must be an object' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (globalRetentionDays !== undefined) updates.globalRetentionDays = Number(globalRetentionDays)
    if (perSectionRetentionDays !== undefined) updates.perSectionRetentionDays = perSectionRetentionDays

    const settings = await updateTrashSettings(
      updates as any,
      { username: admin.username, role: admin.role },
    )

    return NextResponse.json({ settings, message: 'Retention settings updated.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update settings'
    console.error('PUT trash settings error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
