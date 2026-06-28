'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

/* ─── Types ─── */

interface AuditItem {
  id: string
  url: string
  domain: string
  overall: 'pass' | 'warn' | 'fail' | 'pending'
  checks: { name: string; status: string }[]
  userName: string
  userEmail: string
  userPhone?: string
  createdAt: string
}

interface Stats {
  total: number
  passCount: number
  warnCount: number
  failCount: number
}

/* ─── Helpers ─── */

function fmtOverall(status: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pass: { label: 'Pass', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    warn: { label: 'Warn', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    fail: { label: 'Fail', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    pending: { label: 'Running…', color: '#7dd3fc', bg: 'rgba(14,165,233,0.1)' },
  }
  return map[status] || { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
}

function fmtDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return date }
}

/* ─── Component ─── */

export default function SeoAuditAdminPage() {
  const router = useRouter()
  const [items, setItems] = useState<AuditItem[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, passCount: 0, warnCount: 0, failCount: 0 })
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'audits' | 'queries'>('audits')
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AuditItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteAllBusy, setDeleteAllBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/seo-audit?${params.toString()}`)
      if (res.status === 401) {
        router.push('/admin/login?next=/admin/seo-audit')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems(data.items || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      if (data.stats) setStats(data.stats)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, router])

  useEffect(() => { load() }, [load])

  function applySearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  async function handleExport() {
    setExportLoading(true)
    try {
      const res = await fetch('/api/admin/seo-audit/export')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seo-audits-${new Date().toISOString().substring(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setExportLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/seo-audit/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Delete failed')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAll() {
    setDeleteAllBusy(true)
    try {
      const res = await fetch('/api/admin/seo-audit?confirm=yes', { method: 'DELETE' })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Bulk delete failed')
      setDeleteAllOpen(false)
      if (data?.message) alert(data.message)
      setPage(1)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeleteAllBusy(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
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
            <h1>🔍 SEO Audit Dashboard</h1>
            <div className="sub">
              {total} total {total === 1 ? 'audit' : 'audits'} · page {page} of {pages}
            </div>
          </div>
          <div className="cell-actions">
            <a className="btn btn-primary" href="/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              🔍 Run new audit
            </a>
            <button className="btn btn-ghost" onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? <span className="spinner" /> : '⬇'} Export Excel
            </button>
            <button className="btn btn-danger" onClick={() => setDeleteAllOpen(true)} disabled={total === 0} suppressHydrationWarning>
              🗑 Delete all ({total})
            </button>
            <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card total">
            <div className="label">Total Audits</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card completed">
            <div className="label">Passed</div>
            <div className="value">{stats.passCount}</div>
          </div>
          <div className="stat-card pending">
            <div className="label">Warnings</div>
            <div className="value">{stats.warnCount}</div>
          </div>
          <div className="stat-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="label" style={{ color: '#fca5a5' }}>Failed</div>
            <div className="value" style={{ color: '#ef4444' }}>{stats.failCount}</div>
          </div>
        </div>

        {/* Search */}
        <form className="toolbar" onSubmit={applySearch}>
          <input
            className="grow"
            placeholder="Search by URL or domain…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setViewMode(viewMode === 'audits' ? 'queries' : 'audits')}
          >
            {viewMode === 'audits' ? '📋 Audit Queries' : '📊 Audit Results'}
          </button>
          {(search || searchInput) && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}>
              Clear
            </button>
          )}
        </form>

        {/* ── View switcher subtitle ── */}
        <div style={{ marginBottom: 8, fontSize: 12, color: '#64748b', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontWeight: viewMode === 'audits' ? 700 : 400, color: viewMode === 'audits' ? '#e2e8f0' : '#64748b' }}>📊 Audit Results</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontWeight: viewMode === 'queries' ? 700 : 400, color: viewMode === 'queries' ? '#e2e8f0' : '#64748b' }}>📋 Audit Queries</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Table ── */}
        <div className="table-wrap">
          {viewMode === 'audits' ? (
            <table className="queries">
              <thead>
                <tr>
                  <th>User</th>
                  <th>URL / Domain</th>
                  <th>Overall</th>
                  <th>Checks</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="empty"><span className="spinner" /> Loading…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="empty">
                    <div className="icon">🔍</div>
                    <div>No audits yet. <a href="/" style={{ color: '#7dd3fc' }}>Run your first audit →</a></div>
                  </td></tr>
                ) : (
                  items.map((item) => {
                    const st = fmtOverall(item.overall)
                    const passCount = item.checks.filter((c) => c.status === 'pass').length
                    const totalChecks = item.checks.length
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{(item.userName && item.userName.trim()) ? item.userName.trim() : '—'}</div>
                          <div style={{ color: '#94a3b8', fontSize: 12 }}>
                            <a href={`mailto:${item.userEmail}`} style={{ color: '#7dd3fc', textDecoration: 'none' }}>
                              {(item.userEmail && item.userEmail.trim()) ? item.userEmail.trim() : '—'}
                            </a>
                          </div>
                          {item.userPhone && item.userPhone.trim() && (
                            <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>
                              📞 {item.userPhone.trim()}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.domain}</div>
                          <div style={{ color: '#94a3b8', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.url}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.color}33`,
                          }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#94a3b8' }}>
                          {passCount}/{totalChecks} passed
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                          {fmtDate(item.createdAt)}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="cell-actions" style={{ flexWrap: 'nowrap' }}>
                            <button
                              className="icon-btn"
                              onClick={() => window.open(`/seo-audit/${item.id}`, '_blank')}
                            >
                              👁 View
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => setDeleteTarget(item)}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="queries">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Website URL</th>
                  <th>Date &amp; Time</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="empty"><span className="spinner" /> Loading queries…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="empty">
                    <div className="icon">📭</div>
                    <div>No user queries yet.</div>
                  </td></tr>
                ) : (
                  items.map((item) => {
                    const st = fmtOverall(item.overall)
                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{(item.userName && item.userName.trim()) ? item.userName.trim() : '—'}</div>
                        </td>
                        <td>
                          <a href={`mailto:${item.userEmail}`} style={{ color: '#7dd3fc', textDecoration: 'none' }}>
                            {(item.userEmail && item.userEmail.trim()) ? item.userEmail.trim() : '—'}
                          </a>
                        </td>
                        <td style={{ color: '#94a3b8' }}>
                          {(item.userPhone && item.userPhone.trim()) ? item.userPhone.trim() : '—'}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{item.domain}</div>
                          <div style={{ color: '#64748b', fontSize: 11 }}>{item.url}</div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                          {fmtDate(item.createdAt)}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.color}33`,
                          }}>
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <div className="cell-actions" style={{ flexWrap: 'nowrap' }}>
                            <button
                              className="icon-btn"
                              onClick={() => window.open(`/seo-audit/${item.id}`, '_blank')}
                            >
                              👁 View
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => setDeleteTarget(item)}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
          <div className="pager">
            <div>Showing {(page - 1) * 20 + (items.length ? 1 : 0)}–{(page - 1) * 20 + items.length} of {total}</div>
            <div className="btns">
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</button>
              <button className="icon-btn" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next ›</button>
              <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(pages)}>»</button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>🗑 Delete audit</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Are you sure you want to delete the audit for <strong style={{ color: '#e2e8f0' }}>{deleteTarget.domain}</strong>?
              {deleteTarget.userName && (
                <> (submitted by <strong style={{ color: '#e2e8f0' }}>{deleteTarget.userName}</strong>)</>
              )}
            </p>
            <div className="cell-actions" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteTarget.id)} disabled={deleting}>
                {deleting ? <span className="spinner" /> : '🗑'} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete All confirmation modal ── */}
      {deleteAllOpen && (
        <div className="modal-backdrop" onClick={() => !deleteAllBusy && setDeleteAllOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>⚠ Delete all audits</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#e2e8f0' }}>all {total} {total === 1 ? 'audit' : 'audits'}</strong>?
              This action cannot be undone.
            </p>
            <div className="cell-actions" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setDeleteAllOpen(false)} disabled={deleteAllBusy}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAll} disabled={deleteAllBusy}>
                {deleteAllBusy ? <span className="spinner" /> : '🗑'} Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
