import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { emptyAllTrash, getTrashCollection } from '@/lib/trash'
import { deleteAllItemFiles } from '@/lib/cloudinary-delete'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Only super admin can empty the trash' }, { status: 403 })
  }

  try {
    // Fetch all active trash items to clean up Cloudinary files
    const trashCol = await getTrashCollection()
    const items = await trashCol.find({ permanentlyDeletedAt: null }).toArray()

    // Clean up Cloudinary files for each item from trash_items (best-effort, concurrent)
    await Promise.allSettled(
      items.map(async (item) => {
        if (item?.data) {
          try {
            await deleteAllItemFiles(item.data)
          } catch (cloudErr) {
            console.warn(`Cloudinary cleanup failed for ${item._id} (non-blocking):`, cloudErr)
          }
        }
      }),
    )


    const count = await emptyAllTrash({ username: admin.username, role: admin.role })

    logActivity({ event: 'trash_empty', description: `Emptied trash: ${count} item(s) permanently deleted`, username: admin.username, dashboard: 'admin' }).catch(() => {})
    return NextResponse.json({
      message: `Trash emptied. ${count} item(s) permanently deleted.`,
      count,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to empty trash'
    console.error('DELETE empty trash error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
