import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, DEFAULT_SUBADMIN_PERMISSIONS } from '@/lib/auth'
import { getSubAdminsCollection, SubAdminPermissions } from '@/lib/db'
import { deepMergePermissions } from '@/lib/permissions'
import { softDeleteFromNative } from '@/lib/trash'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/sub-admins/[id] — Get a single sub-admin (super admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const col = await getSubAdminsCollection()
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }
    const sub = await col.findOne({ _id: new ObjectId(id) })
    if (!sub) {
      return NextResponse.json({ error: 'Sub-admin not found' }, { status: 404 })
    }

    return NextResponse.json({
      item: {
        _id: String(sub._id),
        username: sub.username,
        isActive: sub.isActive,
        createdBy: sub.createdBy,
        permissions: sub.permissions,
        queryCategories: Array.isArray(sub.queryCategories) ? sub.queryCategories : [],
        lastLoginAt: sub.lastLoginAt?.toISOString?.() ?? null,
        createdAt: sub.createdAt?.toISOString?.() ?? null,
        updatedAt: sub.updatedAt?.toISOString?.() ?? null,
      },
    })
  } catch (err) {
    console.error('GET /api/admin/sub-admins/[id] error', err)
    return NextResponse.json({ error: 'Failed to fetch sub-admin' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/sub-admins/[id] — Update sub-admin (super admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const col = await getSubAdminsCollection()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const existing = await col.findOne({ _id: new ObjectId(id) })
    if (!existing) {
      return NextResponse.json({ error: 'Sub-admin not found' }, { status: 404 })
    }

    const update: any = { updatedAt: new Date() }

    // Update username
    if (body.username !== undefined) {
      const newUsername = String(body.username).trim()
      if (!newUsername) {
        return NextResponse.json({ error: 'Username cannot be empty' }, { status: 400 })
      }
      // Check for duplicates
      const dup = await col.findOne({ username: newUsername, _id: { $ne: new ObjectId(id) } })
      if (dup) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
      }
      update.username = newUsername
    }

    // Update password
    if (body.password) {
      if (String(body.password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      update.passwordHash = await bcrypt.hash(String(body.password), 10)
    }

    // Update status
    if (body.isActive !== undefined) {
      update.isActive = Boolean(body.isActive)
    }

    // Update permissions
    if (body.permissions) {
      // Deep merge with existing permissions
      update.permissions = deepMergePermissions(existing.permissions || DEFAULT_SUBADMIN_PERMISSIONS, body.permissions)
    }

    // Update queryCategories
    if (body.queryCategories !== undefined) {
      if (!Array.isArray(body.queryCategories)) {
        return NextResponse.json({ error: 'queryCategories must be an array of strings' }, { status: 400 })
      }
      update.queryCategories = Array.from(
        new Set(body.queryCategories.map((c: any) => String(c).trim()).filter(Boolean)),
      )
    }

    await col.updateOne({ _id: new ObjectId(id) }, { $set: update })

    const updated = await col.findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      item: {
        _id: String(updated!._id),
        username: updated!.username,
        isActive: updated!.isActive,
        createdBy: updated!.createdBy,
        permissions: updated!.permissions,
        queryCategories: Array.isArray(updated!.queryCategories) ? updated!.queryCategories : [],
        lastLoginAt: updated!.lastLoginAt?.toISOString?.() ?? null,
        createdAt: updated!.createdAt?.toISOString?.() ?? null,
        updatedAt: updated!.updatedAt?.toISOString?.() ?? null,
      },
    })
  } catch (err) {
    console.error('PUT /api/admin/sub-admins/[id] error', err)
    return NextResponse.json({ error: 'Failed to update sub-admin' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/sub-admins/[id] — Delete sub-admin (super admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const col = await getSubAdminsCollection()
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await softDeleteFromNative(
      'subadmins',
      'sub_admins',
      id,
      { username: admin.username, role: admin.role },
      (doc) => (doc as any)?.username || id,
    )

    return NextResponse.json({ success: true, message: 'Sub-admin moved to trash.' })
  } catch (err) {
    console.error('DELETE /api/admin/sub-admins/[id] error', err)
    return NextResponse.json({ error: 'Failed to delete sub-admin' }, { status: 500 })
  }
}


