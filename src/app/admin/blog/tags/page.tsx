'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Tag {
  _id: string
  name: string
  slug: string
}

export default function AdminBlogTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog/tags', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setTags(data.tags || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setToast(`Tag "${name}" created`)
      setName('')
      setShowForm(false)
      load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the tag "${name}"? This will remove it from all blog posts.`)) return
    try {
      const res = await fetch(`/api/admin/blog/tags?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      setToast(data.message || `Tag "${name}" deleted`)
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="admin-topbar">
        <div>
          <h1>Blog Tags</h1>
          <div className="sub">{tags.length} tags</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New Tag
        </button>
      </div>

      {toast && <div className="alert alert-success">{toast}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div className="field">
            <label>Tag Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., SEO Tips"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : null} Create
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="empty"><span className="spinner" /> Loading…</div>
      ) : tags.length === 0 ? (
        <div className="empty">
          <div className="icon">🏷</div>
          <p>No tags yet. Create your first tag!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="queries">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag._id}>
                  <td style={{ fontWeight: 600 }}>#{tag.name}</td>
                  <td style={{ color: '#94a3b8' }}>{tag.slug}</td>
                  <td>
                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(tag._id, tag.name)}
                      title="Delete tag"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
