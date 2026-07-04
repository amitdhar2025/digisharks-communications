'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { adminFetch } from '@/lib/admin-fetch'
import AdminSidebar from '@/components/admin/Sidebar'

/* ── Types ────────────────────────────────────────────── */

interface RobotsRule {
  bot: string
  type: 'allow' | 'disallow'
  path: string
}

interface RobotsSettings {
  rules: RobotsRule[]
  sitemapUrl: string
  crawlDelay: number | null
  blockAIBots: boolean
  rawContent: string
  lastSaved: string | null
  fileSize: number
}

/* ── Constants ────────────────────────────────────────── */

const BOT_OPTIONS = [
  { value: '*', label: 'All Bots (*)' },
  { value: 'Googlebot', label: 'Googlebot' },
  { value: 'Bingbot', label: 'Bingbot' },
  { value: 'Yandexbot', label: 'Yandexbot' },
  { value: 'Baiduspider', label: 'Baiduspider' },
  { value: 'GPTBot', label: 'GPTBot' },
  { value: 'ChatGPT-User', label: 'ChatGPT-User' },
  { value: 'CCBot', label: 'CCBot' },
  { value: 'anthropic-ai', label: 'anthropic-ai' },
  { value: 'Google-Extended', label: 'Google-Extended' },
  { value: '__custom__', label: 'Custom…' },
]

