/**
 * CMS Admin — Page Content Editor
 *
 * Renders a form that matches each page's section fields (defined
 * in lib/page-fields.js). Supports text, textarea, link, stats,
 * arrays, and image upload fields.
 *
 * Styled to match the /admin/blog/new editor design (card-based sections
 * with colored accent bars, Tailwind classes).
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPageFields } from '@/lib/page-fields'
import { Upload, X, Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import {
  INPUT_CLASS,
  TEXTAREA_CLASS,
  INPUT_FLEX_CLASS,
  LABEL_CLASS,
  BTN_PRIMARY_LG,
  BTN_GHOST,
  CARD_CLASS,
  ACCENT_COLORS,
  TOAST_SUCCESS_CLASS,
  TOAST_ERROR_CLASS,
  SPINNER_CLASS,
  LOADING_WRAPPER_CLASS,
  BACK_LINK_CLASS,
} from '@/app/content/admin/lib/cms-styles'

export const dynamic = 'force-dynamic'

// ── Colored accent bar component ──────────────────────────────────────

function SectionHeader({ label, colorIndex = 0 }: { label: string; colorIndex?: number }) {
  const color = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length]
  return (
    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
      <span className={`w-1.5 h-5 ${color} rounded-full inline-block flex-shrink-0`} />
      {label}
    </h3>
  )
}

function FieldLabel({ label }: { label: string }) {
  return (
    <label className={LABEL_CLASS}>
      {label}
    </label>
  )
}

// ── Sub-components for each field type ────────────────────────────────

function TextField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
    </div>
  )
}

function TextareaField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={TEXTAREA_CLASS}
      />
    </div>
  )
}

function LinkField({ value, onChange, label }: { value: any; onChange: (v: any) => void; label: string }) {
  const link = value || { text: '', href: '' }
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Button text"
          value={link.text || ''}
          onChange={(e) => onChange({ ...link, text: e.target.value })}
          className={INPUT_FLEX_CLASS}
        />
        <input
          type="text"
          placeholder="URL (e.g. /contact-us)"
          value={link.href || ''}
          onChange={(e) => onChange({ ...link, href: e.target.value })}
          className={INPUT_FLEX_CLASS}
        />
      </div>
    </div>
  )
}

function ImageField({ value, onChange, label, altValue, onAltChange }: {
  value: string; onChange: (v: string) => void; label: string
  altValue?: string; onAltChange?: (v: string) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('image', file)
      const res = await fetch('/api/content/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) onChange(data.url)
    } catch {} finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {value ? (
        <div className="space-y-2">
          <div className="relative group rounded-xl overflow-hidden border border-slate-600 bg-slate-900 max-w-sm">
            <img src={value} alt={altValue || ''} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition-colors">
                {uploading ? 'Uploading…' : 'Replace'}
                <input type="file" accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-xs text-white transition-colors"
                onClick={() => onChange('')}
              >
                <X size={12} /> Remove
              </button>
            </div>
          </div>
          <input
            type="text"
            value={altValue || ''}
            onChange={(e) => onAltChange?.(e.target.value)}
            placeholder="Alt text (for accessibility & SEO)"
            className="w-full max-w-sm bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
      ) : (
        <div>
          <label className="inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-sky-500 hover:bg-slate-800/50 transition-colors text-sm text-slate-400">
            <Upload size={18} />
            {uploading ? 'Uploading…' : 'Upload Image'}
            <input type="file" accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
          </label>
          <input
            type="text"
            value={altValue || ''}
            onChange={(e) => onAltChange?.(e.target.value)}
            placeholder="Alt text (for accessibility & SEO)"
            className="w-full max-w-sm mt-2 bg-slate-900/70 border border-slate-600/60 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
      )}
    </div>
  )
}

// ── Array field types ─────────────────────────────────────────────────

function ArrayRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {children}
      <button
        type="button"
        className="flex-shrink-0 p-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors"
        onClick={onRemove}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function StatsArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <ArrayRow key={i} onRemove={() => onChange(items.filter((_: any, j: number) => j !== i))}>
          <input
            type="text" placeholder="Number" value={item.number || ''}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], number: e.target.value }; onChange(n) }}
            className="w-24 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
          />
          <input
            type="text" placeholder="Suffix" value={item.suffix || ''}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], suffix: e.target.value }; onChange(n) }}
            className="w-16 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
          />
          <input
            type="text" placeholder="Label" value={item.label || ''}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; onChange(n) }}
            className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
          />
        </ArrayRow>
      ))}
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => onChange([...items, { number: '', suffix: '', label: '' }])}
      >
        <Plus size={12} /> Add Stat
      </button>
    </div>
  )
}

function TextArrayField({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const items = value || []
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: string, i: number) => (
        <ArrayRow key={i} onRemove={() => onChange(items.filter((_: string, j: number) => j !== i))}>
          <input
            type="text" value={item || ''}
            onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n) }}
            className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500"
          />
        </ArrayRow>
      ))}
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => onChange([...items, ''])}
      >
        <Plus size={12} /> Add Item
      </button>
    </div>
  )
}

function CardArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3.5 mb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">#{i + 1}</span>
            <button
              type="button"
              className="p-1 rounded-lg text-red-400 hover:bg-red-600/15 transition-colors"
              onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="Icon (emoji)" value={item.icon || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], icon: e.target.value }; onChange(n) }}
              className="w-20 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <input type="text" placeholder="Title" value={item.title || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n) }}
              className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
          </div>
          <textarea placeholder="Description" value={item.desc || item.description || ''} rows={2}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], desc: e.target.value }; onChange(n) }}
            className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 resize-y min-h-[60px]" />
        </div>
      ))}
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => onChange([...items, { icon: '', title: '', desc: '' }])}
      >
        <Plus size={12} /> Add Card
      </button>
    </div>
  )
}

function PolicySectionArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3.5 mb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">#{i + 1}</span>
            <button
              type="button"
              className="p-1 rounded-lg text-red-400 hover:bg-red-600/15 transition-colors"
              onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <input type="text" placeholder="Section Title (e.g. 1. Acceptance of Terms)" value={item.title || ''}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n) }}
            className="w-full mb-2 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
          <textarea placeholder="Section Content" value={item.content || ''} rows={4}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], content: e.target.value }; onChange(n) }}
            className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 resize-y min-h-[80px]" />
        </div>
      ))}
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => onChange([...items, { title: '', content: '' }])}
      >
        <Plus size={12} /> Add Section
      </button>
    </div>
  )
}

function FAQArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3.5 mb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Q{i + 1}</span>
            <button
              type="button"
              className="p-1 rounded-lg text-red-400 hover:bg-red-600/15 transition-colors"
              onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <input type="text" placeholder="Question" value={item.question || ''}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; onChange(n) }}
            className="w-full mb-2 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
          <textarea placeholder="Answer" value={item.answer || ''} rows={2}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; onChange(n) }}
            className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 resize-y min-h-[60px]" />
        </div>
      ))}
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => onChange([...items, { question: '', answer: '' }])}
      >
        <Plus size={12} /> Add FAQ
      </button>
    </div>
  )
}

function TimelineArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3.5 mb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">#{i + 1}</span>
            <button
              type="button"
              className="p-1 rounded-lg text-red-400 hover:bg-red-600/15 transition-colors"
              onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="Year (e.g. 2017)" value={item.year || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], year: e.target.value }; onChange(n) }}
              className="w-24 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <input type="text" placeholder="Heading" value={item.heading || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], heading: e.target.value }; onChange(n) }}
              className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
          </div>
          <textarea placeholder="Description" value={item.description || ''} rows={2}
            onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; onChange(n) }}
            className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 resize-y min-h-[60px]" />
        </div>
      ))}
      <button
        type="button"
        className={BTN_GHOST}
        onClick={() => onChange([...items, { year: '', heading: '', description: '' }])}
      >
        <Plus size={12} /> Add Item
      </button>
    </div>
  )
}

// ── Video field (URL input + upload + preview) ────────────────────────

function VideoField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false)
  const [videoError, setVideoError] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('image', file)
      const res = await fetch('/api/content/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) onChange(data.url)
    } catch {} finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT_FLEX_CLASS}
          placeholder="https://example.com/video.mp4"
        />
        <label className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploading ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100'}`}>
          {uploading ? (
            <><span className="inline-block w-3.5 h-3.5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" /> Uploading</>
          ) : (
            <><Upload size={15} /> Upload</>
          )}
          <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>
      {value && !videoError && (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 bg-black max-w-md">
          <video src={value} controls preload="metadata" className="w-full" style={{ maxHeight: 200 }}
            onError={() => setVideoError(true)}
          />
        </div>
      )}
      {value && videoError && (
        <p className="mt-1 text-xs text-red-400">Video could not be loaded. Check the URL.</p>
      )}
    </div>
  )
}

// ── Shared sortable card header (used by gallery[], award[], etc.) ─────

/** Renders the top header row of a sortable array item: up/down arrows,
 *  index label, active toggle, order input, and delete button. */
