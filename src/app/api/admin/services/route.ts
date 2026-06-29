import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { getQueriesCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/services
 *
 * Returns the unique list of `service` values that exist in the contact-query
 * collection. Used by the sub-admin management page to show available
 * categories that a sub-admin can be granted/restricted to.
 *
 * - Super admin: returns ALL services currently in use.
 * - Sub-admin: returns the union of (a) all services in use and (b) the
 *   categories already granted to this sub-admin (so their grants are
 *   preserved even if a service is removed from new queries).
 */
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collection = await getQueriesCollection()

    // Use MongoDB distinct() to pull every unique service value currently stored
    let services = await collection.distinct('service')

    // Strip empty / whitespace-only entries
    services = services
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())

    // For sub-admins, merge in their already-granted categories so saved
    // restrictions remain editable even if no new queries use them.
    if (!isSuperAdmin(admin) && admin.subAdminId) {
      try {
        const { getSubAdminsCollection } = await import('@/lib/db')
        const { ObjectId } = await import('mongodb')
        const col = await getSubAdminsCollection()
        const sub = await col.findOne({ _id: new ObjectId(admin.subAdminId) })
        const granted = Array.isArray(sub?.queryCategories) ? sub!.queryCategories : []
        services = Array.from(new Set([...services, ...granted]))
      } catch {
        // ignore — fall back to just the in-use services
      }
    }

    // Sort alphabetically, case-insensitive
    services.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

    return NextResponse.json({ services })
  } catch (err) {
    console.error('GET /api/admin/services error', err)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
