'use client'

export default function SkeletonCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    >
      <div style={{ padding: 16 }}>
        {/* Category badge skeleton */}
        <div
          style={{
            width: 80,
            height: 20,
            background: '#f3f4f6',
            borderRadius: 4,
            marginBottom: 10,
          }}
        />
        {/* Title skeleton */}
        <div
          style={{
            width: '100%',
            height: 16,
            background: '#f3f4f6',
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: '70%',
            height: 16,
            background: '#f3f4f6',
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        {/* Description skeleton */}
        <div
          style={{
            width: '100%',
            height: 11,
            background: '#f3f4f6',
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: '85%',
            height: 11,
            background: '#f3f4f6',
            borderRadius: 4,
            marginBottom: 16,
          }}
        />
        {/* Bottom row skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f3f4f6' }} />
            <div style={{ width: 60, height: 10, background: '#f3f4f6', borderRadius: 4 }} />
          </div>
          <div style={{ width: 50, height: 10, background: '#f3f4f6', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  )
}
