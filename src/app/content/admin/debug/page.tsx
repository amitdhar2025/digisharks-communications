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
} from 'lucide-react'

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
  const [tab, setTab] = useState<'errors' | 'combined' | 'system'>('errors')
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState('')
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set())

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
      }
      if (sysRes.ok) {
        const data = await sysRes.json()
        setSystemInfo(data.info || null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

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
      {loading ? (
        <div className="cms-loading">
          <div className="cms-spinner-sm" />
          <span>Loading debug data…</span>
        </div>
      ) : tab === 'system' && systemInfo ? (
        <div style={{
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0,
          }}>
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
              <div key={i} style={{
                padding: '14px 16px',
                borderRight: '1px solid #1e293b',
                borderBottom: '1px solid #1e293b',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: `${item.color}14`, color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', wordBreak: 'break-all' }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Log header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', background: '#0b1220',
            borderBottom: '1px solid #1e293b',
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Showing last {tab === 'errors' ? errorLogs.length : combinedLogs.length} entries
              {tab === 'errors' && errorLogs.length > 0 && (
                <span style={{ color: '#ef4444', marginLeft: 8 }}>
                  ({errorLogs.filter(l => l.includes('error')).length} errors)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {tab !== 'system' && (
                <a
                  href={`/api/admin/debug?type=${tab}&download=1`}
                  download
                  className="cms-btn cms-btn-ghost cms-btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  ⬇ .txt
                </a>
              )}
              <button
                className="cms-btn cms-btn-danger cms-btn-sm"
                onClick={() => handleClear(tab === 'combined' ? 'combined' : 'errors')}
                disabled={clearing}
              >
                <Trash2 size={12} />
                {clearing ? 'Clearing…' : `Clear ${tab}.log`}
              </button>
              <button
                className="cms-btn cms-btn-danger cms-btn-sm"
                onClick={() => handleClear('all')}
                disabled={clearing}
              >
                <Trash2 size={12} />
                Clear All
              </button>
            </div>
          </div>

          {/* Log content */}
          <div style={{
            maxHeight: '60vh', overflowY: 'auto',
            fontFamily: 'monospace', fontSize: 11,
          }}>
            {(tab === 'errors' ? errorLogs : combinedLogs).length === 0 ? (
              <div className="cms-table-empty">
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div>No log entries found</div>
              </div>
            ) : (
              (tab === 'errors' ? errorLogs : combinedLogs).map((line, i) => renderLogLine(line, i))
            )}
          </div>
        </div>
      )}

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
