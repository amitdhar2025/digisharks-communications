import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_LOGIN = '/admin/login'
const ADMIN_FORGOT = '/admin/forgot-password'
const ADMIN_FORGOT_USERNAME = '/admin/forgot-username'
const ADMIN_ROOT = '/admin'
const CMS_ADMIN_LOGIN = '/content/admin/login'
const CMS_ADMIN_FORGOT = '/content/admin/forgot-password'
const CMS_ADMIN_FORGOT_USERNAME = '/content/admin/forgot-username'
const CMS_ADMIN_ROOT = '/content/admin'

/**
 * Middleware to protect /admin/* and /content/admin/* routes.
 * Checks for the appropriate cookie and redirects to login if missing.
 * Public paths like login pages and API routes are allowed through.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── /admin/* protection ─────────────────────────────────────────────
  if (pathname.startsWith(ADMIN_ROOT)) {
    // Allow login page, forgot-password, forgot-username, and API auth routes
    if (
      pathname === ADMIN_LOGIN ||
      pathname === ADMIN_FORGOT ||
      pathname === ADMIN_FORGOT_USERNAME ||
      pathname.startsWith('/api/admin/login') ||
      pathname.startsWith('/api/admin/forgot-password') ||
      pathname.startsWith('/api/admin/forgot-username') ||
      pathname.startsWith('/api/admin/logout') ||
      pathname === '/admin'
    ) {
      return NextResponse.next()
    }

    // Public file extensions (JS, CSS, images, etc.)
    const publicExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.json']
    if (publicExtensions.some((ext) => pathname.endsWith(ext))) {
      return NextResponse.next()
    }

    // Check for admin_token cookie
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      const loginUrl = new URL(ADMIN_LOGIN, req.url)
      loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // ── /content/admin/* protection ────────────────────────────────────
  if (pathname.startsWith(CMS_ADMIN_ROOT)) {
    // Allow login page, forgot-password, forgot-username, and API auth routes
    if (
      pathname === CMS_ADMIN_LOGIN ||
      pathname === CMS_ADMIN_FORGOT ||
      pathname === CMS_ADMIN_FORGOT_USERNAME ||
      pathname.startsWith('/api/content/admin/login') ||
      pathname.startsWith('/api/content/admin/forgot-password') ||
      pathname.startsWith('/api/content/admin/forgot-username') ||
      pathname.startsWith('/api/content/admin/logout')
    ) {
      return NextResponse.next()
    }

    // Public file extensions (JS, CSS, images, etc.)
    const publicExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.json']
    if (publicExtensions.some((ext) => pathname.endsWith(ext))) {
      return NextResponse.next()
    }

    // Check for cms_admin_token cookie
    const token = req.cookies.get('cms_admin_token')?.value
    if (!token) {
      const loginUrl = new URL(CMS_ADMIN_LOGIN, req.url)
      loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/content/admin/:path*', '/content/admin'],
}
