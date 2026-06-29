import { NextResponse } from 'next/server'
import { getAdminFromCookies, getSubAdminPermissions, isSuperAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // If sub-admin, fetch their permissions
  let permissions = null
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    permissions = await getSubAdminPermissions(admin.subAdminId)
  }

  return NextResponse.json({
    authenticated: true,
    username: admin.username,
    role: admin.role,
    subAdminId: admin.subAdminId || null,
    permissions,
  })
}
