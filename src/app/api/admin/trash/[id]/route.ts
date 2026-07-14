import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { permanentDelete, getTrashCollection } from '@/lib/trash'
import { deleteAllItemFiles } from '@/lib/cloudinary-delete'
import { ObjectId } from 'mongodb'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (admin.role !== 'admin') {
    return NextResponse.json({ error: 'Only super admin can permanently delete items' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json().catch(() => ({})) as { section?: string }
    const sectionFromBody = body.section

    // Fetch the trash item first to access stored Cloudinary files
    const oid = new ObjectId(id)
    const trashCol = await getTrashCollection()
    let itemData: Record<string, unknown> | null = null

    // Try trash_items first, then source collections (blogposts isDeleted=true or not)
    const trashDoc = await trashCol.findOne({ _id: oid })
    if (trashDoc?.data) {
      itemData = trashDoc.data as Record<string, unknown>
    } else {
      const { getDb } = await import('@/lib/db')
      const db = await getDb()

      // Try blogposts — look up by _id (blog posts are soft-deleted with
      // isDeleted=true in the blogposts collection, never moved to trash_items).
      // Cloudinary cleanup only happens here on permanent delete, not on soft delete.
      if (ObjectId.isValid(id)) {
        const blogDoc = await db.collection('blogposts').findOne({
          _id: oid,
        })
        if (blogDoc) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...rest } = blogDoc
          itemData = rest as Record<string, unknown>
        }
      }
    }

    // Clean up Cloudinary files (best-effort, never blocks the delete)
    if (itemData) {
      try {
        await deleteAllItemFiles(itemData)
      } catch (cloudErr) {
        console.warn('Cloudinary cleanup failed (non-blocking):', cloudErr)
      }
    }

    // Permanently delete from trash — pass section for faster lookup
    await permanentDelete(id, { username: admin.username, role: admin.role }, sectionFromBody || trashDoc?.collectionName)

    logActivity({ event: 'trash_permanent_delete', description: `Permanently deleted item from trash (${id})`, username: admin.username, dashboard: 'admin', target: id }).catch(() => {})
    return NextResponse.json({ message: 'Item permanently deleted.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to permanently delete item'
    console.error('DELETE trash permanent delete error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
