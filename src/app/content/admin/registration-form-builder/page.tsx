/**
 * CMS Admin - Registration Form Builder
 *
 * A full page builder where admins can configure the registration form:
 * - Add/remove/reorder fields via drag and drop
 * - Configure each field's type, label, placeholder, options, etc.
 * - Set required fields, widths, and help text
 * - Dynamic layout tools: row, column, section, divider, separator, image, html
 * - Spacing, sizing, and styling controls for every field
 *
 * Field types: text, textarea, email, tel, select, radio, checkbox,
 * checkbox-group, file, heading, label, url, number, date,
 * row, column, section, divider, separator, image, html
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  ArrowLeft,
  AlertCircle,
  X,
  ExternalLink,
  Copy,
  Globe,
  Image,
  Loader2,
  Columns,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveVertical,
} from 'lucide-react'
import Link from 'next/link'
import { normalizeFields, ensureValidOrders as sharedEnsureValidOrders } from '@/lib/registration-utils'

/* ── Types ────────────────────────────────────────────── */

interface FieldOption {
  value: string
  label: string
}

interface FormField {
  key: string
  type: string
  label: string
  placeholder: string
  heading: string
  required: boolean
  options: FieldOption[]
  order: number
  isActive: boolean
  width: string
  helpText: string
  pattern: string
  errorMessage: string
  // Layout
  customWidth?: string
  height?: string
  marginTop?: string
  marginBottom?: string
  paddingTop?: string
  paddingBottom?: string
  // Style
  backgroundColor?: string
  borderColor?: string
  borderWidth?: string
  borderRadius?: string
  textAlign?: string
  // Divider
  dividerStyle?: string
  dividerColor?: string
  dividerThickness?: string
  // Separator
  separatorHeight?: string
  // Image
  imageSrc?: string
  imageAlt?: string
  imageHeight?: string
  imageBorderRadius?: string
  // HTML
  htmlContent?: string
  // Row / Column
  columns?: number
  columnGap?: string
  childKeys?: string[]
}

interface FormConfig {
  key: string
  slug?: string
  name?: string
  formTitle: string
  formSubtitle: string
  successMessage: string
  submitButtonText: string
  isEnabled: boolean
  formBannerUrl?: string
  fields: FormField[]
}

/* ── Constants ────────────────────────────────────────── */

const LAYOUT_TYPES = [
  { value: 'row', label: '⊞ Row Container', color: '#8b5cf6' },
  { value: 'section', label: '📦 Section', color: '#6366f1' },
  { value: 'divider', label: '➖ Divider Line', color: '#64748b' },
  { value: 'separator', label: '↕ Spacer', color: '#64748b' },
  { value: 'image', label: '🖼️ Image', color: '#ec4899' },
  { value: 'html', label: '⟨/⟩ HTML Block', color: '#f59e0b' },
]

const INPUT_TYPES = [
  { value: 'heading', label: '🔷 Section Heading', color: '#6366f1' },
  { value: 'label', label: '📝 Label / Text Block', color: '#6b7280' },
  { value: 'text', label: '📄 Text Input', color: '#0ea5e9' },
  { value: 'email', label: '✉️ Email Input', color: '#0ea5e9' },
  { value: 'tel', label: '📞 Phone Input', color: '#0ea5e9' },
  { value: 'url', label: '🔗 URL Input', color: '#0ea5e9' },
  { value: 'number', label: '🔢 Number Input', color: '#0ea5e9' },
  { value: 'textarea', label: '📋 Text Area', color: '#8b5cf6' },
  { value: 'select', label: '▼ Dropdown Select', color: '#f59e0b' },
  { value: 'radio', label: '⭕ Radio Buttons', color: '#f59e0b' },
  { value: 'checkbox', label: '✅ Single Checkbox', color: '#22c55e' },
  { value: 'checkbox-group', label: '☑️ Checkbox Group', color: '#22c55e' },
  { value: 'file', label: '📎 File Upload', color: '#ec4899' },
  { value: 'date', label: '📅 Date Picker', color: '#14b8a6' },
  { value: 'password', label: '🔐 Password Input', color: '#ef4444' },
]

const FIELD_TYPES = [...LAYOUT_TYPES, ...INPUT_TYPES]

const WIDTH_OPTIONS = [
  { value: 'full', label: 'Full Width (100%)' },
  { value: 'half', label: 'Half Width (50%)' },
  { value: 'third', label: 'One Third (33%)' },
  { value: 'two-thirds', label: 'Two Thirds (66%)' },
  { value: 'quarter', label: 'Quarter (25%)' },
  { value: 'three-quarters', label: 'Three Quarters (75%)' },
  { value: 'auto', label: 'Auto Width' },
]

const HEIGHT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'sm', label: 'Small (40px)' },
  { value: 'md', label: 'Medium (80px)' },
  { value: 'lg', label: 'Large (160px)' },
]

