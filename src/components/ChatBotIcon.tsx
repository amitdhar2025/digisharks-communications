'use client'

import { useId } from 'react'

interface Props {
  // Outer circle (the bubble background)
  bubbleBg: string          // e.g. teal/green
  bubbleBorder: string      // e.g. white or a light tint
  bubbleShadow: string      // rgba shadow color
  // Robot face (the line drawing inside the circle)
  faceStroke: string        // outline color (e.g. white)
  faceFill: string          // fill of the eyes/inner dots
  faceCheek: string         // cheek/blush accent
  // Antenna dot (the small dot at the top)
  antennaColor: string
  // Size
  size?: number
}

/**
 * ChatBotIcon — a rounded, modern chat-bot bubble icon that mimics the
 * reference design: a colored circle with a white robot face (antenna,
 * head, eyes, smile) drawn as outlines. Every color is fully dynamic
 * so the admin can re-skin it from the dashboard.
 */
export default function ChatBotIcon({
  bubbleBg,
  bubbleBorder,
  bubbleShadow,
  faceStroke,
  faceFill,
  faceCheek,
  antennaColor,
  size = 64,
}: Props) {
  const uid = useId()
  const gradId = `cb-grad-${uid}`
  const glowId = `cb-glow-${uid}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bubbleBg} stopOpacity="1" />
          <stop offset="100%" stopColor={bubbleBg} stopOpacity="0.85" />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer colored circle (the chat bubble background) */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill={`url(#${gradId})`}
        stroke={bubbleBorder}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 6px 12px ${bubbleShadow})` }}
      />

      {/* Robot face group — drawn with stroke so it follows faceStroke */}
      <g
        fill="none"
        stroke={faceStroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Antenna stem */}
        <line x1="50" y1="18" x2="50" y2="26" />
        {/* Antenna dot */}
        <circle cx="50" cy="15" r="3" fill={antennaColor} stroke="none" />

        {/* Head — rounded rectangle */}
        <rect x="28" y="28" width="44" height="38" rx="10" ry="10" />

        {/* Ear / side knobs */}
        <line x1="25" y1="40" x2="28" y2="40" />
        <line x1="25" y1="52" x2="28" y2="52" />
        <line x1="72" y1="40" x2="75" y2="40" />
        <line x1="72" y1="52" x2="75" y2="52" />

        {/* Eyes (round) */}
        <circle cx="40" cy="46" r="4" fill={faceFill} stroke="none" />
        <circle cx="60" cy="46" r="4" fill={faceFill} stroke="none" />

        {/* Smile / mouth */}
        <path d="M 40 58 Q 50 64 60 58" />

        {/* Bottom chin curve */}
        <path d="M 36 66 Q 50 72 64 66" />
      </g>

      {/* Cheek blush (decorative accent) */}
      <ellipse cx="34" cy="56" rx="3" ry="1.6" fill={faceCheek} opacity="0.55" />
      <ellipse cx="66" cy="56" rx="3" ry="1.6" fill={faceCheek} opacity="0.55" />
    </svg>
  )
}
