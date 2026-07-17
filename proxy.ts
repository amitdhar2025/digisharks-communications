/**
 * Route Protection Proxy — Next.js 16 (replaces src/middleware.ts)
 *
 * Protects /admin/* and /content/admin/* routes.
 * If no valid session cookie is found, redirects to the appropriate login.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { COOKIE_NAME as CMS_COOKIE } from './src/lib/auth-cms'
import { COOKIE_NAME as ADMIN_COOKIE } from './src/lib/auth'

// ── Public paths (no auth required) ────────────────────────────────────

const ADMIN_PUBLIC = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/forgot-username',
  '/api/admin/login',
  '/api/admin/forgot-password',
  '/api/admin/forgot-username',
  '/api/admin/logout',
]

const CMS_PUBLIC = [
  '/content/admin/login',
  '/content/admin/forgot-password',
  '/content/admin/forgot-username',
  '/api/content/admin/login',
  '/api/content/admin/forgot-password',
  '/api/content/admin/forgot-username',
  '/api/content/admin/logout',
]

// File extensions that are always public (JS, CSS, images, etc.)
const PUBLIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.json', '.webp', '.avif',
]

function isPublicPath(publicPaths: string[], pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isPublicExtension(pathname: string): boolean {
  return PUBLIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Allow non-admin routes through immediately ───────────────────────
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/content/admin')) {
    return NextResponse.next()
  }

  // ── /admin/* protection ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Allow public paths and file extensions
    if (isPublicPath(ADMIN_PUBLIC, pathname) || isPublicExtension(pathname)) {
      return NextResponse.next()
    }

    // Check for admin_token cookie (presence check — token verified by route handlers)
    const token = req.cookies.get(ADMIN_COOKIE)?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // ── /content/admin root → always redirect to login ────────────────
  if (pathname === '/content/admin') {
    const loginUrl = new URL('/content/admin/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // ── /content/admin/* protection ──────────────────────────────────────
  if (isPublicPath(CMS_PUBLIC, pathname) || isPublicExtension(pathname)) {
    return NextResponse.next()
  }

  // Check for CMS admin_token cookie (presence check — token verified by route handlers)
  const token = req.cookies.get(CMS_COOKIE)?.value

  if (!token) {
    const loginUrl = new URL('/content/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/content/admin/:path*', '/content/admin'],
}
