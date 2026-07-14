/**
 * CMS Admin Login API
 *
 * POST /api/content/admin/login
 *
 * Accepts { username, password }, looks up the user in the AdminUser
 * collection, compares the password with the stored bcrypt hash, and
 * sets a httpOnly JWT cookie on success.
 *
 * Auto-seeding: if no admin exists in the database, the first login
 * attempt will create the admin from ADMIN_USERNAME / ADMIN_PASSWORD
 * env vars (matching the main admin seeding logic in admin-seed.ts).
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { LRUCache } from 'lru-cache'
import AdminUser from '@/models/AdminUser'
import { connectCMSDb } from '@/lib/db-cms'
import { signCMSToken, setCMSCookie } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'
import { sendMail } from '@/lib/mailer'
import { buildFailedLoginAlertEmail } from '@/lib/email-templates'
import { getClientIp } from '@/lib/rateLimit'
import SiteSettings from '@/models/SiteSettings'

export const dynamic = 'force-dynamic'

/* ─── Failed Login Email Alert Rate Limiter (shared pattern) ─── */

const ALERT_COOLDOWN_MS =
  (parseInt(process.env.ADMIN_ALERT_COOLDOWN_MINUTES || '5', 10) || 5) * 60 * 1000

const alertRateLimiter = new LRUCache({
  max: 10_000,
  ttl: ALERT_COOLDOWN_MS,
})

function checkAlertRateLimit(ip) {
  const lastSent = alertRateLimiter.get(ip)
  const now = Date.now()
  if (!lastSent || now - lastSent >= ALERT_COOLDOWN_MS) {
    alertRateLimiter.set(ip, now)
    return true
  }
  return false
}

async function getAdminAlertEmail() {
  try {
    await connectCMSDb()
    const settings = await SiteSettings.findOne({ key: 'global' }).select('email').lean()
    if (settings && settings.email) return settings.email
  } catch {
    // best-effort
  }
  return process.env.ADMIN_ALERT_EMAIL || 'marketing@digisharkscommunications.com'
}

async function sendFailedLoginAlert({ username, ip, userAgent, reason, location }) {
  if (!checkAlertRateLimit(ip)) return
  try {
    const to = await getAdminAlertEmail()
    const { subject, html, text } = buildFailedLoginAlertEmail({
      username,
      ip,
      userAgent,
      reason,
      attemptTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      location,
    })
    await sendMail({ to, subject, html, text })
    console.log('[cms] Failed login alert sent to', to, 'for IP', ip, 'reason:', reason)
  } catch (err) {
    console.error('[cms] Failed to send login alert email:', err?.message || String(err))
  }
}

/**
 * Auto-seed the CMS admin from environment variables if no admin exists.
 * Uses ONLY CMS_ADMIN_USERNAME / CMS_ADMIN_PASSWORD — no fallback to
 * the main admin credentials (keeps the two panels fully separate).
 *
 * **Does NOT re-hash existing admins** — once seeded, the DB password
 * is authoritative so forgot-password resets persist.
 */
async function ensureCMSAdminExists() {
  const envUser = process.env.CMS_ADMIN_USERNAME
  const envPass = process.env.CMS_ADMIN_PASSWORD

  if (!envUser || !envPass) {
    return null
  }

  // Only seed if no CMS admin users exist at all
  const count = await AdminUser.countDocuments()
  if (count > 0) {
    return null
  }

  const passwordHash = await bcrypt.hash(envPass, 10)

  const newAdmin = await AdminUser.create({
    username: envUser.toLowerCase(),
    passwordHash,
  })
  console.log('[cms] Auto-created CMS admin user from env vars:', envUser)
  return newAdmin
}

export async function POST(req) {
  try {
    const { username, password } = await req.json()
    const user = String(username || '').trim()
    const pwd = String(password || '')

    // ── Validate input ────────────────────────────────────────────────
    if (!user || !pwd) {
      sendFailedLoginAlert({ username: user || 'unknown', ip: getClientIp(req), userAgent: req.headers.get('user-agent') || '', reason: 'missing_credentials' })
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // ── Connect to database ──────────────────────────────────────────
    await connectCMSDb()

    // ── Remove any legacy/non-configured admin users ───────────────────
    //     This runs on every login to clean up stale records (e.g., the
    //     old 'admin' user from when credentials were shared between panels).
    const configuredAdmin = process.env.CMS_ADMIN_USERNAME
    if (configuredAdmin) {
      await AdminUser.deleteMany({ username: { $ne: configuredAdmin.toLowerCase() } })
    }

    // ── Try to find the admin user in the database ─────────────────────
    let admin = await AdminUser.findOne({ username: user.toLowerCase() })

    // ── Auto-seed if not found (first login only) ──────────────────────
    //     Uses ONLY CMS_ADMIN_USERNAME / CMS_ADMIN_PASSWORD.
    //     Does NOT re-hash existing admins — forgot-password resets persist.
    if (!admin) {
      const seeded = await ensureCMSAdminExists()
      if (seeded && seeded.username === user.toLowerCase()) {
        admin = seeded
      }
    }

    // ── Still no admin — try env var direct match (DB was down) ────────
    if (!admin) {
      const envUser = (process.env.CMS_ADMIN_USERNAME || '').toLowerCase()
      const envPass = process.env.CMS_ADMIN_PASSWORD
      if (envUser && envPass && envUser === user.toLowerCase() && envPass === pwd) {
        const token = signCMSToken(envUser)
        await setCMSCookie(token)
        logActivity({ event: 'login', description: `CMS admin logged in (env fallback): ${envUser}`, username: envUser, dashboard: 'cms' }).catch(() => {})
        return NextResponse.json({
          success: true,
          username: envUser,
        })
      }
    }

    if (!admin) {
      sendFailedLoginAlert({ username: user, ip: getClientIp(req), userAgent: req.headers.get('user-agent') || '', reason: 'invalid_credentials' })
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // ── Compare password with bcrypt hash ─────────────────────────────
    const valid = await bcrypt.compare(pwd, admin.passwordHash)

    if (!valid) {
      sendFailedLoginAlert({ username: user, ip: getClientIp(req), userAgent: req.headers.get('user-agent') || '', reason: 'invalid_password' })
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // ── Create session token and set cookie ───────────────────────────
    const token = signCMSToken(admin.username)
    await setCMSCookie(token)

    logActivity({ event: 'login', description: `CMS admin logged in: ${admin.username}`, username: admin.username, dashboard: 'cms' }).catch(() => {})
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
