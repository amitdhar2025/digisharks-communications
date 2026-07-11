/**
 * Shared Video Utilities
 *
 * Centralises all video-platform URL detection, ID extraction,
 * embed-URL generation, and thumbnail-URL retrieval for:
 *   - YouTube (youtube.com, youtu.be)
 *   - Vimeo (vimeo.com)
 *   - Dailymotion (dailymotion.com, dai.ly)
 *   - Direct video files (.mp4, .webm, .ogg, .mov, .avi, .mkv)
 */

// ── Helpers ────────────────────────────────────────────────────────────

/** Regex for direct video file extensions */
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i

// ── YouTube ────────────────────────────────────────────────────────────

export function getYouTubeId(url: string): string | null {
  try {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch) return shortMatch[1]
    const watchMatch = url.match(/youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)([a-zA-Z0-9_-]+)/)
    if (watchMatch) return watchMatch[1]
  } catch { /* ignore */ }
  return null
}

export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url)
}

export function getYouTubeEmbedUrl(url: string, autoplay = false): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  const params = autoplay ? '?autoplay=1' : ''
  return `https://www.youtube.com/embed/${id}${params}`
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

// ── Vimeo ──────────────────────────────────────────────────────────────

export function getVimeoId(url: string): string | null {
  try {
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match) return match[1]
  } catch { /* ignore */ }
  return null
}

export function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/i.test(url)
}

export function getVimeoEmbedUrl(url: string, autoplay = false): string | null {
  const id = getVimeoId(url)
  if (!id) return null
  const params = autoplay ? '?autoplay=1&muted=1' : ''
  return `https://player.vimeo.com/video/${id}${params}`
}

/**
 * Fetch the Vimeo thumbnail URL for a given video URL using the oEmbed endpoint.
 * Falls back to null if the fetch fails or the URL is invalid.
 *
 * This is async because Vimeo doesn't provide a predictable direct thumbnail URL.
 * The oEmbed endpoint requires NO API key for public videos.
 */
export async function getVimeoThumbnailUrl(url: string): Promise<string | null> {
  const id = getVimeoId(url)
  if (!id) return null
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.thumbnail_url || null
  } catch {
    return null
  }
}

// ── Dailymotion ────────────────────────────────────────────────────────

export function getDailymotionId(url: string): string | null {
  try {
    // dailymotion.com/video/XXXXX or dailymotion.com/embed/video/XXXXX
    const match = url.match(/dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/)
    if (match) return match[1]
    // Short URL: dai.ly/XXXXX
    const shortMatch = url.match(/dai\.ly\/([a-zA-Z0-9]+)/)
    if (shortMatch) return shortMatch[1]
  } catch { /* ignore */ }
  return null
}

export function isDailymotionUrl(url: string): boolean {
  return /dailymotion\.com|dai\.ly/i.test(url)
}

export function getDailymotionEmbedUrl(url: string, autoplay = false): string | null {
  const id = getDailymotionId(url)
  if (!id) return null
  const params = autoplay ? '?autoplay=1&muted=1' : ''
  return `https://www.dailymotion.com/embed/video/${id}${params}`
}

export function getDailymotionThumbnailUrl(url: string): string | null {
  const id = getDailymotionId(url)
  if (!id) return null
  return `https://www.dailymotion.com/thumbnail/video/${id}`
}

// ── Direct video files ─────────────────────────────────────────────────

export function isDirectVideoUrl(url: string): boolean {
  return VIDEO_EXT_RE.test(url)
}

// ── Generic composites ─────────────────────────────────────────────────

/** Check if a URL is any known video type (service or direct file) */
export function isAnyVideoUrl(url: string): boolean {
  if (!url) return false
  return isYouTubeUrl(url) || isVimeoUrl(url) || isDailymotionUrl(url) || isDirectVideoUrl(url)
}

/**
 * Get the embed URL for a video from any supported platform.
 * Returns the raw URL for direct video files (used as <video> src).
 */
export function getAnyVideoEmbedUrl(url: string, autoplay = false): string | null {
  const yt = getYouTubeEmbedUrl(url, autoplay)
  if (yt) return yt
  const vm = getVimeoEmbedUrl(url, autoplay)
  if (vm) return vm
  const dm = getDailymotionEmbedUrl(url, autoplay)
  if (dm) return dm
  if (isDirectVideoUrl(url)) return url
  return null
}

/** Synchronous thumbnail URL — works for YouTube and Dailymotion (returns null for Vimeo) */
export function getSyncThumbnailUrl(url: string): string | null {
  const yt = getYouTubeThumbnailUrl(url)
  if (yt) return yt
  const dm = getDailymotionThumbnailUrl(url)
  if (dm) return dm
  return null
}

/** Identify the video platform for display purposes */
export function getVideoPlatformLabel(url: string): string {
  if (isYouTubeUrl(url)) return 'YouTube'
  if (isVimeoUrl(url)) return 'Vimeo'
  if (isDailymotionUrl(url)) return 'Dailymotion'
  if (isDirectVideoUrl(url)) return 'Video'
  return ''
}