const SPACING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'xs', label: 'XS (4px)' },
  { value: 'sm', label: 'SM (8px)' },
  { value: 'md', label: 'MD (16px)' },
  { value: 'lg', label: 'LG (24px)' },
  { value: 'xl', label: 'XL (32px)' },
]

const BORDER_WIDTH_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'thin', label: 'Thin (1px)' },
  { value: 'medium', label: 'Medium (2px)' },
  { value: 'thick', label: 'Thick (3px)' },
]

const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small (4px)' },
  { value: 'md', label: 'Medium (8px)' },
  { value: 'lg', label: 'Large (12px)' },
  { value: 'xl', label: 'XL (16px)' },
  { value: 'full', label: 'Full (round)' },
]

const DIVIDER_STYLES = [
  { value: 'solid', label: '━━━ Solid' },
  { value: 'dashed', label: '┅┅┅ Dashed' },
  { value: 'dotted', label: '····· Dotted' },
  { value: 'double', label: '═══ Double' },
]

const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Center', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight },
]

const COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#0f172a', '#1e293b', '#334155',
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899',
  '#22c55e', '#f59e0b', '#ef4444', '#14b8a6',
]

/* ── Helpers ──────────────────────────────────────────── */

function generateFieldKey(type: string): string {
  const base = type.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field'
  return base + '_' + Date.now()
}

/* ── Shared input style ──────────────────────────────── */

const inputStyle: React.CSSProperties = {
  background: '#0b1220',
  color: '#e2e8f0',
  border: '1px solid #1e293b',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12,
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  marginBottom: 4,
  display: 'block',
}

/* ── Color Picker Component ──────────────────────────── */

function ColorField({
  label, value, onChange, presets,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  presets?: string[]
}) {
  const colors = presets || COLOR_PRESETS
  return (
    <div className="field">
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 28, border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', background: 'transparent', padding: 0 }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          style={{ ...inputStyle, width: 90, flex: 'none' }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}
            title="Clear color"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 18, height: 18, borderRadius: 4,
              background: c, border: value === c ? '2px solid #0ea5e9' : '1px solid #334155',
              cursor: 'pointer', padding: 0,
            }}
            title={c}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────── */

