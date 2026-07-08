/**
 * CMS Admin — Menu Management
 *
 * Manage Alert Bar quick links, Main Navigation items, and Services Sub-menus.
 * Full CRUD: add, edit, delete, reorder.
 *
 * Styled to match the page editor's card-based layout (Tailwind classes).
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Save,
  Edit3,
  X,
  GripVertical,
  Check,
  AlertTriangle,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  INPUT_CLASS,
  INPUT_COMPACT_CLASS,
  LABEL_CLASS,
  BTN_PRIMARY_SM,
  BTN_GHOST,
  BTN_PRIMARY_LG,
  CARD_COMPACT_CLASS,
  CARD_CLASS,
  TOAST_SUCCESS_CLASS,
  TOAST_ERROR_CLASS,
  SPINNER_CLASS,
  LOADING_WRAPPER_CLASS,
} from '@/app/content/admin/lib/cms-styles'

const MENU_TYPES = [
  { key: 'alert-bar', label: 'Alert Bar Links', desc: 'Quick links shown in the top alert bar (About Us, TIA, Career, News)', icon: '🔔' },
  { key: 'alert-ticker', label: 'Ticker Messages', desc: 'Scrolling alert messages in the top bar (security warnings, award announcements)', icon: '📢' },
  { key: 'main-nav', label: 'Main Navigation', desc: 'Primary navigation menu items (Home, About Us, Services, Portfolio, etc.)', icon: '📋' },
  { key: 'services-sub', label: 'Services Sub-menus', desc: 'Dropdown items under the Services menu (Press Release, Digital Marketing, etc.)', icon: '📂' },
]

interface MenuItem {
  _id?: string
  label: string
  icon?: string
  href?: string
  order?: number
  isActive?: boolean
  type?: string
}



// ── Menu Form ─────────────────────────────────────────────────────────

function MenuForm({ item, onSave, onCancel, saving, menuType }: {
  item: MenuItem | null
  onSave: (data: any) => void
  onCancel?: () => void
  saving: boolean
  menuType: string
}) {
  const isTicker = menuType === 'alert-ticker'
  const [label, setLabel] = useState(item?.label || '')
  const [icon, setIcon] = useState(item?.icon || '')
  const [href, setHref] = useState(item?.href || '')
  const [order, setOrder] = useState(item?.order ?? 0)
  const [isActive, setIsActive] = useState(item?.isActive ?? true)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!label.trim()) { setError(isTicker ? 'Message text is required' : 'Label is required'); return }
    if (!isTicker && !href.trim()) { setError('URL is required'); return }
    onSave({ label: label.trim(), icon: icon.trim() || (item?.icon || ''), href: isTicker ? (item?.href || '#') : href.trim(), order: Number(order), isActive })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 flex-wrap items-end">
        {isTicker ? (
          <>
            <div className="flex flex-col gap-1" style={{ width: 80 }}>
              <label className={LABEL_CLASS}>Icon</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className={INPUT_COMPACT_CLASS} placeholder="🚨" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <label className={LABEL_CLASS}>Message</label>
              <textarea value={label} onChange={(e) => setLabel(e.target.value)} className={`${INPUT_COMPACT_CLASS} resize-y min-h-[52px]`} placeholder="Type your alert ticker message..." rows={2} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1 flex-[2] min-w-0">
              <label className={LABEL_CLASS}>Label</label>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className={INPUT_COMPACT_CLASS} placeholder="e.g. About Us" />
            </div>
            <div className="flex flex-col gap-1 flex-[2] min-w-0">
              <label className={LABEL_CLASS}>URL</label>
              <input type="text" value={href} onChange={(e) => setHref(e.target.value)} className={INPUT_COMPACT_CLASS} placeholder="e.g. /about-us" />
            </div>
          </>
        )}
        <div className="flex flex-col gap-1" style={{ width: 80 }}>
          <label className={LABEL_CLASS}>Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value === '' ? 0 : Number(e.target.value))} className={INPUT_COMPACT_CLASS} min={0} />
        </div>
        <div className="flex flex-col gap-1" style={{ width: 70 }}>
          <label className={LABEL_CLASS}>Active</label>
          <div className="flex items-center h-[38px]">
            <label className="relative inline-block w-9 h-5 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="opacity-0 w-0 h-0 absolute" />
              <span className={`absolute inset-0 rounded-full transition-colors ${isActive ? 'bg-emerald-500/60' : 'bg-slate-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" className={BTN_PRIMARY_SM} disabled={saving}>
          <Save size={13} />
          {saving ? 'Saving…' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" className={BTN_GHOST} onClick={onCancel}>
            <X size={13} />
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

// ── Sortable Menu Item Row ────────────────────────────────────────────

function SortableMenuItemRow({ item, onEdit, onDelete, onToggleActive, deleting, menuType }: {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  deleting: boolean
  menuType: string
}) {
  const isTicker = menuType === 'alert-ticker'
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id || item.label })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
        isDragging
          ? 'border-sky-500 shadow-lg shadow-sky-500/20 bg-gradient-to-r from-slate-800 to-slate-800/50'
          : item.isActive
            ? 'bg-slate-800/20 border-slate-700 hover:border-slate-600'
            : 'bg-slate-800/10 border-slate-700/50 opacity-55'
      }`}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="text-slate-500 hover:text-sky-400 cursor-grab active:cursor-grabbing flex-shrink-0 p-0.5 rounded transition-colors hover:bg-sky-500/10">
        <GripVertical size={15} />
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isTicker && item.icon && <span className="text-base leading-none">{item.icon}</span>}
          <span className="text-sm font-semibold text-slate-200 truncate">{item.label}</span>
          {!item.isActive && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Inactive</span>
          )}
        </div>
        <div className={`text-xs ${isTicker ? 'text-slate-500 truncate max-w-[500px]' : 'text-slate-500 font-mono'}`}>
          {isTicker ? item.label : item.href}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <label className="relative inline-block w-7 h-4 cursor-pointer" title={item.isActive ? 'Deactivate' : 'Activate'}>
          <input type="checkbox" checked={item.isActive} onChange={() => onToggleActive(item._id || '', !item.isActive)} className="opacity-0 w-0 h-0 absolute" />
          <span className={`absolute inset-0 rounded-full transition-colors ${item.isActive ? 'bg-emerald-500/60' : 'bg-slate-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${item.isActive ? 'translate-x-3' : 'translate-x-0'}`} />
          </span>
        </label>
        <button className="p-1.5 rounded-lg bg-slate-700/40 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors" onClick={() => onEdit(item)} title="Edit">
          <Edit3 size={13} />
        </button>
        <button className="p-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors" onClick={() => onDelete(item._id || '')} disabled={deleting} title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function MenusPage() {
  const [activeTab, setActiveTab] = useState('alert-bar')
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ kind?: string; text: string } | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/content/admin/menus?type=${activeTab}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setItems(data.items || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally { setLoading(false) }
  }, [activeTab])

  useEffect(() => { loadItems() }, [loadItems])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i._id === active.id)
    const newIndex = items.findIndex((i) => i._id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(items, oldIndex, newIndex)
    const updatedItems = reordered.map((item, idx) => ({ ...item, order: idx }))
    setItems(updatedItems)
    try {
      const res = await fetch('/api/content/admin/menus/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems.map((item) => ({ _id: item._id, order: item.order })) }),
      })
      if (!res.ok) throw new Error('Failed to save order')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      loadItems()
    }
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true)
    setError('')
    try {
      const isUpdate = !!editingItem
      const url = isUpdate ? `/api/content/admin/menus/${editingItem!._id}` : '/api/content/admin/menus'
      const body = isUpdate ? data : { ...data, type: activeTab }
      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save')
      setToast({ kind: 'success', text: isUpdate ? 'Menu item updated!' : 'Menu item created!' })
      setEditingItem(null)
      setShowAddForm(false)
      loadItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this menu item?')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/content/admin/menus/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to delete')
      setToast({ kind: 'success', text: 'Menu item deleted!' })
      loadItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally { setDeleting(false) }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/content/admin/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to update')
      setToast({ kind: 'success', text: isActive ? 'Menu item activated!' : 'Menu item deactivated!' })
      loadItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  function handleEdit(item: MenuItem) { setEditingItem(item); setShowAddForm(false) }
  function handleCancel() { setEditingItem(null); setShowAddForm(false) }

  const currentType = MENU_TYPES.find((t) => t.key === activeTab)

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-100">Menu Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage navigation menus across your website</p>
      </div>

      {/* Toast */}        {toast && (
        <div className={TOAST_SUCCESS_CLASS}>
          <Check size={14} />
          {toast.text}
        </div>
      )}

      {error && (
        <div className={TOAST_ERROR_CLASS}>{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-slate-900/40 border border-slate-700 rounded-xl p-1.5 overflow-x-auto">
        {MENU_TYPES.map((t) => (
          <button
            key={t.key}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all font-sans ${
              activeTab === t.key
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30 border border-transparent'
            }`}
            onClick={() => { setActiveTab(t.key); setEditingItem(null); setShowAddForm(false) }}
          >
            <span className="text-sm">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.key === 'alert-bar' ? 'Alert' : t.key === 'alert-ticker' ? 'Ticker' : t.key === 'main-nav' ? 'Nav' : 'Sub'}</span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{currentType?.desc}</p>

      {/* Add/Edit form card */}
      {(showAddForm || editingItem) && (
        <div className={CARD_COMPACT_CLASS + ' mb-4'}>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            {editingItem ? `Edit: ${editingItem.label}` : `New ${currentType?.label}`}
          </h3>
          <MenuForm item={editingItem} onSave={handleSave} onCancel={handleCancel} saving={saving} menuType={activeTab} />
        </div>
      )}

      {/* Add button */}
      {!showAddForm && !editingItem && (
        <button
          className={BTN_PRIMARY_LG}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={15} />
          Add {currentType?.label}
        </button>
      )}

      {/* Items list with drag-and-drop */}
      <div className="space-y-1.5">
        {loading ? (
          <div className={LOADING_WRAPPER_CLASS}>
            <div className={SPINNER_CLASS} />
            <span className="text-sm">Loading…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-slate-500 text-sm">
            <AlertTriangle size={20} className="text-slate-600" />
            <p>No {currentType?.label?.toLowerCase()} found. Click the button above to add one.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i._id || i.label)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableMenuItemRow
                  key={item._id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  deleting={deleting}
                  menuType={activeTab}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
