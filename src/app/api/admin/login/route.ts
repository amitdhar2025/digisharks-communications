import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken, signSubAdminToken, setAdminCookie } from '@/lib/auth'
import { getAdminsCollection, getSubAdminsCollection, getLoginLogsCollection } from '@/lib/db'
import { ensureAdminExists } from '@/lib/admin-seed'
import logger, { logAuthEvent } from '@/lib/logger'
import { getClientIp } from '@/lib/rateLimit'
import { logActivity } from '@/lib/activity-log'
import { LRUCache } from 'lru-cache'
import { sendMail } from '@/lib/mailer'
import { buildFailedLoginAlertEmail } from '@/lib/email-templates'
import { connectCMSDb } from '@/lib/db-cms'
import SiteSettings from '@/models/SiteSettings'

const ALERT_COOLDOWN_MS =
  (parseInt(process.env.ADMIN_ALERT_COOLDOWN_MINUTES || '5', 10) || 5) * 60 * 1000

/**
 * Per-IP rate limiter for failed login email alerts.
 * Prevents spamming the admin inbox when an attacker fires rapid requests.
 * Entries auto-evict after the cooldown period via lru-cache TTL.
 */
const alertRateLimiter = new LRUCache<string, number>({
  max: 10_000,
  ttl: ALERT_COOLDOWN_MS,
})

/**
 * Check whether we can send an alert for the given IP.
 * Returns true if no alert was sent within the cooldown window.
 */
function checkAlertRateLimit(ip: string): boolean {
  const lastSent = alertRateLimiter.get(ip)
  const now = Date.now()

  if (!lastSent || now - lastSent >= ALERT_COOLDOWN_MS) {
    // Cooldown expired or first alert — allow and record
    alertRateLimiter.set(ip, now)
    return true
  }

  return false
}

export const dynamic = 'force-dynamic'

/**
 * Look up the geolocation of an IP address using ip-api.com (free, no key needed).
 * Returns a best-effort result — never throws.
 */
async function geoLookup(ip: string): Promise<{ country: string; region: string; city: string; isp: string }> {
  // Skip lookup for local / private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
    return { country: 'Local', region: 'Local', city: 'Local', isp: 'Local' }
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return { country: '', region: '', city: '', isp: '' }
    const data = await res.json()
    return {
      country: data.country || '',
      region: data.regionName || '',
      city: data.city || '',
      isp: data.isp || '',
    }
  } catch {
    return { country: '', region: '', city: '', isp: '' }
  }
}

/**
 * Get the admin email address to send alert notifications to.
 * Checks SiteSettings first, then env var, then a hard-coded default.
 */
async function getAdminAlertEmail(): Promise<string> {
  try {
    await connectCMSDb()
    const settings = await SiteSettings.findOne({ key: 'global' }).select('email').lean()
    if (settings && (settings as any).email) return (settings as any).email
  } catch {
    // Best-effort — fall through to env/default
  }
  return process.env.ADMIN_ALERT_EMAIL || 'marketing@digisharkscommunications.com'
}

/**
 * Send a failed login alert email to the admin (fire-and-forget).
 * Rate-limited per IP — at most one email per cooldown window (default 5 min).
 */
async function sendFailedLoginAlert(params: {
  username: string
  ip: string
  userAgent: string
  reason: string
  location?: string
}) {
  // Rate-limit check: skip silently if we already sent one recently for this IP
  if (!checkAlertRateLimit(params.ip)) {
    return
  }

  try {
    const to = await getAdminAlertEmail()
    const { subject, html, text } = buildFailedLoginAlertEmail({
      username: params.username,
      ip: params.ip,
      userAgent: params.userAgent,
      reason: params.reason,
      attemptTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      location: params.location,
    })
    await sendMail({ to, subject, html, text })
  } catch {
    // Best-effort — don't let email failures break the login flow
  }
}

/**
 * Store a login log entry in the database (fire-and-forget).
 */
