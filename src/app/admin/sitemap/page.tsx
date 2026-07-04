'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { adminFetch } from '@/lib/admin-fetch'
import AdminSidebar from '@/components/admin/Sidebar'

/* ── Types ────────────────────────────────────────────── */

interface SitemapSettings {
  includeBlogPosts: boolean
  includePages: boolean
  includeCategories: boolean
  includeTags: boolean
  includeImages: boolean
  autoPing: boolean
  includeProducts: boolean
  maxUrls: number
  excludeIds: string
  lastGenerated: string | null
  lastPingGoogle: string | null
  lastPingBing: string | null
  totalUrls: number
  fileSize: number
}

interface GenerateStats {
  totalUrls: number
  files: number
  fileSize: number
  googlePing: 'success' | 'failed' | 'skipped'
  bingPing: 'success' | 'failed' | 'skipped'
  lastGenerated: string | null
}

/* ── Helpers ──────────────────────────────────────────── */

function fmtDate(iso: string | null) {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
}

function fmtBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/* ── Component ────────────────────────────────────────── */

export default function SitemapPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Settings
  const [settings, setSettings] = useState<SitemapSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Generate
  const [generating, setGenerating] = useState(false)
  const [lastResult, setLastResult] = useState<GenerateStats | null>(null)
  const [generateError, setGenerateError] = useState('')

  /* ── Data loading ────────────────────────────────────── */

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await adminFetch<{ settings: SitemapSettings }>('/api/admin/sitemap/settings')
      if (error || !data?.settings) return
      setSettings(data.settings)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        loadSettings().then(() => setLoading(false))
      })
      .catch(() => router.push('/admin/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ─────────────────────────────────────────── */

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    try {
      const { error } = await adminFetch('/api/admin/sitemap/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError('')
    setLastResult(null)
    try {
      const { data, error } = await adminFetch<{ stats: GenerateStats }>('/api/admin/sitemap/generate', {
        method: 'POST',
      })
      if (error || !data) {
        setGenerateError(error || 'Generation failed')
        return
      }
      setLastResult(data.stats)
      // Reload settings to get updated lastGenerated
      await loadSettings()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      setGenerateError(msg)
    } finally {
      setGenerating(false)
    }
  }

  function toggle(key: keyof SitemapSettings) {
    if (!settings) return
    setSettings({ ...settings, [key]: !settings[key] })
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="admin-layout">
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* ── TOP BAR ── */}
        <div className="admin-topbar">
          <div>
            <h1>🗺️ Sitemap Generator</h1>
            <div className="sub">Manage your XML sitemap for Google &amp; Bing</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <span className="spinner" /> Loading…
          </div>
        ) : (
          <>
            {/* ── INFO BAR ── */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))',
                border: '1px solid rgba(14,165,233,0.2)',
                borderRadius: 14,
                padding: 20,
                marginBottom: 24,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Your Sitemap URL
                </div>
                <a
                  href="https://www.digisharkscommunications.com/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7dd3fc', fontSize: 15, fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none' }}
                >
                  https://www.digisharkscommunications.com/sitemap.xml ↗
                </a>
              </div>
              <div style={{ flex: '0 0 auto', fontSize: 13, color: '#94a3b8' }}>
                Last generated:{' '}
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {fmtDate(settings?.lastGenerated ?? null)}
                </span>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  padding: '10px 28px',
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: generating ? 0.7 : 1,
                }}
              >
                {generating ? (
                  <>
                    <span className="spinner" /> Generating…
                  </>
                ) : (
                  '🔄 Regenerate Now'
                )}
              </button>
            </div>

            {/* ── Generate result ── */}
            {lastResult && (
              <div
                className="alert alert-success"
                style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
              >
                ✅ Sitemap generated!{' '}
                <span style={{ fontWeight: 700 }}>{lastResult.totalUrls}</span> URLs across{' '}
                <span style={{ fontWeight: 700 }}>{lastResult.files}</span> file(s) (
                {fmtBytes(lastResult.fileSize)})
                <span style={{ marginLeft: 8, fontSize: 12 }}>
                  Google ping: <strong>{lastResult.googlePing}</strong> · Bing ping:{' '}
                  <strong>{lastResult.bingPing}</strong>
                </span>
              </div>
            )}
            {generateError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                ❌ {generateError}
              </div>
            )}
            {saved && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✅ Settings saved!
              </div>
            )}

            {/* ── SECTION 1: INCLUDE IN SITEMAP ── */}
            <div className="dash-section">
              <div className="dash-section-title">✅ Include in Sitemap</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                  {/* Blog Posts */}
                  <ToggleRow
                    label="📝 Blog Posts"
                    description="All published blog posts from MongoDB"
                    checked={settings?.includeBlogPosts ?? true}
                    onChange={() => toggle('includeBlogPosts')}
                  />

                  {/* Pages */}
                  <ToggleRow
                    label="📄 Static Pages"
                    description="16 static pages (home, about, contact, etc.)"
                    checked={settings?.includePages ?? true}
                    onChange={() => toggle('includePages')}
                  />

                  {/* Categories */}
                  <ToggleRow
                    label="📂 Categories"
                    description="All active categories from MongoDB"
                    checked={settings?.includeCategories ?? true}
                    onChange={() => toggle('includeCategories')}
                  />

                  {/* Tags */}
                  <ToggleRow
                    label="🏷️ Tags"
                    description="All active tags from MongoDB"
                    checked={settings?.includeTags ?? false}
                    onChange={() => toggle('includeTags')}
                  />

                  {/* Featured Images */}
                  <ToggleRow
                    label="🖼️ Featured Images"
                    description="Add image tags inside each URL entry"
                    checked={settings?.includeImages ?? true}
                    onChange={() => toggle('includeImages')}
                  />

                  {/* Auto-ping */}
                  <ToggleRow
                    label="📡 Auto-ping Google &amp; Bing"
                    description="Notify search engines on update"
                    checked={settings?.autoPing ?? true}
                    onChange={() => toggle('autoPing')}
                  />

                  {/* Products */}
                  <ToggleRow
                    label="🛍️ Products"
                    description="All active products from MongoDB"
                    checked={settings?.includeProducts ?? true}
                    onChange={() => toggle('includeProducts')}
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 2: ADVANCED SETTINGS ── */}
            <div className="dash-section">
              <div className="dash-section-title">⚙ Advanced Settings</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {/* Max URLs */}
                  <div className="field">
                    <label>Max URLs per sitemap file</label>
                    <input
                      type="number"
                      value={settings?.maxUrls ?? 1000}
                      min={1}
                      max={5000}
                      onChange={(e) =>
                        setSettings((s) =>
                          s ? { ...s, maxUrls: Math.min(5000, Math.max(1, parseInt(e.target.value) || 1000)) } : s,
                        )
                      }
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        color: '#e2e8f0',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 14,
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      If URLs exceed this limit, split into multiple files with sitemap index
                    </div>
                  </div>

                  {/* Exclude IDs */}
                  <div className="field">
                    <label>Exclude Post/Page IDs</label>
                    <input
                      type="text"
                      value={settings?.excludeIds ?? ''}
                      placeholder="e.g. 12, 45, 99"
                      onChange={(e) => setSettings((s) => (s ? { ...s, excludeIds: e.target.value } : s))}
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        color: '#e2e8f0',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 14,
                        width: '100%',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Comma-separated IDs — these will be skipped when generating
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      padding: '10px 28px',
                      fontSize: 14,
                      fontWeight: 700,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner" /> Saving…
                      </>
                    ) : (
                      '💾 Save Settings'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: SITEMAP STATUS ── */}
            <div className="dash-section">
              <div className="dash-section-title">📊 Sitemap Status</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <StatusCard
                    icon="🔢"
                    label="Total URLs"
                    value={String(settings?.totalUrls ?? 0)}
                  />
                  <StatusCard
                    icon="📅"
                    label="Last Generated"
                    value={fmtDate(settings?.lastGenerated ?? null)}
                  />
                  <StatusCard
                    icon="📦"
                    label="File Size"
                    value={fmtBytes(settings?.fileSize ?? 0)}
                  />
                  <StatusCard
                    icon="📄"
                    label="Sitemap Files"
                    value={settings?.totalUrls && settings?.maxUrls
                      ? String(Math.ceil(settings.totalUrls / settings.maxUrls))
                      : '1'}
                  />
                  <StatusCard
                    icon="🔍"
                    label="Last Google Ping"
                    value={fmtDate(settings?.lastPingGoogle ?? null)}
                  />
                  <StatusCard
                    icon="🔍"
                    label="Last Bing Ping"
                    value={fmtDate(settings?.lastPingBing ?? null)}
                  />
                </div>

                <div style={{ marginTop: 20 }}>
                  <a
                    href="https://www.digisharkscommunications.com/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{ fontSize: 13 }}
                  >
                    👁️ View Sitemap ↗
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────── */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{description}</div>
      </div>
      <button
        onClick={onChange}
        style={{
          width: 52,
          height: 28,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: checked ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#334155',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: checked ? 27 : 3,
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  )
}

function StatusCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  )
}
