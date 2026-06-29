'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminBlogShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    adminFetch('/api/admin/me').then(({ data, error }) => {
      if (error || !data?.authenticated) {
        router.push('/admin/login?next=/admin/blog')
      }
    })
  }, [router])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
