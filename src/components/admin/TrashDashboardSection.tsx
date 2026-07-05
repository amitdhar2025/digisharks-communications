'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'
import { ArrowRight, Trash2, RotateCcw, AlertTriangle, MessageSquare, ShoppingCart, FileText, Rss, Briefcase, Bot, Search, Users, LogIn, Shield } from 'lucide-react'

/* ── Types ────────────────────────────────────────────── */

interface TrashCounts {
  total: number
  bySection: Record<string, number>
}

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
  retentionDays?: number
  remainingDays?: number
}

const TRASH_SECTIONS_CONF = [
  { key: 'queries', label: 'Queries Trash', lucide: MessageSquare, color: '#0ea5e9' },
  { key: 'orders', label: 'Store/Orders Trash', lucide: ShoppingCart, color: '#10b981' },
  { key: 'blogposts', label: 'Blog Trash', lucide: FileText, color: '#8b5cf6' },
  { key: 'rss', label: 'RSS Feeds Trash', lucide: Rss, color: '#f97316' },
  { key: 'careerjobs', label: 'Career Trash', lucide: Briefcase, color: '#6366f1' },
  { key: 'careerapplications', label: 'Job Apps Trash', lucide: Briefcase, color: '#06b6d4' },
  { key: 'chatbotqa', label: 'Chatbot Trash', lucide: Bot, color: '#a855f7' },
  { key: 'seoaudits', label: 'SEO Audit Trash', lucide: Search, color: '#059669' },
  { key: 'subadmins', label: 'Sub-Admins Trash', lucide: Users, color: '#eab308' },
  { key: 'loginlogs', label: 'Login Logs Trash', lucide: LogIn, color: '#64748b' },
  { key: 'securityattacks', label: 'Security Trash', lucide: Shield, color: '#ef4444' },
]

/* ── Helpers ──────────────────────────────────────────── */

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtCountdown(item: TrashItem) {
  if (item.restoredAt) return <span style={{ color: '#4ade80', fontSize: 11 }}>✓ Restored</span>
  if (item.remainingDays === undefined) return null
  if (item.remainingDays <= 0) return <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>⚠ Expired</span>
  if (item.remainingDays <= 3) return <span style={{ color: '#f87171', fontSize: 11, fontWeight: 600 }}>{item.remainingDays}d left</span>
  if (item.remainingDays <= 14) return <span style={{ color: '#fbbf24', fontSize: 11 }}>{item.remainingDays}d left</span>
  return <span style={{ color: '#64748b', fontSize: 11 }}>{item.remainingDays}d</span>
}

/* ── Component ────────────────────────────────────────── */

