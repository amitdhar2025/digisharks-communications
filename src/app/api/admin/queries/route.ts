import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getQueriesCollection, getSubAdminsCollection, ContactQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

function toClient(q: any) {
  if (!q) return q
  const { _id, ...rest } = q
  const comments = (rest.comments || []).map((c: any) => ({
    _id: c._id?.toString(),
    text: c.text,
    author: c.author,
    createdAt: c.createdAt,
  }))
  return { id: _id?.toString(), ...rest, comments }
}

/**
 * Fetch the sub-admin's allowed query categories from the DB.
 * Returns empty array if user is not a sub-admin / not found / not configured.
 */
async function getSubAdminQueryCategories(subAdminId: string): Promise<string[]> {
  try {
    const col = await getSubAdminsCollection()
    const sub = await col.findOne({ _id: new ObjectId(subAdminId) })
    if (!sub) return []
    return Array.isArray(sub.queryCategories) ? sub.queryCategories : []
  } catch {
    return []
  }
}

function buildFilter(
  searchParams: URLSearchParams,
  allowedCategories?: string[] | null,
) {
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const filter: any = {}

  // Enforce sub-admin category restriction. If allowedCategories is provided
  // (non-null), only queries whose `service` is in that list are visible.
  // null/undefined = no restriction (super-admin).
  if (allowedCategories !== undefined && allowedCategories !== null) {
    if (!Array.isArray(allowedCategories) || allowedCategories.length === 0) {
      // Empty allowed list = no access at all. Force a filter that returns nothing.
      filter._id = { $exists: false }
      return filter
    }
    filter.service = { $in: allowedCategories }
  }

  if (status && status !== 'all') {
    filter.status = status
  }
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [
      { fullName: re },
      { email: re },
      { phone: re },
      { service: re },
      { message: re },
    ]
  }
  return filter
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check view permission for sub-admins
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    const subPerms = await getSubAdminPermissions(admin.subAdminId)
    const denied = await requirePermission(admin, 'queries', 'view', subPerms)
    if (denied) return denied
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  // Sub-admin: restrict to allowed queryCategories (if any)
  const allowedCategories = !isSuperAdmin(admin) && admin.subAdminId
    ? await getSubAdminQueryCategories(admin.subAdminId)
    : null

  const collection = await getQueriesCollection()
  const filter = buildFilter(searchParams, allowedCategories ?? undefined)

  const total = await collection.countDocuments(filter)
  const items = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  return NextResponse.json({
    items: items.map(toClient),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check create permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'queries', 'edit', subPerms)
    if (denied) return denied
  }

  try {
    const body = await req.json()
    const { fullName, email, phone, service, message, status } = body || {}

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'fullName, email and message are required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const doc: ContactQuery = {
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      service: service ? String(service).trim() : 'Other',
      message: String(message).trim(),
      status: status || 'pending',
      comments: [],
      createdAt: now,
      updatedAt: now,
    }

    const collection = await getQueriesCollection()
    const result = await collection.insertOne(doc)
    return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/queries error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check delete permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'queries', 'delete', subPerms)
    if (denied) return denied
  }

  try {
    // Sub-admin: restrict deletion to allowed queryCategories
    const allowedCategories = !isSuperAdmin(admin) && admin.subAdminId
      ? await getSubAdminQueryCategories(admin.subAdminId)
      : null

    const { searchParams } = new URL(req.url)
    const confirm = searchParams.get('confirm')

    if (confirm !== 'yes') {
      return NextResponse.json(
        { error: 'Confirmation required. Pass ?confirm=yes to delete.' },
        { status: 400 }
      )
    }

    const filter = buildFilter(searchParams, allowedCategories ?? undefined)
    const collection = await getQueriesCollection()

    // Count how many will be deleted for reporting
    const matched = await collection.countDocuments(filter)

    // Only perform the delete if there is at least one matching document
    if (matched === 0) {
      return NextResponse.json({ success: true, deleted: 0, message: 'No queries matched the filter.' })
    }

    const result = await collection.deleteMany(filter)

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} ${result.deletedCount === 1 ? 'query' : 'queries'}.`,
    })
  } catch (err) {
    console.error('DELETE /api/admin/queries error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
