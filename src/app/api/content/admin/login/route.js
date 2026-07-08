/**
 * CMS Admin Login API
 *
 * POST /api/content/admin/login
 *
 * Accepts { username, password }, looks up the user in the AdminUser
 * collection, compares the password with the stored bcrypt hash, and
 * sets a httpOnly JWT cookie on success.
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import AdminUser from '@/models/AdminUser'
import { connectCMSDb } from '@/lib/db-cms'
import { signCMSToken, setCMSCookie } from '@/lib/auth-cms'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { username, password } = await req.json()
    const user = String(username || '').trim()
    const pwd = String(password || '')

    // ── Validate input ────────────────────────────────────────────────
    if (!user || !pwd) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // ── Connect to database ──────────────────────────────────────────
    await connectCMSDb()

    // ── Find the admin user ──────────────────────────────────────────
    const admin = await AdminUser.findOne({ username: user.toLowerCase() })

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // ── Compare password with bcrypt hash ─────────────────────────────
    const valid = await bcrypt.compare(pwd, admin.passwordHash)

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // ── Create session token and set cookie ───────────────────────────
    const token = signCMSToken(admin.username)
    await setCMSCookie(token)

    return NextResponse.json({
      success: true,
      username: admin.username,
    })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
