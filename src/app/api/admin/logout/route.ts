import { NextResponse } from 'next/server'
import { clearAdminCookie, getAdminFromCookies } from '@/lib/auth'
import { getLoginLogsCollection } from '@/lib/db'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function POST() {
  const admin = await getAdminFromCookies()

  // Update the most recent login log for this user with logout time
  if (admin?.username) {
    try {
      const col = await getLoginLogsCollection()
      await col.findOneAndUpdate(
        { username: admin.username, logoutTime: { $exists: false } },
        { $set: { logoutTime: new Date() } },
        { sort: { loginTime: -1 } }
      )
    } catch {
      // Best-effort
    }
    logActivity({ event: 'logout', description: `Admin logged out: ${admin.username}`, username: admin.username, dashboard: 'admin' }).catch(() => {})
  }

  await clearAdminCookie()
  return NextResponse.json({ success: true })
}
