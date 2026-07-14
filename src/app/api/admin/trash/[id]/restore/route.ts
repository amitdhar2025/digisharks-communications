import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { restoreFromTrash } from '@/lib/trash'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({})) as { section?: string }
    const section = body.section
    const result = await restoreFromTrash(id, {
      username: admin.username,
      role: admin.role,
    }, section)
    logActivity({ event: 'trash_restore', description: `Restored ${result.collectionName || 'item'} from trash (${id})`, username: admin.username, dashboard: 'admin', target: id }).catch(() => {})
    return NextResponse.json({
      message: `Item restored to ${result.collectionName}.`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to restore item'
    console.error('POST restore error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
