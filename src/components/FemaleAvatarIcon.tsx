'use client'

import { useId } from 'react'

interface Props {
  primaryColor: string
  accentColor?: string
  size?: number
}

export default function FemaleAvatarIcon({ primaryColor, accentColor, size = 56 }: Props) {
  const uid = useId()
  const gradId = `avatar-grad-${uid}`
  const clipId = `face-clip-${uid}`
  const accent = accentColor || '#0F1628'

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <clipPath id={clipId}>
          <circle cx="50" cy="45" r="24" />
        </clipPath>
      </defs>

      {/* Background circle with gradient */}
      <circle cx="50" cy="50" r="50" fill={`url(#${gradId})`} />

      {/* Hair (behind face) */}
      <path
        d="M 18 50 C 14 22, 30 12, 50 10 C 70 12, 86 22, 82 50 C 80 78, 72 92, 50 94 C 28 92, 20 78, 18 50 Z"
        fill="#1a1a2e"
        opacity="0.92"
      />

      {/* Face */}
      <circle cx="50" cy="46" r="23" fill="#fce8d0" />

      {/* Hair fringe / bangs */}
      <path
        d="M 27 42 Q 30 18 50 15 Q 70 18 73 42 Q 68 28 50 24 Q 32 28 27 42"
        fill="#1a1a2e"
      />

      {/* Side hair framing */}
      <path
        d="M 20 48 C 18 36, 22 28, 28 24 L 27 48 C 27 60, 25 70, 28 80"
        fill="#1a1a2e"
        opacity="0.85"
      />
      <path
        d="M 80 48 C 82 36, 78 28, 72 24 L 73 48 C 73 60, 75 70, 72 80"
        fill="#1a1a2e"
        opacity="0.85"
      />

      {/* Eyes */}
      <ellipse cx="39" cy="44" rx="3.5" ry="4" fill="#1a1a2e" />
      <ellipse cx="61" cy="44" rx="3.5" ry="4" fill="#1a1a2e" />

      {/* Eye highlights */}
      <circle cx="40.5" cy="42.5" r="1.5" fill="white" opacity="0.9" />
      <circle cx="62.5" cy="42.5" r="1.5" fill="white" opacity="0.9" />

      {/* Eyebrows */}
      <path
        d="M 33 38 Q 39 35 45 38"
        fill="none"
        stroke="#8b6b4a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 55 38 Q 61 35 67 38"
        fill="none"
        stroke="#8b6b4a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Nose */}
      <path
        d="M 50 48 L 48 53 Q 50 55 52 53"
        fill="none"
        stroke="#d4a574"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Smile */}
      <path
        d="M 42 58 Q 50 65 58 58"
        fill="none"
        stroke="#d4786a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Blush */}
      <ellipse cx="34" cy="54" rx="5" ry="3" fill="#f5a0a0" opacity="0.2" />
      <ellipse cx="66" cy="54" rx="5" ry="3" fill="#f5a0a0" opacity="0.2" />

      {/* Earrings */}
      <circle cx="27" cy="48" r="2" fill="#e8c97a" opacity="0.7" />
      <circle cx="73" cy="48" r="2" fill="#e8c97a" opacity="0.7" />
    </svg>
  )
}
