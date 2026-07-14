/**
 * Dynamic Registration Page
 *
 * Renders registration form by slug using the shared RegisterForm component.
 * Example URLs: /register/career, /register/partner-with-us
 */

'use client'

import { useParams } from 'next/navigation'
import RegisterForm from '@/components/RegisterForm'

export default function RegisterBySlugPage() {
  const params = useParams()
  const slug = params?.slug as string

  if (!slug) {
    return (
      <div className="register-page" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <p style={{ color: '#4a5568' }}>Invalid registration link.</p>
      </div>
    )
  }

  return (
    <RegisterForm
      apiUrl={`/api/public/registration-form-config?slug=${encodeURIComponent(slug)}`}
      formSlug={slug}
      disabledMessage="This registration form is currently unavailable."
    />
  )
}
