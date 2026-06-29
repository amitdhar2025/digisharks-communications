import { NextRequest, NextResponse } from 'next/server'
import { getLoginLogsCollection } from '@/lib/db'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { ObjectId } from 'mongodb'

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
    const col = await getLoginLogsCollection()
    const result = await col.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Log entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Log entry deleted.' })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete log entry' }, { status: 500 })
  }
}
