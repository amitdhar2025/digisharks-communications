import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { clearAllAttacks } from '@/lib/anti-spam'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deleted = await clearAllAttacks()
    return NextResponse.json({ success: true, deleted })
  } catch (err) {
    console.error('DELETE /api/admin/security/clear-logs error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
