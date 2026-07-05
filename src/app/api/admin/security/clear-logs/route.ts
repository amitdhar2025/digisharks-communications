import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const col = db.collection('security_attacks')

    // Soft-delete: move all attack records to trash
    const attacks = await col.find({}).toArray()
    const trashCol = db.collection('trash_items')

    let movedCount = 0
    for (const attack of attacks) {
      await trashCol.insertOne({
        collectionName: 'securityattacks',
        sectionLabel: 'Security Attacks',
        originalId: String(attack._id),
        title: `Attack: ${attack.ip || 'unknown'} - ${attack.reason || 'unknown'}`,
        data: attack as unknown as Record<string, unknown>,
        deletedBy: { username: admin.username, role: admin.role },
        deletedAt: new Date(),
        restoredAt: null,
        restoredBy: null,
        permanentlyDeletedAt: null,
      })
      movedCount++
    }

    await col.deleteMany({})

    return NextResponse.json({ success: true, deleted: movedCount, message: `${movedCount} attack log(s) moved to trash.` })
  } catch (err) {
    console.error('DELETE /api/admin/security/clear-logs error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
