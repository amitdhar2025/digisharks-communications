'use client'

import { Suspense, useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import { adminFetch, adminFetchOrThrow } from '@/lib/admin-fetch'

/* ─── Types ────────────────────────────────────────────── */

interface TrashItem {
  _id: string
  collectionName: string
  sectionLabel: string
  originalId: string
  title: string
  deletedBy: { username: string; role: string }
  deletedAt: string
  restoredAt: string | null
  restoredBy: { username: string; role: string } | null
  retentionDays?: number
  remainingDays?: number
}

interface TrashCounts {
  total: number
  bySection: Record<string, number>
}

interface TrashSettings {
  globalRetentionDays: number
  perSectionRetentionDays: Record<string, number>
}

/* ─── Section Config ──────────────────────────────────── */

const SECTION_OPTIONS = [
  { value: 'all', label: 'All Sections' },
  { value: 'queries', label: '📋 Contact Queries' },
  { value: 'orders', label: '🛒 Digital Products / Orders' },
  { value: 'blogposts', label: '📝 Blog Posts' },
  { value: 'rss', label: '📡 RSS Feeds' },
  { value: 'careerjobs', label: '💼 Career / Jobs' },
  { value: 'careerapplications', label: '📩 Job Applications' },
  { value: 'subadmins', label: '👥 Sub-Admins' },
  { value: 'seoaudits', label: '🔍 SEO Audits' },
  { value: 'chatbotqa', label: '🤖 Chatbot Q&A' },
  { value: 'loginlogs', label: '📋 Login Logs' },
  { value: 'securityattacks', label: '🛡️ Security Attacks' },
]

const RETENTION_PRESETS = [15, 30, 45, 60, 90]

/* ─── Helpers ──────────────────────────────────────────── */

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ─── Component ────────────────────────────────────────── */

export default function TrashPageWrapper() {
  return (
    <Suspense fallback={<div className="empty"><span className="spinner" /> Loading Trash…</div>}>
      <TrashPage />
    </Suspense>
  )
}

function TrashPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [items, setItems] = useState<TrashItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Filters
  const searchParams = useSearchParams()
  const [sectionFilter, setSectionFilter] = useState(searchParams?.get('section') || 'all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // Actions
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmPermanentId, setConfirmPermanentId] = useState<string | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  // Counts
  const [counts, setCounts] = useState<TrashCounts | null>(null)

  // Settings
  const [settings, setSettings] = useState<TrashSettings | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [globalRetention, setGlobalRetention] = useState(30)
  const [customGlobalInput, setCustomGlobalInput] = useState('')
  const [sectionRetention, setSectionRetention] = useState<Record<string, number>>({})
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Check admin role
  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setIsSuperAdmin(d?.role === 'admin')
    }).catch(() => {})
  }, [])

  // Escape key closes any open modal or overlay
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
if (confirmBulkDelete) { setConfirmBulkDelete(false); return }
      if (confirmPermanentId) { setConfirmPermanentId(null); return }
      if (showSettings) { setShowSettings(false); return }
      if (sidebarOpen) { setSidebarOpen(false); return }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmBulkDelete, confirmPermanentId, showSettings, sidebarOpen])

  const loadCounts = useCallback(async () => {
    const { data } = await adminFetch<TrashCounts>('/api/admin/trash/count')
    if (data) setCounts(data)
  }, [])

  const loadSettings = useCallback(async () => {
    const { data } = await adminFetch<{ settings: TrashSettings }>('/api/admin/trash/settings')
    if (data?.settings) {
      setSettings(data.settings)
      setGlobalRetention(data.settings.globalRetentionDays)
      setSectionRetention(data.settings.perSectionRetentionDays)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (sectionFilter !== 'all') params.set('section', sectionFilter)
      if (search) params.set('search', search)

      const { data, error } = await adminFetch<{
        items: TrashItem[]
        total: number
        pages: number
        page: number
        settings: TrashSettings
      }>(`/api/admin/trash?${params}`)
      if (error) throw new Error(error)
      setItems(data?.items || [])
      setTotal(data?.total || 0)
      setPages(data?.pages || 1)
      if (data?.settings) {
        setSettings(data.settings)
        setGlobalRetention(data.settings.globalRetentionDays)
        setSectionRetention(data.settings.perSectionRetentionDays)
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load trash')
    } finally {
      setLoading(false)
    }
  }, [page, sectionFilter, search])

  useEffect(() => { load(); loadCounts(); loadSettings() }, [load, loadCounts, loadSettings])

  function applySearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  /* ── Restore (optimistic) ── */

  async function handleRestore(trashId: string) {
    // Capture section BEFORE optimistic removal
    const section = items.find(i => i._id === trashId)?.collectionName
    // Optimistic: remove from list immediately
    setItems(prev => prev.filter(i => i._id !== trashId))
    setTotal(prev => Math.max(0, prev - 1))
    setBusyId(trashId)
    try {
      const { data } = await adminFetchOrThrow(`/api/admin/trash/${trashId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      })
      setToast({ kind: 'success', text: data?.message || 'Item restored successfully!' })
      loadCounts()
    } catch (e: any) {
      // Rollback: reload to restore the item back
      load()
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBusyId(null)
    }
  }

  /* ── Bulk Select ── */

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i._id)))
    }
  }

  /* ── Bulk Restore ── */

  async function handleBulkRestore() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setBulkBusy(true)
    try {
      const { data } = await adminFetchOrThrow('/api/admin/trash/restore-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      setToast({ kind: 'success', text: data?.message || `${data?.success || ids.length} item(s) restored.` })
      setSelectedIds(new Set())
      load()
      loadCounts()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBulkBusy(false)
    }
  }

  /* ── Bulk Permanent Delete ── */

  async function handleBulkPermanentDelete() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setConfirmBulkDelete(false)
    setBulkBusy(true)
    try {
      const { data } = await adminFetchOrThrow('/api/admin/trash/permanent-bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      setToast({ kind: 'success', text: data?.message || `${data?.success || ids.length} item(s) permanently deleted.` })
      setSelectedIds(new Set())
      load()
      loadCounts()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBulkBusy(false)
    }
  }

  /* ── Permanent Delete (optimistic) ── */

  async function handlePermanentDelete(trashId: string) {
    // Capture section BEFORE optimistic removal
    const section = items.find(i => i._id === trashId)?.collectionName
    // Optimistic: remove from list immediately
    setItems(prev => prev.filter(i => i._id !== trashId))
    setTotal(prev => Math.max(0, prev - 1))
    setBusyId(trashId)
    setConfirmPermanentId(null)
    try {
      const { data } = await adminFetchOrThrow(`/api/admin/trash/${trashId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      })
      setToast({ kind: 'success', text: data?.message || 'Item permanently deleted.' })
      loadCounts()
    } catch (e: any) {
      // Rollback: reload to restore the item back
      load()
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBusyId(null)
    }
  }

  /* ── Save Settings ── */

  async function handleSaveSettings() {
    setSavingSettings(true)
    try {
      // Parse custom input if provided
      let effectiveGlobal = globalRetention
      if (customGlobalInput.trim()) {
        const parsed = parseInt(customGlobalInput.trim(), 10)
        if (isNaN(parsed) || parsed < 1 || parsed > 365) {
          setToast({ kind: 'error', text: 'Custom retention must be between 1 and 365 days.' })
          return
        }
        effectiveGlobal = parsed
      }

      const perSection: Record<string, number> = {}
      // Only include sections that have been customized
      for (const section of SECTION_OPTIONS) {
        if (section.value === 'all') continue
        const key = `${section.value}_retention`
        const inputEl = document.getElementById(key) as HTMLSelectElement | null
        if (inputEl) {
          const val = parseInt(inputEl.value, 10)
          if (val > 0 && val !== effectiveGlobal) {
            perSection[section.value] = val
          }
        }
      }

      const { data, error } = await adminFetch('/api/admin/trash/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          globalRetentionDays: effectiveGlobal,
          perSectionRetentionDays: perSection,
        }),
      })
      if (error) throw new Error(error)
      setToast({ kind: 'success', text: data?.message || 'Settings saved.' })
      setShowSettings(false)
      load()
      loadSettings()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setSavingSettings(false)
    }
  }

  /* ── Countdown helper ── */

  function renderCountdown(item: TrashItem) {
    if (item.remainingDays === undefined || item.retentionDays === undefined) return <span style={{ color: '#64748b', fontSize: 12 }}>—</span>
    if (item.remainingDays <= 0) return <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>⚠ Auto-deleting</span>
    if (item.remainingDays <= 3) return <span style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>{item.remainingDays}d left</span>
    if (item.remainingDays <= 14) return <span style={{ color: '#fbbf24', fontSize: 12 }}>{item.remainingDays}d left</span>
    return <span style={{ color: '#64748b', fontSize: 12 }}>{item.remainingDays}d</span>
  }

  return (
    <div className="admin-layout">
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {toast && (
          <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
            {toast.text}
          </div>
        )}

        <div className="admin-topbar">
          <div>
            <h1>🗑 Trash / Recycle Bin</h1>
            <div className="sub">
              {total} {total === 1 ? 'item' : 'items'} in trash · page {page} of {pages}
              {settings && <span style={{ marginLeft: 8, color: '#475569' }}>· Auto-delete after {settings.globalRetentionDays}d</span>}
            </div>
          </div>
          <div className="cell-actions">
            {isSuperAdmin && (
              <button className="btn btn-ghost" onClick={() => setShowSettings(!showSettings)}>
                ⚙ Retention Settings
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => { load(); loadCounts() }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        {showSettings && isSuperAdmin && (
          <div style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14,
            padding: 24, marginBottom: 18,
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, color: '#e2e8f0' }}>⚙ Auto-Delete Retention Settings</h2>

            {/* Global retention */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                Global Retention Period
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px' }}>
                Items in trash are automatically permanently deleted after this many days. Applies to all sections unless overridden below.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {RETENTION_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn ${globalRetention === d && !customGlobalInput.trim() ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setGlobalRetention(d); setCustomGlobalInput('') }}
                    style={{ fontSize: 13, padding: '6px 14px' }}
                  >
                    {d} days
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>or</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Custom days"
                    value={customGlobalInput}
                    onChange={(e) => { setCustomGlobalInput(e.target.value); if (e.target.value) setGlobalRetention(parseInt(e.target.value) || 30) }}
                    style={{
                      width: 100, background: '#0b1220', border: '1px solid #1e293b',
                      color: '#e2e8f0', padding: '6px 10px', borderRadius: 8, fontSize: 13,
                    }}
                  />
                  <span style={{ color: '#64748b', fontSize: 12 }}>days</span>
                </div>
              </div>
            </div>

            {/* Per-section overrides */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                Per-Section Overrides <span style={{ color: '#64748b', fontWeight: 400, fontSize: 12 }}>(optional — leave as global to use default)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {SECTION_OPTIONS.filter(s => s.value !== 'all').map((section) => (
                  <div key={section.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#cbd5e1', minWidth: 80 }}>{section.label.split(' ').slice(1).join(' ')}</span>
                    <select
                      id={`${section.value}_retention`}
                      defaultValue={sectionRetention[section.value] || globalRetention}
                      style={{
                        background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
                        padding: '4px 6px', borderRadius: 6, fontSize: 12, flex: 1,
                      }}
                    >
                      <option value={globalRetention}>Global ({globalRetention}d)</option>
                      {RETENTION_PRESETS.map((d) => (
                        <option key={d} value={d}>{d} days</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSettings} disabled={savingSettings}>
                {savingSettings ? <span className="spinner" /> : null} 💾 Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Section filter tabs */}
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <select
            value={sectionFilter}
            onChange={(e) => { setSectionFilter(e.target.value); setPage(1) }}
            style={{
              background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
              padding: '8px 10px', borderRadius: 8, fontSize: 13,
            }}
          >
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}{counts?.bySection[opt.value] ? ` (${counts.bySection[opt.value]})` : ''}
              </option>
            ))}
          </select>

          <form onSubmit={applySearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              className="grow"
              placeholder="Search trash items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0',
                padding: '8px 10px', borderRadius: 8, fontSize: 13, width: '100%',
              }}
            />
            <button className="btn btn-ghost" type="submit">Search</button>
          </form>

        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Bulk actions toolbar */}
        {selectedIds.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)',
            borderRadius: 10, marginBottom: 14,
          }}>
            <span style={{ fontSize: 13, color: '#7dd3fc', fontWeight: 600 }}>
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              className="btn btn-ghost"
              onClick={handleBulkRestore}
              disabled={bulkBusy}
              style={{ fontSize: 13 }}
            >
              {bulkBusy ? <span className="spinner" /> : null} ♻ Restore Selected
            </button>
            {isSuperAdmin && (
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmBulkDelete(true)}
                disabled={bulkBusy}
                style={{ fontSize: 13, color: '#fca5a5' }}
              >
                🗑 Delete Selected Forever
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => setSelectedIds(new Set())}
              style={{ fontSize: 13, marginLeft: 'auto' }}
            >
              ✕ Clear Selection
            </button>
          </div>
        )}

        {/* Trash items table */}
        <div className="table-wrap">
          {loading ? (
            <div className="empty"><span className="spinner" /> Loading trash items…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="icon">🗑</div>
              <p>Trash is empty. Deleted items will appear here.</p>
            </div>
          ) : (
            <table className="queries">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Item</th>
                  <th>Source Section</th>
                  <th>Deleted By</th>
                  <th>Deleted On</th>
                  <th>Auto-Deletes In</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} style={selectedIds.has(item._id) ? { background: 'rgba(14,165,233,0.06)' } : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item._id)}
                        onChange={() => toggleSelect(item._id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        ID: {item.originalId.substring(0, 16)}…
                      </div>
                    </td>
                    <td>
                      <span className="badge">{item.sectionLabel}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.deletedBy?.username || '—'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {item.deletedBy?.role === 'admin' ? 'Super Admin' : 'Sub-Admin'}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                      {fmtDate(item.deletedAt)}
                    </td>
                    <td>
                      {renderCountdown(item)}
                      {item.retentionDays && item.retentionDays > 0 && (
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>
                          ({item.retentionDays}d retention)
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="status-pill status-pending">
                        <span className="dot" /> In Trash
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleRestore(item._id)}
                          disabled={busyId === item._id}
                          title="Restore this item"
                        >
                          {busyId === item._id ? <span className="spinner" /> : '♻'} Restore
                        </button>
                        {confirmPermanentId === item._id ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <button
                              className="icon-btn danger"
                              onClick={() => handlePermanentDelete(item._id)}
                              disabled={busyId === item._id}
                              style={{ fontWeight: 700, color: '#ef4444' }}
                            >
                              {busyId === item._id ? <span className="spinner" /> : '⚠'} Confirm?
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => setConfirmPermanentId(null)}
                              style={{ fontSize: 11 }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="icon-btn danger"
                            onClick={() => setConfirmPermanentId(item._id)}
                            title="Permanently delete (cannot be undone)"
                            disabled={busyId === item._id}
                          >
                            🗑 Delete Forever
                          </button>
                        )}
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
              <div>Page {page} of {pages} · {total} items</div>
              <div className="btns">
                <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
                <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Prev</button>
                <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next ›</button>
                <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(pages)}>»</button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk delete confirmation modal */}
        {confirmBulkDelete && (
          <div className="modal-backdrop" onClick={() => setConfirmBulkDelete(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <h2 style={{ color: '#fca5a5' }}>⚠️ Delete {selectedIds.size} Item(s) Forever</h2>
              <p className="modal-sub">
                This will <strong>permanently delete</strong> {selectedIds.size} item(s). This action <strong>cannot be undone</strong>.
              </p>
              <div className="row">
                <button className="btn btn-ghost" onClick={() => setConfirmBulkDelete(false)} disabled={bulkBusy}>Cancel</button>
                <button
                  className="btn btn-danger"
                  onClick={handleBulkPermanentDelete}
                  disabled={bulkBusy}
                  style={{ background: '#dc2626', color: '#fff' }}
                >
                  {bulkBusy ? <span className="spinner" /> : null} ⚠ Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info note */}
        {items.length > 0 && settings && (
          <div style={{
            marginTop: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10,
            fontSize: 13, color: '#94a3b8', lineHeight: 1.6,
          }}>
            <strong style={{ color: '#fbbf24' }}>ℹ️ Note:</strong> Items restored from trash are re-inserted with their original data.
            Items are automatically permanently deleted after{' '}
            <strong style={{ color: '#e2e8f0' }}>{settings.globalRetentionDays} days</strong>
            {Object.keys(settings.perSectionRetentionDays).length > 0 && (
              <> (some sections have custom retention periods)</>
            )}.
            Adjust this in <strong style={{ color: '#7dd3fc', cursor: 'pointer' }} onClick={() => setShowSettings(true)}>Retention Settings</strong>.
          </div>
        )}
      </main>
    </div>
  )
}
