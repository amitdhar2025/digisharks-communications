'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

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
  remainingDays?: number
}

interface TrashCounts {
  total: number
  bySection: Record<string, number>
}

/* ─── Props ────────────────────────────────────────────── */

interface TrashSectionViewProps {
  /** The collectionName key for this section (e.g. 'blogposts', 'queries', 'rss') */
  sectionKey: string
  /** Human-readable section label (e.g. 'Blog Posts', 'Contact Queries') */
  sectionLabel: string
  /** Callback when an item is restored — so the parent page can refresh its list */
  onItemRestored?: () => void
}

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

export default function TrashSectionView({ sectionKey, sectionLabel, onItemRestored }: TrashSectionViewProps) {
  const [items, setItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [count, setCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmPermanentId, setConfirmPermanentId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const loadCount = useCallback(async () => {
    try {
      const { data } = await adminFetch<TrashCounts>('/api/admin/trash/count')
      if (data?.bySection) {
        setCount(data.bySection[sectionKey] ?? 0)
      }
    } catch {
      // silently ignore
    }
  }, [sectionKey])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ section: sectionKey, limit: '20' })
      const { data } = await adminFetch<{ items: TrashItem[] }>(`/api/admin/trash?${params}`)
      setItems(data?.items || [])
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [sectionKey])

  useEffect(() => { loadCount() }, [loadCount])

  async function handleRestore(trashId: string) {
    setBusyId(trashId)
    try {
      const { data, error } = await adminFetch(`/api/admin/trash/${trashId}/restore`, { method: 'POST' })
      if (error) throw new Error(error)
      setToast({ kind: 'success', text: data?.message || 'Item restored!' })
      loadItems()
      loadCount()
      onItemRestored?.()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBusyId(null)
    }
  }

  async function handlePermanentDelete(trashId: string) {
    setBusyId(trashId)
    try {
      const { data, error } = await adminFetch(`/api/admin/trash/${trashId}`, { method: 'DELETE' })
      if (error) throw new Error(error)
      setToast({ kind: 'success', text: data?.message || 'Item permanently deleted.' })
      setConfirmPermanentId(null)
      loadItems()
      loadCount()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBusyId(null)
    }
  }

  function toggleTrash() {
    if (!showTrash) loadItems()
    setShowTrash(!showTrash)
  }

  return (
    <div style={{ marginTop: 8 }}>
      {/* Toast */}
      {toast && (
        <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status" style={{ marginBottom: 12, fontSize: 13 }}>
          {toast.text}
        </div>
      )}

      {/* Toggle button */}
      <button
        className="btn btn-ghost"
        onClick={toggleTrash}
        style={{
          color: count > 0 ? '#fbbf24' : '#64748b',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        🗑 {sectionLabel} Trash{count > 0 ? ` (${count})` : ''}
        <span style={{ fontSize: 10, color: '#475569' }}>{showTrash ? '▲' : '▼'}</span>
      </button>

      {/* Trash items panel */}
      {showTrash && (
        <div style={{
          marginTop: 10,
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
              🗑 Deleted {sectionLabel}
            </div>
            <button className="icon-btn" onClick={() => { loadItems(); loadCount() }} style={{ fontSize: 12 }}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty" style={{ padding: '20px 0' }}>
              <span className="spinner" /> Loading trash items…
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No deleted {sectionLabel.toLowerCase()}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((item) => (
                <div key={item._id} style={{
                  background: '#0b1220', border: '1px solid #1e293b',
                  borderRadius: 8, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      Deleted by {item.deletedBy?.username || '—'} · {fmtDate(item.deletedAt)}
                      {item.remainingDays !== undefined && !item.restoredAt && (
                        <span style={{ marginLeft: 8, color: item.remainingDays <= 3 ? '#f87171' : '#64748b' }}>
                          · {item.remainingDays <= 0 ? 'Expired' : `${item.remainingDays}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!item.restoredAt ? (
                      <>
                        <button
                          className="icon-btn"
                          onClick={() => handleRestore(item._id)}
                          disabled={busyId === item._id}
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          title="Restore this item"
                        >
                          {busyId === item._id ? <span className="spinner" /> : '♻'} Restore
                        </button>
                        {confirmPermanentId === item._id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="icon-btn danger"
                              onClick={() => handlePermanentDelete(item._id)}
                              disabled={busyId === item._id}
                              style={{ fontWeight: 700, color: '#ef4444', fontSize: 12, padding: '4px 10px' }}
                            >
                              {busyId === item._id ? <span className="spinner" /> : '⚠'} Confirm?
                            </button>
                            <button className="icon-btn" onClick={() => setConfirmPermanentId(null)} style={{ fontSize: 11, padding: '4px 8px' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="icon-btn danger"
                            onClick={() => setConfirmPermanentId(item._id)}
                            style={{ fontSize: 12, padding: '4px 10px' }}
                            title="Permanently delete (cannot be undone)"
                          >
                            🗑 Delete Forever
                          </button>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#4ade80', fontSize: 12 }}>✓ Restored</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
