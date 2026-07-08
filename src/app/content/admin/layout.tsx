/**
 * CMS Admin Layout (Server Component)
 *
 * Wraps all /content/admin pages with the client-side shell.
 */

import CMSAdminLayout from './CMSAdminLayout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'CMS · Digisharks Communications',
  description: 'Content Management System for Digisharks Communications',
}

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return <CMSAdminLayout>{children}</CMSAdminLayout>
}
