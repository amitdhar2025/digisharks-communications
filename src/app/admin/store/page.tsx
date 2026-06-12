'use client'

import { useEffect, useMemo, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DeleteOrderModal from '@/components/admin/DeleteOrderModal'

interface OrderItem {
  slug: string
  title: string
  price: number
  qty: number
}

interface AdminOrder {
  _id: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  customer: { name: string; email: string; phone: string; company?: string; gst?: string }
  items: OrderItem[]
  amount: number
  currency: string
  payment: {
    provider: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
    status: 'created' | 'paid' | 'failed'
  }
  deliveryStatus: 'not_yet' | 'received'
  emailSent: boolean
  emailSentAt?: string | null
  emailError?: string | null
}

interface OrderStats {
  totalProductsSold: number
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  deliveredOrders: number
  pendingDelivery: number
}

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

function fmtDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ------------------------------------------------------------------ */
/* Download helper                                                     */
/* ------------------------------------------------------------------ */

async function downloadFile(url: string, fallbackName: string) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Download failed (${res.status})`)
  }
  // Try to read filename from Content-Disposition header
  let filename = fallbackName
  const dispo = res.headers.get('content-disposition') || ''
  const m = dispo.match(/filename="?([^"]+)"?/i)
  if (m && m[1]) filename = m[1]
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export default function AdminStorePage() {
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'not_yet' | 'received'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedCount = selectedIds.size

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
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
      if (deliveryFilter !== 'all') params.set('deliveryStatus', deliveryFilter)
      if (search) params.set('q', search)
      params.set('sort', sort)
      const res = await fetch('/api/admin/orders?' + params.toString(), {
        credentials: 'include',
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setOrders(data.orders)
      setStats(data.stats)
      // Prune the selection to ids that still exist
      setSelectedIds((prev) => {
        const keep = new Set(data.orders.map((o: AdminOrder) => o._id))
        const next = new Set<string>()
        for (const id of prev) if (keep.has(id)) next.add(id)
        return next
      })
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [deliveryFilter, search, sort, router])

  useEffect(() => {
    load()
  }, [load])

  function applySearch(e: FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  async function resendEmail(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}/resend`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          data.error ||
          (res.status === 401
            ? 'Session expired — please sign in again'
            : 'Resend failed')
        setToast({ kind: 'error', text: msg })
        if (res.status === 401) router.push('/admin/login?next=/admin/store')
      } else {
        setToast({ kind: 'success', text: 'Email re-sent successfully' })
        await load()
      }
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Resend failed' })
    } finally {
      setBusyId(null)
    }
  }

  async function toggleDeliveryStatus(o: AdminOrder) {
    const next = o.deliveryStatus === 'received' ? 'not_yet' : 'received'
    setBusyId(o._id)
    try {
      const res = await fetch(`/api/admin/orders/${o._id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: next }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setToast({ kind: 'error', text: d.error || 'Update failed' })
      } else {
        await load()
      }
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Update failed' })
    } finally {
      setBusyId(null)
    }
  }

  /* ----------- Selection helpers ----------- */

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedCount === orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o._id)))
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  /* ----------- Delete handlers ----------- */

  async function handleDeleteOne() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${deleteTarget._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setToast({ kind: 'error', text: data.error || 'Delete failed' })
      } else {
        setToast({
          kind: 'success',
          text: `Order #${deleteTarget.orderNumber} deleted.`,
        })
        setDeleteTarget(null)
        await load()
      }
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Delete failed' })
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteSelected() {
    if (selectedCount === 0) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-delete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setToast({ kind: 'error', text: data.error || 'Bulk delete failed' })
      } else {
        setToast({
          kind: 'success',
          text: data.message || `Deleted ${data.deletedCount} orders.`,
        })
        setDeleteSelectedOpen(false)
        clearSelection()
        await load()
      }
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Bulk delete failed' })
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAll() {
    setDeleting(true)
    try {
      const params = new URLSearchParams()
      if (deliveryFilter !== 'all') params.set('deliveryStatus', deliveryFilter)
      if (search) params.set('q', search)
      const res = await fetch('/api/admin/orders/bulk-delete?' + params.toString(), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setToast({ kind: 'error', text: data.error || 'Bulk delete failed' })
      } else {
        setToast({
          kind: 'success',
          text: data.message || `Deleted ${data.deletedCount} orders.`,
        })
        setDeleteAllOpen(false)
        clearSelection()
        await load()
      }
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Bulk delete failed' })
    } finally {
      setDeleting(false)
    }
  }

  const deleteAllScopeLabel = useMemo(() => {
    const parts: string[] = []
    if (deliveryFilter !== 'all') parts.push(`delivery = ${deliveryFilter.replace('_', ' ')}`)
    if (search) parts.push(`search "${search}"`)
    if (parts.length === 0) return 'across all orders'
    return `matching ${parts.join(' and ')}`
  }, [deliveryFilter, search])

  /* ----------- Export handlers ----------- */

  function buildExportParams(): URLSearchParams {
    const params = new URLSearchParams()
    if (deliveryFilter !== 'all') params.set('deliveryStatus', deliveryFilter)
    if (search) params.set('q', search)
    return params
  }

  async function exportXlsx() {
    setExportLoading(true)
    try {
      const params = buildExportParams()
      const url = '/api/admin/orders/export?' + params.toString()
      await downloadFile(url, `orders-${new Date().toISOString().substring(0, 10)}.xlsx`)
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Excel export failed' })
    } finally {
      setExportLoading(false)
    }
  }

  async function exportCsv() {
    setExportLoading(true)
    try {
      const params = buildExportParams()
      params.set('format', 'csv')
      const url = '/api/admin/orders/export?' + params.toString()
      await downloadFile(url, `orders-${new Date().toISOString().substring(0, 10)}.csv`)
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'CSV export failed' })
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Digital Products — Sales</h1>
          <div className="sub">
            Track orders, revenue and email delivery.{' '}
            <Link href="/admin/dashboard" style={{ color: '#7dd3fc' }}>
              ← Contact queries
            </Link>
          </div>
        </div>
        <div>
          <Link
            href="/digital-products"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            View storefront ↗
          </Link>
        </div>
      </div>

      {toast && (
        <div
          className={
            'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')
          }
          role="status"
        >
          {toast.text}
        </div>
      )}

      {stats && (
        <div className="stat-grid" aria-label="Order stats">
          <div className="stat-card total">
            <div className="label">Total products sold</div>
            <div className="value">{stats.totalProductsSold}</div>
          </div>
          <div className="stat-card total">
            <div className="label">Total revenue (paid)</div>
            <div className="value">{formatINR(stats.totalRevenue)}</div>
          </div>
          <div className="stat-card total">
            <div className="label">Total orders</div>
            <div className="value">{stats.totalOrders}</div>
          </div>
          <div className="stat-card completed">
            <div className="label">Delivered</div>
            <div className="value">{stats.deliveredOrders}</div>
          </div>
          <div className="stat-card pending">
            <div className="label">Pending delivery</div>
            <div className="value">{stats.pendingDelivery}</div>
          </div>
          <div className="stat-card followup">
            <div className="label">Paid orders</div>
            <div className="value">{stats.paidOrders}</div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <form onSubmit={applySearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 220 }}>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search order #, name, email, phone…"
            aria-label="Search orders"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-ghost">Search</button>
        </form>
        <select
          value={deliveryFilter}
          onChange={(e) => setDeliveryFilter(e.target.value as any)}
          aria-label="Filter by delivery status"
        >
          <option value="all">All delivery</option>
          <option value="received">Delivered (received)</option>
          <option value="not_yet">Not yet delivered</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          aria-label="Sort"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Amount (high → low)</option>
          <option value="amount_asc">Amount (low → high)</option>
        </select>
        <button type="button" className="btn btn-ghost" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {/* Action bar: bulk + export */}
      <div
        className="toolbar"
        style={{ background: 'transparent', border: 'none', padding: '0 0 12px' }}
      >
        <div className="cell-actions" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-success"
            onClick={exportXlsx}
            disabled={exportLoading}
            title="Download all visible orders as an Excel workbook"
          >
            {exportLoading ? <span className="spinner" /> : '⬇'} Excel (.xlsx)
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={exportCsv}
            disabled={exportLoading}
            title="Download all visible orders as a CSV file"
          >
            {exportLoading ? <span className="spinner" /> : '⬇'} CSV (.csv)
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <div className="cell-actions" style={{ flexWrap: 'wrap' }}>
          {selectedCount > 0 && (
            <>
              <span
                style={{
                  color: '#7dd3fc',
                  fontSize: 12,
                  alignSelf: 'center',
                  fontWeight: 600,
                }}
              >
                {' '}
                {selectedCount} selected
              </span>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setDeleteSelectedOpen(true)}
                disabled={deleting}
              >
                {'🗑'} Delete selected ({selectedCount})
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearSelection}
                disabled={deleting}
              >
                Clear
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setDeleteAllOpen(true)}
            disabled={orders.length === 0 || deleting}
            title="Delete every order matching the current filter"
          >
            {'🗑'} Delete all ({orders.length})
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="empty">
          <div className="icon">{'⏳'}</div>
          <p>Loading orders{'…'}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="icon">{'📬'}</div>
          <p>No orders yet. Share the storefront to get your first sale!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="queries" aria-label="Orders">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selectedCount > 0 && selectedCount === orders.length}
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          selectedCount > 0 && selectedCount < orders.length
                    }}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemSummary = o.items
                  .map((i) => i.title + ' × ' + i.qty)
                  .join(', ')
                const isSelected = selectedIds.has(o._id)
                return (
                  <tr
                    key={o._id}
                    style={
                      isSelected
                        ? { background: 'rgba(14, 165, 233, 0.08)' }
                        : undefined
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={'Select order ' + o.orderNumber}
                        checked={isSelected}
                        onChange={() => toggleSelect(o._id)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.orderNumber}</div>
                      {o.payment?.razorpayPaymentId && (
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                          {o.payment.razorpayPaymentId}
                        </div>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(o.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {o.customer.email}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {o.customer.phone}
                      </div>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                        {itemSummary}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#7dd3fc' }}>
                      {formatINR(o.amount)}
                    </td>
                    <td>
                      <span
                        className={
                          o.payment.status === 'paid'
                            ? 'status-pill status-completed'
                            : o.payment.status === 'failed'
                            ? 'status-pill status-pending'
                            : 'status-pill status-follow-up'
                        }
                      >
                        <span className="dot" /> {o.payment.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          o.deliveryStatus === 'received'
                            ? 'status-pill status-completed'
                            : 'status-pill status-pending'
                        }
                        onClick={() => toggleDeliveryStatus(o)}
                        disabled={busyId === o._id}
                        title="Click to toggle"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="dot" />{' '}
                        {o.deliveryStatus === 'received' ? 'received' : 'not yet'}
                      </button>
                    </td>
                    <td>
                      {o.emailSent ? (
                        <span
                          className="status-pill status-completed"
                          title={
                            o.emailSentAt
                              ? 'Sent at ' + fmtDate(o.emailSentAt)
                              : ''
                          }
                        >
                          <span className="dot" /> sent
                        </span>
                      ) : o.payment.status === 'paid' ? (
                        <span
                          className="status-pill status-pending"
                          title={o.emailError || ''}
                        >
                          <span className="dot" /> failed
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>{'—'}</span>
                      )}
                    </td>
                    <td>
                      <div className="cell-actions">
                        {o.payment.status === 'paid' && (
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => resendEmail(o._id)}
                            disabled={busyId === o._id}
                            title="Re-send the premium invoice + database PDF"
                          >
                            {busyId === o._id ? <span className="spinner" /> : '✉'}{' '}
                            Resend
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => setDeleteTarget(o)}
                          title="Delete this order"
                        >
                          {'🗑'} Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <DeleteOrderModal
          target={deleteTarget}
          count={1}
          onClose={() => (deleting ? null : setDeleteTarget(null))}
          onConfirm={handleDeleteOne}
          busy={deleting}
        />
      )}

      {deleteSelectedOpen && (
        <DeleteOrderModal
          count={selectedCount}
          scopeLabel="you have selected"
          onClose={() => (deleting ? null : setDeleteSelectedOpen(false))}
          onConfirm={handleDeleteSelected}
          busy={deleting}
        />
      )}

      {deleteAllOpen && (
        <DeleteOrderModal
          count={orders.length}
          scopeLabel={deleteAllScopeLabel}
          onClose={() => (deleting ? null : setDeleteAllOpen(false))}
          onConfirm={handleDeleteAll}
          busy={deleting}
        />
      )}
    </div>
  )
}
