import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken, setAdminCookie } from '@/lib/auth'
import { getAdminsCollection } from '@/lib/db'
import { ensureAdminExists } from '@/lib/admin-seed'
import logger, { logAuthEvent } from '@/lib/logger'
import { getClientIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  try {
    const { username, password } = await req.json()
    const user = String(username || '').trim()
    const pwd = String(password || '')

    if (!username || !password) {
      logAuthEvent('login_failed', user || 'unknown', ip, { reason: 'missing_credentials' })
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Make sure a default admin exists (first-run bootstrap) and
    // that the stored hash matches the current env password.
    await ensureAdminExists()

    const admins = await getAdminsCollection()

    // 1) Look up the admin in the DB and verify the password.
    const admin = await admins.findOne({ username: user })

    if (admin) {
      const ok = await bcrypt.compare(pwd, admin.passwordHash)
      if (!ok) {
        logAuthEvent('login_failed', user, ip, { reason: 'invalid_password' })
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }
      const token = signAdminToken(admin.username)
      await setAdminCookie(token)
      logAuthEvent('login', admin.username, ip, { method: 'database' })
      return NextResponse.json({
        success: true,
        username: admin.username,
        token,
      })
    }

    // 2) Fallback: if no admin row matched (e.g. env credentials were
    //    not yet seeded into the DB because the DB was down), accept
    //    the env credentials directly. This keeps the admin login
    //    working even when MongoDB is unreachable.
    const envUser = process.env.ADMIN_USERNAME?.trim()
    const envPass = process.env.ADMIN_PASSWORD
    if (envUser && envPass && envUser === user && envPass === pwd) {
      const token = signAdminToken(envUser)
      await setAdminCookie(token)
      logAuthEvent('login', envUser, ip, { method: 'env_fallback' })
      return NextResponse.json({
        success: true,
        username: envUser,
        token,
      })
    }

    logAuthEvent('login_failed', user, ip, { reason: 'invalid_credentials' })
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
  } catch (err) {
    logger.error('POST /api/admin/login error', { ip, error: String(err) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
