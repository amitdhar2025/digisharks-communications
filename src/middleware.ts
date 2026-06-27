import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_LOGIN = '/admin/login'
const ADMIN_ROOT = '/admin'

/**
 * Middleware to protect /admin/* routes.
 * Checks for the admin_token cookie and redirects to login if missing.
 * Public paths like /admin/login are allowed through.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith(ADMIN_ROOT)) {
    return NextResponse.next()
  }

  // Allow login page and API auth routes
  if (
    pathname === ADMIN_LOGIN ||
    pathname.startsWith('/api/admin/login') ||
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
    // Pass the original path as `next` so the login page can bounce back
    // to it after a successful sign-in. Also include `redirect` for
    // backward compatibility with any old bookmarks/links.
    loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
    loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
