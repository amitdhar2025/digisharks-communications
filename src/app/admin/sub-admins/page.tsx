'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/Sidebar'
import { adminFetch } from '@/lib/admin-fetch'

/* ─── Types ─── */

interface SubAdminItem {
  _id: string
  username: string
  isActive: boolean
  createdBy: string
  permissions: SubAdminPermissions
  queryCategories: string[]
  lastLoginAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface SubAdminPermissions {
  blog: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  store: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  orders: { view: boolean; edit: boolean; delete: boolean; export: boolean }
  products: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  coupons: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  reports: { view: boolean; export: boolean }
  career: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  chatbot: { view: boolean; manage: boolean; settings: boolean }
  seoAudit: { view: boolean; delete: boolean }
  rss: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  queries: { view: boolean; edit: boolean; delete: boolean; export: boolean }
}

const EMPTY_PERMS: SubAdminPermissions = {
  blog: { view: false, create: false, edit: false, delete: false },
  store: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, edit: false, delete: false, export: false },
  products: { view: false, create: false, edit: false, delete: false },
  coupons: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
  career: { view: false, create: false, edit: false, delete: false },
  chatbot: { view: false, manage: false, settings: false },
  seoAudit: { view: false, delete: false },
  rss: { view: false, create: false, edit: false, delete: false },
  queries: { view: false, edit: false, delete: false, export: false },
}

/* ─── Section Config ─── */

interface SectionConfig {
  key: keyof SubAdminPermissions
  label: string
  icon: string
  actions: { key: string; label: string }[]
}

const SECTIONS: SectionConfig[] = [
  { key: 'store', label: 'Digital Products', icon: '🛒', actions: ['view', 'create', 'edit', 'delete'].map(a => ({ key: a, label: a.charAt(0).toUpperCase() + a.slice(1) })) },
  { key: 'orders', label: 'Orders & Sales', icon: '📦', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }, { key: 'export', label: 'Export' }] },
  { key: 'products', label: 'Manage Products', icon: '🏷️', actions: ['view', 'create', 'edit', 'delete'].map(a => ({ key: a, label: a.charAt(0).toUpperCase() + a.slice(1) })) },
  { key: 'coupons', label: 'Coupons', icon: '🎟️', actions: ['view', 'create', 'edit', 'delete'].map(a => ({ key: a, label: a.charAt(0).toUpperCase() + a.slice(1) })) },
  { key: 'reports', label: 'Sales Reports', icon: '📈', actions: [{ key: 'view', label: 'View' }, { key: 'export', label: 'Export' }] },
  { key: 'blog', label: 'Blog', icon: '📝', actions: ['view', 'create', 'edit', 'delete'].map(a => ({ key: a, label: a.charAt(0).toUpperCase() + a.slice(1) })) },
  { key: 'career', label: 'Career', icon: '💼', actions: ['view', 'create', 'edit', 'delete'].map(a => ({ key: a, label: a.charAt(0).toUpperCase() + a.slice(1) })) },
  { key: 'chatbot', label: 'Chatbot', icon: '🤖', actions: [{ key: 'view', label: 'View' }, { key: 'manage', label: 'Manage Q&A' }, { key: 'settings', label: 'Settings' }] },
  { key: 'seoAudit', label: 'SEO Audit', icon: '🔍', actions: [{ key: 'view', label: 'View' }, { key: 'delete', label: 'Delete' }] },
  { key: 'rss', label: 'RSS Feeds', icon: '📡', actions: ['view', 'create', 'edit', 'delete'].map(a => ({ key: a, label: a.charAt(0).toUpperCase() + a.slice(1) })) },
  { key: 'queries', label: 'Queries', icon: '📋', actions: [{ key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }, { key: 'export', label: 'Export' }] },
]

/* ─── Component ─── */

