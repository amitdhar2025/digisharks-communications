import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminFromRequest, isSuperAdmin, DEFAULT_SUBADMIN_PERMISSIONS } from '@/lib/auth'
import { getSubAdminsCollection, SubAdminPermissions } from '@/lib/db'
import { deepMergePermissions } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/sub-admins?confirm=yes — Soft-delete all sub-admins (super admin only)
 */
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const confirm = searchParams.get('confirm')
    if (confirm !== 'yes') {
      return NextResponse.json({ error: 'Confirmation required. Pass ?confirm=yes to delete.' }, { status: 400 })
    }

    const col = await getSubAdminsCollection()
    const subAdmins = await col.find({}).project({ _id: 1, username: 1 }).toArray()

    if (subAdmins.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0, message: 'No sub-admins to delete.' })
    }

    const { softDeleteFromNative } = await import('@/lib/trash')
    let deletedCount = 0
    for (const sub of subAdmins) {
      try {
        await softDeleteFromNative(
          'subadmins',
          'sub_admins',
          String(sub._id),
          { username: admin.username, role: 'admin' },
          (doc) => (doc as any)?.username || 'Sub-admin',
        )
        deletedCount++
      } catch (err) {
        console.error(`Failed to soft-delete sub-admin ${sub._id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} sub-admin(s) moved to trash.`,
    })
  } catch (err) {
    console.error('DELETE /api/admin/sub-admins error', err)
    return NextResponse.json({ error: 'Failed to delete sub-admins' }, { status: 500 })
  }
}



/**
 * GET /api/admin/sub-admins — List all sub-admins (super admin only)
 */
export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const col = await getSubAdminsCollection()
    const subAdmins = await col
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const items = subAdmins.map((s) => ({
      _id: String(s._id),
      username: s.username,
      isActive: s.isActive,
      createdBy: s.createdBy,
      permissions: s.permissions,
      queryCategories: Array.isArray(s.queryCategories) ? s.queryCategories : [],
      lastLoginAt: s.lastLoginAt?.toISOString?.() ?? null,
      createdAt: s.createdAt?.toISOString?.() ?? null,
      updatedAt: s.updatedAt?.toISOString?.() ?? null,
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error('GET /api/admin/sub-admins error', err)
    return NextResponse.json({ error: 'Failed to fetch sub-admins' }, { status: 500 })
  }
}

/**
 * POST /api/admin/sub-admins — Create a new sub-admin (super admin only)
 */
export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { username, password, permissions, queryCategories } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const col = await getSubAdminsCollection()

    // Check for duplicate username
    const existing = await col.findOne({ username: username.trim() })
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Validate and merge permissions
    const mergedPerms = deepMergePermissions(DEFAULT_SUBADMIN_PERMISSIONS, permissions || {})

    // Normalise queryCategories: array of trimmed non-empty strings
    const normalisedCats: string[] = Array.isArray(queryCategories)
      ? Array.from(new Set(queryCategories.map((c: any) => String(c).trim()).filter(Boolean)))
      : []

    const now = new Date()
    const doc = {
      username: username.trim(),
      passwordHash,
      isActive: true,
      createdBy: admin.username,
      permissions: mergedPerms,
      queryCategories: normalisedCats,
      createdAt: now,
      updatedAt: now,
    }

    const result = await col.insertOne(doc)

    return NextResponse.json({
      success: true,
      item: {
        _id: String(result.insertedId),
        username: doc.username,
        isActive: doc.isActive,
        createdBy: doc.createdBy,
        permissions: doc.permissions,
        queryCategories: doc.queryCategories,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
    }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/sub-admins error', err)
    return NextResponse.json({ error: 'Failed to create sub-admin' }, { status: 500 })
  }
}


