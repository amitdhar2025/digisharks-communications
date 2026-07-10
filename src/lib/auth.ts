import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { SubAdminPermissions } from './db'

// Resolve the JWT secret at startup. We DO NOT silently fall back to a
// hard-coded string — that would let anyone forge admin tokens if the
// env var was ever missing in production. In dev we use a clearly
// marked placeholder so the developer can still boot the server.
const RAW_JWT_SECRET = process.env.JWT_SECRET
const DEV_PLACEHOLDER = 'digisharks_dev_jwt_secret_DO_NOT_USE_IN_PRODUCTION'
const JWT_SECRET = RAW_JWT_SECRET && RAW_JWT_SECRET.trim()
  ? RAW_JWT_SECRET.trim()
  : process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error(
          'JWT_SECRET is not set. Refusing to start in production without ' +
          'a strong, unique JWT secret. Set JWT_SECRET in your .env.local ' +
          'and in your Vercel project Environment Variables.'
        )
      })()
    : DEV_PLACEHOLDER

export const COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY = '7d'

export interface AdminPayload {
  username: string
  role: 'admin' | 'sub-admin'
  subAdminId?: string
  iat?: number
  exp?: number
}

export const DEFAULT_SUBADMIN_PERMISSIONS: SubAdminPermissions = {
  blog: { view: false, create: false, edit: false, delete: false },
  store: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, edit: false, delete: false, export: false },
  products: { view: false, create: false, edit: false, delete: false },
  coupons: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
  career: { view: false, create: false, edit: false, delete: false },
  chatbot: { view: false, manage: false, settings: false },
  seoAudit: { view: false, delete: false },
  rss: { view: false, create: false, edit: false, delete: false },
  queries: { view: false, edit: false, delete: false, export: false },
}

export const FULL_PERMISSIONS: SubAdminPermissions = {
  blog: { view: true, create: true, edit: true, delete: true },
  store: { view: true, create: true, edit: true, delete: true },
  orders: { view: true, edit: true, delete: true, export: true },
  products: { view: true, create: true, edit: true, delete: true },
  coupons: { view: true, create: true, edit: true, delete: true },
  reports: { view: true, export: true },
  career: { view: true, create: true, edit: true, delete: true },
  chatbot: { view: true, manage: true, settings: true },
  seoAudit: { view: true, delete: true },
  rss: { view: true, create: true, edit: true, delete: true },
  queries: { view: true, edit: true, delete: true, export: true },
}

export function signAdminToken(username: string): string {
  const payload: AdminPayload = { username, role: 'admin' }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function signSubAdminToken(username: string, subAdminId: string): string {
  const payload: AdminPayload = { username, role: 'sub-admin', subAdminId }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
    if (decoded.role !== 'admin' && decoded.role !== 'sub-admin') return null
    return decoded
  } catch {
    return null
  }
}

export async function setAdminCookie(token: string) {
  const store = await cookies()
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAdminCookie() {
  const store = await cookies()
  store.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function getAdminFromCookies(): Promise<AdminPayload | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export function getAdminFromRequest(req: NextRequest): AdminPayload | null {
  // First try the Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return verifyAdminToken(token)
  }
  // Then try the cookie
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

/**
 * Check if the authenticated user is a super admin (not a sub-admin).
 */
export function isSuperAdmin(payload: AdminPayload | null): boolean {
  return payload?.role === 'admin' || false
}

/**
 * Check if a sub-admin has a specific permission.
 * Super admins always return true.
 */
export function hasPermission(
  payload: AdminPayload | null,
  section: keyof SubAdminPermissions,
  action: string,
  subAdminPermissions?: SubAdminPermissions | null,
): boolean {
  if (!payload) return false
  if (payload.role === 'admin') return true // super admin has all permissions

  // Sub-admin: check specific permission
  if (!subAdminPermissions) return false
  const perm = subAdminPermissions[section]
  if (!perm) return false
  return (perm as any)[action] === true
}

/**
 * Get permissions for a sub-admin from the database.
 */
export async function getSubAdminPermissions(
  subAdminId: string,
): Promise<SubAdminPermissions | null> {
  try {
    const { getSubAdminsCollection } = await import('./db')
    const col = await getSubAdminsCollection()
    const { ObjectId } = await import('mongodb')
    const sub = await col.findOne({ _id: new ObjectId(subAdminId) })
    if (!sub) return null
    return sub.permissions || DEFAULT_SUBADMIN_PERMISSIONS
  } catch {
    return null
  }
}
