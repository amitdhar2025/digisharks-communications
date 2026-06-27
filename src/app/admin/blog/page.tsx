'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { Plus, Edit, Trash2, Eye, Search, ExternalLink, ArrowUpDown } from 'lucide-react'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  featuredImage?: { url: string; publicId: string } | null
  author: string
  status: 'draft' | 'published' | 'active' | 'inactive' | 'featured' | 'scheduled'
  isFeatured?: boolean
  featured: boolean
  readingTime: number
  publishedAt: string | null
  scheduledAt?: string | null
  createdAt: string
  updatedAt: string
  categories: { _id: string; name: string; slug: string; color: string }[]
  tags: { _id: string; name: string; slug: string }[]
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [deleteAllTarget, setDeleteAllTarget] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const limit = 15

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/blog/posts?${params}`, { credentials: 'include' })
      if (res.status === 401) {
        router.push('/admin/login?next=/admin/blog')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setPosts(data.posts || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search, router])

  useEffect(() => { load() }, [load])

  // Check for scheduled posts every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch('/api/admin/blog/publish-scheduled')
        // Reload the list to reflect any published posts
        load()
      } catch {}
    }, 60000)
    return () => clearInterval(interval)
  }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/posts/${deleteTarget._id}`, {
        method: 'DELETE', credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      setToast({ kind: 'success', text: `"${deleteTarget.title}" deleted.` })
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAll() {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/blog/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete all failed')
      const data = await res.json()
      setToast({ kind: 'success', text: data.message || 'All posts deleted.' })
      setDeleteAllTarget(false)
      setPosts([])
      setTotal(0)
      setPages(1)
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeleting(false)
    }
  }

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    featured: posts.filter((p) => p.status === 'featured' || p.isFeatured).length,
  }), [posts])

  const columnHelper = createColumnHelper<BlogPost>()

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'image',
      header: 'Image',
      cell: (info) => {
        const post = info.row.original
        const imgSrc = post.featuredImage?.url || post.coverImage || ''
        return (
          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#1e293b', flexShrink: 0 }}>
            {imgSrc ? (
              <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#475569' }}>📰</div>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <div>
          <div style={{ fontWeight: 600, color: '#e2e8f0', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {info.getValue()}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            /{info.row.original.slug}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const s = info.getValue()
        const row = info.row.original
        return (
          <div>
            <span className={`status-pill ${s === 'published' ? 'status-completed' : s === 'featured' ? 'status-featured' : s === 'scheduled' ? 'status-scheduled' : 'status-pending'}`}>
              <span className="dot" /> {s}
            </span>
            {s === 'scheduled' && row.scheduledAt && (
              <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 4 }}>
                📅 {new Date(row.scheduledAt).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            )}
          </div>
        )
      },
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    }),
    columnHelper.display({
      id: 'featured',
      header: 'Featured',
      cell: (info) => {
        const post = info.row.original
        return post.isFeatured || post.status === 'featured' ? (
          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>★ Featured</span>
        ) : (
          <span style={{ color: '#475569', fontSize: 12 }}>—</span>
        )
      },
    }),
    columnHelper.accessor('author', {
      header: 'Author',
      cell: (info) => info.getValue() || '—',
    }),
    columnHelper.accessor('readingTime', {
      header: 'Read',
      cell: (info) => `${info.getValue()} min`,
    }),
    columnHelper.accessor('categories', {
      header: 'Categories',
      cell: (info) => (
        <div className="cell-actions" style={{ gap: 4 }}>
          {(info.getValue() || []).slice(0, 2).map((cat: any) => (
            <span key={cat._id} className="badge" style={{ background: `${cat.color}20`, color: cat.color }}>
              {cat.name}
            </span>
          ))}
          {(info.getValue()?.length || 0) > 2 && (
            <span className="badge">+{info.getValue().length - 2}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      cell: (info) => (
        <span style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
          {fmtDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="cell-actions">
          <Link
            href={`/admin/blog/${info.row.original._id}/edit`}
            className="icon-btn"
            title="Edit"
          >
            <Edit size={14} /> Edit
          </Link>
          <a
            href={`/blog/${info.row.original.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            title="View on site"
          >
            <Eye size={14} /> View
          </a>
          <button
            className="icon-btn danger"
            onClick={() => setDeleteTarget(info.row.original)}
            title="Delete"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ),
    }),
  ], [columnHelper])

  const table = useReactTable({
    data: posts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div>
      {toast && (
        <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
          {toast.text}
        </div>
      )}

      {/* Top bar */}
      <div className="admin-topbar">
        <div>
          <h1>Blog Posts</h1>
          <div className="sub">
            {total} total · {stats.published} published · {stats.featured} featured · {stats.draft} drafts
          </div>
        </div>
        <div className="cell-actions">
          <Link href="/admin/blog/categories" className="btn btn-ghost">
            📂 Categories
          </Link>
          <Link href="/admin/blog/tags" className="btn btn-ghost">
            🏷 Tags
          </Link>
          <Link href="/blog" target="_blank" className="btn btn-ghost">
            <ExternalLink size={14} /> View Blog
          </Link>
          <Link href="/admin/blog/new" className="btn btn-primary">
            <Plus size={16} /> + New Post
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()) }}
          style={{ display: 'flex', gap: 8, flex: 1 }}
        >
          <input
            type="search"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="grow"
            style={{ background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0', padding: '8px 10px', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
          <button type="submit" className="btn btn-ghost">
            <Search size={14} /> Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0', padding: '8px 10px', borderRadius: 8, fontSize: 13 }}
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="featured">Featured</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <button type="button" className="btn btn-ghost" onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ↻ Refresh
        </button>
        {posts.length > 0 && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setDeleteAllTarget(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Trash2 size={14} /> Delete All
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="empty">
            <span className="spinner" /> Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div className="empty">
            <div className="icon">📝</div>
            <p>No blog posts yet. Create your first post!</p>
            <Link href="/admin/blog/new" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
              <Plus size={16} /> Create Post
            </Link>
          </div>
        ) : (
          <table className="queries">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pager">
            <div>
              Showing page {page} of {pages}
            </div>
            <div className="btns">
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</button>
              <button className="icon-btn" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next ›</button>
              <button className="icon-btn" disabled={page >= pages} onClick={() => setPage(pages)}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation (single) */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Post</h2>
            <p className="modal-sub">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation */}
      {deleteAllTarget && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteAllTarget(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete All Posts</h2>
            <p className="modal-sub">
              Are you sure you want to delete <strong>ALL posts</strong>? This action cannot be undone.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteAllTarget(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAll} disabled={deleting}>
                {deleting ? <span className="spinner" /> : null} Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