function SortableItemHeader({ index, isActive, order, totalItems, onMoveUp, onMoveDown, onToggleActive, onOrderChange, onRemove }: {
  index: number; isActive: boolean; order: number; totalItems: number
  onMoveUp: () => void; onMoveDown: () => void
  onToggleActive: () => void; onOrderChange: (val: number) => void; onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <button type="button" className="p-0.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-30" onClick={onMoveUp} disabled={index === 0}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
        </button>
        <button type="button" className="p-0.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-30" onClick={onMoveDown} disabled={index === totalItems - 1}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">#{index + 1}</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="relative inline-block w-7 h-4 cursor-pointer" title={isActive ? 'Active' : 'Inactive'}>
          <input type="checkbox" checked={isActive} onChange={onToggleActive} className="opacity-0 w-0 h-0 absolute" />
          <span className={`absolute inset-0 rounded-full transition-colors ${isActive ? 'bg-emerald-500/60' : 'bg-slate-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isActive ? 'translate-x-3' : 'translate-x-0'}`} />
          </span>
        </label>
        <input type="number" value={order} onChange={(e) => onOrderChange(parseInt(e.target.value) || 0)}
          className="w-14 bg-slate-900/70 border border-slate-600/60 rounded px-1.5 py-1 text-xs text-slate-200 text-center outline-none focus:border-sky-500" min={0} placeholder="Order" title="Sort Order" />
        <button type="button" className="p-1 rounded-lg text-red-400 hover:bg-red-600/15 transition-colors" onClick={onRemove}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Shared image upload handler ───────────────────────────────────────

async function uploadImage(e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> {
  const file = e.target.files?.[0]
  if (!file) return null
  const formData = new FormData()
  formData.set('image', file)
  const res = await fetch('/api/content/admin/upload', { method: 'POST', body: formData })
  const data = await res.json()
  return res.ok ? data.url : null
}

// ── Helper: upload a single file and return the URL ───────────────────

async function uploadSingleFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.set('image', file)
  const res = await fetch('/api/content/admin/upload', { method: 'POST', body: formData })
  const data = await res.json()
  return res.ok ? data.url : null
}

// ── Gallery array field (sortable images with active/order) ───────────

function GalleryArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null)

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return
    const n = [...items]; const [removed] = n.splice(from, 1); n.splice(to, 0, removed); onChange(n)
  }

  async function handleImageUpload(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    setUploadingIdx(i)
    try {
      const url = await uploadImage(e)
      if (url) {
        const n = [...items]; n[i] = { ...n[i], image: url }; onChange(n)
      }
    } finally {
      setUploadingIdx(null)
      e.target.value = ''
    }
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setBulkUploading(true)
    setBulkProgress({ current: 0, total: files.length })
    const added: any[] = []
    for (let fi = 0; fi < files.length; fi++) {
      setBulkProgress({ current: fi + 1, total: files.length })
      try {
        const url = await uploadSingleFile(files[fi])
        if (url) {
          added.push({ image: url, caption: '', alt: '', link: '', isActive: true, order: items.length + added.length })
        }
      } catch {}
    }
    if (added.length > 0) onChange([...items, ...added])
    setBulkUploading(false)
    setBulkProgress(null)
    e.target.value = ''
  }

  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3.5 mb-2">
          <SortableItemHeader
            index={i} totalItems={items.length} isActive={item.isActive !== false} order={item.order ?? i}
            onMoveUp={() => moveItem(i, i - 1)}
            onMoveDown={() => moveItem(i, i + 1)}
            onToggleActive={() => { const n = [...items]; n[i] = { ...n[i], isActive: item.isActive === false ? true : false }; onChange(n) }}
            onOrderChange={(val) => { const n = [...items]; n[i] = { ...n[i], order: val }; onChange(n) }}
            onRemove={() => onChange(items.filter((_: any, j: number) => j !== i))}
          />
          <div className="flex gap-2 mb-1.5">
            {item.image && <img src={item.image} alt="" className="w-16 h-12 rounded object-cover border border-slate-600 flex-shrink-0" />}
            <input type="text" placeholder="Image URL" value={item.image || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], image: e.target.value }; onChange(n) }}
              className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <label className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploadingIdx === i ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100'}`}>
              {uploadingIdx === i ? (
                <><span className="inline-block w-3 h-3 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" /> Uploading</>
              ) : (
                <><Upload size={13} /> Upload</>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e)} hidden disabled={uploadingIdx !== null || bulkUploading} />
            </label>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Caption" value={item.caption || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], caption: e.target.value }; onChange(n) }}
              className="flex-[2] bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <input type="text" placeholder="Alt text" value={item.alt || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], alt: e.target.value }; onChange(n) }}
              className="flex-[2] bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <input type="text" placeholder="Link URL" value={item.link || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], link: e.target.value }; onChange(n) }}
              className="flex-[3] bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <button type="button" className={BTN_GHOST} onClick={() => onChange([...items, { image: '', caption: '', alt: '', link: '', isActive: true, order: items.length }])} disabled={bulkUploading}>
          <Plus size={12} /> Add Image
        </button>
        <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${bulkUploading ? 'bg-sky-500/20 text-sky-300' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-600/30'}`}>
          {bulkUploading ? (
            <><span className="inline-block w-3 h-3 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" /> {bulkProgress ? `${bulkProgress.current}/${bulkProgress.total}` : 'Uploading...'}</>
          ) : (
            <><Upload size={13} /> Bulk Upload</>
          )}
          <input type="file" multiple accept="image/*" onChange={handleBulkUpload} hidden disabled={bulkUploading} />
        </label>
      </div>
    </div>
  )
}

