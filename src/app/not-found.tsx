/**
 * Custom 404 Not Found Page
 *
 * Redirects all 404 errors to the homepage (/) so visitors never
 * see a dead-end page.
 */

import { redirect } from 'next/navigation'

export default function NotFound() {
  redirect('/')
}