const PRESETS = {
  allowAll: {
    label: '✅ Allow All',
    rules: [{ bot: '*', type: 'allow' as const, path: '/' }],
    sitemapUrl: 'https://www.digisharkscommunications.com/sitemap.xml',
    blockAIBots: false,
  },
  blockAll: {
    label: '🚫 Block All',
    rules: [{ bot: '*', type: 'disallow' as const, path: '/' }],
    sitemapUrl: '',
    blockAIBots: false,
  },
  blockAdmin: {
    label: '🔒 Block Admin Only',
    rules: [
      { bot: '*', type: 'disallow' as const, path: '/admin/' },
      { bot: '*', type: 'disallow' as const, path: '/api/' },
      { bot: '*', type: 'allow' as const, path: '/' },
    ],
    sitemapUrl: 'https://www.digisharkscommunications.com/sitemap.xml',
    blockAIBots: false,
  },
  seoOptimized: {
    label: '⭐ SEO Optimized (Recommended)',
    rules: [
      { bot: '*', type: 'allow' as const, path: '/' },
      { bot: '*', type: 'disallow' as const, path: '/admin/' },
      { bot: '*', type: 'disallow' as const, path: '/api/' },
      { bot: '*', type: 'disallow' as const, path: '/checkout/' },
      { bot: '*', type: 'disallow' as const, path: '/cart/' },
      { bot: '*', type: 'disallow' as const, path: '/order-success/' },
      { bot: '*', type: 'disallow' as const, path: '/_next/' },
      { bot: '*', type: 'disallow' as const, path: '/static/' },
    ],
    sitemapUrl: 'https://www.digisharkscommunications.com/sitemap.xml',
    blockAIBots: false,
  },
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

function generatePreview(
  rules: RobotsRule[],
  sitemapUrl: string,
  crawlDelay: number | null,
  blockAIBots: boolean,
): string {
  const lines: string[] = []
  const grouped: Record<string, RobotsRule[]> = {}

  for (const rule of rules) {
    if (!grouped[rule.bot]) grouped[rule.bot] = []
    grouped[rule.bot].push(rule)
  }

  if (blockAIBots) {
    const aiBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Google-Extended', 'Amazonbot']
    for (const bot of aiBots) {
      if (!grouped[bot]) grouped[bot] = []
      grouped[bot].push({ bot, type: 'disallow', path: '/' })
    }
  }

  const entries = Object.entries(grouped)
  for (let i = 0; i < entries.length; i++) {
    const [bot, botRules] = entries[i]
    if (i > 0) lines.push('')
    lines.push(`User-agent: ${bot}`)
    for (const r of botRules) {
      lines.push(`${r.type === 'allow' ? 'Allow' : 'Disallow'}: ${r.path}`)
    }
    if (bot === '*' && crawlDelay && crawlDelay > 0) {
      lines.push(`Crawl-delay: ${crawlDelay}`)
    }
  }

  if (sitemapUrl) {
    if (entries.length > 0) lines.push('')
    lines.push(`Sitemap: ${sitemapUrl}`)
  }

  return lines.join('\n') + '\n'
}

function botDisplayName(bot: string): string {
  if (bot === '*') return 'All Bots (*)'
  return bot
}

/* ── Component ────────────────────────────────────────── */

export default function RobotsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Settings
  const [rules, setRules] = useState<RobotsRule[]>([])
  const [sitemapUrl, setSitemapUrl] = useState('https://www.digisharkscommunications.com/sitemap.xml')
  const [crawlDelay, setCrawlDelay] = useState<number | null>(null)
  const [blockAIBots, setBlockAIBots] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState(0)

  // Rule builder form
  const [selectedBot, setSelectedBot] = useState('*')
  const [customBot, setCustomBot] = useState('')
  const [selectedType, setSelectedType] = useState<'allow' | 'disallow'>('disallow')
  const [rulePath, setRulePath] = useState('')

  // Save state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copied, setCopied] = useState(false)

  /* ── Data loading ────────────────────────────────────── */

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await adminFetch<{
        settings: RobotsSettings
        previewContent: string
      }>('/api/admin/robots')
      if (error || !data?.settings) return
      const s = data.settings
      setRules(s.rules || [])
      setSitemapUrl(s.sitemapUrl || 'https://www.digisharkscommunications.com/sitemap.xml')
      setCrawlDelay(s.crawlDelay)
      setBlockAIBots(s.blockAIBots)
      setLastSaved(s.lastSaved)
      setFileSize(s.fileSize)
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

  function applyPreset(key: keyof typeof PRESETS) {
    const preset = PRESETS[key]
    setRules([...preset.rules])
    setSitemapUrl(preset.sitemapUrl)
    setBlockAIBots(preset.blockAIBots)
  }

  function addRule() {
    const bot = selectedBot === '__custom__' ? customBot.trim() : selectedBot
    if (!bot || !rulePath.trim()) return
    setRules([...rules, { bot, type: selectedType, path: rulePath.trim() }])
    setRulePath('')
  }

  function removeRule(index: number) {
    setRules(rules.filter((_, i) => i !== index))
  }

  function handleCopy() {
    const preview = generatePreview(rules, sitemapUrl, crawlDelay, blockAIBots)
    navigator.clipboard.writeText(preview).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const { data, error } = await adminFetch<{
        settings: RobotsSettings
        previewContent: string
      }>('/api/admin/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules,
          sitemapUrl,
          crawlDelay,
          blockAIBots,
        }),
      })
      if (error || !data) {
        setSaveError(error || 'Save failed')
        return
      }
      setLastSaved(data.settings.lastSaved)
      setFileSize(data.settings.fileSize)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    applyPreset('seoOptimized')
  }

  /* ── Computed ────────────────────────────────────────── */

  const previewContent = generatePreview(rules, sitemapUrl, crawlDelay, blockAIBots)

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
            <h1>🤖 Robots.txt Manager</h1>
            <div className="sub">Control how search engines crawl your website</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <span className="spinner" /> Loading…
          </div>
        ) : (
          <>
            {saved && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✅ Robots.txt saved successfully!
              </div>
            )}
            {saveError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                ❌ {saveError}
              </div>
            )}

            {/* ── SECTION 1: QUICK PRESETS ── */}
            <div className="dash-section">
              <div className="dash-section-title">⚡ Quick Presets</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {(Object.entries(PRESETS) as [keyof typeof PRESETS, (typeof PRESETS)[keyof typeof PRESETS]][]).map(
                    ([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => applyPreset(key)}
                        style={{
                          background: key === 'seoOptimized'
                            ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,180,127,0.15))'
                            : '#0b1220',
                          border: key === 'seoOptimized'
                            ? '1px solid rgba(34,197,94,0.4)'
                            : '1px solid #1e293b',
                          color: '#e2e8f0',
                          padding: '10px 20px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {preset.label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* ── SECTION 2: VISUAL RULE BUILDER ── */}
            <div className="dash-section">
              <div className="dash-section-title">🔧 Visual Rule Builder</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                {/* Add rule form */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    alignItems: 'flex-end',
                    marginBottom: 20,
                  }}
                >
                  {/* Bot selector */}
                  <div style={{ flex: '1 1 160px', minWidth: 160 }}>
                    <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Bot
                    </label>
                    <select
                      value={selectedBot}
                      onChange={(e) => setSelectedBot(e.target.value)}
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        color: '#e2e8f0',
                        padding: '9px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {BOT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom bot input */}
                  {selectedBot === '__custom__' && (
                    <div style={{ flex: '1 1 160px', minWidth: 160 }}>
                      <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        Custom Bot Name
                      </label>
                      <input
                        type="text"
                        value={customBot}
                        placeholder="e.g. MyBot"
                        onChange={(e) => setCustomBot(e.target.value)}
                        style={{
                          background: '#0b1220',
                          border: '1px solid #1e293b',
                          color: '#e2e8f0',
                          padding: '9px 12px',
                          borderRadius: 10,
                          fontSize: 13,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  {/* Type selector */}
                  <div style={{ flex: '0 0 130px' }}>
                    <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Rule Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as 'allow' | 'disallow')}
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        color: '#e2e8f0',
                        padding: '9px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="allow">Allow</option>
                      <option value="disallow">Disallow</option>
                    </select>
                  </div>

                  {/* Path input */}
                  <div style={{ flex: '1 1 200px', minWidth: 200 }}>
                    <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Path
                    </label>
                    <input
                      type="text"
                      value={rulePath}
                      placeholder="e.g. /admin/"
                      onChange={(e) => setRulePath(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRule()}
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        color: '#e2e8f0',
                        padding: '9px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontFamily: 'monospace',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Add button */}
                  <button
                    onClick={addRule}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      border: 'none',
                      color: '#fff',
                      padding: '9px 20px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ➕ Add Rule
                  </button>
                </div>

                {/* Rules table */}
                {rules.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    No rules added yet. Use a preset or add rules manually.
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table className="queries">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Bot</th>
                          <th>Type</th>
                          <th>Path</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.map((rule, i) => (
                          <tr key={i}>
                            <td style={{ color: '#64748b' }}>{i + 1}</td>
                            <td style={{ fontWeight: 600, fontSize: 13 }}>{botDisplayName(rule.bot)}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '3px 10px',
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  background:
                                    rule.type === 'allow'
                                      ? 'rgba(34,197,94,0.12)'
                                      : 'rgba(239,68,68,0.12)',
                                  color: rule.type === 'allow' ? '#86efac' : '#fca5a5',
                                  border: `1px solid ${rule.type === 'allow' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                }}
                              >
                                {rule.type}
                              </span>
                            </td>
                            <td>
                              <code style={{ fontSize: 12, color: '#7dd3fc', fontFamily: 'monospace' }}>
                                {rule.path}
                              </code>
                            </td>
                            <td>
                              <button
                                className="icon-btn danger"
                                onClick={() => removeRule(i)}
                                title="Remove rule"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION 3 & 4 & 5: SETTINGS ── */}
            <div className="dash-section">
              <div className="dash-section-title">⚙ Settings</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {/* Sitemap URL */}
                  <div className="field">
                    <label>🗺️ Sitemap URL</label>
                    <input
                      type="text"
                      value={sitemapUrl}
                      onChange={(e) => setSitemapUrl(e.target.value)}
                      style={{
                        background: '#0b1220',
                        border: '1px solid #1e293b',
                        color: '#e2e8f0',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontFamily: 'monospace',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Crawl Delay */}
                  <div className="field">
                    <label>⏱️ Crawl Delay (seconds)</label>
                    <input
                      type="number"
                      value={crawlDelay ?? ''}
                      min={0}
                      max={60}
                      placeholder="Empty = no delay"
                      onChange={(e) => {
                        const v = e.target.value
                        setCrawlDelay(v === '' ? null : Math.min(60, Math.max(0, parseInt(v) || 0)))
                      }}
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
                      Tell bots how many seconds to wait between requests
                    </div>
                  </div>
                </div>

                {/* Block AI Bots toggle */}
                <div
                  style={{
                    marginTop: 20,
                    background: '#0b1220',
                    border: '1px solid #1e293b',
                    borderRadius: 12,
                    padding: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🤖 Block AI Training Bots</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Block bots that scrape your content for AI training — GPTBot, ChatGPT-User, CCBot, anthropic-ai, Google-Extended, Amazonbot
                    </div>
                  </div>
                  <button
                    onClick={() => setBlockAIBots(!blockAIBots)}
                    style={{
                      width: 52,
                      height: 28,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      background: blockAIBots
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : '#334155',
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
                        left: blockAIBots ? 27 : 3,
                        transition: 'left 0.2s',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 6: LIVE PREVIEW ── */}
            <div className="dash-section">
              <div className="dash-section-title">👁️ robots.txt Preview</div>
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '1px solid #1e293b',
                    background: '#0b1220',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>LIVE PREVIEW</span>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: 'transparent',
                      border: '1px solid #334155',
                      color: copied ? '#22c55e' : '#94a3b8',
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre
                  style={{
                    padding: 20,
                    margin: 0,
                    fontSize: 13,
                    fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                    minHeight: 120,
                  }}
                >
                  {previewContent || '(no rules yet)'}
                </pre>
              </div>
            </div>

            {/* ── SECTION 7: FILE STATUS BAR ── */}
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 14,
                padding: 16,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Last saved:{' '}
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmtDate(lastSaved)}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                File size:{' '}
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{fmtBytes(fileSize)}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Rules:{' '}
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {rules.length + (blockAIBots ? 6 : 0)}
                </span>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: '#7dd3fc',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                👁️ View Live File ↗
              </a>
            </div>

            {/* ── BOTTOM BUTTONS ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={handleReset}
                style={{
                  background: '#334155',
                  border: '1px solid #475569',
                  color: '#e2e8f0',
                  padding: '10px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔄 Reset to Default
              </button>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#334155',
                  border: '1px solid #475569',
                  color: '#e2e8f0',
                  padding: '10px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                📄 View Live File
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 32px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <span className="spinner" /> Saving…
                  </>
                ) : (
                  '💾 Save robots.txt'
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
