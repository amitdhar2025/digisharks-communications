/**
 * CMS Admin - Registration Forms List
 *
 * Lists all registration forms with their stats, allows creating new forms,
 * editing existing ones, and viewing entries per form.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Settings,
  Trash2,
  ExternalLink,
  Copy,
  FileText,
  Users,
  Globe,
  AlertCircle,
  Eye,
} from 'lucide-react'
import Link from 'next/link'

interface FormSummary {
  key: string
  slug: string
  name: string
  formTitle: string
  isEnabled: boolean
  fieldCount: number
  formBannerUrl?: string
  createdAt: string
}

export default function RegistrationFormsListPage() {
  const [forms, setForms] = useState<FormSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const loadForms = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/content/admin/registration-form-config')
      if (res.status === 401) { window.location.href = '/content/admin/login'; return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setForms(data.forms || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load forms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadForms() }, [loadForms])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleCreate() {
    if (!newName.trim() || !newSlug.trim()) {
      setToast({ kind: 'error', text: 'Name and slug are required.' })
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/content/admin/registration-form-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          formTitle: newName.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setToast({ kind: 'success', text: `Form "${data.config.name}" created!` })
      setShowCreate(false)
      setNewName('')
      setNewSlug('')
      loadForms()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message || 'Failed to create form' })
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(key: string, name: string) {
    if (!confirm(`Delete form "${name}"? This cannot be undone.`)) return
    setDeleting(key)
    try {
      const res = await fetch(`/api/content/admin/registration-form-config?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      setToast({ kind: 'success', text: `Form "${name}" deleted.` })
      loadForms()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message || 'Failed to delete' })
    } finally {
      setDeleting(null)
    }
  }

  function copyPublicUrl(slug: string) {
    const url = `${window.location.protocol}//${window.location.host}/register/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    })
  }

  function fmtDate(iso: string) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div>
      {/* ── Top Bar ── */}
      <div className="cms-topbar">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} />
            Registration Forms
          </h1>
          <div className="sub">
            {forms.length} form{forms.length !== 1 ? 's' : ''} configured
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/content/admin/registered" className="cms-btn cms-btn-ghost cms-btn-sm">
            <Users size={14} /> All Entries
          </Link>
          <button
            className="cms-btn cms-btn-primary cms-btn-sm"
            onClick={() => setShowCreate(true)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}
          >
            <Plus size={14} /> New Form
          </button>
        </div>
      </div>

      {toast && (
        <div className={`cms-alert ${toast.kind === 'success' ? 'cms-alert-success' : 'cms-alert-error'}`}>
          {toast.text}
        </div>
      )}

      {error && (
        <div className="cms-alert cms-alert-error">
          <AlertCircle size={14} className="inline-block align-middle mr-1" />
          {error}
        </div>
      )}

      {/* ── Create Form Modal ── */}
      {showCreate && (
        <div
          className="cms-modal-backdrop"
          onClick={() => setShowCreate(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480,
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 16, padding: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>📝 Create New Form</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4, display: 'block' }}>
                  Form Name (admin display)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                  }}
                  placeholder="e.g. Career Application"
                  style={{ background: '#0b1220', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4, display: 'block' }}>
                  URL Slug (public URL path)
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ background: '#1e293b', color: '#64748b', padding: '10px 8px', borderRadius: '8px 0 0 8px', fontSize: 12, border: '1px solid #1e293b', borderRight: 'none' }}>/register/</span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="career"
                    style={{ background: '#0b1220', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: '0 8px 8px 0', padding: '10px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                {newSlug && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Public URL: /register/<strong style={{ color: '#7dd3fc' }}>{newSlug}</strong>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="cms-btn cms-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="cms-btn cms-btn-primary"
                onClick={handleCreate}
                disabled={creating || !newName.trim() || !newSlug.trim()}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
              >
                {creating ? <><span className="spinner" /> Creating…</> : 'Create Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Forms Grid ── */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <span className="spinner" style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
            borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: 8,
          }} />
          Loading forms…
        </div>
      ) : forms.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b', background: '#0f172a', border: '2px dashed #1e293b', borderRadius: 12 }}>
          <FileText size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 14, marginBottom: 16 }}>No registration forms yet.</p>
          <button
            className="cms-btn cms-btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
          >
            <Plus size={14} /> Create Your First Form
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {forms.map((form) => (
            <div
              key={form.key}
              style={{
                background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
                overflow: 'hidden', transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#334155' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1e293b' }}
            >
              {form.formBannerUrl && (
                <div style={{ height: 100, overflow: 'hidden', background: '#1e293b' }}>
                  <img src={form.formBannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: form.isEnabled ? '#22c55e' : '#64748b',
                  }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
                    {form.name || form.formTitle || form.key}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                  {form.formTitle}
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                  <span>📄 {form.fieldCount} fields</span>
                  <span>📅 {fmtDate(form.createdAt)}</span>
                  <span style={{ color: form.isEnabled ? '#22c55e' : '#ef4444' }}>
                    {form.isEnabled ? '✅ Active' : '⏸ Disabled'}
                  </span>
                </div>

                {/* Slug / URL */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#0b1220', border: '1px solid #1e293b', borderRadius: 8,
                  padding: '6px 10px', marginBottom: 12, fontSize: 12,
                }}>
                  <Globe size={12} style={{ color: '#64748b', flexShrink: 0 }} />
                  <span style={{ color: '#64748b' }}>/register/</span>
                  <span style={{ color: '#7dd3fc', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.slug}
                  </span>
                  <button
                    onClick={() => copyPublicUrl(form.slug)}
                    style={{ background: 'transparent', border: 'none', color: copiedSlug === form.slug ? '#4ade80' : '#64748b', cursor: 'pointer', padding: 2 }}
                    title="Copy URL"
                  >
                    <Copy size={12} />
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Link
                    href={`/content/admin/registration-form-builder?key=${form.key}`}
                    className="cms-btn cms-btn-primary cms-btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Settings size={13} /> Edit Fields
                  </Link>
                  <Link
                    href={`/content/admin/registered?form=${form.slug}`}
                    className="cms-btn cms-btn-ghost cms-btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Users size={13} /> Entries
                  </Link>
                  <a
                    href={`/register/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cms-btn cms-btn-ghost cms-btn-sm"
                    style={{ padding: '6px 10px' }}
                    title="View public page"
                  >
                    <ExternalLink size={13} />
                  </a>
                  {form.key !== 'registration-form' && (
                    <button
                      className="cms-btn cms-btn-danger cms-btn-sm"
                      onClick={() => handleDelete(form.key, form.name || form.key)}
                      disabled={deleting === form.key}
                      title="Delete form"
                    >
                      {deleting === form.key ? '…' : <Trash2 size={13} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; }
      `}</style>
    </div>
  )
}
