'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'
import AdminSidebar from '@/components/admin/Sidebar'


/* ── Types ────────────────────────────────────────────── */

interface SecurityStats {
  totalAllTime: number
  totalToday: number
  blockedByIp: number
  blockedByEmail: number
  blockedByCountry: number
  honeypotCaught: number
  botDetected: number
  rateLimitHits: number
  autoBanned: number
  topIps: { _id: string; count: number; lastSeen: string; country: string; countryCode: string }[]
  topDomains: { _id: string; count: number }[]
  topCountries: { _id: { country: string; code: string }; count: number }[]
}

interface AttackItem {
  _id: string
  reason: string
  ip: string
  email?: string
  country?: string
  countryCode?: string
  userAgent?: string
  formType: string
  pageUrl?: string
  createdAt: string
}

interface SecuritySettings {
  autoBlock: boolean
  honeypotEnabled: boolean
  loggingEnabled: boolean
  bannedIps: string[]
  blockedEmailDomains: string[]
  blockedCountries: string[]
}

interface HourlyData { hour: string; count: number }
interface DailyData { day: string; count: number }

/* ── Constants ────────────────────────────────────────── */

const REASON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  banned_ip:             { bg: 'rgba(239,68,68,0.12)',  text: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
  blocked_email_domain:  { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  blocked_country:       { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  honeypot_filled:       { bg: 'rgba(34,197,94,0.12)',  text: '#86efac', border: 'rgba(34,197,94,0.3)' },
  rate_limit:            { bg: 'rgba(14,165,233,0.12)', text: '#7dd3fc', border: 'rgba(14,165,233,0.3)' },
  bot_user_agent:        { bg: 'rgba(244,63,94,0.12)',  text: '#fda4af', border: 'rgba(244,63,94,0.3)' },
}

const REASON_LABELS: Record<string, string> = {
  banned_ip: 'Banned IP',
  blocked_email_domain: 'Blocked Email',
  blocked_country: 'Blocked Country',
  honeypot_filled: 'Honeypot Trap',
  rate_limit: 'Rate Limit',
  bot_user_agent: 'Bot Detected',
}

const FORM_LABELS: Record<string, string> = {
  contact: 'Contact',
  checkout: 'Checkout',
  career: 'Career',
  chatbot: 'Chatbot',
  registration: 'Registration',
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', IN: '🇮🇳', CN: '🇨🇳', RU: '🇷🇺', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷',
  BR: '🇧🇷', JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', CA: '🇨🇦', NL: '🇳🇱', TR: '🇹🇷',
  VN: '🇻🇳', ID: '🇮🇩', TH: '🇹🇭', PH: '🇵🇭', MX: '🇲🇽', AR: '🇦🇷', NG: '🇳🇬',
  PK: '🇵🇰', BD: '🇧🇩', IR: '🇮🇷', EG: '🇪🇬', IL: '🇮🇱', UA: '🇺🇦', PL: '🇵🇱',
  SG: '🇸🇬', MY: '🇲🇾', HK: '🇭🇰', TW: '🇹🇼', IT: '🇮🇹', ES: '🇪🇸', SE: '🇸🇪',
}

/* ── Helpers ──────────────────────────────────────────── */

function fmtDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function fmtShort(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

/* ── Component ────────────────────────────────────────── */

export default function SecurityPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Stats
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [hourlyChart, setHourlyChart] = useState<HourlyData[]>([])
  const [dailyChart, setDailyChart] = useState<DailyData[]>([])

  // Attacks
  const [attacks, setAttacks] = useState<AttackItem[]>([])
  const [attacksTotal, setAttacksTotal] = useState(0)
  const [attacksPage, setAttacksPage] = useState(1)
  const [attacksPages, setAttacksPages] = useState(1)

  // Filters
  const [dateRange, setDateRange] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  // Settings
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [settingsBannedIps, setSettingsBannedIps] = useState('')
  const [settingsBlockedDomains, setSettingsBlockedDomains] = useState('')
  const [settingsBlockedCountries, setSettingsBlockedCountries] = useState('')

  // Confirmations
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [securityTrashCount, setSecurityTrashCount] = useState(0)

  useEffect(() => {
    fetch('/api/admin/trash/count?section=security_attacks')
      .then(r => r.json())
      .then(d => { if (d.count !== undefined) setSecurityTrashCount(d.count) })
      .catch(() => {})
  }, [])

  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  /* ── Data loading ────────────────────────────────────── */

  const loadStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({ range: dateRange })
      if (dateRange === 'custom') {
        if (customFrom) params.set('from', customFrom)
        if (customTo) params.set('to', customTo)
      }
      const { data, error } = await adminFetch<{
        stats: SecurityStats
        charts: { hourly: HourlyData[]; daily: DailyData[] }
      }>(`/api/admin/security?${params}`)
      if (error || !data) return
      setStats(data.stats)
      setHourlyChart(data.charts.hourly)
      setDailyChart(data.charts.daily)
      setLastRefresh(new Date())
    } catch {}
  }, [dateRange, customFrom, customTo])

  const loadAttacks = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ range: dateRange, page: String(page), limit: '50' })
      if (dateRange === 'custom') {
        if (customFrom) params.set('from', customFrom)
        if (customTo) params.set('to', customTo)
      }
      const { data, error } = await adminFetch<{
        items: AttackItem[]; total: number; pages: number
      }>(`/api/admin/security/attacks?${params}`)
      if (error || !data) return
      setAttacks(data.items)
      setAttacksTotal(data.total)
      setAttacksPages(data.pages)
      setAttacksPage(page)
    } catch {}
  }, [dateRange, customFrom, customTo])

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const { data } = await adminFetch<{ settings: SecuritySettings }>('/api/admin/security/settings')
      if (data?.settings) {
        setSettings(data.settings)
        setSettingsBannedIps(data.settings.bannedIps.join('\n'))
        setSettingsBlockedDomains(data.settings.blockedEmailDomains.join('\n'))
        setSettingsBlockedCountries(data.settings.blockedCountries.join('\n'))
      }
    } catch {} finally {
      setSettingsLoading(false)
    }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadStats(), loadAttacks(1)])
    setLoading(false)
  }, [loadStats, loadAttacks])

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      if (!d?.authenticated) { router.push('/admin/login'); return }
      if (d.role !== 'admin') { router.push('/admin/dashboard'); return }
      loadAll()
      loadSettings()
    }).catch(() => router.push('/admin/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload data when filter changes
  useEffect(() => {
    if (!loading) {
      loadStats()
      loadAttacks(1)
    }
  }, [dateRange, customFrom, customTo]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => { loadStats(); loadAttacks(1) }, 60_000)
    return () => clearInterval(id)
  }, [autoRefresh]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Actions ─────────────────────────────────────────── */

  async function handleBanIp(ip: string, action: 'ban' | 'unban') {
    try {
      await adminFetch('/api/admin/security/ban-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, action }),
      })
      loadSettings()
      loadStats()
    } catch {}
  }

  async function handleBlockDomain(domain: string, action: 'block' | 'unblock') {
    try {
      await adminFetch('/api/admin/security/block-email-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, action }),
      })
      loadSettings()
      loadStats()
    } catch {}
  }

  async function handleBlockCountry(code: string, action: 'block' | 'unblock') {
    try {
      await adminFetch('/api/admin/security/block-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: code, action }),
      })
      loadSettings()
      loadStats()
    } catch {}
  }

  async function handleSaveSettings() {
    setSettingsSaved(false)
    setSettingsError('')
    try {
      const { data, error } = await adminFetch('/api/admin/security/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoBlock: settings?.autoBlock ?? true,
          honeypotEnabled: settings?.honeypotEnabled ?? true,
          loggingEnabled: settings?.loggingEnabled ?? true,
          bannedIps: settingsBannedIps,
          blockedEmailDomains: settingsBlockedDomains,
          blockedCountries: settingsBlockedCountries,
        }),
      })
      if (error || !data) { setSettingsError(error || 'Failed to save'); return }
      setSettingsSaved(true)
      loadSettings()
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch (e: any) {
      setSettingsError(e?.message || 'Failed to save')
    }
  }

  async function handleClearLogs() {
    setClearing(true)
    try {
      await adminFetch('/api/admin/security/clear-logs', { method: 'DELETE' })
      setConfirmClear(false)
      loadAll()
    } finally { setClearing(false) }
  }

  function handleExport() {
    window.open('/api/admin/security/export', '_blank')
  }

  function copyIp(ip: string) {
    navigator.clipboard.writeText(ip).then(() => {
      setCopySuccess(ip)
      setTimeout(() => setCopySuccess(null), 2000)
    })
  }

  function toggleSetting(key: keyof SecuritySettings) {
    if (!settings) return
    setSettings({ ...settings, [key]: !settings[key] })
  }

  /* ── Render ──────────────────────────────────────────── */

  const maxCountryCount = stats?.topCountries?.[0]?.count || 1

  return (
    <div className="admin-layout">
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">☰</button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* ── TOP BAR ── */}
        <div className="admin-topbar">
          <div>
            <h1>🛡️ Security Dashboard</h1>
            <div className="sub">
              Anti-spam protection &amp; attack monitoring
              {lastRefresh && <span style={{ marginLeft: 8, color: '#475569' }}>· last refresh {fmtShort(lastRefresh.toISOString())}</span>}
            </div>
          </div>
          <div className="cell-actions">
            <button className="btn btn-ghost" onClick={handleExport}>⬇ Export CSV</button>
            <button className="btn btn-danger" onClick={() => setConfirmClear(true)}>🗑 Clear Logs</button>            <Link href="/admin/trash?section=security_attacks" className="btn btn-ghost" style={{ color: securityTrashCount > 0 ? '#fbbf24' : undefined }}>
              🗑 Trash{securityTrashCount > 0 ? ` (${securityTrashCount})` : ''}
            </Link>
            <button className="btn btn-ghost"
              onClick={() => { setAutoRefresh(!autoRefresh) }}
              title={autoRefresh ? 'Auto-refresh ON (60s)' : 'Auto-refresh OFF'}
            >
              {autoRefresh ? '🔄 Auto' : '⏸ Manual'}
            </button>
          </div>
        </div>

        {/* ── CONFIRM CLEAR MODAL ── */}
        {confirmClear && (
          <div className="modal-backdrop" onClick={() => !clearing && setConfirmClear(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>🗑 Clear All Attack Logs</h2>
              <div className="modal-sub">
                This will move all {attacksTotal} attack records to the Trash. They can be restored later from the Trash section.
              </div>
              <div className="row">
                <button className="btn btn-ghost" onClick={() => setConfirmClear(false)} disabled={clearing}>Cancel</button>
                <button className="btn btn-danger" onClick={handleClearLogs} disabled={clearing}>
                  {clearing ? <><span className="spinner" /> Clearing…</> : '🗑 Yes, Clear Everything'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <div className="toolbar">
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>📅 Filter:</span>
          {['today', 'yesterday', '7days', '30days', 'all', 'custom'].map(r => (
            <button
              key={r}
              className={`icon-btn${dateRange === r ? ' active' : ''}`}
              style={dateRange === r ? { background: 'rgba(14,165,233,0.15)', color: '#7dd3fc', borderColor: 'rgba(14,165,233,0.3)' } : {}}
              onClick={() => setDateRange(r)}
            >
              {r === 'all' ? 'All Time' : r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : r === 'custom' ? 'Custom' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          {dateRange === 'custom' && (
            <>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                style={{ background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0', padding: '6px 10px', borderRadius: 8, fontSize: 13 }} />
              <span style={{ color: '#64748b' }}>to</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                style={{ background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0', padding: '6px 10px', borderRadius: 8, fontSize: 13 }} />
            </>
          )}
        </div>

        {/* ── STAT CARDS ── */}
        {loading ? (
          <div className="dash-stats">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="dash-stat-card blue" style={{ opacity: 0.5 }}>
                <span className="dash-stat-icon">⏳</span>
                <div className="dash-stat-value loading">—</div>
                <div className="dash-stat-label">Loading…</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-stats">
            <div className="dash-stat-card rose">
              <span className="dash-stat-icon">🛡️</span>
              <div className="dash-stat-value">{stats?.totalAllTime ?? 0}</div>
              <div className="dash-stat-label">Total Blocked</div>
            </div>
            <div className="dash-stat-card amber">
              <span className="dash-stat-icon">📅</span>
              <div className="dash-stat-value">{stats?.totalToday ?? 0}</div>
              <div className="dash-stat-label">Blocked Today</div>
            </div>
            <div className="dash-stat-card blue">
              <span className="dash-stat-icon">🌐</span>
              <div className="dash-stat-value">{stats?.blockedByIp ?? 0}</div>
              <div className="dash-stat-label">By IP Address</div>
            </div>
            <div className="dash-stat-card purple">
              <span className="dash-stat-icon">📧</span>
              <div className="dash-stat-value">{stats?.blockedByEmail ?? 0}</div>
              <div className="dash-stat-label">By Email</div>
            </div>
            <div className="dash-stat-card cyan">
              <span className="dash-stat-icon">🌍</span>
              <div className="dash-stat-value">{stats?.blockedByCountry ?? 0}</div>
              <div className="dash-stat-label">By Country</div>
            </div>
            <div className="dash-stat-card green">
              <span className="dash-stat-icon">🪤</span>
              <div className="dash-stat-value">{stats?.honeypotCaught ?? 0}</div>
              <div className="dash-stat-label">Honeypot Trap</div>
            </div>
            <div className="dash-stat-card rose">
              <span className="dash-stat-icon">🤖</span>
              <div className="dash-stat-value">{stats?.botDetected ?? 0}</div>
              <div className="dash-stat-label">Bots Detected</div>
            </div>
            <div className="dash-stat-card green">
              <span className="dash-stat-icon">🔨</span>
              <div className="dash-stat-value">{stats?.autoBanned ?? 0}</div>
              <div className="dash-stat-label">Auto Banned</div>
            </div>
          </div>
        )}

        {/* ── CHARTS (pure CSS, no recharts needed) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Hourly chart */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 16 }}>
              📊 Attacks Per Hour (Today)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 160 }}>
              {hourlyChart.map((d, i) => {
                const maxVal = Math.max(...hourlyChart.map(h => h.count), 1)
                const h = Math.max(2, (d.count / maxVal) * 140)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {d.count > 0 && <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>{d.count}</div>}
                    <div title={`${d.hour}: ${d.count} attacks`} style={{
                      width: '100%', height: h, borderRadius: '3px 3px 0 0',
                      background: d.count > 0 ? 'linear-gradient(180deg, #ef4444, #dc2626)' : '#1e293b',
                      transition: 'height 0.3s', cursor: 'pointer',
                    }} />
                    {i % 4 === 0 && <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>{d.hour}</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily chart */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 16 }}>
              📈 Attacks Per Day (This Month)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 160 }}>
              {dailyChart.map((d, i) => {
                const maxVal = Math.max(...dailyChart.map(h => h.count), 1)
                const h = Math.max(1, (d.count / maxVal) * 140)
                const dayNum = parseInt(d.day.split('-')[2], 10)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {d.count > 0 && <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 2 }}>{d.count}</div>}
                    <div title={`${d.day}: ${d.count} attacks`} style={{
                      width: '100%', height: h, borderRadius: '2px 2px 0 0',
                      background: d.count > 0 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : '#1e293b',
                      transition: 'height 0.3s', cursor: 'pointer',
                    }} />
                    {dayNum % 5 === 1 && <div style={{ fontSize: 8, color: '#475569', marginTop: 4 }}>{dayNum}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── ATTACK LIST TABLE ── */}
        <div className="dash-section">
          <div className="dash-section-title">🚨 Attack Log</div>
          <div className="table-wrap">
            <table className="queries">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date &amp; Time</th>
                  <th>Reason</th>
                  <th>IP Address</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Form</th>
                  <th>Page</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="empty"><span className="spinner" /> Loading…</td></tr>
                ) : attacks.length === 0 ? (
                  <tr><td colSpan={9} className="empty"><div className="icon">🛡️</div><div>No attacks recorded yet. Your site is clean!</div></td></tr>
                ) : (
                  attacks.map((a, i) => {
                    const rc = REASON_COLORS[a.reason] || REASON_COLORS.banned_ip
                    const isBanned = settings?.bannedIps.includes(a.ip)
                    return (
                      <tr key={a._id}>
                        <td style={{ color: '#64748b' }}>{(attacksPage - 1) * 50 + i + 1}</td>
                        <td title={fmtDate(a.createdAt)} style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {fmtShort(a.createdAt)}
                          <div style={{ fontSize: 11, color: '#475569' }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
                            borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.04em', background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`,
                          }}>
                            {REASON_LABELS[a.reason] || a.reason}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ fontSize: 12, color: '#7dd3fc', fontFamily: 'monospace' }}>{a.ip}</code>
                            <button
                              className="icon-btn"
                              style={{ padding: '2px 6px', fontSize: 10 }}
                              onClick={() => copyIp(a.ip)}
                              title="Copy IP"
                            >
                              {copySuccess === a.ip ? '✓' : '📋'}
                            </button>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: '#cbd5e1' }}>{a.email || '—'}</td>
                        <td>
                          <span style={{ fontSize: 12 }}>
                            {COUNTRY_FLAGS[a.countryCode || ''] || ''} {a.country || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="badge">{FORM_LABELS[a.formType] || a.formType}</span>
                        </td>
                        <td style={{ fontSize: 11, color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.pageUrl || ''}>
                          {a.pageUrl || '—'}
                        </td>
                        <td>
                          <button
                            className={`icon-btn ${isBanned ? 'success' : 'danger'}`}
                            onClick={() => handleBanIp(a.ip, isBanned ? 'unban' : 'ban')}
                          >
                            {isBanned ? '✓ Unban' : '🚫 Ban IP'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            {attacksPages > 1 && (
              <div className="pager">
                <div>Page {attacksPage} of {attacksPages} · {attacksTotal} total attacks</div>
                <div className="btns">
                  <button className="icon-btn" disabled={attacksPage <= 1} onClick={() => loadAttacks(1)}>«</button>
                  <button className="icon-btn" disabled={attacksPage <= 1} onClick={() => loadAttacks(attacksPage - 1)}>‹ Prev</button>
                  <button className="icon-btn" disabled={attacksPage >= attacksPages} onClick={() => loadAttacks(attacksPage + 1)}>Next ›</button>
                  <button className="icon-btn" disabled={attacksPage >= attacksPages} onClick={() => loadAttacks(attacksPages)}>»</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TOP BAD IPs ── */}
        {stats?.topIps && stats.topIps.length > 0 && (
          <div className="dash-section">
            <div className="dash-section-title">🚫 Top Bad IPs</div>
            <div className="table-wrap">
              <table className="queries">
                <thead>
                  <tr><th>IP Address</th><th>Attacks</th><th>Country</th><th>Last Seen</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {stats.topIps.map(ip => {
                    const isBanned = settings?.bannedIps.includes(ip._id)
                    return (
                      <tr key={ip._id}>
                        <td><code style={{ fontSize: 12, color: '#7dd3fc', fontFamily: 'monospace' }}>{ip._id}</code></td>
                        <td><span style={{ fontWeight: 700, color: '#f87171' }}>{ip.count}</span></td>
                        <td>{COUNTRY_FLAGS[ip.countryCode || ''] || ''} {ip.country || '—'}</td>
                        <td style={{ color: '#94a3b8' }}>{fmtDate(ip.lastSeen)}</td>
                        <td>
                          <button
                            className={`icon-btn ${isBanned ? 'success' : 'danger'}`}
                            onClick={() => handleBanIp(ip._id, isBanned ? 'unban' : 'ban')}
                          >
                            {isBanned ? '✓ Unban' : '🚫 Ban'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TOP SPAM EMAIL DOMAINS ── */}
        {stats?.topDomains && stats.topDomains.length > 0 && (
          <div className="dash-section">
            <div className="dash-section-title">📧 Top Spam Email Domains</div>
            <div className="table-wrap">
              <table className="queries">
                <thead>
                  <tr><th>Domain</th><th>Count</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {stats.topDomains.map(d => {
                    const isBlocked = settings?.blockedEmailDomains.includes(d._id)
                    return (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 600 }}>{d._id}</td>
                        <td><span style={{ fontWeight: 700, color: '#fbbf24' }}>{d.count}</span></td>
                        <td>
                          <button
                            className={`icon-btn ${isBlocked ? 'success' : 'danger'}`}
                            onClick={() => handleBlockDomain(d._id, isBlocked ? 'unblock' : 'block')}
                          >
                            {isBlocked ? '✓ Unblock' : '🚫 Block'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── COUNTRIES TABLE ── */}
        {stats?.topCountries && stats.topCountries.length > 0 && (
          <div className="dash-section">
            <div className="dash-section-title">🌍 Top Attacking Countries</div>
            <div className="table-wrap">
              <table className="queries">
                <thead>
                  <tr><th>Country</th><th>Attacks</th><th>Percentage</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {stats.topCountries.map(c => {
                    const isBlocked = settings?.blockedCountries.includes(c._id.code)
                    const pct = Math.round((c.count / maxCountryCount) * 100)
                    return (
                      <tr key={c._id.code}>
                        <td>
                          <span style={{ fontSize: 14, marginRight: 6 }}>{COUNTRY_FLAGS[c._id.code] || '🏳️'}</span>
                          <span style={{ fontWeight: 600 }}>{c._id.country}</span>
                          <span style={{ color: '#64748b', marginLeft: 6, fontSize: 12 }}>({c._id.code})</span>
                        </td>
                        <td><span style={{ fontWeight: 700, color: '#c084fc' }}>{c.count}</span></td>
                        <td style={{ minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              flex: 1, height: 8, borderRadius: 999, background: '#1e293b', overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', width: `${pct}%`, borderRadius: 999,
                                background: isBlocked
                                  ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                  : 'linear-gradient(90deg, #a855f7, #c084fc)',
                                transition: 'width 0.3s',
                              }} />
                            </div>
                            <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 36 }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className={`icon-btn ${isBlocked ? 'success' : 'danger'}`}
                            onClick={() => handleBlockCountry(c._id.code, isBlocked ? 'unblock' : 'block')}
                          >
                            {isBlocked ? '✓ Unblock' : '🚫 Block'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS SECTION ── */}
        <div className="dash-section" style={{ marginTop: 40 }}>
          <div className="dash-section-title">⚙ Security Settings</div>

          {settingsLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}><span className="spinner" /> Loading settings…</div>
          ) : (
            <div style={{
              background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24,
            }}>
              {settingsSaved && (
                <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ Settings saved successfully!</div>
              )}
              {settingsError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>❌ {settingsError}</div>
              )}

              {/* Toggle settings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Auto Block */}
                <div style={{
                  background: '#0b1220', border: '1px solid #1e293b', borderRadius: 12, padding: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🤖 Auto Block New Spam Domains</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      When ON: automatically block email domains that send spam. Never blocks Gmail, Yahoo, etc.
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('autoBlock')}
                    style={{
                      width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: settings?.autoBlock ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#334155',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3,
                      left: settings?.autoBlock ? 27 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* Honeypot */}
                <div style={{
                  background: '#0b1220', border: '1px solid #1e293b', borderRadius: 12, padding: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🪤 Honeypot Trap</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Adds invisible fields to forms. Bots fill them, humans never see them.
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('honeypotEnabled')}
                    style={{
                      width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: settings?.honeypotEnabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#334155',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3,
                      left: settings?.honeypotEnabled ? 27 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* Logging */}
                <div style={{
                  background: '#0b1220', border: '1px solid #1e293b', borderRadius: 12, padding: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📝 Attack Logging</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      When ON: save every blocked attack with full details. When OFF: only count numbers.
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('loggingEnabled')}
                    style={{
                      width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: settings?.loggingEnabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#334155',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3,
                      left: settings?.loggingEnabled ? 27 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              </div>

              {/* Text area settings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Blocked IPs */}
                <div className="field">
                  <label>🚫 Blocked IP Addresses <span style={{ color: '#64748b', fontWeight: 400 }}>(one per line)</span></label>
                  <textarea
                    value={settingsBannedIps}
                    onChange={e => setSettingsBannedIps(e.target.value)}
                    placeholder="192.168.1.1&#10;10.0.0.1"
                    style={{
                      background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
                      padding: 12, borderRadius: 10, fontSize: 13, fontFamily: 'monospace',
                      minHeight: 140, resize: 'vertical', width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {settingsBannedIps.split('\n').filter(Boolean).length} IPs configured
                  </div>
                </div>

                {/* Blocked Email Domains */}
                <div className="field">
                  <label>📧 Blocked Email Domains <span style={{ color: '#64748b', fontWeight: 400 }}>(one per line)</span></label>
                  <textarea
                    value={settingsBlockedDomains}
                    onChange={e => setSettingsBlockedDomains(e.target.value)}
                    placeholder=".ru&#10;spamdomain.com&#10;ventura17.ru"
                    style={{
                      background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
                      padding: 12, borderRadius: 10, fontSize: 13, fontFamily: 'monospace',
                      minHeight: 140, resize: 'vertical', width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {settingsBlockedDomains.split('\n').filter(Boolean).length} domains configured · Safe: Gmail, Yahoo, Hotmail, Outlook, iCloud, ProtonMail, Rediffmail
                  </div>
                </div>

                {/* Blocked Countries */}
                <div className="field">
                  <label>🌍 Blocked Countries <span style={{ color: '#64748b', fontWeight: 400 }}>(2-letter codes, one per line)</span></label>
                  <textarea
                    value={settingsBlockedCountries}
                    onChange={e => setSettingsBlockedCountries(e.target.value)}
                    placeholder="RU&#10;CN&#10;TR"
                    style={{
                      background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
                      padding: 12, borderRadius: 10, fontSize: 13, fontFamily: 'monospace',
                      minHeight: 140, resize: 'vertical', width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {settingsBlockedCountries.split('\n').filter(Boolean).length} countries configured
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveSettings}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    padding: '12px 32px',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  💾 Save Settings
                </button>
              </div>

              {/* Rate limits info */}
              <div style={{
                marginTop: 24, padding: 16, background: '#0b1220', border: '1px solid #1e293b',
                borderRadius: 12, fontSize: 13,
              }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>📊 Rate Limits Per Form (built-in)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, color: '#94a3b8' }}>
                  <div>📧 Contact: <strong style={{ color: '#7dd3fc' }}>5</strong> / 10 min</div>
                  <div>💳 Checkout: <strong style={{ color: '#7dd3fc' }}>10</strong> / min</div>
                  <div>💼 Career: <strong style={{ color: '#7dd3fc' }}>3</strong> / hour</div>
                  <div>🤖 Chatbot: <strong style={{ color: '#7dd3fc' }}>20</strong> / min</div>
                  <div>📝 Registration: <strong style={{ color: '#7dd3fc' }}>3</strong> / 10 min</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
