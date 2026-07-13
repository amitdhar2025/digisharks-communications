'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { adminFetch } from '@/lib/admin-fetch'
import {
  HardDrive,
  Database,
  Cloud,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Archive,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────── */

interface BackupItem {
  _id: string
  type: 'full' | 'database' | 'media'
  period: 'daily' | 'monthly'
  date: string
  fileName: string
  fileSize: string
  fileSizeBytes: number
  downloadUrl: string
  durationSeconds: number
  collectionsCount?: number
  mediaCount?: number
  status: 'success' | 'failed' | 'partial'
  errorMessage?: string
  createdAt: string
}

interface BackupStats {
  total: number
  dailyCount: number
  monthlyCount: number
  lastBackup: BackupItem | null
}

/* ── Helpers ──────────────────────────────────────────── */

const BACKUP_TYPES = [
  { value: 'full', label: 'Full (Database + Media)', icon: HardDrive },
  { value: 'database', label: 'Database Only', icon: Database },
  { value: 'media', label: 'Media Only', icon: Cloud },
] as const

function getTypeIcon(type: string) {
  const found = BACKUP_TYPES.find((t) => t.value === type)
  return found?.icon || HardDrive
}

function getTypeColor(type: string) {
  switch (type) {
    case 'full': return '#0ea5e9'
    case 'database': return '#22c55e'
    case 'media': return '#f59e0b'
    default: return '#64748b'
  }
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function getRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Status Badge ─────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string; icon: any }> = {
    success: { bg: 'rgba(34,197,94,0.12)', color: '#86efac', label: 'Success', icon: CheckCircle },
    failed: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', label: 'Failed', icon: AlertCircle },
    partial: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', label: 'Partial', icon: AlertCircle },
  }
  const c = config[status] || config.failed
  const Icon = c.icon
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
        background: c.bg, color: c.color,
      }}
    >
      <Icon size={11} />
      {c.label}
    </span>
  )
}

/* ── Main Component ───────────────────────────────────── */

