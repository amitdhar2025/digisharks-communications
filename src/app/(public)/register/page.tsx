/**
 * Public Registration Page
 *
 * Renders the default registration form using the shared RegisterForm component.
 * Admins can customize fields via /content/admin/registration-form-builder.
 */

'use client'

import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <RegisterForm
      apiUrl="/api/public/registration-form-config"
      formSlug="registration"
    />
  )
}
