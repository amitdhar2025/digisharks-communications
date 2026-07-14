import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getSecuritySettings, saveSecuritySettings } from '@/lib/anti-spam'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

/** Add or remove an IP from the banned list */
export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { ip, action } = await req.json()

    if (!ip || !['ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'ip and action (ban/unban) are required' }, { status: 400 })
    }

    const settings = await getSecuritySettings()
    let list = [...settings.bannedIps]

    if (action === 'ban') {
      if (!list.includes(ip)) list.push(ip)
    } else {
      list = list.filter(i => i !== ip)
    }

    const updated = await saveSecuritySettings({ bannedIps: list })
    logActivity({ event: 'security_ip_' + action, description: `${action === 'ban' ? 'Banned' : 'Unbanned'} IP: ${ip}`, username: admin.username, dashboard: 'admin', target: ip }).catch(() => {})
    return NextResponse.json({ success: true, bannedIps: updated.bannedIps })
  } catch (err) {
    console.error('POST /api/admin/security/ban-ip error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
