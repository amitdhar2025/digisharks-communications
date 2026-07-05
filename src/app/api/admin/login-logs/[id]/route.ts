import { NextRequest, NextResponse } from 'next/server'
import { getLoginLogsCollection } from '@/lib/db'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import { softDeleteFromNative } from '@/lib/trash'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/login-logs/:id
 * Delete a single login log entry.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await softDeleteFromNative(
      'loginlogs',
      'login_logs',
      id,
      { username: admin.username, role: admin.role },
      (doc) => `Login: ${(doc as any)?.username || id}`,
    )

    return NextResponse.json({ success: true, message: 'Log entry moved to trash.' })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete log entry' }, { status: 500 })
  }
}
