'use client'

import { useEffect, useMemo, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import {
  QueryItem,
  Status,
  STATUS_OPTIONS,
  statusClass,
  statusLabel,
  fmtDate,
} from '@/components/admin/types'
import ViewModal from '@/components/admin/ViewModal'
import EditModal from '@/components/admin/EditModal'
import CreateModal from '@/components/admin/CreateModal'
import DeleteModal from '@/components/admin/DeleteModal'
import DeleteAllModal from '@/components/admin/DeleteAllModal'

export default function QueriesPage() {
  const router = useRouter()
  const [items, setItems] = useState<QueryItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const limit = 20
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')

  // Modals
  const [viewItem, setViewItem] = useState<QueryItem | null>(null)
  const [editItem, setEditItem] = useState<QueryItem | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<QueryItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Bulk delete ("delete all" matching the current filter)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteAllBusy, setDeleteAllBusy] = useState(false)

  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) setUsername(d.username)
      })
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/queries?${params.toString()}`)
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems(data.items)
      setTotal(data.total)
      setPages(data.pages || 1)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search, router])

  useEffect(() => {
    load()
  }, [load])

  function applySearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  async function changeStatus(id: string, status: Status) {
    try {
      const res = await fetch(`/api/admin/queries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed')
      const data = await res.json()
      setItems((prev) => prev.map((q) => (q.id === id ? data.item : q)))
      if (viewItem?.id === id) setViewItem(data.item)
      if (editItem?.id === id) setEditItem(data.item)
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/queries/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const deleteAllScopeLabel = useMemo(() => {
    const parts: string[] = []
    if (statusFilter !== 'all') parts.push(`status = ${statusFilter}`)
    if (search) parts.push(`search "${search}"`)
    if (parts.length === 0) return 'across all statuses and searches'
    return `matching ${parts.join(' and ')}`
  }, [statusFilter, search])

  async function handleDeleteAll() {
    setDeleteAllBusy(true)
    try {
      const params = new URLSearchParams()
      params.set('confirm', 'yes')
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/queries?${params.toString()}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Bulk delete failed')
      setDeleteAllOpen(false)
      setPage(1)
      if (data?.message) {
        setError(null)
        alert(data.message)
      }
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeleteAllBusy(false)
    }
  }

  function handleExportAll() {
    setExportLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    fetch(`/api/admin/export?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Export failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `queries-${new Date().toISOString().substring(0, 10)}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      })
      .catch((e) => alert(e.message))
      .finally(() => setExportLoading(false))
  }

  function handleExportOne(id: string) {
    fetch(`/api/admin/export?id=${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Export failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `query-${id}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      })
      .catch((e) => alert(e.message))
  }

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((q) => q.status === 'pending').length,
      completed: items.filter((q) => q.status === 'completed').length,
      followup: items.filter((q) => q.status === 'follow-up').length,
    }
  }, [items])

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
            <h1>Contact Queries</h1>
            <div className="sub">
              {total} total {total === 1 ? 'record' : 'records'} · page {page} of {pages}
            </div>
          </div>
          <div className="cell-actions">
            <button
              className="btn btn-ghost"
              onClick={handleExportAll}
              disabled={exportLoading}
            >
              {exportLoading ? <span className="spinner" /> : '⬇'} Export all (.xlsx)
            </button>
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-danger"
                onClick={() => setDeleteAllOpen(true)}
                disabled={total === 0}
                title={
                  total === 0
                    ? 'No queries to delete'
                    : `Delete all ${total} ${total === 1 ? 'query' : 'queries'} matching the current filter`
                }
              >
                🗑 Delete all ({total})
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              ＋ New query
            </button>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card total">
            <div className="label">Total (this view)</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card pending">
            <div className="label">Pending</div>
            <div className="value">{stats.pending}</div>
          </div>
          <div className="stat-card followup">
            <div className="label">Follow-up</div>
            <div className="value">{stats.followup}</div>
          </div>
          <div className="stat-card completed">
            <div className="label">Completed</div>
            <div className="value">{stats.completed}</div>
          </div>
        </div>

        <form className="toolbar" onSubmit={applySearch}>
          <input
            className="grow"
            placeholder="Search by name, email, phone, service, message…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | Status)
              setPage(1)
            }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="follow-up">Follow-up</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn btn-primary" type="submit">
            Search
          </button>
          {(search || statusFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setStatusFilter('all')
                setPage(1)
              }}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={load}
            title="Refresh"
          >
            ↻ Refresh
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="table-wrap">
          <table className="queries">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="empty">
                    <span className="spinner" /> Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    <div className="icon">📭</div>
                    <div>No queries found</div>
                  </td>
                </tr>
              ) : (
                items.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{q.fullName}</div>
                      <div
                        style={{
                          color: '#94a3b8',
                          fontSize: 12,
                          marginTop: 2,
                          maxWidth: 280,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={q.message}
                      >
                        {q.message}
                      </div>
                    </td>
                    <td>
                      <a
                        href={`mailto:${q.email}`}
                        style={{ color: '#7dd3fc', textDecoration: 'none' }}
                      >
                        {q.email}
                      </a>
                    </td>
                    <td>{q.phone || '—'}</td>
                    <td>{q.service}</td>
                    <td>
                      <select
                        className={`status-pill ${statusClass(q.status)}`}
                        value={q.status}
                        onChange={(e) =>
                          changeStatus(q.id, e.target.value as Status)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="badge">💬 {q.comments?.length || 0}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                      {fmtDate(q.createdAt)}
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button
                          className="icon-btn"
                          onClick={() => setViewItem(q)}
                          title="View"
                        >
                          👁 View
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => setEditItem(q)}
                          title="Edit"
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleExportOne(q.id)}
                          title="Download as Excel"
                        >
                          ⬇ Excel
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleteTarget(q)}
                          title="Delete"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pager">
            <div>
              Showing {(page - 1) * limit + (items.length ? 1 : 0)}–
              {(page - 1) * limit + items.length} of {total}
            </div>
            <div className="btns">
              <button
                className="icon-btn"
                disabled={page <= 1}
                onClick={() => setPage(1)}
              >
                «
              </button>
              <button
                className="icon-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹ Prev
              </button>
              <button
                className="icon-btn"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next ›
              </button>
              <button
                className="icon-btn"
                disabled={page >= pages}
                onClick={() => setPage(pages)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </main>

      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onChangeStatus={(s) => changeStatus(viewItem.id, s)}
          onUpdate={(it) => {
            setViewItem(it)
            setItems((prev) => prev.map((q) => (q.id === it.id ? it : q)))
          }}
        />
      )}

      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={(it) => {
            setEditItem(null)
            setItems((prev) => prev.map((q) => (q.id === it.id ? it : q)))
            load()
          }}
        />
      )}

      {createOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false)
            load()
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          busy={deleting}
        />
      )}

      {deleteAllOpen && (
        <DeleteAllModal
          count={total}
          scopeLabel={deleteAllScopeLabel}
          onClose={() => (deleteAllBusy ? null : setDeleteAllOpen(false))}
          onConfirm={handleDeleteAll}
          busy={deleteAllBusy}
        />
      )}
    </div>
  )
}
