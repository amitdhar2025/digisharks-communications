/**
 * CMS Admin - Registered Entries Page
 *
 * View all public registration form submissions with search,
 * pagination, and delete capabilities.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Users,
  Search,
  Trash2,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Settings,
  FileSpreadsheet,
  CalendarDays,
  Filter,
} from 'lucide-react'
import Link from 'next/link'

interface FormConfigInfo {
  slug: string
  name: string
}

interface RegistrationItem {
  _id: string
  reference: string
  fullName: string
  email: string
  phone: string
  formData: Record<string, any>
  formSlug: string
  emailSent: boolean
  emailSentAt?: string
  emailError?: string
  createdAt: string
  updatedAt: string
}

interface ListResponse {
  items: RegistrationItem[]
  total: number
  pages: number
  page: number
}

/** Known important form data keys that deserve their own column */
const IMPORTANT_FIELD_KEYS = [
  'company',
  'service',
  'preferredContact',
  'budget',
  'hearAbout',
  'message',
] as const

function getFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    company: 'Company',
    service: 'Service',
    preferredContact: 'Contact Method',
    budget: 'Budget',
    hearAbout: 'Heard Via',
    message: 'Message',
  }
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

function formatFieldValue(value: any): string {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? '✅ Yes' : '—'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

/** Read all filter state from URL search params */
function readFiltersFromURL(): {
  search: string
  form: string
  dateFrom: string
  dateTo: string
  updatedFrom: string
  updatedTo: string
  page: number
  sortField: 'createdAt' | 'updatedAt'
  sortDir: 'desc' | 'asc'
} {
  const p = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const sf = p.get('sortField')
  return {
    search: p.get('search') || '',
    form: p.get('form') || '',
    dateFrom: p.get('dateFrom') || '',
    dateTo: p.get('dateTo') || '',
    updatedFrom: p.get('updatedFrom') || '',
    updatedTo: p.get('updatedTo') || '',
    page: Math.max(1, parseInt(p.get('page') || '1', 10)),
    sortField: sf === 'updatedAt' ? 'updatedAt' : 'createdAt',
    sortDir: p.get('sort') === 'asc' ? 'asc' : 'desc',
  }
}

export default function RegisteredEntriesPage() {
  // ── Initialise state from URL ──────────────────────────────
  const initial = readFiltersFromURL()

  const [items, setItems] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(initial.search)
  const [page, setPage] = useState(initial.page)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState<RegistrationItem | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteAllBusy, setDeleteAllBusy] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    danger?: boolean
    onConfirm: () => void
  }>({ open: false, title: '', message: '', onConfirm: () => {} })
  const [formFilter, setFormFilter] = useState(initial.form)
  const [formNameMap, setFormNameMap] = useState<Record<string, string>>({})
  const [dateFrom, setDateFrom] = useState(initial.dateFrom)
  const [dateTo, setDateTo] = useState(initial.dateTo)
  const [updatedFrom, setUpdatedFrom] = useState(initial.updatedFrom)
  const [updatedTo, setUpdatedTo] = useState(initial.updatedTo)
  const [sortField, setSortField] = useState<'createdAt' | 'updatedAt'>(initial.sortField)
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>(initial.sortDir)

  // Track initial mount so we don't write URL during the first render
  const isFirstRender = useRef(true)

  // Fetch form configs to build slug → name map
  useEffect(() => {
    fetch('/api/content/admin/registration-form-config')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {}
        if (data.forms && Array.isArray(data.forms)) {
          data.forms.forEach((f: FormConfigInfo) => {
            map[f.slug] = f.name
          })
        }
        setFormNameMap(map)
      })
      .catch(() => {
        // non-critical, fall back to slug
      })
  }, [])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [formFilter, dateFrom, dateTo, updatedFrom, updatedTo])

  // ── Sync filter / pagination state to URL ─────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const p = new URLSearchParams()
    if (search.trim()) p.set('search', search.trim())
    if (formFilter) p.set('form', formFilter)
    if (dateFrom) p.set('dateFrom', dateFrom)
    if (dateTo) p.set('dateTo', dateTo)
    if (updatedFrom) p.set('updatedFrom', updatedFrom)
    if (updatedTo) p.set('updatedTo', updatedTo)
    if (page > 1) p.set('page', String(page))
    if (sortField !== 'createdAt') p.set('sortField', sortField)
    if (sortDir !== 'desc') p.set('sort', sortDir)

    const qs = p.toString()
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [search, formFilter, dateFrom, dateTo, updatedFrom, updatedTo, page, sortField, sortDir])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sort: sortDir,
        sortField: sortField,
      })
      if (search.trim()) params.set('search', search.trim())
      if (formFilter) params.set('form', formFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (updatedFrom) params.set('updatedFrom', updatedFrom)
      if (updatedTo) params.set('updatedTo', updatedTo)

      const res = await fetch(`/api/content/admin/registered?${params}`)
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/content/admin/login'
          return
        }
        throw new Error('Failed to load')
      }
      const data: ListResponse = await res.json()
      setItems(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch (e: any) {
      setError(e.message || 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }, [page, search, formFilter, dateFrom, dateTo, updatedFrom, updatedTo, sortField, sortDir])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleDelete(id: string) {
    // Find the item to show details in the confirmation
    const item = items.find(i => i._id === id)
    const itemName = item ? `${item.fullName} (${item.reference})` : 'this entry'
    setConfirmModal({
      open: true,
      title: 'Delete Entry',
      message: `Are you sure you want to delete the entry for ${itemName}? This action cannot be undone.`,
      confirmLabel: 'Delete Entry',
      danger: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }))
        setDeleting(id)
        try {
          const res = await fetch('/api/content/admin/registered', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          })
          if (!res.ok) throw new Error('Delete failed')
          setToast({ kind: 'success', text: 'Entry deleted.' })
          setSelectedItem(null)
          loadData()
        } catch (e: any) {
          setToast({ kind: 'error', text: e.message || 'Delete failed' })
        } finally {
          setDeleting(null)
        }
      },
    })
  }

  async function handleDeleteAll() {
    // Build a description of what will be deleted
    const parts: string[] = []
    if (formFilter) parts.push(`form "${formNameMap[formFilter] || formFilter}"`)
    if (dateFrom || dateTo) parts.push(`submitted ${dateFrom || '…'} → ${dateTo || '…'}`)
    if (updatedFrom || updatedTo) parts.push(`updated ${updatedFrom || '…'} → ${updatedTo || '…'}`)
    const label = parts.length > 0 ? parts.join(', ') : 'ALL registered entries'
    setConfirmModal({
      open: true,
      title: 'Delete All Entries',
      message: `Are you sure you want to delete ${label}? This will permanently remove all matching entries from the database. This action cannot be undone.`,
      confirmLabel: `Delete ${parts.length > 0 ? 'Filtered' : 'All'} Entries`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }))
        setDeleteAllBusy(true)
      try {
        const body: Record<string, any> = { deleteAll: true }
        if (formFilter) body.form = formFilter
        if (dateFrom) body.dateFrom = dateFrom
        if (dateTo) body.dateTo = dateTo
        if (updatedFrom) body.updatedFrom = updatedFrom
        if (updatedTo) body.updatedTo = updatedTo
        const res = await fetch('/api/content/admin/registered', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Delete failed')
        const result = await res.json()
        setToast({ kind: 'success', text: result.message || 'Entries deleted.' })
        loadData()
      } catch (e: any) {
        setToast({ kind: 'error', text: e.message || 'Delete failed' })
      } finally {
        setDeleteAllBusy(false)
      }
    },
  })
  }

  /** Toggle sort for a given field */
  function toggleSort(field: 'createdAt' | 'updatedAt') {
    if (sortField === field) {
      // Flip direction
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc') // default to newest-first when switching fields
    }
    setPage(1)
  }

  /** Format a Date as YYYY-MM-DD for <input type="date"> */
  function toDateInputValue(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  /** Compute preset date range and apply it */
  function applyPreset(preset: 'today' | 'last7' | 'thisMonth' | 'lastMonth') {
    const { from, to } = getPresetDates(preset)
    setDateFrom(toDateInputValue(from))
    setDateTo(toDateInputValue(to))
    setPage(1)
  }

  /** Shared helper: compute from/to Date objects for a preset */
  function getPresetDates(preset: 'today' | 'last7' | 'thisMonth' | 'lastMonth'): { from: Date; to: Date } {
    const now = new Date()
    switch (preset) {
      case 'today':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          to: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        }
      case 'last7':
        const to7 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const from7 = new Date(to7)
        from7.setDate(from7.getDate() - 6)
        return { from: from7, to: to7 }
      case 'thisMonth':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        }
      case 'lastMonth':
        return {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0),
        }
    }
  }

  /** Check if a submitted-date preset is currently active */
  function isPresetActive(preset: 'today' | 'last7' | 'thisMonth' | 'lastMonth'): boolean {
    const { from, to } = getPresetDates(preset)
    return dateFrom === toDateInputValue(from) && dateTo === toDateInputValue(to)
  }

  const PRESETS = [
    { id: 'today' as const, label: 'Today' },
    { id: 'last7' as const, label: 'Last 7 Days' },
    { id: 'thisMonth' as const, label: 'This Month' },
    { id: 'lastMonth' as const, label: 'Last Month' },
  ]

  function SortIcon({ field }: { field: 'createdAt' | 'updatedAt' }) {
    if (sortField !== field) {
      return <ArrowUpDown size={11} style={{ opacity: 0.3, marginLeft: 3 }} />
    }
    return sortDir === 'desc'
      ? <ArrowDown size={11} style={{ color: '#0ea5e9', marginLeft: 3 }} />
      : <ArrowUp size={11} style={{ color: '#0ea5e9', marginLeft: 3 }} />
  }

  /** Build a filename suffix reflecting active filters */
  function buildFilterSuffix(): string {
    const parts: string[] = []
    const fName = formFilter ? (formNameMap[formFilter] || formFilter).replace(/\s+/g, '-') : ''
    if (fName) parts.push(fName)
    if (dateFrom || dateTo) parts.push(`submitted-${dateFrom || 'start'}--${dateTo || 'end'}`)
    if (updatedFrom || updatedTo) parts.push(`updated-${updatedFrom || 'start'}--${updatedTo || 'end'}`)
    if (parts.length === 0) return ''
    return '_' + parts.join('_')
  }

  const [exportingExcel, setExportingExcel] = useState(false)

  async function handleExportExcel() {
    setExportingExcel(true)
    try {
      const params = new URLSearchParams({ sort: sortDir, sortField })
      if (search.trim()) params.set('search', search.trim())
      if (formFilter) params.set('form', formFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (updatedFrom) params.set('updatedFrom', updatedFrom)
      if (updatedTo) params.set('updatedTo', updatedTo)

      const res = await fetch(`/api/content/admin/registered/export?${params}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registered-entries${buildFilterSuffix()}_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      setToast({ kind: 'success', text: 'Excel file downloaded.' })
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message || 'Export failed' })
    } finally {
      setExportingExcel(false)
    }
  }

  const [exportingCSV, setExportingCSV] = useState(false)

  async function handleExportCSV() {
    setExportingCSV(true)
    try {
      // Fetch ALL entries from the API (not just current page)
      const params = new URLSearchParams({ page: '1', limit: '10000', sort: sortDir, sortField })
      if (search.trim()) params.set('search', search.trim())
      if (formFilter) params.set('form', formFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (updatedFrom) params.set('updatedFrom', updatedFrom)
      if (updatedTo) params.set('updatedTo', updatedTo)

      const res = await fetch(`/api/content/admin/registered?${params}`)
      if (!res.ok) throw new Error('Failed to fetch entries for CSV export')
      const data: ListResponse = await res.json()
      const allItems = data.items || []

      // Collect all unique formData keys across all items for dynamic columns
      const allFormDataKeys = new Set<string>()
      allItems.forEach(item => {
        if (item.formData) Object.keys(item.formData).forEach(k => allFormDataKeys.add(k))
      })
      const formDataCols = Array.from(allFormDataKeys)

      const headers = ['Reference', 'Full Name', 'Email', 'Phone', 'Form Slug', 'Submitted At', 'Updated At', 'Email Sent', ...formDataCols]
      const rows = allItems.map(item => [
        item.reference,
        item.fullName,
        item.email,
        item.phone || '',
        item.formSlug || '',
        new Date(item.createdAt).toLocaleDateString('en-IN'),
        item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN') : '',
        item.emailSent ? 'Yes' : 'No',
        ...formDataCols.map(k => {
          const val = item.formData?.[k]
          if (val === undefined || val === null || val === '') return ''
          if (typeof val === 'boolean') return val ? 'Yes' : 'No'
          if (Array.isArray(val)) return val.join(', ')
          return String(val)
        }),
      ])

      const csv = [
        headers.join(','),
        ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registered-entries${buildFilterSuffix()}_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setToast({ kind: 'success', text: `CSV downloaded (${allItems.length} entries).` })
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message || 'CSV export failed' })
    } finally {
      setExportingCSV(false)
    }
  }

  function fmtDate(iso: string) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div>
      {/* ── Top Bar ── */}
      <div className="cms-topbar">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={22} />
            Registered Entries
          </h1>
          <div className="sub">
            {total > 0
              ? `${total} registration${total !== 1 ? 's' : ''} total`
              : 'View all public registration form submissions'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {items.length > 0 && (
            <>
              <button className="cms-btn cms-btn-secondary cms-btn-sm" onClick={handleExportExcel} disabled={exportingExcel}>
                {exportingExcel ? (
                  <><span className="spinner" style={{ width: 12, height: 12 }} /> Exporting…</>
                ) : (
                  <><FileSpreadsheet size={14} /> Export Excel</>
                )}
              </button>
              <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={handleExportCSV} disabled={exportingCSV}>
                {exportingCSV ? (
                  <><span className="spinner" style={{ width: 12, height: 12 }} /> Exporting…</>
                ) : (
                  <><Download size={14} /> CSV</>
                )}
              </button>
              <button className="cms-btn cms-btn-danger cms-btn-sm" onClick={handleDeleteAll} disabled={deleteAllBusy}>
                {deleteAllBusy ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={14} />}
                Delete All
              </button>
            </>
          )}
          <Link href="/content/admin/registration-forms" className="cms-btn cms-btn-primary cms-btn-sm" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none',
          }}>
            <Settings size={14} />
            Forms
          </Link>
          <button className="cms-btn cms-btn-ghost cms-btn-sm" onClick={loadData}>
            <RefreshCw size={14} />
            Refresh
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

      {/* ── Filters Row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flexWrap: 'wrap', marginBottom: 16,
      }}>
        {/* ── Search Bar ── */}
        <div className="cms-toolbar" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          flex: '1 1 280px',
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 12, padding: '10px 14px',
        }}>
          <Search size={16} style={{ color: '#475569', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or reference..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: '#e2e8f0', fontSize: 13, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Date Presets ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              style={{
                padding: '5px 10px', borderRadius: 8, border: '1px solid',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                background: isPresetActive(p.id) ? 'rgba(14,165,233,0.15)' : 'transparent',
                color: isPresetActive(p.id) ? '#7dd3fc' : '#64748b',
                borderColor: isPresetActive(p.id) ? 'rgba(14,165,233,0.3)' : '#1e293b',
              }}
              onMouseEnter={e => { if (!isPresetActive(p.id)) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8' } }}
              onMouseLeave={e => { if (!isPresetActive(p.id)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Submitted Date Filter ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 12, padding: '6px 10px',
        }} title="Filter by submission date">
          <CalendarDays size={14} style={{ color: '#0ea5e9', flexShrink: 0 }} />
          <span style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginRight: 2 }}>Submitted</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Submitted from date"
            style={{
              background: 'transparent', border: 'none',
              color: '#e2e8f0', fontSize: 12, outline: 'none',
              fontFamily: 'inherit', width: 118,
              colorScheme: 'dark',
            }}
          />
          <span style={{ color: '#475569', fontSize: 11 }}>→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Submitted to date"
            style={{
              background: 'transparent', border: 'none',
              color: '#e2e8f0', fontSize: 12, outline: 'none',
              fontFamily: 'inherit', width: 118,
              colorScheme: 'dark',
            }}
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(1) }}
              title="Clear submission date range"
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, padding: '2px' }}
            >
              ✕
            </button>
          )}
        </div>



        {/* ── Updated Date Filter ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 12, padding: '6px 10px',
        }} title="Filter by last updated date">
          <RefreshCw size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
          <span style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginRight: 2 }}>Updated</span>
          <input
            type="date"
            value={updatedFrom}
            onChange={(e) => setUpdatedFrom(e.target.value)}
            title="Updated from date"
            style={{
              background: 'transparent', border: 'none',
              color: '#e2e8f0', fontSize: 12, outline: 'none',
              fontFamily: 'inherit', width: 118,
              colorScheme: 'dark',
            }}
          />
          <span style={{ color: '#475569', fontSize: 11 }}>→</span>
          <input
            type="date"
            value={updatedTo}
            onChange={(e) => setUpdatedTo(e.target.value)}
            title="Updated to date"
            style={{
              background: 'transparent', border: 'none',
              color: '#e2e8f0', fontSize: 12, outline: 'none',
              fontFamily: 'inherit', width: 118,
              colorScheme: 'dark',
            }}
          />
          {(updatedFrom || updatedTo) && (
            <button
              onClick={() => { setUpdatedFrom(''); setUpdatedTo(''); setPage(1) }}
              title="Clear update date range"
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, padding: '2px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Summary Bar ── */}
      {(search || formFilter || dateFrom || dateTo || updatedFrom || updatedTo || sortField !== 'createdAt' || sortDir !== 'desc') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          flexWrap: 'wrap', marginBottom: 12,
          padding: '8px 14px',
          background: 'rgba(14,165,233,0.04)',
          border: '1px solid rgba(14,165,233,0.12)',
          borderRadius: 10, fontSize: 12,
        }}>
          <Filter size={13} style={{ color: '#0ea5e9', flexShrink: 0 }} />
          {search && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(148,163,184,0.1)',
              color: '#94a3b8',
            }}>
              Search: <strong style={{ color: '#e2e8f0' }}>"{search}"</strong>
            </span>
          )}
          {formFilter && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(168,85,247,0.1)',
              color: '#a78bfa',
            }}>
              Form: <strong style={{ color: '#e2e8f0' }}>{formNameMap[formFilter] || formFilter}</strong>
            </span>
          )}
          {dateFrom && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(14,165,233,0.1)',
              color: '#7dd3fc',
            }}>
              Submitted: <strong style={{ color: '#e2e8f0' }}>{dateFrom}{dateTo ? ` → ${dateTo}` : ' → …'}</strong>
            </span>
          )}
          {!dateFrom && dateTo && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(14,165,233,0.1)',
              color: '#7dd3fc',
            }}>
              Submitted: <strong style={{ color: '#e2e8f0' }}>… → {dateTo}</strong>
            </span>
          )}
          {updatedFrom && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(168,85,247,0.1)',
              color: '#c4b5fd',
            }}>
              Updated: <strong style={{ color: '#e2e8f0' }}>{updatedFrom}{updatedTo ? ` → ${updatedTo}` : ' → …'}</strong>
            </span>
          )}
          {!updatedFrom && updatedTo && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(168,85,247,0.1)',
              color: '#c4b5fd',
            }}>
              Updated: <strong style={{ color: '#e2e8f0' }}>… → {updatedTo}</strong>
            </span>
          )}
          {(sortField !== 'createdAt' || sortDir !== 'desc') && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(34,197,94,0.1)',
              color: '#4ade80',
            }}>
              Sorted: <strong style={{ color: '#e2e8f0' }}>{sortField === 'updatedAt' ? 'Updated' : 'Submitted'} {sortDir === 'asc' ? 'oldest' : 'newest'}</strong>
            </span>
          )}
          <button
            onClick={() => {
              setSearch('')
              setFormFilter('')
              setDateFrom('')
              setDateTo('')
              setUpdatedFrom('')
              setUpdatedTo('')
              setSortField('createdAt')
              setSortDir('desc')
              setPage(1)
            }}
            style={{
              marginLeft: 'auto',
              padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)',
              background: 'transparent', color: '#fca5a5', fontSize: 11,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ── Entries Table ── */}
      <div className="cms-table-wrap">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Form</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              {IMPORTANT_FIELD_KEYS.map(key => (
                <th key={key}>{getFieldLabel(key)}</th>
              ))}
              <th
                onClick={() => toggleSort('createdAt')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Submitted <SortIcon field="createdAt" />
              </th>
              <th
                onClick={() => toggleSort('updatedAt')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Updated <SortIcon field="updatedAt" />
              </th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={IMPORTANT_FIELD_KEYS.length + 9} className="cms-empty-state" style={{ padding: 40 }}>
                  <div className="spinner" style={{
                    display: 'inline-block', width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                    marginRight: 8,
                  }} />
                  Loading entries…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={IMPORTANT_FIELD_KEYS.length + 9} className="cms-empty-state" style={{ padding: 40, textAlign: 'center' }}>
                  <Users size={24} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ color: '#64748b', fontSize: 13 }}>
                    {search ? 'No entries match your search.' : 'No registrations yet.'}
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <code style={{ fontSize: 11, color: '#7dd3fc', whiteSpace: 'nowrap' }}>{item.reference}</code>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 600,
                      color: '#a78bfa', whiteSpace: 'nowrap', maxWidth: 150,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }} title={formNameMap[item.formSlug] || item.formSlug}>
                      {formNameMap[item.formSlug] || item.formSlug}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.fullName}</div>
                  </td>
                  <td>
                    <a href={`mailto:${item.email}`} style={{ color: '#7dd3fc', textDecoration: 'none', fontSize: 13 }}>
                      {item.email}
                    </a>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{item.phone || '—'}</td>
                  {IMPORTANT_FIELD_KEYS.map(key => (
                    <td key={key} style={{
                      color: '#94a3b8', fontSize: 12,
                      maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }} title={formatFieldValue(item.formData?.[key])}>
                      {formatFieldValue(item.formData?.[key])}
                    </td>
                  )                  )}
                  <td style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {fmtDate(item.createdAt)}
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {fmtDate(item.updatedAt)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {item.emailSent ? (
                      <span className="cms-status-published" style={{ fontSize: 11 }}>
                        <CheckCircle size={11} style={{ color: '#4ade80' }} />
                        Sent
                      </span>
                    ) : item.emailError ? (
                      <span style={{ fontSize: 11, color: '#fca5a5' }} title={item.emailError}>
                        <XCircle size={11} style={{ display: 'inline' }} /> Failed
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#64748b' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="cms-action-btns">
                      <button
                        className="cms-btn cms-btn-sm cms-btn-ghost"
                        onClick={() => setSelectedItem(item)}
                      >
                        👁
                      </button>
                      <button
                        className="cms-btn cms-btn-sm cms-btn-danger"
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                        style={{ fontWeight: 600 }}
                      >
                        {deleting === item._id ? (
                          <span className="spinner" style={{ width: 12, height: 12, border: '2px solid rgba(239,68,68,0.3)', borderTopColor: '#ef4444' }} />
                        ) : (
                          <><Trash2 size={12} /> Delete</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div className="cms-pager" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderTop: '1px solid #1e293b',
            background: '#0b1220', fontSize: 12, color: '#94a3b8',
          }}>
            <span>Page {page} of {pages} · {total} total</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="cms-btn cms-btn-sm cms-btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ArrowLeft size={14} /> Prev
              </button>
              <button
                className="cms-btn cms-btn-sm cms-btn-ghost"
                disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Detail Modal ── */}
      {selectedItem && (
        <div
          className="cms-modal-backdrop"
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '5vh 24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 640, maxHeight: '85vh', overflowY: 'auto',
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 16, padding: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📋 Entry Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#16a34a', marginBottom: 6 }}>
                Reference
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
                {selectedItem.reference}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {[
                  ['Full Name', selectedItem.fullName],
                  ['Email', selectedItem.email],
                  ['Phone', selectedItem.phone || '—'],
                  ['Form', formNameMap[selectedItem.formSlug] || selectedItem.formSlug],
                  ['Form Slug', selectedItem.formSlug],
                  ['Submitted', fmtDate(selectedItem.createdAt)],
                  ['Last Updated', fmtDate(selectedItem.updatedAt)],
                  ['Email Sent', selectedItem.emailSent ? '✅ Yes' : selectedItem.emailError ? `❌ ${selectedItem.emailError}` : '—'],
                  ['Email Sent At', selectedItem.emailSentAt ? fmtDate(selectedItem.emailSentAt) : '—'],
                ].map(([label, value], i) => (
                  <tr key={i} style={{ borderBottom: i < 8 ? '1px solid #1e293b' : 'none' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600, width: '40%', verticalAlign: 'top' }}>
                      {label}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0', wordBreak: 'break-word' }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Form Data ── */}
            {Object.keys(selectedItem.formData || {}).length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📝 Form Data
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>
                    ({Object.keys(selectedItem.formData).length} fields)
                  </span>
                </h3>
                <div style={{ background: '#0b1220', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
                  {Object.entries(selectedItem.formData).map(([key, value], idx) => (
                    <div key={key} style={{
                      display: 'flex', gap: 8, padding: '7px 0',
                      borderBottom: idx < Object.keys(selectedItem.formData).length - 1 ? '1px solid #1e293b' : 'none',
                      fontSize: 13,
                    }}>
                      <span style={{ color: '#64748b', fontWeight: 600, minWidth: 160, flexShrink: 0 }}>
                        {getFieldLabel(key)}:
                      </span>
                      <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>
                        {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No')
                          : Array.isArray(value) ? value.join(', ')
                          : String(value || '—')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                className="cms-btn cms-btn-ghost"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
              <button
                className="cms-btn cms-btn-danger"
                onClick={() => {
                  const id = selectedItem._id
                  setSelectedItem(null)
                  handleDelete(id)
                }}
              >
                <Trash2 size={14} />
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmModal.open && (
        <div
          className="cms-modal-backdrop"
          onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '5vh 24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440,
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 16, padding: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: confirmModal.danger !== false ? 'rgba(239,68,68,0.15)' : 'rgba(14,165,233,0.15)',
                color: confirmModal.danger !== false ? '#ef4444' : '#0ea5e9',
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#e2e8f0' }}>
                  {confirmModal.title}
                </h2>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="cms-btn cms-btn-ghost"
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button
                className={`cms-btn ${confirmModal.danger !== false ? 'cms-btn-danger' : 'cms-btn-primary'}`}
                onClick={confirmModal.onConfirm}
              >
                <Trash2 size={14} />
                {confirmModal.confirmLabel || (confirmModal.danger !== false ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; }
      `}</style>
    </div>
  )
}
