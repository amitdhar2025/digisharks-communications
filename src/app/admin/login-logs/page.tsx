'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/Sidebar'

/* ─── Types ─── */

interface LoginLogItem {
  _id: string
  username: string
  role: 'admin' | 'sub-admin'
  ip: string
  country: string
  region: string
  city: string
  isp: string
  userAgent: string
  loginTime: string | null
  logoutTime: string | null
  blockedIp: boolean
  blockedUser: boolean
  blockedAt: string | null
  blockedBy: string | null
}

interface LogStats {
  total: number
  activeSessions: number
  blockedIps: number
  blockedUsers: number
}

/* ─── Helpers ─── */

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDuration(loginIso: string | null, logoutIso: string | null) {
  if (!loginIso) return '—'
  const login = new Date(loginIso)
  const logout = logoutIso ? new Date(logoutIso) : new Date()
  const diffMs = logout.getTime() - login.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return `${hrs}h ${rem}m`
}

/* ─── Component ─── */

export default function LoginLogsPage() {
  const router = useRouter()
  const [items, setItems] = useState<LoginLogItem[]>([])
  const [stats, setStats] = useState<LogStats>({ total: 0, activeSessions: 0, blockedIps: 0, blockedUsers: 0 })
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [exportLoading, setExportLoading] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<LoginLogItem | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loginTrashCount, setLoginTrashCount] = useState(0)

  useEffect(() => {
    fetch('/api/admin/trash/count?section=login_logs')
      .then(r => r.json())
      .then(d => { if (d.count !== undefined) setLoginTrashCount(d.count) })
      .catch(() => {})
  }, [])

  // Block state
  const [blockTarget, setBlockTarget] = useState<LoginLogItem | null>(null)
  const [blockType, setBlockType] = useState<'ip' | 'user'>('ip')
  const [blocking, setBlocking] = useState(false)

  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/login-logs?${params.toString()}`)
      if (res.status === 401) {
        router.push('/admin/login?next=/admin/login-logs')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems(data.items || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      if (data.stats) setStats(data.stats)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, router])

  useEffect(() => { load() }, [load])

  function applySearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/login-logs/${deleteTarget._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      setToast({ kind: 'success', text: 'Log entry moved to Trash.' })
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAll() {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/login-logs', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setToast({ kind: 'success', text: data.message || 'All logs moved to Trash.' })
      setDeleteAllOpen(false)
      setItems([])
      setTotal(0)
      setPages(1)
      setStats({ total: 0, activeSessions: 0, blockedIps: 0, blockedUsers: 0 })
      load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeleting(false)
    }
  }

  async function handleBlock() {
    if (!blockTarget) return
    setBlocking(true)
    try {
      const res = await fetch(`/api/admin/login-logs/${blockTarget._id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: blockType, blocked: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Block failed')
      setToast({ kind: 'success', text: data.message || 'Blocked successfully.' })
      setBlockTarget(null)
      load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBlocking(false)
    }
  }

  async function handleUnblock(type: 'ip' | 'user', id: string) {
    try {
      const res = await fetch(`/api/admin/login-logs/${id}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, blocked: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unblock failed')
      setToast({ kind: 'success', text: data.message || 'Unblocked successfully.' })
      load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    }
  }

  async function handleExport() {
    setExportLoading(true)
    try {
      const res = await fetch('/api/admin/login-logs/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `login-logs-${new Date().toISOString().substring(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setExportLoading(false)
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>📋 Login Logs</h1>
            <div className="sub">
              {total} total {total === 1 ? 'entry' : 'entries'} · page {page} of {pages}
            </div>
          </div>
          <div className="cell-actions">
            <button className="btn btn-ghost" onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? <span className="spinner" /> : '⬇'} Export CSV
            </button>
            {total > 0 && (
              <button className="btn btn-danger" onClick={() => setDeleteAllOpen(true)}>
                🗑 Delete All ({total})
              </button>
            )}
            <Link href="/admin/trash?section=login_logs" className="btn btn-ghost" style={{ color: loginTrashCount > 0 ? '#fbbf24' : undefined }}>
              🗑 Trash{loginTrashCount > 0 ? ` (${loginTrashCount})` : ''}
            </Link>
            <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        {toast && (
          <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
            {toast.text}
          </div>
        )}

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card total">
            <div className="label">Total Logins</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card completed">
            <div className="label">Active Sessions</div>
            <div className="value">{stats.activeSessions}</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="label" style={{ color: '#fca5a5' }}>Blocked IPs</div>
            <div className="value" style={{ color: '#ef4444' }}>{stats.blockedIps}</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="label" style={{ color: '#fbbf24' }}>Blocked Users</div>
            <div className="value" style={{ color: '#f59e0b' }}>{stats.blockedUsers}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <form className="toolbar" onSubmit={applySearch}>
          <input
            className="grow"
            placeholder="Search by username, IP, country, city, ISP…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All</option>
            <option value="blocked-ip">Blocked IPs</option>
            <option value="blocked-user">Blocked Users</option>
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
          {(search || statusFilter !== 'all') && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearch(''); setStatusFilter('all'); setPage(1) }}>
              Clear
            </button>
          )}
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div className="empty"><span className="spinner" /> Loading login logs…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="icon">📭</div>
              <p>No login logs yet. Log in to start recording.</p>
            </div>
          ) : (
            <table className="queries">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>IP &amp; Location</th>
                  <th>ISP</th>
                  <th>Login Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} style={{
                    background: item.blockedIp ? 'rgba(239,68,68,0.04)' :
                                item.blockedUser ? 'rgba(245,158,11,0.04)' : undefined,
                  }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.username}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${item.role === 'admin' ? 'status-completed' : 'status-follow-up'}`}>
                        <span className="dot" /> {item.role === 'admin' ? 'Admin' : 'Sub'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.ip}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {[item.city, item.region, item.country].filter(Boolean).join(', ') || '—'}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.isp}>
                      {item.isp || '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                      <div>{fmtDate(item.loginTime)}</div>
                      {!item.logoutTime && (
                        <span style={{ color: '#4ade80', fontSize: 10, fontWeight: 700 }}>● Active</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#94a3b8' }}>
                      {fmtDuration(item.loginTime, item.logoutTime)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {item.blockedIp && (
                          <span className="status-pill status-pending" style={{ fontSize: 10 }}>
                            🚫 IP Blocked
                          </span>
                        )}
                        {item.blockedUser && (
                          <span className="status-pill" style={{ fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' }}>
                            🚫 User Blocked
                          </span>
                        )}
                        {!item.blockedIp && !item.blockedUser && (
                          <span style={{ color: '#4ade80', fontSize: 11 }}>✓ OK</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="cell-actions" style={{ flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {!item.blockedIp && (
                            <button
                              className="icon-btn danger"
                              onClick={() => { setBlockTarget(item); setBlockType('ip') }}
                              title="Block this IP"
                              style={{ fontSize: 10, padding: '4px 6px' }}
                            >
                              🚫 IP
                            </button>
                          )}
                          {item.blockedIp && (
                            <button
                              className="icon-btn"
                              onClick={() => handleUnblock('ip', item._id)}
                              title="Unblock this IP"
                              style={{ fontSize: 10, padding: '4px 6px', color: '#4ade80' }}
                            >
                              ✓ IP
                            </button>
                          )}
                          {!item.blockedUser && (
                            <button
                              className="icon-btn danger"
                              onClick={() => { setBlockTarget(item); setBlockType('user') }}
                              title="Block this user"
                              style={{ fontSize: 10, padding: '4px 6px' }}
                            >
                              🚫 User
                            </button>
                          )}
                          {item.blockedUser && (
                            <button
                              className="icon-btn"
                              onClick={() => handleUnblock('user', item._id)}
                              title="Unblock this user"
                              style={{ fontSize: 10, padding: '4px 6px', color: '#4ade80' }}
                            >
                              ✓ User
                            </button>
                          )}
                        </div>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete this log entry"
                          style={{ fontSize: 10, padding: '4px 6px' }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pager">
              <div>Page {page} of {pages}</div>
              <div className="btns">
                <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
                <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Prev</button>
                <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next ›</button>
                <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(pages)}>»</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Block Modal */}
      {blockTarget && (
        <div className="modal-backdrop" onClick={() => !blocking && setBlockTarget(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>🚫 Block {blockType === 'ip' ? 'IP' : 'User'}</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Are you sure you want to block{' '}
              <strong style={{ color: '#e2e8f0' }}>
                {blockType === 'ip' ? blockTarget.ip : blockTarget.username}
              </strong>
              ? This will prevent future logins from this {blockType === 'ip' ? 'IP address' : 'user'}.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setBlockTarget(null)} disabled={blocking}>Cancel</button>
              <button className="btn btn-danger" onClick={handleBlock} disabled={blocking}>
                {blocking ? <><span className="spinner" /> Blocking…</> : `🚫 Block ${blockType === 'ip' ? 'IP' : 'User'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>🗑 Delete Log Entry</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Delete login entry for <strong style={{ color: '#e2e8f0' }}>{deleteTarget.username}</strong>?
              <br />IP: {deleteTarget.ip} · {fmtDate(deleteTarget.loginTime)}
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {deleteAllOpen && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteAllOpen(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>⚠ Delete All Logs</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#e2e8f0' }}>all {total} login log{total !== 1 ? 's' : ''}</strong>?
              They will be moved to the Trash and can be restored later from the Trash section.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteAllOpen(false)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteAll} disabled={deleting}>
                {deleting ? <><span className="spinner" /> Deleting…</> : `🗑 Delete All (${total})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
