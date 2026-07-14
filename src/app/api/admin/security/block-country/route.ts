import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getSecuritySettings, saveSecuritySettings } from '@/lib/anti-spam'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { countryCode, action } = await req.json()

    if (!countryCode || !['block', 'unblock'].includes(action)) {
      return NextResponse.json({ error: 'countryCode and action (block/unblock) are required' }, { status: 400 })
    }

    const settings = await getSecuritySettings()
    let list = [...settings.blockedCountries]
    const normalized = countryCode.toUpperCase().trim()

    if (action === 'block') {
      if (!list.includes(normalized)) list.push(normalized)
    } else {
      list = list.filter(c => c !== normalized)
    }

    const updated = await saveSecuritySettings({ blockedCountries: list })
    logActivity({ event: 'security_country_' + action, description: `${action === 'block' ? 'Blocked' : 'Unblocked'} country: ${normalized}`, username: admin.username, dashboard: 'admin', target: normalized }).catch(() => {})
    return NextResponse.json({ success: true, blockedCountries: updated.blockedCountries })
  } catch (err) {
    console.error('POST /api/admin/security/block-country error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
