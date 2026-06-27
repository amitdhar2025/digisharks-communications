'use client'

import { useState, useCallback, FormEvent } from 'react'

interface PreviewItem {
  title: string
  link: string
  pubDate: string
}

interface AddFeedFormProps {
  existingCategories: string[]
  onFeedAdded: () => void
}

export default function AddFeedForm({ existingCategories, onFeedAdded }: AddFeedFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [location, setLocation] = useState<'homepage' | 'news-page' | 'both'>('both')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Preview state
  const [previewItems, setPreviewItems] = useState<PreviewItem[] | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const handlePreview = useCallback(async () => {
    if (!url.trim()) return
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewItems(null)
    try {
      const res = await fetch(`/api/admin/rss/preview?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        setPreviewError(data.error || 'Failed to fetch preview')
      } else {
        setPreviewItems(data.items || [])
        // Auto-fill name if not set
        if (!name.trim() && data.feedTitle) {
          setName(data.feedTitle)
        }
      }
    } catch {
      setPreviewError('Network error while fetching preview')
    } finally {
      setPreviewLoading(false)
    }
  }, [url, name])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim() || !url.trim()) {
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
          url: url.trim(),
          category: category.trim() || 'General',
          status,
          location,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add feed')
      } else {
        setSuccess(`Feed "${name.trim()}" added successfully!`)
        setName('')
        setUrl('')
        setCategory('')
        setStatus('active')
        setLocation('both')
        setPreviewItems(null)
        onFeedAdded()
      }
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    } catch { return iso }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <div className="grid-2">
        <div className="field">
          <label>Feed Name</label>
          <input
            type="text"
            placeholder="e.g. Zee News India"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Feed URL</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              placeholder="https://example.com/rss"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handlePreview}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handlePreview}
              disabled={previewLoading || !url.trim()}
              title="Preview feed"
            >
              {previewLoading ? <span className="spinner" /> : '🔍'}
            </button>
          </div>
        </div>
      </div>

      {/* Live preview */}
      {previewLoading && (
        <div style={{ margin: '8px 0', fontSize: 13, color: '#94a3b8' }}>
          Fetching feed preview...
        </div>
      )}
      {previewError && (
        <div className="alert alert-error" style={{ margin: '8px 0' }}>
          {previewError}
        </div>
      )}
      {previewItems && previewItems.length > 0 && (
        <div
          style={{
            margin: '8px 0',
            padding: 10,
            background: '#0b1220',
            border: '1px solid #1e293b',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <div style={{ color: '#7dd3fc', fontWeight: 600, marginBottom: 6, fontSize: 12 }}>
            ✓ Latest headlines from this feed:
          </div>
          {previewItems.map((item, i) => (
            <div key={i} style={{ padding: '4px 0', borderBottom: i < previewItems.length - 1 ? '1px solid #1e293b' : 'none' }}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#e2e8f0', textDecoration: 'none' }}
              >
                {item.title}
              </a>
              <span style={{ color: '#64748b', fontSize: 11, marginLeft: 8 }}>
                {item.pubDate ? formatDate(item.pubDate) : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2">
        <div className="field">
          <label>Category</label>
          <input
            type="text"
            list="categoryList"
            placeholder="e.g. National, Business, Tech"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="categoryList">
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

      <div className="field">
        <label>Display Location</label>
        <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
          {(['homepage', 'news-page', 'both'] as const).map((opt) => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="radio"
                name="location"
                value={opt}
                checked={location === opt}
                onChange={() => setLocation(opt)}
              />
              {opt === 'homepage' ? 'Homepage Only' : opt === 'news-page' ? 'News Page Only' : 'Both'}
            </label>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
        style={{ marginTop: 12 }}
      >
        {submitting ? <span className="spinner" /> : '➕'} Add Feed
      </button>
    </form>
  )
}
