'use client'

import { useState, FormEvent } from 'react'

interface FeedItem {
  _id: string
  name: string
  url: string
  category: string
  status: 'active' | 'inactive'
  location: 'homepage' | 'news-page' | 'both'
  createdAt: string
  updatedAt: string
  lastFetchedAt: string | null
  lastArticleCount: number
}

interface EditFeedRowProps {
  feed: FeedItem
  existingCategories: string[]
  onSaved: (item: FeedItem) => void
  onCancel: () => void
}

export default function EditFeedRow({ feed, existingCategories, onSaved, onCancel }: EditFeedRowProps) {
  const [name, setName] = useState(feed.name)
  const [url, setUrl] = useState(feed.url)
  const [category, setCategory] = useState(feed.category)
  const [status, setStatus] = useState(feed.status)
  const [location, setLocation] = useState(feed.location)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/rss/${feed._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          category: category.trim() || 'General',
          status,
          location,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update feed')
      } else {
        onSaved(data.item)
      }
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <tr>
      <td colSpan={9} style={{ padding: 0 }}>
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 14,
            background: 'rgba(14, 165, 233, 0.04)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            borderRadius: 8,
            margin: 8,
          }}
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="grid-2" style={{ marginBottom: 10 }}>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: 10 }}>
            <div className="field">
              <label>Category</label>
              <input
                type="text"
                list="editCategoryList"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="editCategoryList">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Location</label>
            <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
              {(['homepage', 'news-page', 'both'] as const).map((opt) => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="radio"
                    name="editLocation"
                    value={opt}
                    checked={location === opt}
                    onChange={() => setLocation(opt)}
                  />
                  {opt === 'homepage' ? 'Homepage Only' : opt === 'news-page' ? 'News Page Only' : 'Both'}
                </label>
              ))}
            </div>
          </div>
          <div className="row" style={{ margin: 0 }}>
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : '💾'} Save
            </button>
          </div>
        </form>
      </td>
    </tr>
  )
}
