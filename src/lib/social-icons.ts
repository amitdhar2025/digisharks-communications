/**
 * Shared social platform definitions
 *
 * Provides SVG path data and emoji icons for popular social platforms.
 * Used by Navigation.tsx (SVG icons in header) and Footer.tsx (emoji icons).
 * The CMS settings page uses these as defaults when adding known platforms.
 */

export interface SocialPlatformDef {
  /** Unique key e.g. 'facebook', 'twitter' */
  platform: string
  /** Display label e.g. 'Facebook', 'X / Twitter' */
  label: string
  /** Default URL when a new link for this platform is created */
  defaultUrl: string
  /** SVG path data for the header icon (24x24 viewBox) */
  iconSvg: string
  /** Emoji for the footer icon */
  iconEmoji: string
}

export const KNOWN_PLATFORMS: SocialPlatformDef[] = [
  {
    platform: 'facebook',
    label: 'Facebook',
    defaultUrl: 'https://www.facebook.com/digisharks',
    iconSvg: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
    iconEmoji: '📘',
  },
  {
    platform: 'twitter',
    label: 'X / Twitter',
    defaultUrl: 'https://twitter.com/digisharks',
    iconSvg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    iconEmoji: '🐦',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    defaultUrl: 'https://www.instagram.com/digisharks',
    iconSvg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    iconEmoji: '📸',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    defaultUrl: 'https://www.linkedin.com/company/digisharks',
    iconSvg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    iconEmoji: '💼',
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    defaultUrl: 'https://www.youtube.com/@digisharks',
    iconSvg: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    iconEmoji: '▶️',
  },
  {
    platform: 'pinterest',
    label: 'Pinterest',
    defaultUrl: 'https://www.pinterest.com/digisharks',
    iconSvg: 'M12 0a12 12 0 0 0-4.64 23.14c-.1-.77-.19-1.96.04-2.8.2-.73 1.33-5.64 1.33-5.64s-.33-.67-.33-1.66c0-1.55.9-2.71 2.02-2.71.95 0 1.41.72 1.41 1.58 0 .96-.61 2.4-.93 3.73-.27 1.12.56 2.03 1.66 2.03 1.99 0 3.52-2.1 3.52-5.13 0-2.68-1.93-4.56-4.68-4.56-3.19 0-5.06 2.4-5.06 4.87 0 .96.37 2 .83 2.56.09.11.1.21.08.32l-.31 1.27c-.05.21-.16.25-.38.15-1.44-.67-2.34-2.78-2.34-4.47 0-3.64 2.64-6.98 7.62-6.98 4 0 7.11 2.85 7.11 6.67 0 3.98-2.5 7.18-5.99 7.18-1.17 0-2.27-.61-2.65-1.33l-.72 2.75c-.26 1-1 2.02-1.48 2.7A12 12 0 1 0 12 0z',
    iconEmoji: '📌',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    defaultUrl: 'https://www.tiktok.com/@digisharks',
    iconSvg: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    iconEmoji: '🎵',
  },
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    defaultUrl: 'https://wa.me/919627332332',
    iconSvg: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
    iconEmoji: '💬',
  },
]

/**
 * Create default social links array from known platforms
 */
export function defaultSocialLinks() {
  return KNOWN_PLATFORMS.map((p) => ({
    platform: p.platform,
    label: p.label,
    url: p.defaultUrl,
    iconSvg: p.iconSvg,
    iconEmoji: p.iconEmoji,
  }))
}

/**
 * Find a known platform definition by its key
 */
export function getPlatformDef(platform: string): SocialPlatformDef | undefined {
  return KNOWN_PLATFORMS.find((p) => p.platform === platform)
}

/**
 * Get SVG path for a platform, falling back to a generic share icon
 */
export function getSvgPath(platform: string): string {
  const def = getPlatformDef(platform)
  if (def) return def.iconSvg
  // Generic share icon fallback
  return 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z'
}

/**
 * Get emoji for a platform, falling back to a generic link emoji
 */
export function getEmoji(platform: string): string {
  const def = getPlatformDef(platform)
  return def ? def.iconEmoji : '🔗'
}

/**
 * Get display label for a platform
 */
export function getLabel(platform: string): string {
  const def = getPlatformDef(platform)
  return def ? def.label : platform
}
