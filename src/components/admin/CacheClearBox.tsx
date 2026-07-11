'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'

/**
 * Cache Clear Box — reusable component that clears all site caches
 * via POST /api/admin/cache/clear.
 */
export default function CacheClearBox() {
  const [clearing, setClearing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleClear() {
    setClearing(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/cache/clear', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setResult(`✅ ${data.message}`)
      } else {
        setResult(`❌ ${data.error || 'Failed to clear cache'}`)
      }
    } catch {
      setResult('❌ Network error while clearing cache')
    } finally {
      setClearing(false)
      setTimeout(() => setResult(null), 5000)
    }
  }

  return (
    <div
      style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 14,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Zap size={22} style={{ color: '#8b5cf6', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
          ⚡ Clear Cache
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
          Clear all site caches instantly — including API responses, server cache, and in-memory data.
          Refreshes the frontend immediately.
        </div>
      </div>
      <button
        onClick={handleClear}
        disabled={clearing}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: clearing ? '#4f46e566' : '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 13,
          cursor: clearing ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, transform 0.15s',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { if (!clearing) e.currentTarget.style.background = '#4f46e5' }}
        onMouseLeave={(e) => { if (!clearing) e.currentTarget.style.background = '#6366f1' }}
      >
        {clearing ? (
          <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Clearing…</>
        ) : (
          <><Zap size={16} /> Clear Cache</>
        )}
      </button>
      {result && (
        <div style={{ width: '100%', fontSize: 12, color: result.startsWith('✅') ? '#4ade80' : '#f87171', fontWeight: 500 }}>
          {result}
        </div>
      )}
    </div>
  )
}
