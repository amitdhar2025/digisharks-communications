import { NextResponse } from 'next/server'
import {
  AdminPayload,
  isSuperAdmin,
  getSubAdminPermissions,
} from './auth'
import type { SubAdminPermissions } from './db'

export type PermissionSection = keyof SubAdminPermissions

/**
 * Middleware-style permission check for API routes.
 * Returns a NextResponse JSON error if the user lacks permission, or null if allowed.
 *
 * Pass subAdminPermissions if you already fetched them, otherwise pass subAdminId
 * to fetch them from the DB.
 */
export async function requirePermission(
  admin: AdminPayload | null,
  section: PermissionSection,
  action: string,
  subAdminPermissions?: SubAdminPermissions | null,
): Promise<NextResponse | null> {
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Super admin has all permissions
  if (isSuperAdmin(admin)) {
    return null
  }

  // Sub-admin: fetch permissions if not provided
  let perms = subAdminPermissions
  if (!perms && admin.subAdminId) {
    perms = await getSubAdminPermissions(admin.subAdminId)
  }

  if (!perms) {
    return NextResponse.json({ error: 'Forbidden: no permissions found' }, { status: 403 })
  }

  const sectionPerms = perms[section]
  if (!sectionPerms) {
    return NextResponse.json({ error: 'Forbidden: no access to this section' }, { status: 403 })
  }

  if ((sectionPerms as any)[action] !== true) {
    return NextResponse.json(
      { error: `Forbidden: you do not have "${action}" permission for this section` },
      { status: 403 },
    )
  }

  return null
}

/**
 * Check if a sub-admin has any view permission for a section.
 * Super admins always return true.
 */
export function canViewSection(
  admin: AdminPayload | null,
  section: PermissionSection,
  permissions?: SubAdminPermissions | null,
): boolean {
  if (!admin) return false
  if (isSuperAdmin(admin)) return true
  if (!permissions) return false
  const sectionPerms = permissions[section]
  if (!sectionPerms) return false
  // If any permission is true for this section, they can view it
  return Object.values(sectionPerms).some(Boolean)
}

/**
 * Deep-merge partial permissions over existing base permissions.
 * Only the sections and keys present in `override` will be updated.
 */
export function deepMergePermissions(
  base: SubAdminPermissions,
  override: Partial<Record<keyof SubAdminPermissions, Record<string, boolean>>>,
): SubAdminPermissions {
  const result = { ...base }
  for (const section of Object.keys(base) as (keyof SubAdminPermissions)[]) {
    const sectionOverride = override[section]
    if (sectionOverride && typeof sectionOverride === 'object') {
      ;(result as any)[section] = { ...(result as any)[section], ...sectionOverride }
    }
  }
  return result
}
