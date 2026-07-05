import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getTrashCount, getTrashCountsBySection } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const total = await getTrashCount()
    const bySection = await getTrashCountsBySection()
    return NextResponse.json({ total, bySection })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get trash count'
    console.error('GET trash count error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
