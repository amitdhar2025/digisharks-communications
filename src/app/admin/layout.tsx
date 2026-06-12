import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Admin · Digisharks Communications',
  description: 'Admin dashboard for Digisharks Communications',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>
}
