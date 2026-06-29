import type { Metadata } from 'next'
import './admin.css'
import AdminProviders from '@/components/admin/AdminProviders'

export const metadata: Metadata = {
  title: 'Admin · Digisharks Communications',
  description: 'Admin dashboard for Digisharks Communications',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminProviders>{children}</AdminProviders>
    </div>
  )
}