// ── Award array field (sortable awards with active/order) ─────────────

function AwardArrayField({ value, onChange, label }: { value: any[]; onChange: (v: any[]) => void; label: string }) {
  const items = value || []
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null)

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return
    const n = [...items]; const [removed] = n.splice(from, 1); n.splice(to, 0, removed); onChange(n)
  }

  async function handleImageUpload(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    setUploadingIdx(i)
    try {
      const url = await uploadImage(e)
      if (url) {
        const n = [...items]; n[i] = { ...n[i], image: url }; onChange(n)
      }
    } finally {
      setUploadingIdx(null)
      e.target.value = ''
    }
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setBulkUploading(true)
    setBulkProgress({ current: 0, total: files.length })
    const added: any[] = []
    for (let fi = 0; fi < files.length; fi++) {
      setBulkProgress({ current: fi + 1, total: files.length })
      try {
        const url = await uploadSingleFile(files[fi])
        if (url) {
          added.push({ image: url, title: '', subtitle: '', isActive: true, order: items.length + added.length })
        }
      } catch {}
    }
    if (added.length > 0) onChange([...items, ...added])
    setBulkUploading(false)
    setBulkProgress(null)
    e.target.value = ''
  }

  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3.5 mb-2">
          <SortableItemHeader
            index={i} totalItems={items.length} isActive={item.isActive !== false} order={item.order ?? i}
            onMoveUp={() => moveItem(i, i - 1)}
            onMoveDown={() => moveItem(i, i + 1)}
            onToggleActive={() => { const n = [...items]; n[i] = { ...n[i], isActive: item.isActive === false ? true : false }; onChange(n) }}
            onOrderChange={(val) => { const n = [...items]; n[i] = { ...n[i], order: val }; onChange(n) }}
            onRemove={() => onChange(items.filter((_: any, j: number) => j !== i))}
          />
          <div className="flex gap-2 mb-1.5">
            {item.image && <img src={item.image} alt="" className="w-16 h-12 rounded object-cover border border-slate-600 flex-shrink-0" />}
            <input type="text" placeholder="Award image URL" value={item.image || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], image: e.target.value }; onChange(n) }}
              className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <label className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploadingIdx === i ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100'}`}>
              {uploadingIdx === i ? (
                <><span className="inline-block w-3 h-3 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" /> Uploading</>
              ) : (
                <><Upload size={13} /> Upload</>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e)} hidden disabled={uploadingIdx !== null || bulkUploading} />
            </label>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Award Title (e.g. Google Partner)" value={item.title || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n) }}
              className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
            <input type="text" placeholder="Subtitle (e.g. Premier 2026)" value={item.subtitle || ''}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], subtitle: e.target.value }; onChange(n) }}
              className="flex-1 bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500" />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <button type="button" className={BTN_GHOST} onClick={() => onChange([...items, { image: '', title: '', subtitle: '', isActive: true, order: items.length }])} disabled={bulkUploading}>
          <Plus size={12} /> Add Award
        </button>
        <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${bulkUploading ? 'bg-sky-500/20 text-sky-300' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-600/30'}`}>
          {bulkUploading ? (
            <><span className="inline-block w-3 h-3 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" /> {bulkProgress ? `${bulkProgress.current}/${bulkProgress.total}` : 'Uploading...'}</>
          ) : (
            <><Upload size={13} /> Bulk Upload</>
          )}
          <input type="file" multiple accept="image/*" onChange={handleBulkUpload} hidden disabled={bulkUploading} />
        </label>
      </div>
    </div>
  )
}

