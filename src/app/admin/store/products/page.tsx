'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProductItem {
  _id: string
  slug: string
  title: string
  category: string
  price: number
  compareAtPrice: number
  currency: string
  shortPitch: string
  images: string[]
  description?: string
  demoVideo: string
  howToUseVideo: string
  rating: number
  isActive: boolean
  downloadUrl: string
  createdAt: string | null
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [items, setItems] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
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
      const res = await fetch('/api/admin/products', { credentials: 'include' })
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems(data.items || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  async function handleDelete(product: ProductItem) {
    if (!confirm(`Move "${product.title}" to trash? You can restore it later from the Trash section.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setToast({ kind: 'success', text: data.message || 'Product moved to trash.' })
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteAll() {
    if (!confirm('Move ALL products to trash?')) return
    if (!confirm('⚠️ Are you sure? All products will be moved to the trash. You can restore them later from the Trash section.')) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete all failed')
      setToast({ kind: 'success', text: data.message || 'All products moved to trash.' })
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
        <div className="admin-topbar">
          <div>
            <h1>📦 Manage Products</h1>
            <div className="sub">Add, edit, or remove digital products from your store</div>
          </div>
          <div className="cell-actions">
            <Link href="/admin/store/products/add" className="btn btn-primary">＋ Add Product</Link>
            <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
            {items.length > 0 && (
              <button className="btn btn-danger" onClick={handleDeleteAll} disabled={busy}>
                🗑 Delete All
              </button>
            )}
          </div>
        </div>

        {toast && (
          <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
            {toast.text}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="table-wrap">
          {loading ? (
            <div className="empty"><span className="spinner" /> Loading products…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="icon">📦</div>
              <p>No products yet. Add your first product!</p>
            </div>
          ) : (
            <table className="queries">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product._id} style={!product.isActive ? { opacity: 0.6 } : undefined}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', border: '1px solid #1e293b' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{product.title}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>/products/{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge">{product.category}</span></td>
                    <td style={{ fontWeight: 700, color: '#7dd3fc' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                      {product.compareAtPrice > product.price && (
                        <span style={{ color: '#64748b', fontWeight: 400, textDecoration: 'line-through', marginLeft: 6, fontSize: 12 }}>
                          ₹{product.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${product.isActive ? 'status-completed' : 'status-pending'}`}>
                        <span className="dot" /> {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#fbbf24' }}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</td>
                    <td style={{ color: '#94a3b8' }}>—</td>
                    <td>
                      <div className="cell-actions">
                        <Link href={`/admin/store/products/${product._id}/edit`} className="icon-btn">✏ Edit</Link>
                        <Link href={`/digital-products/${product.slug}`} target="_blank" className="icon-btn">👁 View</Link>
                        <button className="icon-btn danger" onClick={() => handleDelete(product)} disabled={busy}>🗑 Trash</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

    </div>
  )
}
