/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;

