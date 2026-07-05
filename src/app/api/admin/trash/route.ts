import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { listTrashItems, autoCleanupTrash, getTrashSettings, getEffectiveRetentionDays } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const section = searchParams.get('section') || 'all'
    const search = searchParams.get('search') || ''

    const result = await listTrashItems(page, limit, section, search)

    // Get settings and retention info for each item
    const settings = await getTrashSettings()

    // Compute retention days for each item based on its section
    const itemsWithRetention = await Promise.all(
      result.items.map(async (item) => {
        const retentionDays = await getEffectiveRetentionDays(item.collectionName)
        const elapsed = Date.now() - new Date(item.deletedAt).getTime()
        const remainingDays = Math.max(0, Math.round(retentionDays - elapsed / (24 * 60 * 60 * 1000)))
        return {
          ...item,
          retentionDays,
          remainingDays,
        }
      }),
    )

    return NextResponse.json({
      ...result,
      items: itemsWithRetention,
      settings: {
        globalRetentionDays: settings.globalRetentionDays,
        perSectionRetentionDays: settings.perSectionRetentionDays,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list trash'
    console.error('GET trash list error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Bulk clean up expired trash items using configured retention settings.
 * Only super admin can call this.
 */
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Only super admin can clean up trash' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'cleanup-expired') {
      const cleaned = await autoCleanupTrash()
      return NextResponse.json({ message: `Cleaned up ${cleaned} expired trash items.` })
    }

    return NextResponse.json({ error: 'Use ?action=cleanup-expired to auto-cleanup' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to clean up trash'
    console.error('DELETE trash cleanup error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
