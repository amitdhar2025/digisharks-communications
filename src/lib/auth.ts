import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

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
  role: 'admin'
  iat?: number
  exp?: number
}

export function signAdminToken(username: string): string {
  const payload: AdminPayload = { username, role: 'admin' }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
    if (decoded.role !== 'admin') return null
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
