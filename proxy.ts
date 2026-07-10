/**
 * Route Protection Proxy — Next.js 16 naming (replaces middleware.ts)
 *
 * Protects every route under /content/admin/* EXCEPT /content/admin/login
 * and /api/content/admin/login (and logout).
 *
 * If no valid CMS session cookie is found, redirects to /content/admin/login.
 * If already logged in and visiting /content/admin/login, redirects to dashboard.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyCMSToken, COOKIE_NAME } from './src/lib/auth-cms'

// ── Public paths (no auth required) ────────────────────────────────────
const PUBLIC_PATHS = [
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
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.json',
  '.webp',
  '.avif',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Only protect /content/admin routes ───────────────────────────────
  if (!pathname.startsWith('/content/admin')) {
    return NextResponse.next()
  }

  // ── Allow public paths ───────────────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // ── Allow public file extensions ──────────────────────────────────────
  if (PUBLIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next()
  }

  // ── Check for valid CMS session cookie ────────────────────────────────
  const token = req.cookies.get(COOKIE_NAME)?.value
  const admin = token ? verifyCMSToken(token) : null

  if (!admin) {
    // Not authenticated — redirect to login
    const loginUrl = new URL('/content/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // ── If already logged in and visiting login page, redirect to dashboard ─
  if (pathname === '/content/admin/login' && admin) {
    return NextResponse.redirect(new URL('/content/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/content/admin/:path*', '/content/admin'],
}
