'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

interface RssFeedItem {
  _id: string
  name: string
  url: string
  category: string
  status: 'active' | 'inactive'
  location: 'homepage' | 'news-page' | 'both'
  createdAt: string
  updatedAt: string
}

export default function RssManagerPage() {
  const router = useRouter()

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [rssUrl, setRssUrl] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [location, setLocation] = useState<'homepage' | 'news-page' | 'both'>('both')

  // Table state
  const [feeds, setFeeds] = useState<RssFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active')
  const [editLocation, setEditLocation] = useState<'homepage' | 'news-page' | 'both'>('both')

  const loadFeeds = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/rss')
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setFeeds(data.items || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => { if (d?.authenticated) setUsername(d.username) })
      .catch(() => {})
    loadFeeds()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !rssUrl.trim()) {
      setError('Name and URL are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          url: rssUrl.trim(),
          category: category.trim() || 'General',
          status,
          location,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add feed')
      setName('')
      setCategory('')
      setRssUrl('')
      setStatus('active')
      setLocation('both')
      loadFeeds()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (feed: RssFeedItem) => {
    setEditingId(feed._id)
    setEditName(feed.name)
    setEditCategory(feed.category)
    setEditUrl(feed.url)
    setEditStatus(feed.status)
    setEditLocation(feed.location)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/admin/rss/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          url: editUrl.trim(),
          category: editCategory.trim() || 'General',
          status: editStatus,
          location: editLocation,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setEditingId(null)
      loadFeeds()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const deleteFeed = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feed?')) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/rss/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      loadFeeds()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    } catch { return iso }
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
            <h1>📡 RSS Feed Manager</h1>
            <div className="sub">Add and manage RSS feeds for the site news and ticker</div>
          </div>
        </div>

        {/* Add Feed Form */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, margin: '0 0 16px', color: '#e2e8f0' }}>Add New Feed</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="grid-2">
              <div className="field">
                <label>Name</label>
                <input type="text" placeholder="e.g. Times of India" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Category</label>
                <input type="text" placeholder="e.g. India, Technology, Sports, Business, World, Entertainment" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>RSS URL</label>
                <input type="url" placeholder="https://example.com/rss" value={rssUrl} onChange={(e) => setRssUrl(e.target.value)} />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Show On</label>
              <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                {(['news-page', 'homepage', 'both'] as const).map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="location" value={opt} checked={location === opt} onChange={() => setLocation(opt)} />
                    {opt === 'news-page' ? 'News Page' : opt === 'homepage' ? 'Home Page' : 'Both'}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 12, background: '#ff6b00', border: 'none' }}>
              {submitting ? <span className="spinner" /> : '➕'} Add Feed
            </button>
          </form>
        </div>

        {/* Feeds Table */}
        <div className="table-wrap">
          <table className="queries">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>URL</th>
                <th>Status</th>
                <th>Show On</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty"><span className="spinner" /> Loading feeds...</td>
                </tr>
              ) : feeds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    <div className="icon">📭</div>
                    <div>No RSS feeds yet. Add one above!</div>
                  </td>
                </tr>
              ) : (
                feeds.map((feed) => (
                  editingId === feed._id ? (
                    <tr key={feed._id}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <div style={{ padding: 14, background: 'rgba(255, 107, 0, 0.06)', border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: 8, margin: 8 }}>
                          <div className="grid-2" style={{ marginBottom: 10 }}>
                            <div className="field">
                              <label>Name</label>
                              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="field">
                              <label>Category</label>
                              <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                            </div>
                          </div>
                          <div className="grid-2" style={{ marginBottom: 10 }}>
                            <div className="field">
                              <label>URL</label>
                              <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                            </div>
                            <div className="field">
                              <label>Status</label>
                              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>
                          <div className="field" style={{ marginBottom: 10 }}>
                            <label>Show On</label>
                            <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                              {(['news-page', 'homepage', 'both'] as const).map((opt) => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                                  <input type="radio" name="editLocation" value={opt} checked={editLocation === opt} onChange={() => setEditLocation(opt)} />
                                  {opt === 'news-page' ? 'News Page' : opt === 'homepage' ? 'Home Page' : 'Both'}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="row" style={{ margin: 0 }}>
                            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={() => saveEdit(feed._id)} style={{ background: '#ff6b00', border: 'none' }}>💾 Save</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={feed._id}>
                      <td><div style={{ fontWeight: 600 }}>{feed.name}</div></td>
                      <td><span className="badge">{feed.category}</span></td>
                      <td><span style={{ color: '#7dd3fc', fontSize: 12, maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={feed.url}>{feed.url}</span></td>
                      <td>
                        <span className={`status-pill ${feed.status === 'active' ? 'status-completed' : 'status-pending'}`}>
                          <span className="dot" /> {feed.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{feed.location === 'news-page' ? 'News Page' : feed.location === 'homepage' ? 'Home Page' : 'Both'}</td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{formatDate(feed.createdAt)}</td>
                      <td>
                        <div className="cell-actions">
                          <button className="icon-btn" onClick={() => startEdit(feed)} title="Edit">✏ Edit</button>
                          <button className="icon-btn danger" onClick={() => deleteFeed(feed._id)} title="Delete">🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
