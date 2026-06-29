import { NextRequest, NextResponse } from 'next/server'
import { getLoginLogsCollection } from '@/lib/db'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/login-logs/:id/block
 * Block an IP or user from logging in.
 * Body: { type: 'ip' | 'user', blocked: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { type, blocked } = body

    if (!type || !['ip', 'user'].includes(type)) {
      return NextResponse.json({ error: 'Invalid block type. Use "ip" or "user".' }, { status: 400 })
    }

    const col = await getLoginLogsCollection()
    const log = await col.findOne({ _id: new ObjectId(id) })
    if (!log) {
      return NextResponse.json({ error: 'Log entry not found' }, { status: 404 })
    }

    const filter = type === 'ip' ? { ip: log.ip } : { username: log.username }

    const setFields: Record<string, any> = {}
    if (type === 'ip') {
      setFields.blockedIp = blocked
    } else {
      setFields.blockedUser = blocked
    }

    if (blocked) {
      setFields.blockedAt = new Date()
      setFields.blockedBy = admin.username
    }

    // Use $unset to clear blockedAt/blockedBy when unblocking
    const $unset: Record<string, ''> = {}
    if (!blocked) {
      $unset.blockedAt = ''
      $unset.blockedBy = ''
    }

    await col.updateMany(
      filter,
      Object.keys($unset).length > 0
        ? { $set: setFields, $unset }
        : { $set: setFields }
    )

    return NextResponse.json({
      success: true,
      message: blocked
        ? `${type === 'ip' ? 'IP' : 'User'} "${type === 'ip' ? log.ip : log.username}" has been blocked.`
        : `${type === 'ip' ? 'IP' : 'User'} "${type === 'ip' ? log.ip : log.username}" has been unblocked.`,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update block status' }, { status: 500 })
  }
}
