'use client'

import { useState, useEffect } from 'react'
import {
  isVimeoUrl,
  isAnyVideoUrl,
  isDirectVideoUrl,
  getAnyVideoEmbedUrl,
  getSyncThumbnailUrl,
  getVimeoThumbnailUrl,
  getVideoPlatformLabel,
} from '@/lib/video-utils'

interface VideoThumbnailProps {
  url: string
  onRemove?: () => void
  label?: string
}

export default function VideoThumbnail({ url, onRemove, label }: VideoThumbnailProps) {
  const [showPlayer, setShowPlayer] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbLoading, setThumbLoading] = useState(false)

  if (!url) return null

  const embedUrl = getAnyVideoEmbedUrl(url, true) // autoplay enabled
  const syncThumb = getSyncThumbnailUrl(url)
  const isVideo = isAnyVideoUrl(url)
  const platform = getVideoPlatformLabel(url)

  // Fetch thumbnail — async for Vimeo, sync for all others
  useEffect(() => {
    if (isVimeoUrl(url)) {
      setThumbLoading(true)
      getVimeoThumbnailUrl(url).then((t) => {
        setThumbnailUrl(t)
        setThumbLoading(false)
      })
    } else {
      setThumbnailUrl(syncThumb)
      setThumbLoading(false)
    }
  }, [url, syncThumb])

  if (!isVideo) return null

  const showLabel = label || (platform ? `▶ ${platform}` : undefined)

  return (
    <>
      <div
        style={{
          position: 'relative',
          marginTop: 8,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#000',
          maxWidth: 400,
          cursor: 'pointer',
        }}
        onClick={() => setShowPlayer(true)}
      >
        {thumbLoading ? (
          // Loading skeleton for Vimeo thumbnail
          <div
            style={{
              width: '100%',
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1a1a2e',
              color: '#64748b',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#6366f1',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>
              Loading thumbnail...
            </span>
          </div>
        ) : thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={`${platform} video thumbnail`}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)' }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF5B2E">
                  <polygon points="8,5 19,12 8,19" />
                </svg>
              </div>
            </div>
            {showLabel && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{getPlatformIcon(platform)}</span>
                {showLabel}
              </div>
            )}
          </>
        ) : (
          // Fallback for videos without thumbnails (or Vimeo before fetch completes)
          <div
            style={{
              width: '100%',
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1a1a2e',
              color: '#94a3b8',
              gap: 8,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 500 }}>
              {platform ? `Click to preview ${platform}` : 'Click to preview video'}
            </span>
          </div>
        )}
        {/* Close button */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Video player modal/overlay */}
      {showPlayer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowPlayer(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 800,
              aspectRatio: '16/9',
              borderRadius: 12,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {embedUrl && !isDirectVideoUrl(url) ? (
              <iframe
                src={embedUrl}
                title="Video preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={url}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', background: '#000' }}
              />
            )}
            <button
              type="button"
              onClick={() => setShowPlayer(false)}
              style={{
                position: 'absolute',
                top: -36,
                right: 0,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                fontSize: 18,
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Spinner animation style */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

/** Get an icon for each video platform */
function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'YouTube': return '▶'
    case 'Vimeo': return '◈'
    case 'Dailymotion': return '▷'
    default: return '▶'
  }
}
