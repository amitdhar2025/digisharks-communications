import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken, signSubAdminToken, setAdminCookie } from '@/lib/auth'
import { getAdminsCollection, getSubAdminsCollection, getLoginLogsCollection } from '@/lib/db'
import { ensureAdminExists } from '@/lib/admin-seed'
import logger, { logAuthEvent } from '@/lib/logger'
import { getClientIp } from '@/lib/rateLimit'

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
        return NextResponse.json(
          { error: 'Account is disabled. Contact the main admin.' },
          { status: 403 }
        )
      }

      const ok = await bcrypt.compare(pwd, subAdmin.passwordHash)
      if (!ok) {
        logAuthEvent('login_failed', user, ip, { reason: 'invalid_password' })
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
      return NextResponse.json({
        success: true,
        username: subAdmin.username,
        role: 'sub-admin',
        token,
      })
    }

    // Try super admin login
    await ensureAdminExists()
    const admins = await getAdminsCollection()
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
      return NextResponse.json({
        success: true,
        username: envUser,
        role: 'admin',
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
