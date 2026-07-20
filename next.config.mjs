import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ================================================================
  // Build ID — unique per build so Next.js can detect server/client
  // mismatch and force a hard navigation instead of broken hydration.
  // When the build ID in the server HTML doesn't match the client
  // bundle's build ID, Next.js does a full page load (not hydration).
  // ================================================================
  generateBuildId: async () => {
    return `ds-${Date.now()}`
  },

  // ================================================================
  // Image optimisation — Next.js uses sharp under the hood to
  // serve AVIF/WebP, resize, and compress on-the-fly for images
  // loaded via the `next/image` component.
  // ================================================================
  images: {
    // Allow external domains that your images are hosted on
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.digisharkscommunications.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
    // Prevent Next.js from serving 1x1 placeholders — always serve
    // optimised at the requested dimensions.
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    formats: ['image/avif', 'image/webp'], // prefer AVIF, fallback WebP
  },

  // ================================================================
  // Compress text-based assets (JS, CSS, SVG) with Brotli / Gzip
  // ================================================================
  compress: true,

  // ================================================================
  // Output file tracing — ensures dynamically-accessed files (e.g.
  // log files read/written by the debug route at runtime) are
  // included in the serverless bundle.
  // ================================================================
  outputFileTracingIncludes: {
    '/api/admin/debug': ['./logs/**'],
  },

  // ================================================================
  // Security headers — applied to every response.
  // ================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ── Frame protection ──────────────────────────────────────
          { key: 'X-Frame-Options', value: 'DENY' },

          // ── MIME-sniffing protection ──────────────────────────────
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // ── XSS filter (legacy — modern browsers use CSP instead) ─
          { key: 'X-XSS-Protection', value: '1; mode=block' },

          // ── Referrer policy ───────────────────────────────────────
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // ── HSTS (enforces HTTPS for 1 year, incl. subdomains) ───
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },

          // ── Permissions policy (block camera, mic, geolocation) ───
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), ' +
              'interest-cohort=()',
          },

          // ── Content Security Policy ───────────────────────────────
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: res.cloudinary.com *.google.com *.googleapis.com *.gstatic.com; " +
              "media-src 'self' res.cloudinary.com; " +
              "font-src 'self'; " +
              "connect-src 'self' https://*.razorpay.com https://checkout.razorpay.com https://*.sentry.io; " +
              "frame-src 'self' https://checkout.razorpay.com https://www.youtube.com https://player.vimeo.com https://www.dailymotion.com https://www.google.com; " +
              "object-src 'none'; " +
              "base-uri 'self';",
          },
        ],
      },
      // ── HTML pages — NO CACHE (prevent browser from serving stale HTML) ──
      // This ensures every visit fetches fresh HTML from the server, which
      // references the latest JS chunk URLs with new content hashes.
      // Only matches paths WITHOUT file extensions (e.g. /, /about-us, /blog)
      // to avoid overriding image/font caching rules.
      {
        source: '/:path((?!_next/)(?!.+\\.[a-z0-9]+$).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate',
          },
        ],
      },

      // ── Aggressive caching for static assets (images only) for 1 year ──
      {
        source: '/:path((?:.+\.(?:avif|webp|jpg|jpeg|png|gif|svg|ico))$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

// Wrap with Sentry for error tracking and performance monitoring
// See https://docs.sentry.io/platforms/javascript/guides/nextjs/
export default withSentryConfig(nextConfig, {
  // Suppress source map uploading during local builds
  silent: !process.env.CI,
  // Upload a larger set of dependency files for more precise error traces
  widenClientFileUpload: true,
  // Hides source maps from logged-in users
  hideSourceMaps: true,
  // Route browser requests to Sentry through the Next.js server to avoid ad-blockers
  tunnelRoute: "/monitoring",
});

