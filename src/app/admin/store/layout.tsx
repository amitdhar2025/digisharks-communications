import { redirect } from 'next/navigation'
import { getAdminFromCookies } from '@/lib/auth'
import AdminStoreShell from './AdminStoreShell'

export const dynamic = 'force-dynamic'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    redirect('/admin/login?next=/admin/store')
  }
  return <AdminStoreShell>{children}</AdminStoreShell>
}
