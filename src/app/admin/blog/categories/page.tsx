'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  color: string
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4F46E5')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) } }, [toast])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog/categories', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setCategories(data.categories || [])
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
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), color }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setToast(`Category "${name}" created`)
      setName('')
      setDescription('')
      setShowForm(false)
      load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the category "${name}"? This will remove it from all blog posts.`)) return
    try {
      const res = await fetch(`/api/admin/blog/categories?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      setToast(data.message || `Category "${name}" deleted`)
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const colorOptions = ['#4F46E5', '#7C3AED', '#6366F1', '#FB7185', '#FDA4AF', '#F97316', '#0EA5E9', '#10B981']

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="admin-topbar">
        <div>
          <h1>Blog Categories</h1>
          <div className="sub">{categories.length} categories</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New Category
        </button>
      </div>

      {toast && <div className="alert alert-success">{toast}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <div className="field">
            <label>Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Digital Marketing"
              required
            />
          </div>
          <div className="field">
            <label>Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
            />
          </div>
          <div className="field">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: c,
                    border: color === c ? '3px solid white' : '1px solid transparent',
                    outline: color === c ? '2px solid ' + c : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', background: 'transparent', border: 'none' }}
              />
            </div>
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

      {/* Category list */}
      {loading ? (
        <div className="empty"><span className="spinner" /> Loading…</div>
      ) : categories.length === 0 ? (
        <div className="empty">
          <div className="icon">📂</div>
          <p>No categories yet. Create your first category!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="queries">
            <thead>
              <tr>
                <th>Color</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: cat.color }} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: '#94a3b8' }}>{cat.slug}</td>
                  <td style={{ color: '#94a3b8', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.description || '—'}
                  </td>
                  <td>
                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(cat._id, cat.name)}
                      title="Delete category"
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
