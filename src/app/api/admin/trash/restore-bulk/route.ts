import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { bulkRestoreFromTrash } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ids } = body as { ids: string[] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
    }

    const result = await bulkRestoreFromTrash(ids, {
      username: admin.username,
      role: admin.role,
    })

    return NextResponse.json({
      message: `${result.success} item(s) restored.`,
      ...result,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to bulk restore items'
    console.error('POST restore-bulk error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
