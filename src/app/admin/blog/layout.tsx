import { redirect } from 'next/navigation'
import { getAdminFromCookies } from '@/lib/auth'
import AdminBlogShell from './AdminBlogShell'

export const dynamic = 'force-dynamic'

export default async function AdminBlogLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    redirect('/admin/login?next=/admin/blog')
  }
  return <AdminBlogShell>{children}</AdminBlogShell>
}
