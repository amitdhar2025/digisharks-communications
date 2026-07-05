import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { bulkPermanentDelete, getTrashCollection } from '@/lib/trash'
import { deleteAllItemFiles } from '@/lib/cloudinary-delete'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Only super admin can permanently delete items' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { ids } = body as { ids: string[] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
    }

    // Clean up Cloudinary files for each item (best-effort)
    const trashCol = await getTrashCollection()
    for (const id of ids) {
      try {
        const trashDoc = await trashCol.findOne({ _id: new ObjectId(id) })
        if (trashDoc?.data) {
          await deleteAllItemFiles(trashDoc.data)
        }
      } catch (cloudErr) {
        console.warn(`Cloudinary cleanup failed for ${id} (non-blocking):`, cloudErr)
      }
    }

    const result = await bulkPermanentDelete(ids, { username: admin.username, role: admin.role })

    return NextResponse.json({
      message: `${result.success} item(s) permanently deleted.`,
      ...result,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to bulk permanently delete items'
    console.error('DELETE permanent-bulk error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
