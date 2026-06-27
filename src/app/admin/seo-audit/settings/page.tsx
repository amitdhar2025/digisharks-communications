'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

/* ─── Types ─── */

interface CheckToggle {
  key: string
  label: string
  enabled: boolean
}

interface AuditConfig {
  googleApiKey: string
  googleApiKeyMasked: string
  checkToggles: CheckToggle[]
}

/* ─── Component ─── */

export default function SeoAuditSettingsPage() {
  const router = useRouter()
  const [config, setConfig] = useState<AuditConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [googleApiKey, setGoogleApiKey] = useState('')

  useEffect(() => {
    fetch('/api/admin/seo-audit/config')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/admin/login?next=/admin/seo-audit/settings')
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load config')
        setConfig(data.config)
        setGoogleApiKey(data.config.googleApiKey || '')
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const body: Record<string, any> = {}
      if (googleApiKey) body.googleApiKey = googleApiKey
      if (config?.checkToggles) body.checkToggles = config.checkToggles

      const res = await fetch('/api/admin/seo-audit/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 401) {
        router.push('/admin/login?next=/admin/seo-audit/settings')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setConfig(data.config)
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleCheck(key: string) {
    if (!config) return
    setConfig({
      ...config,
      checkToggles: config.checkToggles.map((t) =>
        t.key === key ? { ...t, enabled: !t.enabled } : t
      ),
    })
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="brand"><span className="dot" /> Digisharks</div>
          <a className="nav-item" href="/admin/dashboard">📋 Queries</a>
          <a className="nav-item" href="/admin/store">🛒 Digital Products Sales</a>
          <a className="nav-item" href="/admin/blog">📝 Blog</a>
          <a className="nav-item" href="/admin/rss">📡 RSS Feeds</a>
          <div className="nav-section">🤖 Chatbot</div>
          <a className="nav-item" href="/admin/chatbot">📊 Dashboard</a>
          <a className="nav-item" href="/admin/chatbot/qna">💬 Q&A Manager</a>
          <a className="nav-item" href="/admin/chatbot/upload">📤 Upload</a>
          <a className="nav-item" href="/admin/chatbot/settings">⚙ Settings</a>
          <div className="nav-section">🔍 SEO</div>
          <a className="nav-item" href="/admin/seo-audit">📊 Audit Dashboard</a>
          <a className="nav-item active" href="/admin/seo-audit/settings">⚙ Audit Settings</a>
          <a className="nav-item" href="/" target="_blank" rel="noreferrer">🏠 Home</a>
          <div className="nav-section">Account</div>
          <button className="nav-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>🚪 Sign out</button>
          <div className="spacer" />
        </aside>
        <main className="admin-main" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
          <span className="spinner" />
        </main>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand"><span className="dot" /> Digisharks</div>
        <a className="nav-item" href="/admin/dashboard">📋 Queries</a>
        <a className="nav-item" href="/admin/store">🛒 Digital Products Sales</a>
        <a className="nav-item" href="/admin/blog">📝 Blog</a>
        <a className="nav-item" href="/admin/rss">📡 RSS Feeds</a>
        <div className="nav-section">🤖 Chatbot</div>
        <a className="nav-item" href="/admin/chatbot">📊 Dashboard</a>
        <a className="nav-item" href="/admin/chatbot/qna">💬 Q&A Manager</a>
        <a className="nav-item" href="/admin/chatbot/upload">📤 Upload</a>
        <a className="nav-item" href="/admin/chatbot/settings">⚙ Settings</a>
        <div className="nav-section">🔍 SEO</div>
        <a className="nav-item" href="/admin/seo-audit">📊 Audit Dashboard</a>
        <a className="nav-item active" href="/admin/seo-audit/settings">⚙ Audit Settings</a>
        <a className="nav-item" href="/seo-audit" target="_blank" rel="noreferrer">🌐 View Site</a>
        <div className="nav-section">Account</div>
        <button className="nav-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>🚪 Sign out</button>
        <div className="spacer" />
        <div style={{ padding: '10px 12px', fontSize: 11, color: '#64748b', borderTop: '1px solid #1e293b' }}>
          v1.0 · SEO Audit Tool
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>⚙ SEO Audit Settings</h1>
            <div className="sub">Configure API keys and enable/disable individual checks</div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSave}>
          {/* API Keys Section */}
          <div style={{
            background: 'linear-gradient(180deg, #0f172a, #0b1220)',
            border: '1px solid #1e293b',
            borderRadius: 14,
            padding: '22px',
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#e2e8f0' }}>
              🔑 API Keys
            </h2>

            <div className="field">
              <label>Google API Key</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="password"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  placeholder={config?.googleApiKeyMasked || 'Enter your Google API key'}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Used for: PageSpeed Insights · Safe Browsing
                {config?.googleApiKeyMasked && (
                  <span style={{ marginLeft: 8, color: '#4ade80' }}>✓ Key stored</span>
                )}
              </div>
            </div>
          </div>

          {/* Check Toggles */}
          <div style={{
            background: 'linear-gradient(180deg, #0f172a, #0b1220)',
            border: '1px solid #1e293b',
            borderRadius: 14,
            padding: '22px',
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#e2e8f0' }}>
              ✅ Enable/Disable Checks
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
              Toggle individual checks on or off. Disabled checks will be skipped during audits.
            </p>

            {config?.checkToggles.map((check) => (
              <div
                key={check.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid #1e293b',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleCheck(check.key)}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: 'none',
                    background: check.enabled
                      ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                      : '#334155',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 2,
                    left: check.enabled ? 20 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.15s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{check.label}</div>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: check.enabled ? '#4ade80' : '#64748b',
                }}>
                  {check.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>

          {/* Save */}
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ minWidth: 160 }}>
            {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Settings'}
          </button>
        </form>
      </main>
    </div>
  )
}
