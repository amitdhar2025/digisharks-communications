import { redirect } from 'next/navigation'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    redirect('/admin/login?next=/admin/dashboard')
  }

  // Dashboard is super-admin only — redirect sub-admins to their first accessible section
  if (admin.role === 'sub-admin') {
    redirect('/admin/blog')
  }

  return <>{children}</>
}
