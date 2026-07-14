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
    const { domain, action } = await req.json()

    if (!domain || !['block', 'unblock'].includes(action)) {
      return NextResponse.json({ error: 'domain and action (block/unblock) are required' }, { status: 400 })
    }

    const settings = await getSecuritySettings()
    let list = [...settings.blockedEmailDomains]
    const normalized = domain.toLowerCase().trim()

    if (action === 'block') {
      if (!list.includes(normalized)) list.push(normalized)
    } else {
      list = list.filter(d => d !== normalized)
    }

    const updated = await saveSecuritySettings({ blockedEmailDomains: list })
    logActivity({ event: 'security_domain_' + action, description: `${action === 'block' ? 'Blocked' : 'Unblocked'} email domain: ${normalized}`, username: admin.username, dashboard: 'admin', target: normalized }).catch(() => {})
    return NextResponse.json({ success: true, blockedEmailDomains: updated.blockedEmailDomains })
  } catch (err) {
    console.error('POST /api/admin/security/block-email-domain error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
