import { redirect } from 'next/navigation'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminIndex() {
  const admin = await getAdminFromCookies()
  if (admin) {
    redirect('/admin/dashboard')
  }
  redirect('/admin/login')
}
