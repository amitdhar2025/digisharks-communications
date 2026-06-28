'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import toast, { Toaster } from 'react-hot-toast'

interface QAItem {
  _id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  hitCount: number
  createdAt: string
}

export default function QnaManagerPage() {
  const router = useRouter()
  const [items, setItems] = useState<QAItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const limit = 20
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Modal state
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<QAItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QAItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Form state for add/edit
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/chatbot/qna?${params.toString()}`)
      if (res.status === 401) { router.push('/admin/login'); return }
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

  useEffect(() => { load() }, [load])

  function applySearch(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  async function toggleActive(item: QAItem) {
    try {
      const res = await fetch(`/api/chatbot/qna/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed')
      toast.success(item.isActive ? 'Disabled' : 'Enabled')
      load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!formQuestion.trim() || !formAnswer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setFormSaving(true)
    try {
      const res = await fetch('/api/chatbot/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: formQuestion, answer: formAnswer, category: formCategory }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      toast.success('Q&A added')
      setAddOpen(false)
      setFormQuestion('')
      setFormAnswer('')
      setFormCategory('')
      load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setFormSaving(false)
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault()
    if (!editItem || !formQuestion.trim() || !formAnswer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setFormSaving(true)
    try {
      const res = await fetch(`/api/chatbot/qna/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: formQuestion, answer: formAnswer, category: formCategory }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed')
      toast.success('Q&A updated')
      setEditItem(null)
      load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setFormSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/chatbot/qna/${deleteTarget._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      toast.success('Deleted')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} selected Q&A entries?`)) return
    try {
      const ids = Array.from(selected)
      const results = await Promise.allSettled(
        ids.map((id) => fetch(`/api/chatbot/qna/${id}`, { method: 'DELETE' }))
      )
      const succeeded = results.filter(r => r.status === 'fulfilled').length
      toast.success(`Deleted ${succeeded} of ${ids.length} entries`)
      setSelected(new Set())
      load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map(i => i._id)))
    }
  }

  function openEdit(item: QAItem) {
    setEditItem(item)
    setFormQuestion(item.question)
    setFormAnswer(item.answer)
    setFormCategory(item.category || '')
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' } }} />
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <div className="admin-topbar" style={{ marginTop: 0 }}>
          <div>
            <h1>💬 Q&A Manager</h1>
            <div className="sub">{total} total {total === 1 ? 'entry' : 'entries'} · page {page} of {pages}</div>
          </div>
          <div className="cell-actions">
            {selected.size > 0 && (
              <button className="btn btn-danger" onClick={handleBulkDelete}>🗑 Delete {selected.size}</button>
            )}
            <button className="btn btn-primary" onClick={() => { setAddOpen(true); setFormQuestion(''); setFormAnswer(''); setFormCategory('') }}>＋ Add New</button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="toolbar" onSubmit={applySearch}>
          <input className="grow" placeholder="Search questions, answers, categories…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
          {(search || statusFilter !== 'all') && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearch(''); setStatusFilter('all'); setPage(1) }}>Clear</button>
          )}
          <button type="button" className="btn btn-ghost" onClick={load}>↻ Refresh</button>
        </form>

        <div className="table-wrap">
          <table className="queries">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" onChange={toggleSelectAll} checked={selected.size === items.length && items.length > 0} style={{ accentColor: '#0ea5e9' }} />
                </th>
                <th>Question</th>
                <th>Answer</th>
                <th style={{ width: 100 }}>Category</th>
                <th style={{ width: 80 }}>Status</th>
                <th style={{ width: 70 }}>Hits</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="empty"><span className="spinner" /> Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="empty"><div className="icon">📭</div><div>No Q&A entries found</div><div style={{ fontSize: 12, marginTop: 4 }}>Add your first question and answer to get started.</div></td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td><input type="checkbox" checked={selected.has(item._id)} onChange={() => toggleSelect(item._id)} style={{ accentColor: '#0ea5e9' }} /></td>
                    <td><div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.question}>{item.question}</div></td>
                    <td><div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8' }} title={item.answer}>{item.answer}</div></td>
                    <td>{item.category ? <span className="badge">{item.category}</span> : '—'}</td>
                    <td>
                      <button
                        className={`status-pill ${item.isActive ? 'status-completed' : 'status-pending'}`}
                        onClick={() => toggleActive(item)}
                        title="Toggle on/off"
                      >
                        <span className="dot" />
                        {item.isActive ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td><span className="badge">👁 {item.hitCount}</span></td>
                    <td>
                      <div className="cell-actions">
                        <button className="icon-btn" onClick={() => openEdit(item)}>✏ Edit</button>
                        <button className="icon-btn danger" onClick={() => setDeleteTarget(item)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pager">
            <div>Showing {(page - 1) * limit + (items.length ? 1 : 0)}–{(page - 1) * limit + items.length} of {total}</div>
            <div className="btns">
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Prev</button>
              <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next ›</button>
              <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(pages)}>»</button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {addOpen && (
        <div className="modal-backdrop" onClick={() => !formSaving && setAddOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h2>➕ Add New Q&A</h2>
            <div className="modal-sub">Add a question and answer pair</div>
            <form onSubmit={handleAdd}>
              <div className="field">
                <label>Question *</label>
                <input value={formQuestion} onChange={e => setFormQuestion(e.target.value)} placeholder="e.g. What are your business hours?" required />
              </div>
              <div className="field">
                <label>Answer *</label>
                <textarea value={formAnswer} onChange={e => setFormAnswer(e.target.value)} placeholder="e.g. We are open Monday to Friday 9am to 6pm" required style={{ minHeight: 80 }} />
              </div>
              <div className="field">
                <label>Category (optional)</label>
                <input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. General, Services, Support" />
              </div>
              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => setAddOpen(false)} disabled={formSaving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formSaving}>{formSaving ? <><span className="spinner" /> Saving…</> : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-backdrop" onClick={() => !formSaving && setEditItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h2>✏ Edit Q&A</h2>
            <div className="modal-sub">Update the question and answer</div>
            <form onSubmit={handleEdit}>
              <div className="field">
                <label>Question *</label>
                <input value={formQuestion} onChange={e => setFormQuestion(e.target.value)} required />
              </div>
              <div className="field">
                <label>Answer *</label>
                <textarea value={formAnswer} onChange={e => setFormAnswer(e.target.value)} required style={{ minHeight: 80 }} />
              </div>
              <div className="field">
                <label>Category</label>
                <input value={formCategory} onChange={e => setFormCategory(e.target.value)} />
              </div>
              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => setEditItem(null)} disabled={formSaving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formSaving}>{formSaving ? <><span className="spinner" /> Saving…</> : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 440 }}>
            <h2>🗑 Delete Q&A</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '8px 0' }}>Are you sure you want to delete this Q&A entry?</p>
            <div style={{ background: '#0b1220', borderRadius: 8, padding: 10, margin: '12px 0', fontSize: 13, color: '#cbd5e1' }}>
              <strong>Q:</strong> {deleteTarget.question}<br />
              <strong>A:</strong> {deleteTarget.answer}
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? <><span className="spinner" /> Deleting…</> : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
