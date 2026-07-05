import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getTrashCollection, getEffectiveRetentionDays } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    const trashCol = await getTrashCollection()
    const items = await trashCol
      .find({ permanentlyDeletedAt: null })
      .sort({ deletedAt: -1 })
      .limit(100) // fetch more to filter by retention
      .toArray()

    // Compute remaining days for each item
    const now = Date.now()
    const expiringItems = []

    for (const item of items) {
      if (item.restoredAt) continue
      const retentionDays = await getEffectiveRetentionDays(item.collectionName)
      const elapsed = now - new Date(item.deletedAt).getTime()
      const remainingDays = Math.max(0, Math.round(retentionDays - elapsed / (24 * 60 * 60 * 1000)))

      // Only include items expiring within 3 days
      if (remainingDays <= 3) {
        expiringItems.push({
          _id: item._id?.toString() || '',
          title: item.title,
          section: item.collectionName,
          sectionLabel: item.sectionLabel,
          deletedBy: item.deletedBy,
          deletedAt: item.deletedAt?.toISOString?.() ?? String(item.deletedAt),
          retentionDays,
          remainingDays,
          expiresAt: new Date(new Date(item.deletedAt).getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
    }

    // Sort by remainingDays ascending (most urgent first)
    expiringItems.sort((a, b) => a.remainingDays - b.remainingDays)

    return NextResponse.json({ items: expiringItems.slice(0, limit) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch expiring trash'
    console.error('GET trash/expiring error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
