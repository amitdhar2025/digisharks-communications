'use client'

import AdminErrorBoundary from './ErrorBoundary'

/**
 * Client-side wrapper that adds the global Error Boundary around all admin
 * panel content. Wrap this around children in the admin server layout.
 */
export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return <AdminErrorBoundary>{children}</AdminErrorBoundary>
}