export default function BackupsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<BackupItem[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [triggering, setTriggering] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('full')
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  // Auth + load data
  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.authenticated) {
          router.push('/admin/login')
          return
        }
        loadBackups()
      })
      .catch(() => router.push('/admin/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadBackups() {
    setLoading(true)
    const { data } = await adminFetch<{ items: BackupItem[]; stats: BackupStats }>(
      '/api/admin/backups?limit=20'
    )
    if (data) {
      setItems(data.items || [])
      setStats(data.stats || null)
    }
    setLoading(false)
  }

  async function handleTrigger() {
    setTriggering(true)
    const { data, error } = await adminFetch<{ success: boolean; message: string }>(
      '/api/admin/backups/trigger',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      }
    )
    if (data?.success) {
      setToast({ kind: 'success', text: data.message })
    } else {
      setToast({ kind: 'error', text: error || 'Failed to trigger backup' })
    }
    setTriggering(false)
  }

  // Separate daily and monthly items
  const dailyItems = items.filter((i) => i.period === 'daily').slice(0, 7)
  const monthlyItems = items.filter((i) => i.period === 'monthly')

  return (
    <div className="admin-layout">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .bk-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) {
          .bk-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .dash-stat-card {
          position: relative;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
        }
        .dash-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }
        .dash-stat-card.blue::before { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
        .dash-stat-card.green::before { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .dash-stat-card.purple::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .dash-stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
      `}</style>

      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">☰</button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* ── Header ── */}
        <div className="admin-topbar">
          <div>
            <h1>💾 Backups</h1>
            <div className="sub">Manage database and media backups stored in Backblaze B2</div>
          </div>
          <div className="cell-actions">
            <button className="btn btn-ghost" onClick={loadBackups} disabled={loading}>
              <RefreshCw size={14} style={{ marginRight: 4 }} />
              Refresh
            </button>
          </div>
        </div>

        {toast && (
          <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
            {toast.text}
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div className="bk-grid" style={{ marginBottom: 24 }}>
          <div className="dash-stat-card blue" style={{ padding: '16px', cursor: 'default' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{stats?.total ?? '—'}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Total Backups</div>
          </div>
          <div className="dash-stat-card green" style={{ padding: '16px', cursor: 'default' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{stats?.dailyCount ?? '—'}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Daily Backups</div>
          </div>
          <div className="dash-stat-card purple" style={{ padding: '16px', cursor: 'default' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{stats?.monthlyCount ?? '—'}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Monthly Archives</div>
          </div>
          <div className="dash-stat-card amber" style={{ padding: '16px', cursor: 'default' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
              {stats?.lastBackup ? (
                <>Last: {getRelativeTime(stats.lastBackup.createdAt)}</>
              ) : (
                'No backups yet'
              )}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {stats?.lastBackup ? (
                <>{stats.lastBackup.type.toUpperCase()} &middot; {stats.lastBackup.fileSize}</>
              ) : (
                'Run your first backup above'
              )}
            </div>
          </div>
        </div>

        {/* ── Trigger Backup ── */}
        <div
          style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
            padding: 20, marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} style={{ color: '#0ea5e9' }} />
            Trigger Manual Backup
          </h2>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="field" style={{ minWidth: 240, marginBottom: 0 }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {BACKUP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleTrigger}
              disabled={triggering}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {triggering ? (
                <span className="spinner" />
              ) : (
                <HardDrive size={14} />
              )}
              {triggering ? 'Starting...' : 'Back up now'}
            </button>

            <span style={{ fontSize: 11, color: '#64748b' }}>
              Backup runs in the background — results appear after completion
            </span>
          </div>
        </div>

        {/* ── Daily Backups Table ── */}
        <div
          style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
            overflow: 'hidden', marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 18px', borderBottom: '1px solid #1e293b',
              background: '#0b1220',
            }}
          >
            <Calendar size={15} style={{ color: '#0ea5e9' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
              Daily Backups
            </span>
            <span style={{
              fontSize: 10, color: '#64748b', background: '#1e293b',
              padding: '1px 7px', borderRadius: 10, fontWeight: 600,
            }}>
              Last 7
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div className="spinner" />
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Loading backups...</div>
            </div>
          ) : dailyItems.length === 0 ? (
            <div style={{ padding: '30px 18px', textAlign: 'center' }}>
              <Archive size={32} style={{ color: '#334155', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 12, color: '#64748b' }}>
                No daily backups found
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                Trigger a backup above to get started
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>Date</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>Type</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>Status</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'right', borderBottom: '1px solid #1e293b' }}>Size</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'right', borderBottom: '1px solid #1e293b' }}>Duration</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'center', borderBottom: '1px solid #1e293b' }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyItems.map((item) => {
                    const TypeIcon = getTypeIcon(item.type)
                    return (
                      <tr key={item._id} style={{
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: getTypeColor(item.type),
                            textTransform: 'uppercase',
                          }}>
                            <TypeIcon size={12} />
                            {item.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <StatusBadge status={item.status} />
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {item.fileSize}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} />
                            {formatDuration(item.durationSeconds)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {item.downloadUrl ? (
                            <a
                              href={item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#7dd3fc', textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 11, fontWeight: 600,
                              }}
                              title={item.fileName}
                            >
                              <Download size={11} />
                              ZIP
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: '#475569' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Monthly Archives ── */}
        <div
          style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 18px', borderBottom: '1px solid #1e293b',
              background: '#0b1220',
            }}
          >
            <Archive size={15} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
              Monthly Archive
            </span>
            <span style={{
              fontSize: 10, color: '#64748b', background: '#1e293b',
              padding: '1px 7px', borderRadius: 10, fontWeight: 600,
            }}>
              Kept 12 months
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div className="spinner" />
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Loading...</div>
            </div>
          ) : monthlyItems.length === 0 ? (
            <div style={{ padding: '30px 18px', textAlign: 'center' }}>
              <Archive size={32} style={{ color: '#334155', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 12, color: '#64748b' }}>
                No monthly archives yet
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                Monthly archives are created automatically on the 1st of each month
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>Date</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>Type</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>Status</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'right', borderBottom: '1px solid #1e293b' }}>Size</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'right', borderBottom: '1px solid #1e293b' }}>Duration</th>
                    <th style={{ padding: '10px 16px', fontSize: 11, color: '#64748b', textAlign: 'center', borderBottom: '1px solid #1e293b' }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyItems.map((item) => {
                    const TypeIcon = getTypeIcon(item.type)
                    return (
                      <tr key={item._id} style={{
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: getTypeColor(item.type),
                            textTransform: 'uppercase',
                          }}>
                            <TypeIcon size={12} />
                            {item.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <StatusBadge status={item.status} />
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {item.fileSize}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#94a3b8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} />
                            {formatDuration(item.durationSeconds)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {item.downloadUrl ? (
                            <a
                              href={item.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#7dd3fc', textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 11, fontWeight: 600,
                              }}
                              title={item.fileName}
                            >
                              <Download size={11} />
                              ZIP
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: '#475569' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