export default function RegistrationFormBuilderPage() {
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [editingField, setEditingField] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    layout: true,
    spacing: false,
    style: false,
    advanced: false,
  })

  const fieldHeaderRefs = useRef<(HTMLDivElement | null)[]>([])

  // Load form key from URL params (init from window to avoid hydration mismatch)
  const [formKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('key') || ''
    }
    return ''
  })

  const publicUrl = `${typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.host : ''}/register${config?.slug && config.slug !== 'register' ? '/' + config.slug : ''}`

  // formKey is initialized once from URL params and never changes
  useEffect(() => { loadConfig() }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function loadConfig() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      // Always load a specific form — default to 'registration-form' if no key provided
      params.set('key', formKey || 'registration-form')
      const res = await fetch(`/api/content/admin/registration-form-config?${params}`)
      if (res.status === 401) { window.location.href = '/content/admin/login'; return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      if (!data.config || !data.config.fields) {
        throw new Error(`Form with key "${formKey || 'registration-form'}" not found. Go to All Forms to create or select one.`)
      }
      const { fields: fixedFields } = sharedEnsureValidOrders(normalizeFields(data.config.fields || []))
      setConfig({ ...data.config, fields: fixedFields })
    } catch (e: any) {
      setError(e.message || 'Failed to load form config')
    } finally {
      setLoading(false)
    }
  }

  async function saveConfig(updatedConfig: FormConfig) {
    setSaving(true)
    try {
      const res = await fetch('/api/content/admin/registration-form-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setConfig(data.config)
      setToast({ kind: 'success', text: 'Form config saved!' })
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  function updateField(index: number, updates: Partial<FormField>) {
    if (!config) return
    const newFields = [...config.fields]
    newFields[index] = { ...newFields[index], ...updates }
    setConfig({ ...config, fields: newFields })
  }

  function addField(type: string) {
    if (!config) return
    const isLayout = LAYOUT_TYPES.some(l => l.value === type)
    const newField: FormField = {
      key: generateFieldKey(type),
      type,
      label: '',
      placeholder: '',
      heading: type === 'row' ? 'Row' : type === 'section' ? 'Section' : '',
      required: false,
      options: ['select', 'radio', 'checkbox-group'].includes(type)
        ? [{ value: 'option1', label: 'Option 1' }]
        : [],
      order: config.fields.length,
      isActive: true,
      width: 'full',
      helpText: '',
      pattern: '',
      errorMessage: '',
      // Defaults for new types
      height: 'auto',
      marginTop: 'none',
      marginBottom: 'none',
      paddingTop: 'none',
      paddingBottom: 'none',
      backgroundColor: '',
      borderColor: '',
      borderWidth: 'none',
      borderRadius: type === 'row' ? 'md' : 'none',
      textAlign: 'left',
      dividerStyle: 'solid',
      dividerColor: '#e2e8f0',
      dividerThickness: '1',
      separatorHeight: '24',
      imageSrc: '',
      imageAlt: '',
      imageHeight: 'auto',
      imageBorderRadius: '8',
      htmlContent: type === 'html' ? '<p>Custom HTML content</p>' : '',
      columns: type === 'row' ? 2 : 2,
      columnGap: '16',
      childKeys: [],
    }
    setConfig({ ...config, fields: [...config.fields, newField] })
    setEditingField(config.fields.length)
  }

  function removeField(index: number) {
    if (!config) return
    const newFields = config.fields.filter((_, i) => i !== index)
    const reordered = newFields.map((f, i) => ({ ...f, order: i }))
    setConfig({ ...config, fields: reordered })
    if (editingField === index) setEditingField(null)
    if (editingField !== null && editingField > index) setEditingField(editingField - 1)
    const focusTarget = Math.min(index, reordered.length - 1)
    if (focusTarget >= 0) setTimeout(() => fieldHeaderRefs.current[focusTarget]?.focus(), 0)
  }

  function moveField(fromIndex: number, toIndex: number) {
    if (!config || toIndex < 0 || toIndex >= config.fields.length) return
    const newFields = [...config.fields]
    const [moved] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, moved)
    const reordered = newFields.map((f, i) => ({ ...f, order: i }))
    setConfig({ ...config, fields: reordered })
  }

  function addOption(fieldIndex: number) {
    if (!config) return
    const field = config.fields[fieldIndex]
    updateField(fieldIndex, { options: [...(field.options || []), { value: '', label: '' }] })
  }

  function updateOption(fieldIndex: number, optionIndex: number, updates: Partial<FieldOption>) {
    if (!config) return
    const field = config.fields[fieldIndex]
    const newOptions = [...(field.options || [])]
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates }
    if (updates.label && !newOptions[optionIndex].value) {
      newOptions[optionIndex].value = updates.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
    updateField(fieldIndex, { options: newOptions })
  }

  function removeOption(fieldIndex: number, optionIndex: number) {
    if (!config) return
    const field = config.fields[fieldIndex]
    updateField(fieldIndex, { options: (field.options || []).filter((_, i) => i !== optionIndex) })
  }

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleFieldKeyDown(e: React.KeyboardEvent, index: number) {
    if (!config) return
    const isEditing = editingField === index
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (index > 0) { moveField(index, index - 1); setFocusedIndex(index - 1); setTimeout(() => fieldHeaderRefs.current[index - 1]?.focus(), 0) }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (index < config.fields.length - 1) { moveField(index, index + 1); setFocusedIndex(index + 1); setTimeout(() => fieldHeaderRefs.current[index + 1]?.focus(), 0) }
        break
      case ' ': case 'Enter':
        e.preventDefault()
        if (!isEditing) setEditingField(index)
        break
      case 'Escape':
        e.preventDefault()
        if (isEditing) setEditingField(null)
        break
      case 'Delete': case 'Backspace':
        if (!isEditing) { e.preventDefault(); removeField(index) }
        break
    }
  }

  function handleSave() {
    if (!config) return
    const { fields: fixedFields, fixedCount } = sharedEnsureValidOrders(normalizeFields(config.fields))
    if (fixedCount > 0) setToast({ kind: 'success', text: `Auto-fixed ${fixedCount} field(s) with missing order values.` })
    saveConfig({ ...config, fields: fixedFields })
  }

  /* ── Loading / Error states ────────────────────────── */

  if (loading) {
    return (
      <div>
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <span className="spinner" style={{
            display: 'inline-block', width: 14, height: 14,
            border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
            borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: 8,
          }} />
          Loading form builder...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cms-alert cms-alert-error">
        <AlertCircle size={14} className="inline-block align-middle mr-1" />
        {error}
      </div>
    )
  }

  if (!config) return null

  /* ── Layout controls sidebar section renderer ──────── */

  function renderLayoutControls(field: FormField, index: number) {
    const isLayout = ['row', 'section', 'divider', 'separator', 'image', 'html'].includes(field.type)
    const isInput = !isLayout && !['heading', 'label'].includes(field.type)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
        {/* ── LAYOUT SECTION ── */}
        <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => toggleSection('layout')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', background: '#0b1220', border: 'none',
              color: '#e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Columns size={13} style={{ color: '#8b5cf6' }} />
            Layout & Size
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 10 }}>{expandedSections.layout ? '▲' : '▼'}</span>
          </button>
          {expandedSections.layout && (
            <div style={{ padding: '12px', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Width */}
              <div className="field">
                <label style={labelStyle}>Field Width</label>
                <select
                  value={field.width}
                  onChange={(e) => updateField(index, { width: e.target.value })}
                  style={inputStyle}
                >
                  {WIDTH_OPTIONS.map(wo => <option key={wo.value} value={wo.value}>{wo.label}</option>)}
                </select>
              </div>

              {/* Custom Width */}
              <div className="field">
                <label style={labelStyle}>Custom Width (overrides above)</label>
                <input
                  type="text"
                  value={field.customWidth || ''}
                  onChange={(e) => updateField(index, { customWidth: e.target.value })}
                  placeholder="e.g. 200px, 33.3%, 10em"
                  style={inputStyle}
                />
              </div>

              {/* Height */}
              <div className="field">
                <label style={labelStyle}>Height</label>
                <select
                  value={field.height || 'auto'}
                  onChange={(e) => updateField(index, { height: e.target.value })}
                  style={inputStyle}
                >
                  {HEIGHT_OPTIONS.map(ho => <option key={ho.value} value={ho.value}>{ho.label}</option>)}
                  <option value="custom">Custom...</option>
                </select>
                {field.height === 'custom' && (
                  <input
                    type="text"
                    value={field.height || ''}
                    onChange={(e) => updateField(index, { height: e.target.value })}
                    placeholder="e.g. 200px"
                    style={{ ...inputStyle, marginTop: 4 }}
                  />
                )}
              </div>

              {/* Text Align */}
              {isInput && (
                <div className="field">
                  <label style={labelStyle}>Text Align</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {TEXT_ALIGN_OPTIONS.map(ta => (
                      <button
                        key={ta.value}
                        onClick={() => updateField(index, { textAlign: ta.value })}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          padding: '6px 8px', borderRadius: 6,
                          background: field.textAlign === ta.value ? 'rgba(14,165,233,0.15)' : '#0b1220',
                          border: `1px solid ${field.textAlign === ta.value ? 'rgba(14,165,233,0.4)' : '#1e293b'}`,
                          color: field.textAlign === ta.value ? '#7dd3fc' : '#94a3b8',
                          fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <ta.icon size={12} /> {ta.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Row columns */}
              {field.type === 'row' && (
                <div className="field">
                  <label style={labelStyle}>Columns</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[2, 3, 4].map(n => (
                      <button
                        key={n}
                        onClick={() => updateField(index, { columns: n })}
                        style={{
                          flex: 1, padding: '6px 8px', borderRadius: 6,
                          background: field.columns === n ? 'rgba(139,92,246,0.15)' : '#0b1220',
                          border: `1px solid ${field.columns === n ? 'rgba(139,92,246,0.4)' : '#1e293b'}`,
                          color: field.columns === n ? '#c4b5fd' : '#94a3b8',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Column gap */}
              {(field.type === 'row' || field.type === 'section') && (
                <div className="field">
                  <label style={labelStyle}>Column Gap (px)</label>
                  <input
                    type="text"
                    value={field.columnGap || '16'}
                    onChange={(e) => updateField(index, { columnGap: e.target.value })}
                    placeholder="16"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SPACING SECTION ── */}
        <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => toggleSection('spacing')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', background: '#0b1220', border: 'none',
              color: '#e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <MoveVertical size={13} style={{ color: '#22c55e' }} />
            Spacing (Margin & Padding)
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 10 }}>{expandedSections.spacing ? '▲' : '▼'}</span>
          </button>
          {expandedSections.spacing && (
            <div style={{ padding: '12px', background: '#0f172a', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field">
                <label style={labelStyle}>Margin Top</label>
                <select
                  value={field.marginTop || 'none'}
                  onChange={(e) => updateField(index, { marginTop: e.target.value })}
                  style={inputStyle}
                >
                  {SPACING_OPTIONS.map(so => <option key={so.value} value={so.value}>{so.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label style={labelStyle}>Margin Bottom</label>
                <select
                  value={field.marginBottom || 'none'}
                  onChange={(e) => updateField(index, { marginBottom: e.target.value })}
                  style={inputStyle}
                >
                  {SPACING_OPTIONS.map(so => <option key={so.value} value={so.value}>{so.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label style={labelStyle}>Padding Top</label>
                <select
                  value={field.paddingTop || 'none'}
                  onChange={(e) => updateField(index, { paddingTop: e.target.value })}
                  style={inputStyle}
                >
                  {SPACING_OPTIONS.map(so => <option key={so.value} value={so.value}>{so.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label style={labelStyle}>Padding Bottom</label>
                <select
                  value={field.paddingBottom || 'none'}
                  onChange={(e) => updateField(index, { paddingBottom: e.target.value })}
                  style={inputStyle}
                >
                  {SPACING_OPTIONS.map(so => <option key={so.value} value={so.value}>{so.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── STYLE SECTION ── */}
        <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => toggleSection('style')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', background: '#0b1220', border: 'none',
              color: '#e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Palette size={13} style={{ color: '#ec4899' }} />
            Style & Appearance
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 10 }}>{expandedSections.style ? '▲' : '▼'}</span>
          </button>
          {expandedSections.style && (
            <div style={{ padding: '12px', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ColorField
                label="Background Color"
                value={field.backgroundColor || ''}
                onChange={(v) => updateField(index, { backgroundColor: v })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label style={labelStyle}>Border Width</label>
                  <select
                    value={field.borderWidth || 'none'}
                    onChange={(e) => updateField(index, { borderWidth: e.target.value })}
                    style={inputStyle}
                  >
                    {BORDER_WIDTH_OPTIONS.map(bwo => <option key={bwo.value} value={bwo.value}>{bwo.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label style={labelStyle}>Border Radius</label>
                  <select
                    value={field.borderRadius || 'none'}
                    onChange={(e) => updateField(index, { borderRadius: e.target.value })}
                    style={inputStyle}
                  >
                    {BORDER_RADIUS_OPTIONS.map(bro => <option key={bro.value} value={bro.value}>{bro.label}</option>)}
                  </select>
                </div>
              </div>
              {field.borderWidth && field.borderWidth !== 'none' && (
                <ColorField
                  label="Border Color"
                  value={field.borderColor || ''}
                  onChange={(v) => updateField(index, { borderColor: v })}
                />
              )}
            </div>
          )}
        </div>

        {/* ── TYPE-SPECIFIC CONTROLS ── */}

        {/* Divider controls */}
        {field.type === 'divider' && (
          <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field">
                <label style={labelStyle}>Line Style</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {DIVIDER_STYLES.map(ds => (
                    <button
                      key={ds.value}
                      onClick={() => updateField(index, { dividerStyle: ds.value })}
                      style={{
                        flex: '1 1 auto', padding: '6px 10px', borderRadius: 6,
                        background: field.dividerStyle === ds.value ? 'rgba(100,116,139,0.2)' : '#0b1220',
                        border: `1px solid ${field.dividerStyle === ds.value ? 'rgba(100,116,139,0.5)' : '#1e293b'}`,
                        color: field.dividerStyle === ds.value ? '#e2e8f0' : '#94a3b8',
                        fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      }}
                    >
                      {ds.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ColorField
                  label="Line Color"
                  value={field.dividerColor || '#e2e8f0'}
                  onChange={(v) => updateField(index, { dividerColor: v })}
                />
                <div className="field">
                  <label style={labelStyle}>Thickness (px)</label>
                  <input
                    type="number"
                    value={field.dividerThickness || '1'}
                    onChange={(e) => updateField(index, { dividerThickness: e.target.value })}
                    min="1"
                    max="10"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Separator controls */}
        {field.type === 'separator' && (
          <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px', background: '#0f172a' }}>
              <div className="field">
                <label style={labelStyle}>Spacer Height (px)</label>
                <input
                  type="number"
                  value={field.separatorHeight || '24'}
                  onChange={(e) => updateField(index, { separatorHeight: e.target.value })}
                  min="4"
                  max="200"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Image controls */}
        {field.type === 'image' && (
          <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field">
                <label style={labelStyle}>Image URL</label>
                <input
                  type="text"
                  value={field.imageSrc || ''}
                  onChange={(e) => updateField(index, { imageSrc: e.target.value })}
                  placeholder="https://example.com/image.jpg or paste URL"
                  style={inputStyle}
                />
              </div>
              <div className="field">
                <label style={labelStyle}>Alt Text</label>
                <input
                  type="text"
                  value={field.imageAlt || ''}
                  onChange={(e) => updateField(index, { imageAlt: e.target.value })}
                  placeholder="Description of the image"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label style={labelStyle}>Height</label>
                  <input
                    type="text"
                    value={field.imageHeight || 'auto'}
                    onChange={(e) => updateField(index, { imageHeight: e.target.value })}
                    placeholder="auto, 200px, 50%"
                    style={inputStyle}
                  />
                </div>
                <div className="field">
                  <label style={labelStyle}>Border Radius (px)</label>
                  <input
                    type="number"
                    value={field.imageBorderRadius || '8'}
                    onChange={(e) => updateField(index, { imageBorderRadius: e.target.value })}
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </div>
              {field.imageSrc && (
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #1e293b', maxHeight: 150 }}>
                  <img
                    src={field.imageSrc}
                    alt={field.imageAlt || 'Preview'}
                    style={{ width: '100%', height: 'auto', maxHeight: 150, objectFit: 'contain', display: 'block', background: '#1e293b' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* HTML controls */}
        {field.type === 'html' && (
          <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px', background: '#0f172a' }}>
              <div className="field">
                <label style={labelStyle}>HTML Content</label>
                <textarea
                  value={field.htmlContent || ''}
                  onChange={(e) => updateField(index, { htmlContent: e.target.value })}
                  rows={6}
                  placeholder="<p>Enter custom HTML here...</p>"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                />
              </div>
              {field.htmlContent && (
                <div style={{ marginTop: 8, padding: 10, background: '#0b1220', border: '1px solid #1e293b', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>PREVIEW</div>
                  <div dangerouslySetInnerHTML={{ __html: field.htmlContent }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ADVANCED SECTION ── */}
        <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => toggleSection('advanced')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', background: '#0b1220', border: 'none',
              color: '#e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Settings size={13} style={{ color: '#f59e0b' }} />
            Advanced
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 10 }}>{expandedSections.advanced ? '▲' : '▼'}</span>
          </button>
          {expandedSections.advanced && (
            <div style={{ padding: '12px', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field">
                <label style={labelStyle}>Field Key (unique ID)</label>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateField(index, { key: e.target.value })}
                  style={inputStyle}
                />
              </div>
              {isInput && (
                <>
                  <div className="field">
                    <label style={labelStyle}>Validation Pattern (regex)</label>
                    <input
                      type="text"
                      value={field.pattern || ''}
                      onChange={(e) => updateField(index, { pattern: e.target.value })}
                      placeholder="e.g. ^[A-Za-z]+$"
                      style={inputStyle}
                    />
                  </div>
                  <div className="field">
                    <label style={labelStyle}>Error Message</label>
                    <input
                      type="text"
                      value={field.errorMessage || ''}
                      onChange={(e) => updateField(index, { errorMessage: e.target.value })}
                      placeholder="This field is required"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Field type icon helper ─────────────────────────── */

  function getFieldTypeInfo(type: string) {
    return FIELD_TYPES.find(t => t.value === type) || { value: type, label: type, color: '#64748b' }
  }

  function isLayoutType(type: string) {
    return LAYOUT_TYPES.some(l => l.value === type)
  }

  /* ── Main render ────────────────────────────────────── */

  return (
    <div>
      {/* ── Top Bar ── */}
      <div className="cms-topbar">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={22} />
            Registration Form Builder
          </h1>
          <div className="sub">
            Configure fields, layout, spacing, and styling for the public registration page
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/content/admin/registration-forms" className="cms-btn cms-btn-ghost cms-btn-sm">
            <ArrowLeft size={14} /> All Forms
          </Link>
          <button
            className="cms-btn cms-btn-primary cms-btn-sm"
            onClick={handleSave}
            disabled={saving}
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none' }}
          >
            {saving ? <><span className="spinner" /> Saving…</> : <><Save size={14} /> Save Form</>}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`cms-alert ${toast.kind === 'success' ? 'cms-alert-success' : 'cms-alert-error'}`}>
          {toast.text}
        </div>
      )}

      {/* ── Public URL ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(99,102,241,0.06))',
        border: '1px solid rgba(14,165,233,0.2)', borderRadius: 12, padding: '14px 18px',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <Globe size={18} style={{ color: '#7dd3fc', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#7dd3fc', marginBottom: 2 }}>
            Public Registration Page URL
          </div>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: '#38bdf8', fontSize: 14, textDecoration: 'none', wordBreak: 'break-all' }}>
            {publicUrl} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </a>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(publicUrl).then(() => { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }) }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: copiedUrl ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.1)',
            border: `1px solid ${copiedUrl ? 'rgba(34,197,94,0.3)' : 'rgba(14,165,233,0.25)'}`,
            color: copiedUrl ? '#4ade80' : '#7dd3fc', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}
        >
          <Copy size={14} /> {copiedUrl ? 'Copied!' : 'Copy URL'}
        </button>
      </div>

      {/* ── Form Settings ── */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>📋 Form Settings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label style={labelStyle}>Form Name (admin display)</label>
            <input type="text" value={config.name || ''} onChange={(e) => setConfig({ ...config, name: e.target.value })} placeholder="e.g. Career Application" style={inputStyle} />
          </div>
          <div className="field">
            <label style={labelStyle}>URL Slug (public URL path)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ background: '#1e293b', color: '#64748b', padding: '8px 8px', borderRadius: '8px 0 0 8px', fontSize: 12, border: '1px solid #1e293b', borderRight: 'none' }}>/register/</span>
              <input
                type="text"
                value={config.slug || ''}
                onChange={(e) => setConfig({ ...config, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="career"
                style={{ ...inputStyle, borderRadius: '0 8px 8px 0' }}
              />
            </div>
          </div>
          <div className="field">
            <label style={labelStyle}>Form Title</label>
            <input type="text" value={config.formTitle} onChange={(e) => setConfig({ ...config, formTitle: e.target.value })} style={inputStyle} />
          </div>
          <div className="field">
            <label style={labelStyle}>Submit Button Text</label>
            <input type="text" value={config.submitButtonText} onChange={(e) => setConfig({ ...config, submitButtonText: e.target.value })} style={inputStyle} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label style={labelStyle}>Form Subtitle</label>
          <input type="text" value={config.formSubtitle} onChange={(e) => setConfig({ ...config, formSubtitle: e.target.value })} style={inputStyle} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label style={labelStyle}>Success Message</label>
          <textarea value={config.successMessage} onChange={(e) => setConfig({ ...config, successMessage: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#e2e8f0' }}>
            <input type="checkbox" checked={config.isEnabled} onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })} style={{ accentColor: '#22c55e' }} />
            Form is enabled (visible on public site)
          </label>
        </div>

        {/* Banner Upload */}
        <div className="field" style={{ marginTop: 16 }}>
          <label style={labelStyle}>Form Banner Image</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input type="text" value={config.formBannerUrl || ''} onChange={(e) => setConfig({ ...config, formBannerUrl: e.target.value })} placeholder="Paste image URL or upload..." style={inputStyle} />
            </div>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8,
              background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
              color: '#7dd3fc', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingBanner}
                onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return
                  setUploadingBanner(true)
                  try {
                    const form = new FormData(); form.append('file', file)
                    const res = await fetch('/api/public/upload', { method: 'POST', body: form })
                    const data = await res.json()
                    if (data.url) setConfig({ ...config, formBannerUrl: data.url })
                    else setToast({ kind: 'error', text: 'Upload failed' })
                  } catch { setToast({ kind: 'error', text: 'Upload failed' }) }
                  finally { setUploadingBanner(false) }
                }}
              />
              {uploadingBanner ? <Loader2 size={14} className="spinner" /> : <Image size={14} />}
              {uploadingBanner ? 'Uploading...' : 'Upload Image'}
            </label>
            {config.formBannerUrl && (
              <button onClick={() => setConfig({ ...config, formBannerUrl: '' })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>
          {config.formBannerUrl && (
            <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', maxWidth: 400, border: '1px solid #1e293b' }}>
              <img src={config.formBannerUrl} alt="Form banner preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
        </div>
      </div>

      {/* ── Add Field Buttons ── */}
      <div style={{ marginBottom: 20 }}>
        {/* Layout Tools */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Columns size={16} style={{ color: '#8b5cf6' }} />
          Layout Tools
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {LAYOUT_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => addField(ft.value)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: `1px solid ${ft.color}40`,
                background: `${ft.color}10`, color: ft.color,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${ft.color}25` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${ft.color}10` }}
            >
              {ft.label}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} />
          Input Fields
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INPUT_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => addField(ft.value)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: '#cbd5e1',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${ft.color}20`; e.currentTarget.style.borderColor = `${ft.color}40` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fields List ── */}
      <div role="tree" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {config.fields.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#0f172a', border: '2px dashed #1e293b', borderRadius: 12 }}>
            <Settings size={24} style={{ opacity: 0.4, marginBottom: 8 }} />
            <p style={{ fontSize: 13 }}>No form fields configured yet. Click a field type above to add one.</p>
          </div>
        ) : (
          config.fields.map((field, index) => {
            const typeInfo = getFieldTypeInfo(field.type)
            const isLayout = isLayoutType(field.type)
            const hasStyles = field.backgroundColor || (field.borderWidth && field.borderWidth !== 'none') || (field.marginTop && field.marginTop !== 'none') || (field.marginBottom && field.marginBottom !== 'none')

            return (
              <div
                key={field.key + index}
                style={{
                  background: field.isActive ? '#0f172a' : '#0b1220',
                  borderTop: `1px solid ${editingField === index ? 'rgba(14,165,233,0.4)' : isLayout ? `${typeInfo.color}30` : '#1e293b'}`,
                  borderRight: `1px solid ${editingField === index ? 'rgba(14,165,233,0.4)' : isLayout ? `${typeInfo.color}30` : '#1e293b'}`,
                  borderBottom: `1px solid ${editingField === index ? 'rgba(14,165,233,0.4)' : isLayout ? `${typeInfo.color}30` : '#1e293b'}`,
                  borderLeft: isLayout ? `3px solid ${typeInfo.color}` : `1px solid ${editingField === index ? 'rgba(14,165,233,0.4)' : '#1e293b'}`,
                  borderRadius: 10,
                  opacity: field.isActive ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                {/* ── Field Header ── */}
                <div
                  ref={(el) => { fieldHeaderRefs.current[index] = el }}
                  role="treeitem"
                  tabIndex={0}
                  aria-label={`${field.type} field: ${field.heading || field.label || field.key}`}
                  aria-posinset={index + 1}
                  aria-setsize={config.fields.length}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  onKeyDown={(e) => handleFieldKeyDown(e, index)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    cursor: 'grab', userSelect: 'none',
                    outline: focusedIndex === index ? '2px solid rgba(14,165,233,0.6)' : 'none',
                    outlineOffset: -2, borderRadius: focusedIndex === index ? 8 : 0,
                  }}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => { e.preventDefault() }}
                  onDrop={(e) => { e.preventDefault(); if (draggedIndex !== null && draggedIndex !== index) moveField(draggedIndex, index); setDraggedIndex(null) }}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <GripVertical size={16} style={{ color: '#475569', flexShrink: 0, cursor: 'grab' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: typeInfo.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: typeInfo.color, minWidth: isLayout ? 90 : 80, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    {field.type}
                  </span>
                  <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {field.heading || field.label || field.key || '(unnamed)'}
                    {field.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                  </span>

                  {/* Width badge */}
                  <span style={{ fontSize: 10, color: '#64748b', padding: '2px 6px', borderRadius: 4, background: '#1e293b' }}>
                    {field.customWidth || WIDTH_OPTIONS.find(w => w.value === field.width)?.label?.split(' ')[0] || 'Full'}
                  </span>

                  {/* Style indicator */}
                  {hasStyles && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} title="Has custom styling" />
                  )}

                  <button onClick={() => setEditingField(editingField === index ? null : index)}
                    style={{ background: 'transparent', border: 'none', color: editingField === index ? '#0ea5e9' : '#64748b', cursor: 'pointer', padding: 4 }}
                    title="Edit field">
                    <Settings size={14} />
                  </button>
                  <button onClick={() => updateField(index, { isActive: !field.isActive })}
                    style={{ background: 'transparent', border: 'none', color: field.isActive ? '#22c55e' : '#64748b', cursor: 'pointer', padding: 4 }}
                    title={field.isActive ? 'Disable field' : 'Enable field'}>
                    {field.isActive ? <Eye size={14} /> : <EyeOff size={14} style={{ opacity: 0.4 }} />}
                  </button>
                  <button onClick={() => removeField(index)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                    title="Remove field">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* ── Field Editor ── */}
                {editingField === index && (
                  <div style={{ padding: '12px 14px 16px', borderTop: '1px solid #1e293b' }}>
                    {/* Basic settings */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {/* Key */}
                      <div className="field">
                        <label style={labelStyle}>Field Key (unique ID)</label>
                        <input type="text" value={field.key} onChange={(e) => updateField(index, { key: e.target.value })} style={inputStyle} />
                      </div>
                      {/* Type */}
                      <div className="field">
                        <label style={labelStyle}>Field Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value
                            const updates: Partial<FormField> = { type: newType }
                            if (['select', 'radio', 'checkbox-group'].includes(newType) && (!field.options || field.options.length === 0)) {
                              updates.options = [{ value: 'option1', label: 'Option 1' }]
                            }
                            updateField(index, updates)
                          }}
                          style={inputStyle}
                        >
                          <optgroup label="Layout Tools">
                            {LAYOUT_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                          </optgroup>
                          <optgroup label="Input Fields">
                            {INPUT_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                          </optgroup>
                        </select>
                      </div>

                      {/* Heading (for heading, section, row types) */}
                      {['heading', 'section', 'row'].includes(field.type) && (
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                          <label style={labelStyle}>Section / Container Title</label>
                          <input type="text" value={field.heading || ''} onChange={(e) => updateField(index, { heading: e.target.value })} placeholder="e.g. Personal Information" style={inputStyle} />
                        </div>
                      )}

                      {/* Label (for non-heading types) */}
                      {!['heading', 'section', 'row'].includes(field.type) && (
                        <div className="field">
                          <label style={labelStyle}>Label (shown above field)</label>
                          <input type="text" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} placeholder="Enter field label" style={inputStyle} />
                        </div>
                      )}

                      {/* Placeholder (for input types) */}
                      {!['heading', 'label', 'section', 'row', 'divider', 'separator', 'image', 'html', 'checkbox', 'checkbox-group', 'radio', 'file'].includes(field.type) && (
                        <div className="field">
                          <label style={labelStyle}>Placeholder</label>
                          <input type="text" value={field.placeholder} onChange={(e) => updateField(index, { placeholder: e.target.value })} placeholder="Placeholder text" style={inputStyle} />
                        </div>
                      )}

                      {/* Required + Help text */}
                      {!['heading', 'label', 'section', 'row', 'divider', 'separator', 'image', 'html'].includes(field.type) && (
                        <>
                          <div className="field">
                            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 24 }}>
                              <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} style={{ accentColor: '#ef4444' }} />
                              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Required field</span>
                            </label>
                          </div>
                          <div className="field">
                            <label style={labelStyle}>Help Text (shown below field)</label>
                            <input type="text" value={field.helpText} onChange={(e) => updateField(index, { helpText: e.target.value })} placeholder="Helpful hint for users" style={inputStyle} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Options for select, radio, checkbox-group */}
                    {['select', 'radio', 'checkbox-group'].includes(field.type) && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Options</label>
                          <button onClick={() => addOption(index)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', color: '#7dd3fc', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                            <Plus size={12} /> Add Option
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(field.options || []).map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input type="text" value={opt.label} onChange={(e) => updateOption(index, oi, { label: e.target.value })} placeholder="Option label"
                                style={{ flex: 1, ...inputStyle }} />
                              <input type="text" value={opt.value} onChange={(e) => updateOption(index, oi, { value: e.target.value })} placeholder="value"
                                style={{ flex: 1, ...inputStyle, maxWidth: 150 }} />
                              <button onClick={() => removeOption(index, oi)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Layout Controls Sidebar ── */}
                    {renderLayoutControls(field, index)}

                    {/* Close button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button onClick={() => setEditingField(null)} className="cms-btn cms-btn-sm cms-btn-ghost">
                        Done Editing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Save Button (bottom) ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <Link href="/content/admin/registration-forms" className="cms-btn cms-btn-ghost">
          <ArrowLeft size={14} /> All Forms
        </Link>
        <button className="cms-btn cms-btn-primary" onClick={handleSave} disabled={saving}
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none' }}>
          {saving ? <><span className="spinner" /> Saving…</> : <><Save size={14} /> Save Form</>}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; }
        .field label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; display: block; }
      `}</style>
    </div>
  )
}
