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
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '5', 10)))
    const section = searchParams.get('section') || undefined

    const trashCol = await getTrashCollection()
    const filter: Record<string, unknown> = { permanentlyDeletedAt: null }
    if (section) filter.collectionName = section

    const items = await trashCol
      .find(filter)
      .sort({ deletedAt: -1 })
      .limit(limit)
      .toArray()

    // Compute retention and remaining days for each item
    const now = Date.now()
    const result = await Promise.all(
      items.map(async (item) => {
        const retentionDays = await getEffectiveRetentionDays(item.collectionName)
        const elapsed = now - new Date(item.deletedAt).getTime()
        const remainingDays = Math.max(0, Math.round(retentionDays - elapsed / (24 * 60 * 60 * 1000)))
        return {
          _id: item._id?.toString() || '',
          title: item.title,
          section: item.collectionName,
          sectionLabel: item.sectionLabel,
          deletedBy: item.deletedBy,
          deletedAt: item.deletedAt?.toISOString?.() ?? String(item.deletedAt),
          retentionDays,
          remainingDays,
        }
      }),
    )

    return NextResponse.json({ items: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch recent trash'
    console.error('GET trash/recent error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