async function storeLoginLog(params: {
  username: string
  role: 'admin' | 'sub-admin'
  ip: string
  country: string
  region: string
  city: string
  isp: string
  userAgent: string
}) {
  try {
    const col = await getLoginLogsCollection()
    await col.insertOne({
      ...params,
      loginTime: new Date(),
      blockedIp: false,
      blockedUser: false,
      createdAt: new Date(),
    })
  } catch {
    // Best-effort — don't let logging break the login flow
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  try {
    const { username, password } = await req.json()
    const user = String(username || '').trim()
    const pwd = String(password || '')

    if (!username || !password) {
      logAuthEvent('login_failed', user || 'unknown', ip, { reason: 'missing_credentials' })
      sendFailedLoginAlert({ username: user || 'unknown', ip, userAgent: req.headers.get('user-agent') || '', reason: 'missing_credentials' }).catch(() => {})
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const userAgent = req.headers.get('user-agent') || ''

    // Try sub-admin login first
    const subCol = await getSubAdminsCollection()
    const subAdmin = await subCol.findOne({ username: user })

    if (subAdmin) {
      if (!subAdmin.isActive) {
        logAuthEvent('login_failed', user, ip, { reason: 'sub_admin_disabled' })
        sendFailedLoginAlert({ username: user, ip, userAgent, reason: 'sub_admin_disabled' }).catch(() => {})
        return NextResponse.json(
          { error: 'Account is disabled. Contact the main admin.' },
          { status: 403 }
        )
      }

      const ok = await bcrypt.compare(pwd, subAdmin.passwordHash)
      if (!ok) {
        logAuthEvent('login_failed', user, ip, { reason: 'invalid_password' })
        sendFailedLoginAlert({ username: user, ip, userAgent, reason: 'invalid_password' }).catch(() => {})
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // Update last login
      await subCol.updateOne(
        { _id: subAdmin._id },
        { $set: { lastLoginAt: new Date() } }
      )

      // Geo lookup + log (fire-and-forget — don't block the login response)
      geoLookup(ip).then((geo) => {
        storeLoginLog({
          username: subAdmin.username,
          role: 'sub-admin',
          ip,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          isp: geo.isp,
          userAgent,
        })
      }).catch(() => {})

      const token = signSubAdminToken(subAdmin.username, String(subAdmin._id))
      await setAdminCookie(token)
      logAuthEvent('login', subAdmin.username, ip, { role: 'sub-admin' })
      logActivity({ event: 'login', description: `Sub-admin logged in: ${subAdmin.username}`, username: subAdmin.username, dashboard: 'admin', ip }).catch(() => {})
      return NextResponse.json({
        success: true,
        username: subAdmin.username,
        role: 'sub-admin',
        token,
      })
    }

    // Try super admin login — only seed if no admin exists in DB
    const admins = await getAdminsCollection()
    let admin = await admins.findOne({ username: user })
    if (!admin) {
      await ensureAdminExists()
      admin = await admins.findOne({ username: user })
    }

    if (admin) {
      const ok = await bcrypt.compare(pwd, admin.passwordHash)
      if (!ok) {
        logAuthEvent('login_failed', user, ip, { reason: 'invalid_password' })
        // Fire-and-forget geo lookup for the alert email
        geoLookup(ip).then((geo) => {
          const loc = [geo.city, geo.region, geo.country].filter(Boolean).join(', ')
          sendFailedLoginAlert({ username: user, ip, userAgent, reason: 'invalid_password', location: loc || undefined }).catch(() => {})
        }).catch(() => {
          sendFailedLoginAlert({ username: user, ip, userAgent, reason: 'invalid_password' }).catch(() => {})
        })
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // Geo lookup + log (fire-and-forget)
      geoLookup(ip).then((geo) => {
        storeLoginLog({
          username: admin.username,
          role: 'admin',
          ip,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          isp: geo.isp,
          userAgent,
        })
      }).catch(() => {})

      const token = signAdminToken(admin.username)
      await setAdminCookie(token)
      logAuthEvent('login', admin.username, ip, { method: 'database' })
      logActivity({ event: 'login', description: `Admin logged in: ${admin.username}`, username: admin.username, dashboard: 'admin', ip }).catch(() => {})
      return NextResponse.json({
        success: true,
        username: admin.username,
        role: 'admin',
        token,
      })
    }

    // Fallback: env credentials (DB was down)
    const envUser = process.env.ADMIN_USERNAME?.trim()
    const envPass = process.env.ADMIN_PASSWORD
    if (envUser && envPass && envUser === user && envPass === pwd) {
      geoLookup(ip).then((geo) => {
        storeLoginLog({
          username: envUser,
          role: 'admin',
          ip,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          isp: geo.isp,
          userAgent,
        })
      }).catch(() => {})

      const token = signAdminToken(envUser)
      await setAdminCookie(token)
      logAuthEvent('login', envUser, ip, { method: 'env_fallback' })
      logActivity({ event: 'login', description: `Admin logged in (env fallback): ${envUser}`, username: envUser, dashboard: 'admin', ip }).catch(() => {})
      return NextResponse.json({
        success: true,
        username: envUser,
        role: 'admin',
        token,
      })
    }

    logAuthEvent('login_failed', user, ip, { reason: 'invalid_credentials' })
    // Fire-and-forget geo lookup for the alert email
    geoLookup(ip).then((geo) => {
      const loc = [geo.city, geo.region, geo.country].filter(Boolean).join(', ')
      sendFailedLoginAlert({ username: user, ip, userAgent, reason: 'invalid_credentials', location: loc || undefined }).catch(() => {})
    }).catch(() => {
      sendFailedLoginAlert({ username: user, ip, userAgent, reason: 'invalid_credentials' }).catch(() => {})
    })
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
