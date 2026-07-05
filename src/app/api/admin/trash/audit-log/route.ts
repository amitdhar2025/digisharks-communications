import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { getAuditLog } from '@/lib/trash'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Only super admin can view audit logs' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const section = searchParams.get('section') || 'all'

    const { entries, total } = await getAuditLog(page, limit, section)

    return NextResponse.json({ entries, total, page, limit })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch audit log'
    console.error('GET audit-log error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
