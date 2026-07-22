'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  /** Minimum height in px to reserve while loading (prevents CLS). Default 200 */
  minHeight?: number
  /** Additional CSS classes */
  className?: string
  /** Distance in px from viewport to trigger loading. Default 150 */
  rootMargin?: number
  /** Unique ID for the section (for accessibility) */
  id?: string
}

/**
 * Lazily renders children only when the section is near the viewport.
 * Shows a lightweight placeholder with min-height to prevent layout shift.
 * Once triggered, children fade in with a smooth transition.
 */
export default function LazySection({
  children,
  minHeight = 200,
  className = '',
  rootMargin = 150,
  id,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Use a small delay to avoid IntersectionObserver triggering during
    // the initial render flood on slow connections
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(el)
          }
        },
        {
          rootMargin: `${rootMargin}px`,
          threshold: 0,
        }
      )
      observer.observe(el)

      // Cleanup
      return () => observer.disconnect()
    }, 100)

    return () => clearTimeout(timer)
  }, [rootMargin])

  // Trigger the CSS fade-in after a microtask so the browser
  // has painted the initial state (opacity: 0)
  useEffect(() => {
    if (isVisible && !hasAnimated) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHasAnimated(true)
        })
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isVisible, hasAnimated])

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        minHeight: isVisible ? undefined : minHeight,
        opacity: hasAnimated ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        willChange: hasAnimated ? 'auto' : 'opacity',
      }}
    >
      {isVisible ? children : null}
    </div>
  )
}