export default function SubAdminsPage() {
  const router = useRouter()
  const [items, setItems] = useState<SubAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SubAdminItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubAdminItem | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Form state
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formPerms, setFormPerms] = useState<SubAdminPermissions>(EMPTY_PERMS)
  const [bulkAccess, setBulkAccess] = useState<'none' | 'view' | 'full'>('none')

  // Query categories (services this sub-admin is allowed to see)
  const [formCategories, setFormCategories] = useState<string[]>([])
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [newCategoryInput, setNewCategoryInput] = useState('')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subTrashCount, setSubTrashCount] = useState(0)

  useEffect(() => {
    fetch('/api/admin/trash/count?section=sub_admins')
      .then(r => r.json())
      .then(d => { if (d.count !== undefined) setSubTrashCount(d.count) })
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await adminFetch<{ items: SubAdminItem[] }>('/api/admin/sub-admins')
      if (error) throw new Error(error)
      setItems(data?.items || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* Load available services (for the category chip selector) */
  const loadServices = useCallback(async () => {
    const { data } = await adminFetch<{ services: string[] }>('/api/admin/services')
    if (data?.services) setAvailableServices(data.services)
  }, [])

  useEffect(() => { loadServices() }, [loadServices])

  /* Re-sync available services whenever a modal opens, so any new
     services that arrived since the page first loaded are picked up. */
  useEffect(() => {
    if (createOpen || editTarget) loadServices()
  }, [createOpen, editTarget, loadServices])

  /* ── Bulk permission helpers ── */

  function applyBulkAccess(level: 'none' | 'view' | 'full') {
    const newPerms = { ...formPerms }
    for (const section of Object.keys(newPerms) as (keyof SubAdminPermissions)[]) {
      const sectionPerms = { ...newPerms[section] }
      const actionKeys = Object.keys(sectionPerms) as (keyof typeof sectionPerms)[]
      if (level === 'none') {
        actionKeys.forEach(k => { (sectionPerms as any)[k] = false })
      } else if (level === 'view') {
        actionKeys.forEach(k => { (sectionPerms as any)[k] = k === 'view' })
      } else if (level === 'full') {
        actionKeys.forEach(k => { (sectionPerms as any)[k] = true })
      }
      newPerms[section] = sectionPerms as any
    }
    setFormPerms(newPerms)
    setBulkAccess(level)
  }

  function togglePerm(section: keyof SubAdminPermissions, action: string) {
    setFormPerms(prev => {
      const next = { ...prev }
      const sectionPerms = { ...next[section] }
      ;(sectionPerms as any)[action] = !(sectionPerms as any)[action]
      next[section] = sectionPerms as any
      return next
    })
    setBulkAccess('none')
  }

  /* ── Open create modal ── */

  function openCreate() {
    setFormUsername('')
    setFormPassword('')
    setFormActive(true)
    setFormPerms(EMPTY_PERMS)
    setBulkAccess('none')
    setFormCategories([])
    setNewCategoryInput('')
    setCreateOpen(true)
  }

  function openEdit(item: SubAdminItem) {
    setEditTarget(item)
    setFormUsername(item.username)
    setFormPassword('')
    setFormActive(item.isActive)
    setFormPerms({ ...EMPTY_PERMS, ...item.permissions })
    setBulkAccess('none')
    setFormCategories(Array.isArray(item.queryCategories) ? [...item.queryCategories] : [])
    setNewCategoryInput('')
  }

  /* ── Categories chip helpers ── */

  function toggleCategory(cat: string) {
    setFormCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  function addCustomCategory() {
    const v = newCategoryInput.trim()
    if (!v) return
    if (!formCategories.includes(v)) {
      setFormCategories((prev) => [...prev, v])
    }
    if (!availableServices.includes(v)) {
      setAvailableServices((prev) => [...prev, v].sort((a, b) => a.localeCompare(b)))
    }
    setNewCategoryInput('')
  }

  /* ── Create ── */

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!formUsername.trim()) { setError('Username is required'); return }
    if (!formPassword || formPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setBusy(true)
    setError(null)
    try {
      const { data, error } = await adminFetch('/api/admin/sub-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formUsername.trim(),
          password: formPassword,
          permissions: formPerms,
          queryCategories: formCategories,
        }),
      })
      if (error) throw new Error(error)
      setCreateOpen(false)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  /* ── Edit ── */

  async function handleEdit(e: FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    if (!formUsername.trim()) { setError('Username is required'); return }
    setBusy(true)
    setError(null)
    try {
      const body: any = {
        username: formUsername.trim(),
        isActive: formActive,
        permissions: formPerms,
        queryCategories: formCategories,
      }
      if (formPassword) body.password = formPassword

      const { data, error } = await adminFetch(`/api/admin/sub-admins/${editTarget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (error) throw new Error(error)
      setEditTarget(null)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  /* ── Delete ── */

  async function handleDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      const { error } = await adminFetch(`/api/admin/sub-admins/${deleteTarget._id}`, {
        method: 'DELETE',
      })
      if (error) throw new Error(error)
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  /* ── Delete All ── */

  async function handleDeleteAll() {
    setBusy(true)
    try {
      const { error } = await adminFetch('/api/admin/sub-admins?confirm=yes', {
        method: 'DELETE',
      })
      if (error) throw new Error(error)
      setDeleteAllOpen(false)
      setItems([])
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  /* ── Category chip selector (reusable) ── */

  function renderCategoryChips() {
    // Distinct list: from available services plus anything already selected
    const allCats = Array.from(new Set([...availableServices, ...formCategories])).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    )

    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
          🏷 Categories visible to this sub-admin
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px' }}>
          Pick the contact-form services this sub-admin can see in the Queries dashboard.
          If none are selected, they will see nothing — even if they have view permission.
        </p>

        {/* Selected chips */}
        {formCategories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {formCategories.map((cat) => (
              <span
                key={cat}
                className="badge"
                style={{
                  background: 'rgba(14,165,233,0.18)',
                  color: '#7dd3fc',
                  padding: '5px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid rgba(14,165,233,0.35)',
                }}
              >
                {cat}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label={`Remove ${cat}`}
                  title={`Remove ${cat}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add via dropdown */}
        <div className="cell-actions" style={{ marginBottom: 10 }}>
          <select
            value=""
            onChange={(e) => {
              const v = e.target.value
              if (v) toggleCategory(v)
            }}
            style={{
              background: '#0b1220',
              border: '1px solid #1e293b',
              color: '#e2e8f0',
              padding: '8px 10px',
              borderRadius: 8,
              fontSize: 13,
              flex: 1,
              minWidth: 180,
            }}
          >
            <option value="">+ Add existing category…</option>
            {allCats
              .filter((c) => !formCategories.includes(c))
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        {/* Add custom */}
        <div className="cell-actions" style={{ gap: 6 }}>
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            placeholder="…or add a custom category"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomCategory()
              }
            }}
            style={{
              flex: 1,
              background: '#0b1220',
              border: '1px solid #1e293b',
              color: '#e2e8f0',
              padding: '8px 10px',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={addCustomCategory}
            disabled={!newCategoryInput.trim()}
            style={{ fontSize: 12 }}
          >
            ＋ Add
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#64748b', marginTop: 10 }}>
          {formCategories.length === 0
            ? '⚠ No categories selected — sub-admin will have zero access to the Queries dashboard.'
            : `✓ ${formCategories.length} category${formCategories.length === 1 ? '' : 's'} selected.`}
        </div>
      </div>
    )
  }

  /* ── Permission grid (reusable) ── */

  function renderPermissionsGrid(perms: SubAdminPermissions, editable: boolean) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {SECTIONS.map((section) => {
          const sectionPerms = perms[section.key] ?? ({} as SubAdminPermissions[keyof SubAdminPermissions])
          return (
            <div
              key={section.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px repeat(auto-fit, minmax(60px, 1fr))',
                gap: 4,
                padding: '6px 0',
                borderBottom: '1px solid #1e293b',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>
                {section.icon} {section.label}
              </div>
              {section.actions.map((action) => {
                const value = (sectionPerms as any)[action.key] === true
                return editable ? (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => togglePerm(section.key, action.key)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: value ? 'rgba(34,197,94,0.3)' : '#1e293b',
                      background: value ? 'rgba(34,197,94,0.1)' : 'transparent',
                      color: value ? '#4ade80' : '#64748b',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'all 0.1s',
                    }}
                    title={`Toggle ${action.label}`}
                  >
                    {value ? '✓' : '✕'} {action.label}
                  </button>
                ) : (
                  <div
                    key={action.key}
                    style={{
                      fontSize: 11,
                      color: value ? '#4ade80' : '#475569',
                      fontWeight: value ? 600 : 400,
                      padding: '4px 6px',
                    }}
                  >
                    {value ? '✓' : '—'} {action.label}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  /* ── Render ── */

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
            <h1>👥 Sub-Admin Management</h1>
            <div className="sub">Create and manage sub-admin accounts with granular permissions</div>
          </div>
          <div className="cell-actions">
            <button className="btn btn-primary" onClick={openCreate}>＋ Create Sub-Admin</button>
            {items.length > 0 && (
              <button className="btn btn-danger" onClick={() => setDeleteAllOpen(true)}>
                🗑 Delete All ({items.length})
              </button>
            )}
            <Link href="/admin/trash?section=sub_admins" className="btn btn-ghost" style={{ color: subTrashCount > 0 ? '#fbbf24' : undefined }}>
              🗑 Trash{subTrashCount > 0 ? ` (${subTrashCount})` : ''}
            </Link>
            <button className="btn btn-ghost" onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="table-wrap">
          {loading ? (
            <div className="empty"><span className="spinner" /> Loading sub-admins…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="icon">👥</div>
              <p>No sub-admins yet. Create your first one!</p>
            </div>
          ) : (
            <table className="queries">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Last Login</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.username}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${item.isActive ? 'status-completed' : 'status-pending'}`}>
                        <span className="dot" />
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{item.createdBy}</td>
                    <td style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : 'Never'}
                    </td>
                    <td style={{ maxWidth: 300 }}>
                      <details>
                        <summary style={{ cursor: 'pointer', color: '#7dd3fc', fontSize: 12 }}>
                          View permissions
                        </summary>
                        <div style={{ marginTop: 8 }}>
                          {renderPermissionsGrid(item.permissions, false)}
                        </div>
                      </details>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button className="icon-btn" onClick={() => openEdit(item)}>✏ Edit</button>
                        <button className="icon-btn danger" onClick={() => setDeleteTarget(item)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Create Modal ── */}
      {createOpen && (
        <div className="modal-backdrop" onClick={() => !busy && setCreateOpen(false)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <h2>＋ Create Sub-Admin</h2>
            <div className="modal-sub">Set up a new sub-admin account with custom permissions</div>
            <form onSubmit={handleCreate} autoComplete="off">
              {/* Hidden dummy fields to confuse browser password manager */}
              <input
                type="text"
                style={{ position: 'absolute', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                aria-hidden="true"
                data-form-type="other"
                data-lpignore="true"
              />
              <input
                type="password"
                style={{ position: 'absolute', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                aria-hidden="true"
                data-form-type="other"
                data-lpignore="true"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="field">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. editor1"
                    required
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                <div className="field">
                  <label>Password * (min 6 chars)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    data-form-type="other"
                    data-lpignore="true"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, marginTop: 8 }}>
                🔐 Permissions
              </div>

              <div className="cell-actions" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className={`btn ${bulkAccess === 'none' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => applyBulkAccess('none')}
                  style={{ fontSize: 12 }}
                >
                  No access
                </button>
                <button
                  type="button"
                  className={`btn ${bulkAccess === 'view' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => applyBulkAccess('view')}
                  style={{ fontSize: 12 }}
                >
                  View only
                </button>
                <button
                  type="button"
                  className={`btn ${bulkAccess === 'full' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => applyBulkAccess('full')}
                  style={{ fontSize: 12 }}
                >
                  Full access
                </button>
              </div>

              {renderPermissionsGrid(formPerms, true)}

              {renderCategoryChips()}

              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => setCreateOpen(false)} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? <><span className="spinner" /> Creating…</> : 'Create Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div className="modal-backdrop" onClick={() => !busy && setEditTarget(null)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <h2>✏ Edit Sub-Admin</h2>
            <div className="modal-sub">Update account details and permissions</div>
            <form onSubmit={handleEdit} autoComplete="off">
              {/* Hidden dummy fields to confuse browser password manager */}
              <input
                type="text"
                style={{ position: 'absolute', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                aria-hidden="true"
                data-form-type="other"
                data-lpignore="true"
              />
              <input
                type="password"
                style={{ position: 'absolute', top: -9999, left: -9999, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                aria-hidden="true"
                data-form-type="other"
                data-lpignore="true"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="field">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                    autoComplete="off"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                <div className="field">
                  <label>New password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    minLength={6}
                    autoComplete="new-password"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    style={{ accentColor: '#0ea5e9', width: 18, height: 18 }}
                  />
                  Account Active
                </label>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>
                🔐 Permissions
              </div>

              <div className="cell-actions" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className={`btn ${bulkAccess === 'none' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => applyBulkAccess('none')}
                  style={{ fontSize: 12 }}
                >
                  No access
                </button>
                <button
                  type="button"
                  className={`btn ${bulkAccess === 'view' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => applyBulkAccess('view')}
                  style={{ fontSize: 12 }}
                >
                  View only
                </button>
                <button
                  type="button"
                  className={`btn ${bulkAccess === 'full' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => applyBulkAccess('full')}
                  style={{ fontSize: 12 }}
                >
                  Full access
                </button>
              </div>

              {renderPermissionsGrid(formPerms, true)}

              {renderCategoryChips()}

              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => setEditTarget(null)} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete All Confirmation Modal ── */}
      {deleteAllOpen && (
        <div className="modal-backdrop" onClick={() => !busy && setDeleteAllOpen(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>⚠ Delete All Sub-Admins</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#e2e8f0' }}>all {items.length} sub-admin{items.length !== 1 ? 's' : ''}</strong>?
              They will be moved to the Trash and can be restored later from the Trash section.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteAllOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAll} disabled={busy}>
                {busy ? <><span className="spinner" /> Deleting…</> : `🗑 Delete All (${items.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Single Delete Modal ── */}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 440 }}>
            <h2 style={{ color: '#fca5a5' }}>🗑 Delete Sub-Admin</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#e2e8f0' }}>{deleteTarget.username}</strong>?
              They will be moved to the Trash and can be restored later from the Trash section.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
                {busy ? <><span className="spinner" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
