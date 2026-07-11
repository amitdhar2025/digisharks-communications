'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  isDirectVideoUrl,
  isAnyVideoUrl,
} from '@/lib/video-utils'

interface MediaItem {
  image?: string
  videoUrl?: string
  caption?: string
  alt?: string
  link?: string
  isActive?: boolean
  order?: number
}

interface HeroMediaCarouselProps {
  items: MediaItem[]
  autoPlayInterval?: number
}

/** Check if a URL points to a video file or video service */
function isVideoUrl(url: string): boolean {
  return isAnyVideoUrl(url)
}

/** Get video embed URL for carousel (with loop & mute for background play) */
function getCarouselEmbedUrl(url: string): string | null {
  if (!url) return null
  // YouTube with loop + mute
  const ytMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}`
  const ytWatchMatch = url.match(/youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)([a-zA-Z0-9_-]+)/)
  if (ytWatchMatch) return `https://www.youtube.com/embed/${ytWatchMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytWatchMatch[1]}`
  // Vimeo with loop + mute
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1&loop=1`
  // Dailymotion with loop + mute
  const dmMatch = url.match(/dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/)
  if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1&muted=1`
  const dmShortMatch = url.match(/dai\.ly\/([a-zA-Z0-9]+)/)
  if (dmShortMatch) return `https://www.dailymotion.com/embed/video/${dmShortMatch[1]}?autoplay=1&muted=1`
  // Direct video file
  if (isDirectVideoUrl(url)) return url
  return null
}

export default function HeroMediaCarousel({
  items,
  autoPlayInterval = 5000,
}: HeroMediaCarouselProps) {
  const activeItems = items
    .filter((item) => item.isActive !== false && (item.image || item.link))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeItems.length)
  }, [activeItems.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length)
  }, [activeItems.length])

  // Auto-play timer
  useEffect(() => {
    if (activeItems.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(goNext, autoPlayInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeItems.length, isPaused, goNext, autoPlayInterval])

  if (activeItems.length === 0) return null

  const currentItem = activeItems[currentIndex]
  const isVideo = isVideoUrl(currentItem.link || '')

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0f172a',
        aspectRatio: '21/9',
        minHeight: 280,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Media display */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {isVideo ? (
          !isDirectVideoUrl(currentItem.link || '') ? (
            // Embedded video (YouTube, Vimeo, Dailymotion)
            <iframe
              src={getCarouselEmbedUrl(currentItem.link || '') || ''}
              title={currentItem.caption || currentItem.alt || 'Hero video'}
              style={{ width: '100%', height: '100%', border: 'none', pointerEvents: isPaused ? 'auto' : 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Direct video file
            <video
              src={currentItem.link || ''}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )
        ) : (
          // Image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentItem.image || ''}
            alt={currentItem.alt || currentItem.caption || 'Hero banner'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        {/* Gradient overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Caption */}
        {currentItem.caption && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              zIndex: 2,
            }}
          >
            {currentItem.caption}
          </div>
        )}
      </div>

      {/* Navigation arrows (only if more than 1 item) */}
      {activeItems.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 5,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
          >
            ›
          </button>
        </>
      )}

      {/* Dots indicator (only if more than 1 item) */}
      {activeItems.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 5,
          }}
        >
          {activeItems.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === currentIndex ? '#FF5B2E' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
