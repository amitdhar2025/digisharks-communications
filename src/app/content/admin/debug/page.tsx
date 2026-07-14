/**
 * CMS Admin Debug Page
 *
 * Error log viewer and system diagnostics for the CMS admin panel.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Bug,
  RefreshCw,
  Trash2,
  FileText,
  Server,
  AlertTriangle,
  Terminal,
  Cpu,
  HardDrive,
  Clock,
  Activity,
  Zap,
  Database,
  History,
} from 'lucide-react'

interface DailyCount {
  date: string
  count: number
}

interface SystemInfo {
  nodeVersion: string
  platform: string
  arch: string
  memory: { total: number; free: number }
  uptime: number
  cpus: number
  env: string
  vercel: boolean
  pid: number
  cwd: string
}

interface LogStat {
  file: string
  size: string
  lines: number
  exists: boolean
}

export default function CMSDebugPage() {
  const [errorLogs, setErrorLogs] = useState<string[]>([])
  const [combinedLogs, setCombinedLogs] = useState<string[]>([])
  const [logStats, setLogStats] = useState<LogStat[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'errors' | 'combined' | 'system' | 'activity'>('errors')
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState('')
  const [loadError, setLoadError] = useState('')
  const [errorFrequency, setErrorFrequency] = useState<DailyCount[]>([])
  const [combinedFrequency, setCombinedFrequency] = useState<DailyCount[]>([])
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set())

  // ── Activity log state ──
  const [activityItems, setActivityItems] = useState<any[]>([])
  const [activityTotal, setActivityTotal] = useState(0)
  const [activityPages, setActivityPages] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [activityPeriod, setActivityPeriod] = useState<string>('all')
  const [activityEvent, setActivityEvent] = useState('')
  const [activityDashboard, setActivityDashboard] = useState('')
  const [activityEventTypes, setActivityEventTypes] = useState<string[]>([])
  const [activitySearch, setActivitySearch] = useState('')
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityClearing, setActivityClearing] = useState(false)
  const [activityClearMsg, setActivityClearMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [allRes, sysRes] = await Promise.all([
        fetch('/api/admin/debug'),
        fetch('/api/admin/debug?type=system'),
      ])
      if (allRes.ok) {
        const data = await allRes.json()
        setErrorLogs(data.errorLogs || [])
        setCombinedLogs(data.combinedLogs || [])
        setLogStats(data.stats || [])
        setErrorFrequency(data.errorFrequency || [])
        setCombinedFrequency(data.combinedFrequency || [])
        if (data.error) setLoadError(data.error)
      } else {
        try {
          const errData = await allRes.clone().json()
          if (errData.error) setLoadError(errData.error)
        } catch {}
        setLoadError('Server returned ' + allRes.status + '. Please try again.')
      }
      if (sysRes.ok) {
        const data = await sysRes.json()
        setSystemInfo(data.info || null)
      }
    } catch {
      setLoadError('Failed to load debug data. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Read ?tab=activity from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'activity') {
      setTab('activity')
    }
  }, [])

  // Load activity logs
  const loadActivity = useCallback(async () => {
    setActivityLoading(true)
    try {
      const params = new URLSearchParams({ page: String(activityPage), limit: '50' })
      if (activityPeriod !== 'all') params.set('period', activityPeriod)
      if (activityEvent) params.set('event', activityEvent)
      if (activityDashboard) params.set('dashboard', activityDashboard)
      if (activitySearch.trim()) params.set('search', activitySearch.trim())
      const res = await fetch(`/api/admin/activity-log?${params}`)
      if (res.ok) {
        const data = await res.json()
        setActivityItems(data.items || [])
        setActivityTotal(data.total || 0)
        setActivityPages(data.pages || 1)
        setActivityEventTypes(data.eventTypes || [])
      }
    } catch {}
    finally { setActivityLoading(false) }
  }, [activityPage, activityPeriod, activityEvent, activityDashboard, activitySearch])

  useEffect(() => {
    if (tab === 'activity') loadActivity()
  }, [tab, loadActivity])

  async function handleDeleteRow(id: string, description: string) {
    if (!confirm(`Delete this activity entry?\n\n${description.slice(0, 120)}`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/activity-log?ids=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setActivityClearMsg(`🗑️ ${data.message}`)
      loadActivity()
    } catch (e: any) {
      setActivityClearMsg(e.message || 'Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClearActivity(mode: 'filtered' | 'all' | 'seed') {
    if (mode === 'seed') {
      if (!confirm('Generate sample activity log entries for testing?')) return
      setActivityClearMsg('')
      setActivityClearing(true)
      try {
        const sampleEntries = [
          { event: 'login', description: 'Admin logged in: admin', username: 'admin', dashboard: 'admin' as const },
          { event: 'login', description: 'CMS admin logged in: content_manager', username: 'content_manager', dashboard: 'cms' as const },
          { event: 'logout', description: 'Admin logged out: admin', username: 'admin', dashboard: 'admin' as const },
          { event: 'page_edit', description: 'Updated page content: Home Page (/home)', username: 'content_manager', dashboard: 'cms' as const, target: 'home' },
          { event: 'page_edit', description: 'Updated page content: About Us (/about)', username: 'content_manager', dashboard: 'cms' as const, target: 'about' },
          { event: 'login', description: 'Sub-admin logged in: editor', username: 'editor', dashboard: 'admin' as const },
          { event: 'page_edit', description: 'Updated page content: Services (/services)', username: 'content_manager', dashboard: 'cms' as const, target: 'services' },
          { event: 'logout', description: 'CMS admin logged out: content_manager', username: 'content_manager', dashboard: 'cms' as const },
          { event: 'login', description: 'Admin logged in: admin', username: 'admin', dashboard: 'admin' as const },
          { event: 'page_edit', description: 'Updated page content: Contact Us (/contact)', username: 'content_manager', dashboard: 'cms' as const, target: 'contact' },
        ]
        for (const entry of sampleEntries) {
          await fetch('/api/admin/activity-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          })
        }
        setActivityClearMsg('✅ Seeded 10 sample entries with login/logout/page_edit events across Admin & CMS dashboards.')
        loadActivity()
      } catch { setActivityClearMsg('Failed to seed test data') }
      finally { setActivityClearing(false) }
      return
    }

    const label = mode === 'all' ? 'ALL activity log entries' : 'activity entries matching current filters'
    if (!confirm(`Clear ${label}? This cannot be undone.`)) return
    setActivityClearMsg('')
    setActivityClearing(true)
    try {
      const params = new URLSearchParams()
      if (mode === 'all') {
        params.set('all', '1')
      } else {
        if (activityPeriod !== 'all') params.set('period', activityPeriod)
        if (activityEvent) params.set('event', activityEvent)
        if (activityDashboard) params.set('dashboard', activityDashboard)
        if (activitySearch.trim()) params.set('search', activitySearch.trim())
      }
      const res = await fetch(`/api/admin/activity-log?${params}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Clear failed')
      setActivityClearMsg(`🗑️ ${data.message}`)
      loadActivity()
    } catch (e: any) {
      setActivityClearMsg(e.message || 'Failed to clear activity logs')
    } finally {
      setActivityClearing(false)
    }
  }

  async function handleClear(target: 'errors' | 'combined' | 'all') {
    if (!confirm(`Clear ${target === 'all' ? 'all log files' : target + '.log'}? This cannot be undone.`)) return
    setClearing(true)
    setClearMsg('')
    try {
      const res = await fetch(`/api/admin/debug?target=${target}`, { method: 'DELETE' })
      const data = await res.json()
      setClearMsg(data?.cleared || 'Logs cleared')
      loadData()
    } catch {
      setClearMsg('Failed to clear logs')
    } finally {
      setClearing(false)
    }
  }

  function toggleLine(i: number) {
    setExpandedLines((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function formatMem(mb: number) {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
    return `${mb} MB`
  }

  function LogFrequencyChart({ data, barColor }: { data: DailyCount[]; barColor: string }) {
    const maxCount = Math.max(...data.map(d => d.count), 1)
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, paddingTop: 4 }}>
        {data.map((d) => {
          const pct = (d.count / maxCount) * 100
          const isToday = d.date === new Date().toISOString().slice(0, 10)
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} entries`}
              style={{
                flex: 1,
                height: `${Math.max(pct, 2)}%`,
                background: d.count > 0 ? barColor : '#1e293b',
                opacity: isToday ? 1 : d.count > 0 ? 0.7 : 0.4,
                borderRadius: '2px 2px 0 0',
                minHeight: d.count > 0 ? 4 : 2,
                transition: 'height 0.3s',
                cursor: 'pointer',
              }}
            />
          )
        })}
      </div>
    )
  }

  function renderLogLine(line: string, idx: number) {
    const isError = line.includes('"level":"error"') || line.includes('[error]')
    const isWarn = line.includes('"level":"warn"') || line.includes('[warn]')
    const isExpanded = expandedLines.has(idx)
    const truncated = line.length > 300

    return (
      <div
        key={idx}
        onClick={() => truncated && toggleLine(idx)}
        style={{
          padding: '6px 10px',
          fontSize: 11,
          fontFamily: 'monospace',
          color: isError ? '#fca5a5' : isWarn ? '#fbbf24' : '#94a3b8',
          background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
          borderBottom: '1px solid rgba(30,41,59,0.5)',
          cursor: truncated ? 'pointer' : 'default',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: 1.5,
        }}
      >
        {isError && <span style={{ color: '#ef4444', fontWeight: 700, marginRight: 6 }}>🛑</span>}
        {isWarn && <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 6 }}>⚠️</span>}
        {isExpanded ? line : truncated ? line.slice(0, 300) + '…' : line}
      </div>
    )
  }

  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div className="cms-topbar">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bug size={22} style={{ color: '#f59e0b' }} />
            Debug & Error Management
          </h1>
          <div className="sub">View error logs, system diagnostics, and manage log files</div>
        </div>
        <button className="cms-btn cms-btn-ghost" onClick={loadData} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {/* ── CLEAR MESSAGE ── */}
      {clearMsg && (
        <div className="cms-alert cms-alert-success">{clearMsg}</div>
      )}

      {loadError && (
        <div className="cms-alert cms-alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>{loadError}</span>
          <button
            className="cms-btn cms-btn-ghost cms-btn-sm"
            onClick={() => { setLoadError(''); loadData(); }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── HISTOGRAM CHART ── */}
      {(errorFrequency.length > 0 || combinedFrequency.length > 0) && (
        <div style={{
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 20px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} style={{ color: '#0ea5e9' }} />
            Log Activity (last 14 days)
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {errorFrequency.length > 0 && (
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 6, fontWeight: 600 }}>🛑 Error Log</div>
                <LogFrequencyChart data={errorFrequency} barColor="#ef4444" />
              </div>
            )}
            {combinedFrequency.length > 0 && (
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 11, color: '#0ea5e9', marginBottom: 6, fontWeight: 600 }}>📋 Combined Log</div>
                <LogFrequencyChart data={combinedFrequency} barColor="#0ea5e9" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LOG STAT CARDS ── */}
      <div className="cms-stats-grid" style={{ marginBottom: 20 }}>
        {logStats.map((stat) => (
          <div key={stat.file} className="cms-stat-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={20} style={{ color: stat.exists ? '#0ea5e9' : '#475569', flexShrink: 0 }} />
            <div>
              <div className="cms-stat-label" style={{ marginBottom: 2 }}>{stat.file}</div>
              <div className="cms-stat-value" style={{
                fontSize: 18,
                color: stat.exists ? '#f1f5f9' : '#475569'
              }}>
                {stat.exists ? `${stat.lines} lines · ${stat.size}` : 'File not found'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        borderBottom: '1px solid #1e293b', paddingBottom: 10,
        flexWrap: 'wrap',
      }}>
        {([
          { key: 'errors' as const, label: '🛑 Error Log', icon: <AlertTriangle size={14} /> },
          { key: 'combined' as const, label: '📋 Combined Log', icon: <FileText size={14} /> },
          { key: 'system' as const, label: '💻 System Info', icon: <Server size={14} /> },
          { key: 'activity' as const, label: '📋 Activity Log', icon: <History size={14} /> },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="cms-btn"
            style={{
              background: tab === t.key ? 'rgba(14,165,233,0.12)' : 'transparent',
              color: tab === t.key ? '#7dd3fc' : '#94a3b8',
              border: tab === t.key ? '1px solid rgba(14,165,233,0.25)' : '1px solid #1e293b',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      {(() => {
        if (loading) {
          return (
            <div className="cms-loading">
              <div className="cms-spinner-sm" />
              <span>Loading debug data…</span>
            </div>
          )
        }
        if (tab === 'system' && systemInfo) {
          return (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0 }}>
                {[
                  { label: 'Node.js', value: systemInfo.nodeVersion, icon: <Terminal size={16} />, color: '#22c55e' },
                  { label: 'Platform', value: `${systemInfo.platform} (${systemInfo.arch})`, icon: <Cpu size={16} />, color: '#0ea5e9' },
                  { label: 'Environment', value: systemInfo.env, icon: <Zap size={16} />, color: '#f59e0b' },
                  { label: 'Memory', value: `${formatMem(systemInfo.memory.free)} free / ${formatMem(systemInfo.memory.total)} total`, icon: <HardDrive size={16} />, color: '#8b5cf6' },
                  { label: 'CPU Cores', value: String(systemInfo.cpus), icon: <Cpu size={16} />, color: '#06b6d4' },
                  { label: 'Uptime', value: `${systemInfo.uptime}h`, icon: <Clock size={16} />, color: '#10b981' },
                  { label: 'PID', value: String(systemInfo.pid), icon: <Activity size={16} />, color: '#f97316' },
                  { label: 'Serverless', value: systemInfo.vercel ? 'Yes (Vercel)' : 'No (self-hosted)', icon: <Server size={16} />, color: '#64748b' },
                  { label: 'Working Dir', value: systemInfo.cwd, icon: <Database size={16} />, color: '#a855f7' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRight: '1px solid #1e293b', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${item.color}14`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', wordBreak: 'break-all' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
        if (tab === 'activity') {
          return (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 14px', background: '#0b1220', borderBottom: '1px solid #1e293b', alignItems: 'center' }}>
                {[{ value: 'all', label: 'All Time' }, { value: '24h', label: 'Last 24 Hours' }, { value: '7d', label: 'Last 7 Days' }, { value: '30d', label: 'This Month' }].map(p => (
                  <button key={p.value} onClick={() => { setActivityPeriod(p.value); setActivityPage(1) }} className="cms-btn cms-btn-sm"
                    style={{ background: activityPeriod === p.value ? 'rgba(14,165,233,0.15)' : 'transparent', color: activityPeriod === p.value ? '#7dd3fc' : '#64748b', border: `1px solid ${activityPeriod === p.value ? 'rgba(14,165,233,0.3)' : '#1e293b'}`, fontSize: 11 }}>{p.label}</button>
                ))}
                <select value={activityEvent} onChange={(e) => { setActivityEvent(e.target.value); setActivityPage(1) }}
                  style={{ background: '#0b1220', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="">All Events</option>
                  {activityEventTypes.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                </select>
                <select value={activityDashboard} onChange={(e) => { setActivityDashboard(e.target.value); setActivityPage(1) }}
                  style={{ background: '#0b1220', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="">All Dashboards</option>
                  <option value="admin">Main Admin</option>
                  <option value="cms">CMS</option>
                </select>
                <input type="text" placeholder="Search description, user..." value={activitySearch}
                  onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1) }}
                  style={{ flex: '1 1 180px', background: '#0b1220', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' }} />
                <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={loadActivity} title="Refresh"><RefreshCw size={12} /></button>
                <a
                  href={`/api/admin/activity-log?export=csv&${new URLSearchParams({
                    ...(activityPeriod !== 'all' ? { period: activityPeriod } : {}),
                    ...(activityEvent ? { event: activityEvent } : {}),
                    ...(activityDashboard ? { dashboard: activityDashboard } : {}),
                    ...(activitySearch.trim() ? { search: activitySearch.trim() } : {}),
                  }).toString()}`}
                  download
                  className="cms-btn cms-btn-sm"
                  style={{ textDecoration: 'none', fontSize: 10 }}
                >
                  ⬇ CSV
                </a>
                <button
                  className="cms-btn cms-btn-sm"
                  style={{ fontSize: 10, borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}
                  onClick={() => handleClearActivity(activityEvent || activityDashboard || activityPeriod !== 'all' || activitySearch.trim() ? 'filtered' : 'all')}
                  disabled={activityClearing}
                >
                  <Trash2 size={11} /> {activityClearing ? 'Clearing…' : 'Clear'}
                </button>
                {activityTotal > 0 && (
                  <button
                    className="cms-btn cms-btn-sm"
                    style={{ fontSize: 10, borderColor: 'rgba(239,68,68,0.5)', color: '#fca5a5' }}
                    onClick={() => handleClearActivity('all')}
                    disabled={activityClearing}
                  >
                    <Trash2 size={11} /> Clear All
                  </button>
                )}
                {activityTotal === 0 && (
                  <button
                    className="cms-btn cms-btn-sm"
                    style={{ fontSize: 10, borderColor: 'rgba(34,197,94,0.3)', color: '#86efac' }}
                    onClick={() => handleClearActivity('seed')}
                    disabled={activityClearing}
                  >
                    🌱 Seed
                  </button>
                )}
              </div>
              {activityClearMsg && (
                <div style={{ padding: '8px 14px', fontSize: 11, color: activityClearMsg.includes('✅') || activityClearMsg.includes('🗑️') ? '#86efac' : '#fca5a5', background: '#0b1220', borderBottom: '1px solid #1e293b' }}>
                  {activityClearMsg}
                </div>
              )}
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {activityLoading ? (
                  <div className="cms-loading" style={{ padding: '40px 20px' }}><div className="cms-spinner-sm" /><span>Loading activity log…</span></div>
                ) : activityItems.length === 0 ? (
                  <div className="cms-table-empty" style={{ padding: '40px 20px' }}><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div><div>No activity entries found</div></div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e293b', background: '#0b1220' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Time</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Event</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>User</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Dashboard</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Description</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Target</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', width: 50 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityItems.map((item: any) => {
                        const eventColors: Record<string, string> = { login: '#22c55e', logout: '#ef4444', page_edit: '#0ea5e9' }
                        const eventColor = eventColors[item.event] || '#94a3b8'
                        return (
                          <tr key={item._id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '7px 10px', color: '#64748b', whiteSpace: 'nowrap', fontSize: 11 }}>{new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '7px 10px' }}><span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 4, background: `${eventColor}15`, color: eventColor, fontSize: 10, fontWeight: 600 }}>{item.event}</span></td>
                            <td style={{ padding: '7px 10px', color: '#7dd3fc', fontWeight: 600, fontSize: 11 }}>{item.username}</td>
                            <td style={{ padding: '7px 10px', color: '#94a3b8', fontSize: 11 }}>
                              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, background: item.dashboard === 'admin' ? 'rgba(234,179,8,0.12)' : 'rgba(139,92,246,0.12)', color: item.dashboard === 'admin' ? '#eab308' : '#a78bfa', fontSize: 10, fontWeight: 600 }}>
                                {item.dashboard === 'admin' ? 'Admin' : 'CMS'}
                              </span>
                            </td>
                            <td style={{ padding: '7px 10px', color: '#e2e8f0', fontSize: 11, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.description}>{item.description}</td>
                            <td style={{ padding: '7px 10px', color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>{item.target || '—'}</td>
                            <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteRow(item._id, item.description)}
                                disabled={deletingId === item._id}
                                title="Delete this entry"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: 4,
                                  color: deletingId === item._id ? '#64748b' : '#ef4444',
                                  opacity: deletingId === item._id ? 0.5 : 0.6,
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent' }}
                              >
                                {deletingId === item._id ? (
                                  <span className="cms-spinner-sm" style={{ display: 'inline-block', width: 12, height: 12, borderWidth: 1.5 }} />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              {activityPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid #1e293b', background: '#0b1220', fontSize: 11, color: '#94a3b8' }}>
                  <span>Page {activityPage} of {activityPages} · {activityTotal} total</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="cms-btn cms-btn-ghost cms-btn-sm" disabled={activityPage <= 1} onClick={() => setActivityPage(p => Math.max(1, p - 1))}>← Prev</button>
                    <button className="cms-btn cms-btn-ghost cms-btn-sm" disabled={activityPage >= activityPages} onClick={() => setActivityPage(p => Math.min(activityPages, p + 1))}>Next →</button>
                  </div>
                </div>
              )}
            </div>
          )
        }
        return (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0b1220', borderBottom: '1px solid #1e293b' }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Showing last {tab === 'errors' ? errorLogs.length : combinedLogs.length} entries
                {tab === 'errors' && errorLogs.length > 0 && (
                  <span style={{ color: '#ef4444', marginLeft: 8 }}>({errorLogs.filter(l => l.includes('error')).length} errors)</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {tab !== 'system' && (
                  <a href={`/api/admin/debug?type=${tab}&download=1`} download className="cms-btn cms-btn-ghost cms-btn-sm" style={{ textDecoration: 'none' }}>⬇ .txt</a>
                )}
                <button className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => handleClear(tab === 'combined' ? 'combined' : 'errors')} disabled={clearing}>
                  <Trash2 size={12} /> {clearing ? 'Clearing…' : `Clear ${tab}.log`}
                </button>
                <button className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => handleClear('all')} disabled={clearing}>
                  <Trash2 size={12} /> Clear All
                </button>
              </div>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
              {(tab === 'errors' ? errorLogs : combinedLogs).length === 0 ? (
                <div className="cms-table-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div><div>No log entries found</div></div>
              ) : (
                (tab === 'errors' ? errorLogs : combinedLogs).map((line, i) => renderLogLine(line, i))
              )}
            </div>
          </div>
        )
      })()}

      {/* ── TIP BOX ── */}
      <div className="cms-tip" style={{ marginTop: 28 }}>
        <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div className="cms-tip-title">Debug Information</div>
          <div className="cms-tip-body">
            Error logs are written to <code style={{ color: '#7dd3fc', background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>logs/error.log</code> and
            all logs to <code style={{ color: '#7dd3fc', background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>logs/combined.log</code>.
            On Vercel, logs are written to <code style={{ color: '#7dd3fc', background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>/tmp/logs/</code> and are ephemeral.
          </div>
        </div>
      </div>
    </div>
  )
}
