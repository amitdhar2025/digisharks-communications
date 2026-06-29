import { redirect } from 'next/navigation'
import { getAdminFromCookies, isSuperAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function SubAdminsLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    redirect('/admin/login?next=/admin/sub-admins')
  }
  if (!isSuperAdmin(admin)) {
    redirect('/admin/dashboard')
  }
  return <>{children}</>
}
