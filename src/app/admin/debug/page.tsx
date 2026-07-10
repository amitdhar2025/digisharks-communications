'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { adminFetch } from '@/lib/admin-fetch'
import {
  Bug,
  Terminal,
  HardDrive,
  Clock,
  AlertTriangle,
  Trash2,
  RefreshCw,
  FileText,
  Server,
  Cpu,
  Database,
  Activity,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────── */

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

/* ── Component ────────────────────────────────────────── */

export default function DebugPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [username, setUsername] = useState('')
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
      const [allData, sysData] = await Promise.all([
        adminFetch<{ errorLogs: string[]; combinedLogs: string[]; stats: LogStat[] }>('/api/admin/debug'),
        adminFetch<{ info: SystemInfo }>('/api/admin/debug?type=system'),
      ])
      if (allData.data) {
        setErrorLogs(allData.data.errorLogs || [])
        setCombinedLogs(allData.data.combinedLogs || [])
        setLogStats(allData.data.stats || [])
      }
      if (sysData.data?.info) {
        setSystemInfo(sysData.data.info)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
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
        setUsername(d.username || '')
        loadData()
      })
      .catch(() => router.push('/admin/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleClear(target: 'errors' | 'combined' | 'all') {
    if (!confirm(`Clear ${target === 'all' ? 'all log files' : target + '.log'}? This cannot be undone.`)) return
    setClearing(true)
    setClearMsg('')
    try {
      const { data } = await adminFetch<{ cleared: string }>(`/api/admin/debug?target=${target}`, { method: 'DELETE' })
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
    <div className="admin-layout">
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* ── PAGE HEADER ── */}
        <div className="admin-topbar">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bug size={22} style={{ color: '#f59e0b' }} />
              Debug & Error Management
            </h1>
            <div className="sub">
              {username ? `Welcome back, ${username}` : 'Loading…'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={loadData} disabled={loading}>
              <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── CLEAR MESSAGE ── */}
        {clearMsg && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            {clearMsg}
          </div>
        )}

        {/* ── LOG STATS ── */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {logStats.map((stat) => (
            <div key={stat.file} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={20} style={{ color: stat.exists ? '#0ea5e9' : '#475569', flexShrink: 0 }} />
              <div>
                <div className="label" style={{ marginBottom: 2 }}>{stat.file}</div>
                <div className="value" style={{
                  fontSize: 18, fontWeight: 700,
                  color: stat.exists ? '#e2e8f0' : '#475569'
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
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1px solid transparent',
                background: tab === t.key ? 'rgba(14,165,233,0.12)' : 'transparent',
                color: tab === t.key ? '#7dd3fc' : '#94a3b8',
                borderColor: tab === t.key ? 'rgba(14,165,233,0.25)' : '#1e293b',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        {loading ? (
          <div className="empty">
            <div className="spinner" style={{ margin: '0 auto 8px' }} />
            <div>Loading debug data…</div>
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
                    className="btn btn-ghost"
                    style={{ padding: '6px 10px', fontSize: 12, textDecoration: 'none' }}
                  >
                    ⬇ .txt
                  </a>
                )}
                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => handleClear(tab === 'combined' ? 'combined' : 'errors')}
                  disabled={clearing}
                >
                  <Trash2 size={12} />
                  {clearing ? 'Clearing…' : `Clear ${tab}.log`}
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => handleClear('all')}
                  disabled={clearing}
                >
                  <Trash2 size={12} />
                  Clear All Logs
                </button>
              </div>
            </div>

            {/* Log content */}
            <div style={{
              maxHeight: '60vh', overflowY: 'auto',
              fontFamily: 'monospace', fontSize: 11,
            }}>
              {(tab === 'errors' ? errorLogs : combinedLogs).length === 0 ? (
                <div className="empty" style={{ padding: '40px 20px' }}>
                  <div className="icon" style={{ fontSize: 32 }}>📭</div>
                  <div>No log entries found</div>
                </div>
              ) : (
                (tab === 'errors' ? errorLogs : combinedLogs).map((line, i) => renderLogLine(line, i))
              )}
            </div>
          </div>
        )}

        {/* ── TIP BOX ── */}
        <div style={{
          marginTop: 28, padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.04))',
          border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
              Debug Information
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Error logs are written to <code style={{ color: '#7dd3fc', background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>logs/error.log</code> and
              all logs to <code style={{ color: '#7dd3fc', background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>logs/combined.log</code>.
              On Vercel, logs are written to <code style={{ color: '#7dd3fc', background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>/tmp/logs/</code> and are ephemeral.
              Use the System Info tab to check the current environment and server health.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
