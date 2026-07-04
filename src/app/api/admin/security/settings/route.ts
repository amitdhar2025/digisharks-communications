import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getSecuritySettings, saveSecuritySettings } from '@/lib/anti-spam'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getSecuritySettings()
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('GET /api/admin/security/settings error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { autoBlock, honeypotEnabled, loggingEnabled, bannedIps, blockedEmailDomains, blockedCountries } = body

    const updates: Record<string, any> = {}

    if (typeof autoBlock === 'boolean') updates.autoBlock = autoBlock
    if (typeof honeypotEnabled === 'boolean') updates.honeypotEnabled = honeypotEnabled
    if (typeof loggingEnabled === 'boolean') updates.loggingEnabled = loggingEnabled

    // Parse textarea-style text into arrays (one per line)
    if (typeof bannedIps === 'string') {
      updates.bannedIps = bannedIps.split('\n').map((s: string) => s.trim()).filter(Boolean)
    }
    if (typeof blockedEmailDomains === 'string') {
      updates.blockedEmailDomains = blockedEmailDomains.split('\n').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
    }
    if (typeof blockedCountries === 'string') {
      updates.blockedCountries = blockedCountries.split('\n').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
    }

    const settings = await saveSecuritySettings(updates)
    return NextResponse.json({ success: true, settings })
  } catch (err) {
    console.error('POST /api/admin/security/settings error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
