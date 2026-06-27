'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/* ─── Types ─── */

interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  score?: number
  details: string
  raw?: any
}

interface AuditResult {
  id: string
  url: string
  domain: string
  overall: string
  avgScore: number
  checks: CheckResult[]
  pagespeed?: {
    mobile?: Record<string, any>
    desktop?: Record<string, any>
  }
  userName: string
  createdAt: string
}

/* ─── Helpers ─── */

function fmtStatus(status: string) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pass: { label: 'Pass', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
    warn: { label: 'Warning', color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)' },
    fail: { label: 'Fail', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
    pending: { label: 'Running…', color: '#7dd3fc', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)' },
  }
  return map[status] || { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' }
}

const CHECK_ICONS: Record<string, string> = {
  'PageSpeed Insights': '🚀',
  'SSL Certificate': '🔒',
  'Safe Browsing': '🛡️',
  'Robots.txt': '🤖',
  'Sitemap': '🗺️',
  'Meta Tags': '🏷️',
  'Structured Data': '📊',
  'HTML Validation': '✅',
}

/* ─── Component ─── */

export default function SeoAuditResultPage() {
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('No audit ID provided.')
      setLoading(false)
      return
    }

    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | null = null

    async function loadResult() {
      try {
        const res = await fetch(`/api/seo-audit/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load audit result')
        if (cancelled) return
        setResult(data.audit)
        setLoading(false)

        // Check URL params for email_sent flag
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('email_sent') === 'true') {
          setEmailSent(true)
        }

        // If audit is still pending, poll again after 5s
        if (data.audit?.overall === 'pending') {
          pollTimer = setTimeout(loadResult, 5000)
        }
      } catch (err: any) {
        if (cancelled) return
        // If still loading (pending audit fetch failed), retry after 5s
        pollTimer = setTimeout(loadResult, 5000)
      }
    }

    loadResult()

    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
    }
  }, [id])

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'grid',
        placeItems: 'center',
        padding: '60px 24px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48,
            border: '3px solid rgba(14,165,233,0.2)',
            borderTopColor: '#0ea5e9',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#94a3b8' }}>Loading your audit report…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'grid',
        placeItems: 'center',
        padding: '60px 24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Report Not Found</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>{error}</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            ← Back to Home
          </a>
        </div>
      </main>
    )
  }

  if (!result) return null

  // Show a pending state when the audit is still running
  if (result.overall === 'pending') {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'grid',
        placeItems: 'center',
        padding: '60px 24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{
            width: 56, height: 56,
            border: '3px solid rgba(14,165,233,0.2)',
            borderTopColor: '#0ea5e9',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#e2e8f0' }}>
            🔍 Audit in Progress
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 6 }}>
            We&apos;re analyzing <strong style={{ color: '#7dd3fc' }}>{result.domain}</strong>.
          </p>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            This usually takes 30–60 seconds. The page will update automatically.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            fontFamily: 'var(--font-jakarta, Plus Jakarta Sans, system-ui)',
            margin: '0 0 6px',
            background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            SEO Audit Report
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>for {result.domain}</p>
          {result.userName && (
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              Hi {result.userName}, here&apos;s your complete report 👋
            </p>
          )}
          {emailSent && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
              padding: '8px 16px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 10,
              color: '#86efac',
              fontSize: 13,
            }}>
              📧 Report sent to your email
            </div>
          )}
        </div>

        {/* Score Overview */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(11,18,32,0.8))',
          border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: 20,
          padding: '32px',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>Overall Health Score</div>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
            color: result.overall === 'pass' ? '#22c55e' : result.overall === 'warn' ? '#eab308' : '#ef4444',
            lineHeight: 1,
          }}>
            {result.avgScore}
            <span style={{ fontSize: 24, opacity: 0.4 }}>/100</span>
          </div>
          <div style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            ...fmtStatus(result.overall),
          }}>
            {result.overall === 'pass' ? '✅ Pass' : result.overall === 'warn' ? '⚠️ Warning' : '❌ Fail'}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
            {result.url}
          </div>
        </div>

        {/* Check Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.checks.map((check) => {
            const isExpanded = expandedCheck === check.name
            const st = fmtStatus(check.status)
            return (
              <div
                key={check.name}
                style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(11,18,32,0.6))',
                  border: `1px solid ${st.border}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedCheck(isExpanded ? null : check.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{CHECK_ICONS[check.name] || '📋'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{check.name}</div>
                    <div style={{
                      fontSize: 12,
                      color: check.score !== undefined
                        ? (check.score >= 80 ? '#22c55e' : check.score >= 50 ? '#eab308' : '#ef4444')
                        : '#94a3b8',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {check.score !== undefined ? `Score: ${check.score}` : 'N/A'}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: st.bg,
                    color: st.color,
                    border: `1px solid ${st.border}`,
                    whiteSpace: 'nowrap',
                  }}>
                    {st.label}
                  </div>
                  <span style={{
                    color: '#64748b',
                    fontSize: 18,
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▼
                  </span>
                </button>
                {isExpanded && (
                  <div style={{
                    padding: '0 20px 16px',
                    borderTop: '1px solid rgba(148,163,184,0.1)',
                    paddingTop: 14,
                    marginLeft: 56,
                  }}>
                    <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {check.details}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* PageSpeed Details */}
        {result.pagespeed && (() => {
          const hasMobile = result.pagespeed!.mobile && !result.pagespeed!.mobile.error
          const hasDesktop = result.pagespeed!.desktop && !result.pagespeed!.desktop.error
          return hasMobile || hasDesktop
        })() && (
          <div style={{
            marginTop: 20,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(11,18,32,0.6))',
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: 16,
            padding: '20px',
          }}>
            <style>{`.pagespeed-details-title { color: #ffffff !important; }`}</style>
            <h3 className="pagespeed-details-title" style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-jakarta, system-ui)' }}>
              🚀 PageSpeed Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['mobile', 'desktop'].map((strategy) => {
                const data = result.pagespeed![strategy as 'mobile' | 'desktop']
                if (!data || data.error) return null
                const isMobile = strategy === 'mobile'
                return (
                  <div key={strategy} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{isMobile ? '📱' : '💻'}</span>
                      <span>{isMobile ? 'Mobile Speed' : 'Desktop Speed'}</span>
                    </div>
                    {data.performance != null && <ScoreBar label="Performance" value={data.performance} />}
                    {data.seo != null && <ScoreBar label="SEO" value={data.seo} />}
                    {data.accessibility != null && <ScoreBar label="Accessibility" value={data.accessibility} />}
                    {data.bestPractices != null && <ScoreBar label="Best Practices" value={data.bestPractices} />}
                    {data.lcp && <Metric label="LCP" value={data.lcp} />}
                    {data.cls && <Metric label="CLS" value={data.cls} />}
                    {data.tbt && <Metric label="TBT" value={data.tbt} />}
                    {data.fullyLoaded && <Metric label="Fully Loaded" value={data.fullyLoaded} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 12,
              padding: '12px 24px',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Back to Home
          </a>
          <a
            href="/seo-audit"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🔍 Audit another URL
          </a>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

/* ─── Sub-Components ─── */

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, color: '#94a3b8' }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: '#94a3b8' }}>
      <span>{label}</span>
      <span style={{ color: '#7dd3fc', fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  )
}
