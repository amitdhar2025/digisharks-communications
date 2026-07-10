'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Coupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  isActive: boolean
  restrictToProducts?: string[]
  restrictToCategories?: string[]
  createdAt: string
}

const DISCOUNT_TYPES = [
  { value: 'percentage', label: '% Percentage' },
  { value: 'fixed', label: '₹ Fixed Amount' },
]

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })
}

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage')
  const [formValue, setFormValue] = useState('')
  const [formMinOrder, setFormMinOrder] = useState('')
  const [formMaxUses, setFormMaxUses] = useState('')
  const [formExpiry, setFormExpiry] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formSaving, setFormSaving] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/coupons', { credentials: 'include' })
      if (res.status === 401) { router.push('/admin/login'); return }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to load')
      setCoupons(d.coupons || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load coupons')
    } finally { setLoading(false) }
  }, [router])

  useEffect(() => { load() }, [load])

  function resetForm() {
    setFormCode(''); setFormType('percentage'); setFormValue(''); setFormMinOrder('')
    setFormMaxUses(''); setFormExpiry(''); setFormActive(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFormSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode,
          discountType: formType,
          discountValue: Number(formValue),
          minOrderValue: formMinOrder ? Number(formMinOrder) : undefined,
          maxUses: formMaxUses ? Number(formMaxUses) : undefined,
          expiresAt: formExpiry || undefined,
          isActive: formActive,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to save')
      setToast({ kind: 'success', text: `Coupon "${d.coupon.code}" created!` })
      setShowForm(false)
      resetForm()
      await load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Failed to save' })
    } finally { setFormSaving(false) }
  }

  async function toggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${c._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !c.isActive }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Update failed') }
      await load()
    } catch (e: any) {
      setToast({ kind: 'error', text: e?.message || 'Update failed' })
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>🎟️ Coupon Codes</h1>
          <div className="sub">Create and manage discount coupons for the store</div>
        </div>
        <button type="button" className="btn btn-success" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? '✕ Cancel' : '+ New Coupon'}
        </button>
      </div>

      {toast && <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')}>{toast.text}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>Create New Coupon</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} autoComplete="off">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Coupon Code *</label>
                <input type="text" value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 13, textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Discount Type</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 13 }}>
                  {DISCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Value *</label>
                <input type="number" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder={formType === 'percentage' ? 'e.g. 20' : 'e.g. 100'} required min={1}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Min Order Value (optional)</label>
                <input type="number" value={formMinOrder} onChange={(e) => setFormMinOrder(e.target.value)} placeholder="₹0"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Max Uses (optional)</label>
                <input type="number" value={formMaxUses} onChange={(e) => setFormMaxUses(e.target.value)} placeholder="Unlimited"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Expiry Date (optional)</label>
                <input type="date" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="formActive" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />
              <label htmlFor="formActive" style={{ fontSize: 13, color: '#cbd5e1', cursor: 'pointer' }}>Active on creation</label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={formSaving}>
                {formSaving ? <><span className="spinner" /> Saving…</> : '💾 Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty"><div className="icon">⏳</div><p>Loading coupons…</p></div>
      ) : coupons.length === 0 ? (
        <div className="empty"><div className="icon">🎟️</div><p>No coupons yet. Create your first coupon to start offering discounts!</p></div>
      ) : (
        <div className="table-wrap">
          <table className="queries">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date()
                const maxed = c.maxUses && c.usedCount >= c.maxUses
                return (
                  <tr key={c._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#fbbf24' }}>{c.code}</span></td>
                    <td><span className="badge">{c.discountType === 'percentage' ? '%' : '₹'}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td>{c.minOrderValue ? `₹${c.minOrderValue}` : '—'}</td>
                    <td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                    <td style={{ color: expired ? '#f87171' : '#94a3b8' }}>{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                    <td>
                      <span className={`status-pill ${c.isActive && !expired && !maxed ? 'status-completed' : 'status-pending'}`}>
                        <span className="dot" /> {c.isActive && !expired && !maxed ? 'Active' : expired ? 'Expired' : maxed ? 'Maxed' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: '#64748b' }}>{formatDate(c.createdAt)}</td>
                    <td>
                      <div className="cell-actions">
                        <button type="button" className="icon-btn" onClick={() => toggleActive(c)} title={c.isActive ? 'Deactivate' : 'Activate'}>
                          {c.isActive ? '⏸' : '▶'}
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
    </div>
  )
}
