/**
 * CMS Authentication Helpers
 *
 * Manages admin sessions using JWT tokens stored in httpOnly cookies.
 * Uses ADMIN_SESSION_SECRET from environment variables.
 *
 * Functions:
 *   signCMSToken(username)        — creates a JWT that expires in 7 days
 *   verifyCMSToken(token)         — validates a JWT, returns the payload or null
 *   setCMSCookie(token)           — sets the httpOnly cookie on the response
 *   clearCMSCookie()              — removes the cookie (logout)
 *   getCMSAdminFromCookies()      — reads current admin from the request cookies
 */

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// ── Configuration ─────────────────────────────────────────────────────
export const COOKIE_NAME = 'cms_admin_token'
const TOKEN_EXPIRY = '7d'

/**
 * Resolve the JWT secret lazily (not at module load time).
 * Throws at call-time if ADMIN_SESSION_SECRET is missing in production.
 */
function getCMSJwtSecret() {
  const raw = process.env.ADMIN_SESSION_SECRET
  if (raw && raw.trim()) return raw.trim()

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ADMIN_SESSION_SECRET is not set. Set it in .env.local and in ' +
        'your Vercel project environment variables.'
    )
  }

  return 'cms_dev_secret_do_not_use_in_production'
}

// ── Token operations ──────────────────────────────────────────────────

/**
 * Create a signed JWT for an admin user.
 *
 * @param {string} username - The admin's username
 * @returns {string} Signed JWT string
 */
export function signCMSToken(username) {
  return jwt.sign({ username, role: 'cms-admin' }, getCMSJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
  })
}

/**
 * Verify and decode a CMS admin token.
 *
 * @param {string} token - The JWT to verify
 * @returns {object|null} { username, role } or null if invalid/expired
 */
export function verifyCMSToken(token) {
  try {
    const decoded = jwt.verify(token, getCMSJwtSecret())
    if (decoded.role !== 'cms-admin') return null
    return { username: decoded.username, role: decoded.role }
  } catch {
    return null
  }
}

// ── Cookie operations ─────────────────────────────────────────────────

/**
 * Set the CMS admin cookie (httpOnly, secure in production).
 *
 * @param {string} token - The JWT to store in the cookie
 */
export async function setCMSCookie(token) {
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

/**
 * Clear the CMS admin cookie (logout).
 */
export async function clearCMSCookie() {
  const store = await cookies()
  store.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // expires immediately
  })
}

/**
 * Get the currently logged-in CMS admin from request cookies.
 *
 * @returns {Promise<{username: string, role: string}|null>}
 */
export async function getCMSAdminFromCookies() {
  try {
    const store = await cookies()
    const token = store.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyCMSToken(token)
  } catch {
    return null
  }
}