export default function TrashDashboardSection() {
  const [counts, setCounts] = useState<TrashCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<TrashItem[]>([])
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmPermanentId, setConfirmPermanentId] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const loadData = useCallback(async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        adminFetch<TrashCounts>('/api/admin/trash/count'),
        adminFetch<{ items: TrashItem[] }>('/api/admin/trash?page=1&limit=10'),
      ])
      if (countRes.data) setCounts(countRes.data)
      if (listRes.data?.items) setItems(listRes.data.items)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleRestore(trashId: string) {
    setBusyId(trashId)
    try {
      const { data, error } = await adminFetch(`/api/admin/trash/${trashId}/restore`, { method: 'POST' })
      if (error) throw new Error(error)
      setToast({ kind: 'success', text: data?.message || 'Item restored!' })
      loadData()
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
      loadData()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setBusyId(null)
    }
  }

  const expiringItems = items.filter(
    (i) => !i.restoredAt && i.remainingDays !== undefined && i.remainingDays <= 3
  )

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
          TRASH
        </span>
        <div style={{ flex: 1, height: 1, background: '#1e293b', marginLeft: 4 }} />
        <Link href="/admin/trash" style={{ fontSize: 12, color: '#7dd3fc', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          View All Trash <ArrowRight size={12} />
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status" style={{ marginBottom: 12, fontSize: 13 }}>
          {toast.text}
        </div>
      )}

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
        {TRASH_SECTIONS_CONF.map((section) => {
          const count = (counts?.bySection ?? {})[section.key] ?? 0
          return (
            <Link
              key={section.key}
              href={`/admin/trash?section=${section.key}`}
              style={{
                background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
                padding: '12px 14px', textDecoration: 'none', display: 'flex',
                alignItems: 'center', gap: 12,
                borderLeft: `3px solid ${count > 0 ? section.color : '#1e293b'}`,
                opacity: count === 0 ? 0.5 : 1,
              }}
            >
              <section.lucide size={20} style={{ color: section.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{section.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: count > 0 ? '#f1f5f9' : '#475569' }}>
                  {loading ? <span className="spinner" /> : count}
                </div>
              </div>
            </Link>
          )
        })}
        {/* Total card */}
        <Link
          href="/admin/trash"
          style={{
            gridColumn: '1 / -1',
            background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(239,68,68,0.05))',
            border: '1px solid rgba(244,63,94,0.3)', borderRadius: 12,
            padding: '14px 16px', textDecoration: 'none', display: 'flex',
            alignItems: 'center', gap: 14,
          }}
        >
          <Trash2 size={22} style={{ color: '#f43f5e' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Total Items in Trash</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
              {loading ? <span className="spinner" /> : (counts?.total ?? 0)}
            </div>
          </div>
          <ArrowRight size={16} style={{ color: '#f43f5e' }} />
        </Link>
      </div>

      {/* Recently Deleted Grid */}
      {items.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>
            <RotateCcw size={14} style={{ color: '#4ade80' }} /> Recently Deleted — Quick Restore
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.slice(0, 8).map((item) => (
              <div key={item._id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                    <span className="badge" style={{ fontSize: 10 }}>{item.sectionLabel}</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>by {item.deletedBy?.username || '—'} · {fmtDate(item.deletedAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {fmtCountdown(item)}
                  {!item.restoredAt ? (
                    <>
                      <button className="icon-btn" onClick={() => handleRestore(item._id)} disabled={busyId === item._id} style={{ fontSize: 12, padding: '4px 10px' }} title="Restore this item">
                        {busyId === item._id ? <span className="spinner" /> : '♻'} Restore
                      </button>
                      {confirmPermanentId === item._id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="icon-btn danger" onClick={() => handlePermanentDelete(item._id)} disabled={busyId === item._id} style={{ fontWeight: 700, color: '#ef4444', fontSize: 12, padding: '4px 10px' }}>
                            {busyId === item._id ? <span className="spinner" /> : '⚠'} Confirm?
                          </button>
                          <button className="icon-btn" onClick={() => setConfirmPermanentId(null)} style={{ fontSize: 11, padding: '4px 8px' }}>Cancel</button>
                        </div>
                      ) : (
                        <button className="icon-btn danger" onClick={() => setConfirmPermanentId(item._id)} style={{ fontSize: 12, padding: '4px 10px' }} title="Permanently delete (cannot be undone)">
                          🗑 Delete Forever
                        </button>
                      )}
                    </>
                  ) : (
                    <span style={{ color: '#4ade80', fontSize: 11 }}>✓ Restored</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Nearing Auto-Delete */}
      {expiringItems.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 10 }}>
            <AlertTriangle size={14} style={{ color: '#f87171' }} /> Items Nearing Auto-Delete
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {expiringItems.map((item) => (
              <div key={item._id} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                    <span className="badge" style={{ fontSize: 10 }}>{item.sectionLabel}</span>
                    <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>
                      {item.remainingDays !== undefined && item.remainingDays <= 0 ? 'Auto-deleting now' : `Auto-deletes in ${item.remainingDays} day${item.remainingDays !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {fmtCountdown(item)}
                  <button className="icon-btn" onClick={() => handleRestore(item._id)} disabled={busyId === item._id} style={{ fontSize: 12, padding: '4px 10px' }} title="Restore before it expires">
                    {busyId === item._id ? <span className="spinner" /> : '♻'} Restore
                  </button>
                  {confirmPermanentId === item._id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn danger" onClick={() => handlePermanentDelete(item._id)} disabled={busyId === item._id} style={{ fontWeight: 700, color: '#ef4444', fontSize: 12, padding: '4px 10px' }}>
                        {busyId === item._id ? <span className="spinner" /> : '⚠'} Confirm?
                      </button>
                      <button className="icon-btn" onClick={() => setConfirmPermanentId(null)} style={{ fontSize: 11, padding: '4px 8px' }}>Cancel</button>
                    </div>
                  ) : (
                    <button className="icon-btn danger" onClick={() => setConfirmPermanentId(item._id)} style={{ fontSize: 12, padding: '4px 10px' }} title="Permanently delete">
                      🗑 Delete Forever
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View All Link */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <Link href="/admin/trash" style={{ color: '#7dd3fc', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8 }}>
          View All Trash <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