// ── Rich text field (uses TipTapEditor with visual/source toggle) ───────

function RichtextField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [Editor, setEditor] = useState<React.ComponentType<{
    content: string; onChange: (html: string) => void; placeholder?: string
  }> | null>(null)
  const [editorError, setEditorError] = useState(false)

  useEffect(() => {
    import('@/components/admin/TipTapEditor')
      .then((mod) => { setEditor(() => mod.default) })
      .catch(() => { setEditorError(true) })
  }, [])

  if (editorError) {
    return (
      <div className="mb-4">
        <FieldLabel label={label} />
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className={TEXTAREA_CLASS}
          placeholder={label + '...'}
        />
        <p className="text-xs text-slate-500 mt-1">Rich text editor unavailable — using plain textarea. Supports HTML tags.</p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <FieldLabel label={label} />
      <div className="text-sm">
        {Editor ? (
          <Editor content={value || ''} onChange={onChange} placeholder={label + '...'} />
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className={TEXTAREA_CLASS}
            placeholder={label + '...'}
          />
        )}
      </div>
    </div>
  )
}

// ── SEO fields ────────────────────────────────────────────────────────

function SeoField({ value, onChange, label, maxChars }: {
  value: string; onChange: (v: string) => void; label: string; maxChars?: number
}) {
  const charCount = (value || '').length
  const isOver = maxChars ? charCount > maxChars : false
  return (
    <div className="mb-3.5">
      <label className={LABEL_CLASS}>{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={`w-full bg-slate-900/70 border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:ring-1 resize-y ${isOver ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-slate-600/60 focus:border-sky-500 focus:ring-sky-500/30'}`}
        placeholder={label + '...'}
      />
      {maxChars && (
        <div className={`text-xs mt-0.5 text-right ${isOver ? 'text-red-400 font-semibold' : 'text-slate-500'}`}>
          {charCount}/{maxChars} chars {isOver ? '(recommended max)' : ''}
        </div>
      )}
    </div>
  )
}

// ── Main editor component ─────────────────────────────────────────────

export default function CMSPageEditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const initialContentRef = useRef<any>(null)
  const [pageFields, setPageFields] = useState<any>(null)
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ kind: string; text: string } | null>(null)

  // Load field definitions and existing content
  useEffect(() => {
    const fields = getPageFields(slug)
    if (!fields) {
      setError(`Unknown page slug: "${slug}"`)
      setLoading(false)
      return
    }
    setPageFields(fields)

    fetch(`/api/content/pages/${slug}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/content/admin/login')
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        const loaded = data.content || {}
        setContent(loaded)
        initialContentRef.current = JSON.parse(JSON.stringify(loaded)) // deep clone
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug, router])

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  /** Recursively extract all Cloudinary URLs from a data object. */
  function extractCloudinaryUrls(data: any, results: Set<string> = new Set()): Set<string> {
    if (!data) return results
    if (typeof data === 'string') {
      const m = data.match(/https?:\/\/res\.cloudinary\.com\/[^\s"']+/g)
      if (m) m.forEach((u: string) => results.add(u.split('?')[0]))
      return results
    }
    if (typeof data !== 'object') return results
    if (Array.isArray(data)) {
      data.forEach((item) => extractCloudinaryUrls(item, results))
    } else {
      Object.values(data).forEach((val) => extractCloudinaryUrls(val, results))
    }
    return results
  }

  /** Delete a Cloudinary file by its URL via the API. */
  async function deleteCloudinaryFile(url: string): Promise<void> {
    try {
      await fetch('/api/content/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
    } catch {
      // Best-effort — never block the save
    }
  }

  // Save content
  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      // Compare old vs new content to find removed Cloudinary URLs
      const oldUrls = extractCloudinaryUrls(initialContentRef.current)
      const newUrls = extractCloudinaryUrls(content)
      const removedUrls: string[] = []
      oldUrls.forEach((url) => {
        if (!newUrls.has(url)) removedUrls.push(url)
      })

      // Delete removed Cloudinary files (best-effort, before save)
      if (removedUrls.length > 0) {
        await Promise.allSettled(removedUrls.map(deleteCloudinaryFile))
      }

      const res = await fetch(`/api/content/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      // Update the ref to match saved state
      initialContentRef.current = JSON.parse(JSON.stringify(content))

      setToast({
        kind: 'success',
        text: removedUrls.length > 0
          ? `Saved! Also cleaned up ${removedUrls.length} removed file(s) from Cloudinary.`
          : 'Content saved successfully!',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Render helpers ──────────────────────────────────────────────────

  function renderField(field: any, idx: number) {
    const value = content[field.key]
    const onChange = (val: any) => setContent((prev: any) => ({ ...prev, [field.key]: val }))

    switch (field.type) {
      case 'text':
        return <TextField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'textarea':
        return <TextareaField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'richtext':
        return <RichtextField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'link':
        return <LinkField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'image': {
        const altKey = field.key + '_alt'
        return (
          <ImageField
            key={idx}
            value={value}
            onChange={onChange}
            label={field.label}
            altValue={content[altKey]}
            onAltChange={(v) => setContent((prev: any) => ({ ...prev, [altKey]: v }))}
          />
        )
      }
      case 'stat[]':
        return <StatsArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'text[]':
        return <TextArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'card[]':
        return <CardArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'policy-section[]':
        return <PolicySectionArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'faq[]':
        return <FAQArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'timeline[]':
        return <TimelineArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'video':
        return <VideoField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'gallery[]':
        return <GalleryArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      case 'award[]':
        return <AwardArrayField key={idx} value={value} onChange={onChange} label={field.label} />
      default:
        return <TextareaField key={idx} value={value} onChange={onChange} label={field.label} />
    }
  }

  // ── Loading state ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={LOADING_WRAPPER_CLASS}>
        <div className={SPINNER_CLASS} />
        <p className="text-sm">Loading editor…</p>
      </div>
    )
  }

  if (error && !pageFields) {
    return (
      <div className={TOAST_ERROR_CLASS}>
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Toast notification */}
      {toast && (
        <div className={`${TOAST_SUCCESS_CLASS}`}>
          {toast.text}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button
            onClick={() => router.push('/content/admin/pages')}
            className={BACK_LINK_CLASS + ' mb-1'}
          >
            <ArrowLeft size={13} />
            Back to Pages
          </button>
          <h1 className="text-xl font-bold text-slate-100">Edit: {pageFields?.pageName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            /{slug === 'home' ? '' : slug} — Update the content shown on this page
          </p>
        </div>
        <button
          className={BTN_PRIMARY_LG}
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={15} />
          {saving ? <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save Content'}
        </button>
      </div>

      {error && (
        <div className={TOAST_ERROR_CLASS}>
          {error}
        </div>
      )}

      {/* Content Sections as Cards */}
      <div className="space-y-5">
        {pageFields?.sections.map((section: any, si: number) => (
          <div key={si} className={CARD_CLASS}>
            <SectionHeader label={section.label} colorIndex={si} />
            <div className="space-y-1">
              {section.fields.map((field: any, fi: number) => renderField(field, fi))}
            </div>
          </div>
        ))}
      </div>

      {/* SEO Settings — collapsible */}
      <details className="mt-5 bg-slate-800/30 border border-slate-700 rounded-xl group" open={!!content?._seo?.metaTitle}>
        <summary className="text-sm font-semibold text-slate-300 uppercase tracking-wider cursor-pointer flex items-center gap-2 p-5 rounded-xl select-none">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block flex-shrink-0" />
          SEO Settings
          <span className="text-slate-500 font-normal normal-case ml-auto group-open:rotate-180 transition-transform text-xs">▼</span>
        </summary>
        <div className="px-5 pb-5 space-y-4">
          <SeoField
            value={content._seo?.metaTitle || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, metaTitle: v } }))}
            label="Meta Title"
            maxChars={60}
          />
          <SeoField
            value={content._seo?.metaDescription || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, metaDescription: v } }))}
            label="Meta Description"
            maxChars={160}
          />
          <SeoField
            value={content._seo?.metaKeywords || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, metaKeywords: v } }))}
            label="Meta Keywords"
          />
          <SeoField
            value={content._seo?.ogTitle || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, ogTitle: v } }))}
            label="OG Title"
          />
          <SeoField
            value={content._seo?.ogDescription || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, ogDescription: v } }))}
            label="OG Description"
          />
          <div className="mb-3.5">
            <label className={LABEL_CLASS}>OG Image URL</label>
            <input
              type="text"
              value={content._seo?.ogImage || ''}
              onChange={(e) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, ogImage: e.target.value } }))}
              className={INPUT_CLASS}
              placeholder="https://..."
            />
            {content._seo?.ogImage && (
              <img src={content._seo.ogImage} alt="" className="mt-2 max-w-xs rounded-lg border border-slate-700" />
            )}
          </div>
          <SeoField
            value={content._seo?.ogImageAlt || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, ogImageAlt: v } }))}
            label="OG Image Alt Text"
          />
          <SeoField
            value={content._seo?.canonicalUrl || ''}
            onChange={(v) => setContent((prev: any) => ({ ...prev, _seo: { ...prev._seo, canonicalUrl: v } }))}
            label="Canonical URL"
          />
        </div>
      </details>

      {/* Bottom save button */}
      <div className="mt-6 pt-4 border-t border-slate-700/60 flex justify-end">
        <button
          className={BTN_PRIMARY_LG}
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Content'}
        </button>
      </div>
    </div>
  )
}
