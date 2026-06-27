import { redirect } from 'next/navigation'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function SeoAuditAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    redirect('/admin/login?next=/admin/seo-audit')
  }
  return <>{children}</>
}
