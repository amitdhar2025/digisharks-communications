'use client'

import { useState, useMemo, FormEvent, useCallback } from 'react'
import EditFeedRow from './EditFeedRow'

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

interface FeedTableProps {
  feeds: FeedItem[]
  total: number
  page: number
  pages: number
  totalActive: number
  categories: string[]
  onPageChange: (page: number) => void
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void
  onDelete: (feed: FeedItem) => void
  onPreview: (feed: FeedItem) => void
  onRefresh: () => void
}

type SortField = 'name' | 'category' | 'status' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export default function FeedTable({
  feeds,
  total,
  page,
  pages,
  totalActive,
  categories,
  onPageChange,
  onToggleStatus,
  onDelete,
  onPreview,
  onRefresh,
}: FeedTableProps) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      onPageChange(1)
      setSearch(searchInput.trim())
      // In a real app we'd re-fetch from server. For now, local search is fine
      // since we pass search to API via the parent.
    },
    [searchInput, onPageChange]
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    onPageChange(1)
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return ' ↕'
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  const filtered = useMemo(() => {
    if (!search) return feeds
    const lower = search.toLowerCase()
    return feeds.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        f.category.toLowerCase().includes(lower)
    )
  }, [feeds, search])

  // Sort client-side for responsiveness
  const sorted = useMemo(() => {
    const f = sortField
    const dir = sortOrder === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const aVal = String(a[f] || '')
      const bVal = String(b[f] || '')
      return aVal.localeCompare(bVal) * dir
    })
  }, [filtered, sortField, sortOrder])

  function formatDate(iso: string | null | undefined) {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch { return '—' }
  }

  function locationLabel(loc: string) {
    switch (loc) {
      case 'homepage': return 'Homepage'
      case 'news-page': return 'News Page'
      case 'both': return 'Both'
      default: return loc
    }
  }

  const handleEditSaved = (item: FeedItem) => {
    setEditingId(null)
    onRefresh()
  }

  return (
    <div className="table-wrap">
      {/* Search bar */}
      <form
        className="toolbar"
        onSubmit={handleSearch}
        style={{ border: 'none', borderBottom: '1px solid #1e293b', borderRadius: 0 }}
      >
        <input
          className="grow"
          placeholder="Search by name or category..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        {search && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearchInput('')
              setSearch('')
              onPageChange(1)
            }}
          >
            Clear
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </form>

      <table className="queries">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
              Feed Name{sortIndicator('name')}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>
              Category{sortIndicator('category')}
            </th>
            <th>URL</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
              Location
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
              Status{sortIndicator('status')}
            </th>
            <th>Last Fetched</th>
            <th>Articles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={9} className="empty">
                <div className="icon">📭</div>
                <div>{search ? 'No feeds match your search.' : 'No RSS feeds yet. Add one above!'}</div>
              </td>
            </tr>
          ) : (
            sorted.map((feed, idx) => (
              editingId === feed._id ? (
                <EditFeedRow
                  key={feed._id}
                  feed={feed}
                  existingCategories={categories}
                  onSaved={(item) => handleEditSaved(item)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={feed._id}>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{(page - 1) * 20 + idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{feed.name}</div>
                  </td>
                  <td>
                    <span className="badge">{feed.category}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: '#7dd3fc',
                        fontSize: 12,
                        maxWidth: 200,
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={feed.url}
                    >
                      {feed.url}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{locationLabel(feed.location)}</td>
                  <td>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={feed.status === 'active'}
                        onChange={() =>
                          onToggleStatus(
                            feed._id,
                            feed.status === 'active' ? 'inactive' : 'active'
                          )
                        }
                        style={{ accentColor: '#4ade80' }}
                      />
                      <span
                        style={{
                          color: feed.status === 'active' ? '#4ade80' : '#94a3b8',
                          fontWeight: 600,
                        }}
                      >
                        {feed.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>
                    {formatDate(feed.lastFetchedAt)}
                  </td>
                  <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    {feed.lastArticleCount}
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button
                        className="icon-btn"
                        onClick={() => onPreview(feed)}
                        title="Preview"
                      >
                        👁
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setEditingId(feed._id)}
                        title="Edit"
                      >
                        ✏
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => onDelete(feed)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pages > 1 && (
        <div className="pager">
          <div>
            Showing page {page} of {pages} · {total} total feeds · {totalActive} active
          </div>
          <div className="btns">
            <button
              className="icon-btn"
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
            >
              «
            </button>
            <button
              className="icon-btn"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              ‹ Prev
            </button>
            <button
              className="icon-btn"
              disabled={page >= pages}
              onClick={() => onPageChange(Math.min(pages, page + 1))}
            >
              Next ›
            </button>
            <button
              className="icon-btn"
              disabled={page >= pages}
              onClick={() => onPageChange(pages)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
