/**
 * RegisterForm — shared component for rendering CMS-driven registration forms.
 *
 * Used by both /register (default form) and /register/[slug] (slug-based forms).
 *
 * Field types: text, textarea, email, tel, select, radio, checkbox,
 * checkbox-group, file, heading, label, url, number, date, password,
 * row, section, divider, separator, image, html
 */

'use client'

import { useState, useEffect, useRef, FormEvent, useMemo } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

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
  customWidth?: string
  height?: string
  marginTop?: string
  marginBottom?: string
  paddingTop?: string
  paddingBottom?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: string
  borderRadius?: string
  textAlign?: 'left' | 'center' | 'right'
  dividerStyle?: string
  dividerColor?: string
  dividerThickness?: string
  separatorHeight?: string
  imageSrc?: string
  imageAlt?: string
  imageHeight?: string
  imageBorderRadius?: string
  htmlContent?: string
  columns?: number
  columnGap?: string
}

interface FormConfig {
  formTitle: string
  formSubtitle: string
  successMessage: string
  submitButtonText: string
  isEnabled: boolean
  formBannerUrl?: string
  fields: FormField[]
}

interface FormValues {
  [key: string]: any
}

interface FormErrors {
  [key: string]: string
}

interface RegisterFormProps {
  /** The API URL to fetch form config from (e.g. '/api/public/registration-form-config' or '/api/public/registration-form-config?slug=career') */
  apiUrl: string
  /** The slug sent with the submit request */
  formSlug: string
  /** Optional error message shown when the form is disabled or fails to load */
  disabledMessage?: string
}

/* ── Layout Helpers ──────────────────────────────────── */

function getSpacingValue(val?: string): string {
  if (!val || val === 'none') return '0'
  switch (val) {
    case 'xs': return '4px'
    case 'sm': return '8px'
    case 'md': return '16px'
    case 'lg': return '24px'
    case 'xl': return '32px'
    default: return val
  }
}

function getHeightValue(val?: string): string {
  if (!val || val === 'auto') return 'auto'
  switch (val) {
    case 'sm': return '40px'
    case 'md': return '80px'
    case 'lg': return '160px'
    default: return val
  }
}

function getBorderWidthValue(val?: string): string {
  if (!val || val === 'none') return '0'
  switch (val) {
    case 'thin': return '1px'
    case 'medium': return '2px'
    case 'thick': return '3px'
    default: return val
  }
}

function getBorderRadiusValue(val?: string): string {
  if (!val || val === 'none') return '0'
  switch (val) {
    case 'sm': return '4px'
    case 'md': return '8px'
    case 'lg': return '12px'
    case 'xl': return '16px'
    case 'full': return '9999px'
    default: return val
  }
}

function getFieldWidthStyle(field: FormField): React.CSSProperties {
  if (field.customWidth) {
    return { width: field.customWidth, flexShrink: 0 }
  }
  switch (field.width) {
    case 'half': return { width: 'calc(50% - 8px)', flexShrink: 0 }
    case 'third': return { width: 'calc(33.33% - 10px)', flexShrink: 0 }
    case 'two-thirds': return { width: 'calc(66.66% - 10px)', flexShrink: 0 }
    case 'quarter': return { width: 'calc(25% - 12px)', flexShrink: 0 }
    case 'three-quarters': return { width: 'calc(75% - 6px)', flexShrink: 0 }
    case 'auto': return { flex: '1 1 auto' }
    default: return { width: '100%' }
  }
}

function getFieldContainerStyle(field: FormField): React.CSSProperties {
  return {
    ...getFieldWidthStyle(field),
    marginBottom: getSpacingValue(field.marginBottom),
    marginTop: getSpacingValue(field.marginTop),
  }
}

function getFieldInnerStyle(field: FormField): React.CSSProperties {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingTop: getSpacingValue(field.paddingTop),
    paddingBottom: getSpacingValue(field.paddingBottom),
  }
  if (field.backgroundColor) style.background = field.backgroundColor
  if (field.borderColor && field.borderWidth && field.borderWidth !== 'none') {
    style.border = `${getBorderWidthValue(field.borderWidth)} solid ${field.borderColor}`
  }
  const br = getBorderRadiusValue(field.borderRadius)
  if (br !== '0') style.borderRadius = br
  if (field.height && field.height !== 'auto') style.height = getHeightValue(field.height)
  return style
}

/* ── Styles (injected once) ─────────────────────────────── */

const STYLES = `
  .register-page { min-height: 100vh; background: #fafafa; padding: 100px 24px 80px; display: flex; justify-content: center; }
  .register-banner { margin-bottom: 32px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .register-banner-img { width: 100%; height: auto; max-height: 280px; object-fit: cover; display: block; }
  .register-container { max-width: 720px; width: 100%; }
  .register-loading, .register-error-state { text-align: center; padding: 80px 24px; color: #4a5568; }
  .register-header { text-align: center; margin-bottom: 40px; }
  .register-header h1 { font-family: var(--font-dm-sans), sans-serif; font-size: 36px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px; }
  .register-subtitle { font-size: 16px; color: #4a5568; margin: 0; }
  .register-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
  .register-form { display: flex; flex-wrap: wrap; gap: 0; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; padding: 0; }
  @media (max-width: 600px) { .register-header h1 { font-size: 28px; } }
  .form-group label { font-size: 13px; font-weight: 600; color: #374151; }
  .required { color: #dc2626; }
  .form-input { background: #f9fafb; border: 1px solid #d1d5db; color: #1a1a1a; padding: 11px 14px; border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; width: 100%; box-sizing: border-box; }
  .form-input:focus { border-color: #FF5B2E; box-shadow: 0 0 0 3px rgba(255,91,46,0.12); }
  .form-input::placeholder { color: #9ca3af; }
  .form-select { cursor: pointer; appearance: auto; }
  .form-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
  .input-error { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }
  .field-error { font-size: 12px; color: #ef4444; margin: 2px 0 0; }
  .field-help { font-size: 11px; color: #9ca3af; margin: 2px 0 0; }
  .radio-group { display: flex; gap: 10px; flex-wrap: wrap; }
  .radio-label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 10px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.2s; user-select: none; }
  .radio-label.active { border-color: #FF5B2E; background: rgba(255,91,46,0.06); color: #FF5B2E; font-weight: 600; }
  .radio-input { display: none; }
  .radio-custom { width: 16px; height: 16px; border: 2px solid #d1d5db; border-radius: 50%; display: inline-block; position: relative; transition: all 0.2s; flex-shrink: 0; }
  .radio-label.active .radio-custom { border-color: #FF5B2E; }
  .radio-label.active .radio-custom::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #FF5B2E; position: absolute; top: 2px; left: 2px; }
  .checkbox-label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 14px; color: #4a5568; line-height: 1.5; }
  .checkbox-input { display: none; }
  .checkbox-custom { min-width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; display: inline-block; position: relative; margin-top: 2px; transition: all 0.2s; flex-shrink: 0; }
  .checkbox-label:has(.checkbox-input:checked) .checkbox-custom { background: #FF5B2E; border-color: #FF5B2E; }
  .checkbox-label:has(.checkbox-input:checked) .checkbox-custom::after { content: '\\2713'; position: absolute; top: -1px; left: 2px; font-size: 13px; color: #fff; font-weight: 700; }
  .checkbox-error .checkbox-custom { border-color: #ef4444; }
  .checkbox-group-options { display: flex; flex-direction: column; gap: 10px; }
  .upload-area { border: 2px dashed #d1d5db; border-radius: 12px; padding: 20px; text-align: center; transition: all 0.2s; }
  .upload-area:hover { border-color: #FF5B2E; background: rgba(255,91,46,0.03); }
  .upload-button { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 600; color: #374151; cursor: pointer; font-family: inherit; }
  .upload-button:hover { background: #e5e7eb; }
  .upload-button:disabled { opacity: 0.6; cursor: not-allowed; }
  .uploaded-file { display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
  .file-name { font-size: 13px; font-weight: 600; color: #374151; }
  .file-remove { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: inherit; }
  .file-remove:hover { background: #fecaca; }
  .upload-hint { font-size: 11px; color: #9ca3af; margin: 8px 0 0; }
  .form-actions { text-align: center; margin-top: 8px; width: 100%; }
  .submit-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 40px; background: linear-gradient(135deg, #FF5B2E, #FF7A5C); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; min-width: 220px; }
  .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,91,46,0.3); }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
  .register-success { max-width: 560px; width: 100%; text-align: center; }
  .success-icon { font-size: 64px; margin-bottom: 16px; }
  .register-success h1 { font-size: 32px; font-weight: 800; color: #1a1a1a; margin: 0 0 12px; }
  .success-message { font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 24px; }
  .success-reference { display: inline-flex; flex-direction: column; gap: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 24px; margin-bottom: 24px; }
  .ref-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #16a34a; }
  .ref-value { font-size: 20px; font-weight: 700; color: #1a1a1a; letter-spacing: .02em; }
  .success-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: left; margin-bottom: 24px; }
  .success-details h3 { font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: .06em; }
  .success-details ol { margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 2; }
  .email-notice { margin-top: 16px; padding: 12px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 13px; color: #1e40af; }
  .success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary, .btn-secondary { display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; }
  .btn-primary { background: linear-gradient(135deg, #FF5B2E, #FF7A5C); color: #fff; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(255,91,46,0.3); }
  .btn-secondary { background: transparent; color: #1a1a1a; border: 1px solid #e2e8f0; }
  .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { display: inline-block; animation: spin 1s linear infinite; }
`

/* ── Main Component ───────────────────────────────────── */

export default function RegisterForm({ apiUrl, formSlug, disabledMessage }: RegisterFormProps) {
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; url: string }>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        if (data.config && data.config.isEnabled !== false) {
          setConfig(data.config)
          const initial: FormValues = {}
          for (const field of data.config.fields) {
            if (field.isActive) {
              if (field.type === 'checkbox') initial[field.key] = false
              else if (field.type === 'checkbox-group') initial[field.key] = []
              else initial[field.key] = ''
            }
          }
          setValues(initial)
        } else {
          setError(disabledMessage || 'Registration form is currently disabled.')
        }
      })
      .catch(() => setError('Failed to load registration form.'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl])

  function updateValue(key: string, value: any) {
    setValues(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next })
    }
  }

  function validate(): boolean {
    if (!config) return false
    const newErrors: FormErrors = {}
    for (const field of config.fields) {
      if (!field.isActive) continue
      if (['heading', 'label', 'section', 'row', 'divider', 'separator', 'image', 'html'].includes(field.type)) continue
      const value = values[field.key]
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!value) newErrors[field.key] = field.errorMessage || 'This field is required'
        } else if (!value || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.key] = field.errorMessage || 'This field is required'
        }
      }
      if (field.type === 'email' && value && typeof value === 'string' && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value.trim())) newErrors[field.key] = 'Please enter a valid email address'
      }
      if (field.pattern && value && typeof value === 'string' && value.trim()) {
        try {
          const regex = new RegExp(field.pattern)
          if (!regex.test(value.trim())) newErrors[field.key] = field.errorMessage || 'Invalid format'
        } catch { /* invalid regex, skip */ }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleFileUpload(fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(fieldKey)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/public/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setUploadedFiles(prev => ({ ...prev, [fieldKey]: { name: file.name, url: data.url || URL.createObjectURL(file) } }))
      updateValue(fieldKey, data.url || file.name)
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [fieldKey]: 'Upload failed: ' + (err.message || '') }))
    } finally {
      setUploading(null)
    }
  }

  function removeUploadedFile(fieldKey: string) {
    setUploadedFiles(prev => { const next = { ...prev }; delete next[fieldKey]; return next })
    updateValue(fieldKey, '')
    if (fileInputRefs.current[fieldKey]) fileInputRefs.current[fieldKey]!.value = ''
  }

  const identityFields = useMemo(() => {
    if (!config) return { nameKey: 'fullName', emailKey: 'email', phoneKey: 'phone' }
    const active = config.fields.filter(f => f.isActive)
    const emailField = active.find(f => f.type === 'email')
    const phoneField = active.find(f => f.type === 'tel')
    const nameField = active.find(f => f.type === 'text' && f.label?.toLowerCase().includes('name'))
      || active.find(f => f.type === 'text')
    return {
      nameKey: nameField?.key || 'fullName',
      emailKey: emailField?.key || 'email',
      phoneKey: phoneField?.key || 'phone',
    }
  }, [config])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!config || !validate()) return
    setSubmitting(true)
    setError('')
    try {
      const formData: Record<string, any> = {}
      for (const field of config.fields) {
        if (!field.isActive || ['heading', 'label', 'section', 'row', 'divider', 'separator', 'image', 'html'].includes(field.type)) continue
        const val = values[field.key]
        if (val !== undefined && val !== '') formData[field.key] = val
      }
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values[identityFields.nameKey] || values.fullName || '',
          email: values[identityFields.emailKey] || values.email || '',
          phone: values[identityFields.phoneKey] || values.phone || '',
          formSlug,
          formData,
          _hp: values._hp || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setReference(data.reference || '')
      setEmailSent(data.emailSent || false)
      setStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render field ─────────────────────────────────── */

  function renderField(field: FormField, index: number): React.ReactNode {
    const hasError = !!errors[field.key]
    const uniqueKey = `${field.key}-o${field.order ?? index}`

    if (field.type === 'divider') {
      return (
        <div key={uniqueKey} style={{
          ...getFieldContainerStyle(field),
          width: '100%',
          paddingTop: getSpacingValue(field.paddingTop),
          paddingBottom: getSpacingValue(field.paddingBottom),
        }}>
          <hr style={{
            border: 'none',
            borderTop: `${field.dividerThickness || '1'}px ${field.dividerStyle || 'solid'} ${field.dividerColor || '#e2e8f0'}`,
            margin: 0,
          }} />
        </div>
      )
    }

    if (field.type === 'separator') {
      const height = field.separatorHeight || '24'
      return (
        <div key={uniqueKey} style={{
          width: '100%',
          height: `${height}px`,
          marginTop: getSpacingValue(field.marginTop),
          marginBottom: getSpacingValue(field.marginBottom),
        }} />
      )
    }

    if (field.type === 'image') {
      if (!field.imageSrc) return null
      return (
        <div key={uniqueKey} style={{
          ...getFieldContainerStyle(field),
          width: '100%',
          textAlign: field.textAlign || 'center',
        }}>
          <div style={{
            ...getFieldInnerStyle(field),
            alignItems: field.textAlign === 'center' ? 'center' : field.textAlign === 'right' ? 'flex-end' : 'flex-start',
          }}>
            <img
              src={field.imageSrc}
              alt={field.imageAlt || ''}
              style={{
                width: '100%',
                height: field.imageHeight || 'auto',
                borderRadius: `${field.imageBorderRadius || '8'}px`,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>
      )
    }

    if (field.type === 'html') {
      if (!field.htmlContent) return null
      return (
        <div key={uniqueKey} style={{
          ...getFieldContainerStyle(field),
          width: '100%',
        }}>
          <div style={{
            ...getFieldInnerStyle(field),
            textAlign: field.textAlign || 'left',
          }}>
            <div dangerouslySetInnerHTML={{ __html: field.htmlContent }} />
          </div>
        </div>
      )
    }

    if (field.type === 'heading') {
      return (
        <div key={uniqueKey} style={{ ...getFieldContainerStyle(field), width: '100%' }}>
          <div style={{
            ...getFieldInnerStyle(field),
            background: field.backgroundColor || '#fff',
            border: `${getBorderWidthValue(field.borderWidth || 'thin')} solid ${field.borderColor || '#e2e8f0'}`,
            borderRadius: getBorderRadiusValue(field.borderRadius || 'lg'),
            padding: '24px 28px',
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 700, color: '#1a1a1a',
              margin: 0, paddingBottom: 12, borderBottom: '1px solid #e2e8f0',
            }}>{field.heading}</h2>
          </div>
        </div>
      )
    }

    if (field.type === 'label') {
      return (
        <div key={uniqueKey} style={{ ...getFieldContainerStyle(field), width: '100%' }}>
          <div style={{
            ...getFieldInnerStyle(field),
            textAlign: field.textAlign || 'left',
          }}>
            <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {field.label || field.heading}
            </p>
          </div>
        </div>
      )
    }

    const fieldStyle = getFieldContainerStyle(field)
    const innerStyle = getFieldInnerStyle(field)

    return (
      <div key={uniqueKey} style={fieldStyle}>
        <div style={innerStyle}>
          {field.type !== 'checkbox' && field.type !== 'checkbox-group' && (
            <label htmlFor={field.key} style={{ textAlign: field.textAlign || 'left' }}>
              {field.label}
              {field.required && <span className="required"> *</span>}
            </label>
          )}

          {['text', 'email', 'tel', 'url', 'number', 'password', 'date'].includes(field.type) && (
            <input
              id={field.key}
              type={field.type === 'password' ? 'password' : field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : field.type}
              value={values[field.key] || ''}
              onChange={(e) => updateValue(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={`form-input ${hasError ? 'input-error' : ''}`}
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              id={field.key}
              value={values[field.key] || ''}
              onChange={(e) => updateValue(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`form-input form-textarea ${hasError ? 'input-error' : ''}`}
              style={field.height && field.height !== 'auto' ? { minHeight: getHeightValue(field.height) } : undefined}
            />
          )}

          {field.type === 'select' && (
            <select
              id={field.key}
              value={values[field.key] || ''}
              onChange={(e) => updateValue(field.key, e.target.value)}
              className={`form-input form-select ${hasError ? 'input-error' : ''}`}
            >
              {field.placeholder && <option value="">{field.placeholder}</option>}
              {(field.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {field.type === 'radio' && (
            <div className="radio-group">
              {(field.options || []).map((opt) => (
                <label key={opt.value} className={`radio-label ${values[field.key] === opt.value ? 'active' : ''}`}>
                  <input type="radio" name={field.key} value={opt.value} checked={values[field.key] === opt.value}
                    onChange={(e) => updateValue(field.key, e.target.value)} className="radio-input" />
                  <span className="radio-custom" />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <label className={`checkbox-label ${hasError ? 'checkbox-error' : ''}`}>
              <input type="checkbox" checked={!!values[field.key]}
                onChange={(e) => updateValue(field.key, e.target.checked)} className="checkbox-input" />
              <span className="checkbox-custom" />
              <span>{field.label}{field.required && <span className="required"> *</span>}</span>
            </label>
          )}

          {field.type === 'checkbox-group' && (
            <div className="checkbox-group-options">
              {(field.options || []).map((opt) => {
                const checked = (values[field.key] || []).includes(opt.value)
                return (
                  <label key={opt.value} className="checkbox-label">
                    <input type="checkbox" checked={checked}
                      onChange={() => {
                        const current: string[] = values[field.key] || []
                        const next = checked ? current.filter(v => v !== opt.value) : [...current, opt.value]
                        updateValue(field.key, next)
                      }} className="checkbox-input" />
                    <span className="checkbox-custom" />
                    <span>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          )}

          {field.type === 'file' && (
            <div className="upload-area">
              <input ref={(el) => { fileInputRefs.current[field.key] = el }} type="file" id={`file-${field.key}`}
                onChange={(e) => handleFileUpload(field.key, e)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.ppt,.pptx"
                className="file-input-hidden" style={{ display: 'none' }} />
              {!uploadedFiles[field.key] ? (
                <button type="button" className="upload-button"
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                  disabled={uploading === field.key}>
                  {uploading === field.key ? '⏳ Uploading...' : '📎 Choose File'}
                </button>
              ) : (
                <div className="uploaded-file">
                  <span className="file-name">📄 {uploadedFiles[field.key].name}</span>
                  <button type="button" className="file-remove" onClick={() => removeUploadedFile(field.key)}>✕ Remove</button>
                </div>
              )}
              {field.helpText && <p className="upload-hint">{field.helpText}</p>}
            </div>
          )}

          {hasError && <p className="field-error">❌ {errors[field.key]}</p>}
          {field.helpText && !hasError && field.type !== 'file' && (
            <p className="field-help">{field.helpText}</p>
          )}
        </div>
      </div>
    )
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="register-page">
          <div className="register-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading registration form...</p>
          </div>
        </div>
      </>
    )
  }

  if (error && !config) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="register-page">
          <div className="register-error-state">
            <p>{error}</p>
            <Link href="/" className="btn-primary">← Back to Home</Link>
          </div>
        </div>
      </>
    )
  }

  if (!config) return null

  /* ── Success State ── */
  if (step === 'success') {
    return (
      <>
        <style>{STYLES}</style>
        <div className="register-page">
          <div className="register-success">
            <div className="success-icon">✅</div>
            <h1>Registration Successful!</h1>
            <p className="success-message">{config.successMessage}</p>
            {reference && (
              <div className="success-reference">
                <span className="ref-label">Reference Number</span>
                <span className="ref-value">{reference}</span>
              </div>
            )}
            <div className="success-details">
              <h3>What happens next?</h3>
              <ol>
                <li><strong>Confirmation.</strong> Your details have been saved in our system.</li>
                <li><strong>Review.</strong> Our team will review your submission.</li>
                <li><strong>Connect.</strong> We&apos;ll reach out to you with further details.</li>
              </ol>
              {emailSent && (
                <p className="email-notice">📧 A confirmation email has been sent to {values.email || 'your email'}.</p>
              )}
            </div>
            <div className="success-actions">
              <Link href="/" className="btn-primary">← Back to Home</Link>
              <Link href="/contact-us" className="btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ── Form ── */
  const activeFields = config.fields
    .filter(f => f.isActive)
    .sort((a, b) => a.order - b.order)

  function renderFields() {
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < activeFields.length) {
      const field = activeFields[i]

      if (field.type === 'row') {
        const children: React.ReactNode[] = []
        const gap = field.columnGap || '16'
        i++
        while (i < activeFields.length) {
          const child = activeFields[i]
          if (['row', 'section', 'heading', 'divider', 'separator'].includes(child.type)) break
          children.push(renderField(child, i))
          i++
        }
        elements.push(
          <div key={`${field.key}-o${field.order ?? 0}-row`} style={{ ...getFieldContainerStyle(field), width: '100%' }}>
            <div style={{
              ...getFieldInnerStyle(field),
              display: 'flex',
              flexWrap: 'wrap',
              gap: `${gap}px`,
              padding: field.heading ? '20px' : '0',
              alignItems: 'flex-start',
              overflow: 'hidden',
            }}>
              {field.heading && (
                <div style={{ width: '100%', fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
                  {field.heading}
                </div>
              )}
              {children}
            </div>
          </div>
        )
        continue
      }

      if (field.type === 'section') {
        const children: React.ReactNode[] = []
        i++
        while (i < activeFields.length) {
          const child = activeFields[i]
          if (['row', 'section', 'heading'].includes(child.type)) break
          children.push(renderField(child, i))
          i++
        }
        elements.push(
          <div key={`${field.key}-o${field.order ?? 0}-section`} style={{ ...getFieldContainerStyle(field), width: '100%' }}>
            <div style={{
              ...getFieldInnerStyle(field),
              background: field.backgroundColor || '#fff',
              border: `${getBorderWidthValue(field.borderWidth || 'thin')} solid ${field.borderColor || '#e2e8f0'}`,
              borderRadius: getBorderRadiusValue(field.borderRadius || 'lg'),
              padding: '24px 28px',
            }}>
              {field.heading && (
                <h2 style={{
                  fontSize: 16, fontWeight: 700, color: '#1a1a1a',
                  margin: '0 0 16px', paddingBottom: 12, borderBottom: '1px solid #e2e8f0',
                }}>{field.heading}</h2>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {children}
              </div>
            </div>
          </div>
        )
        continue
      }

      elements.push(renderField(field, i))
      i++
    }

    return elements
  }

  return (
    <div className="register-page">
      <div className="register-container">
        {config.formBannerUrl && (
          <div className="register-banner">
            <img src={config.formBannerUrl} alt="Registration banner" className="register-banner-img" />
          </div>
        )}
        <div className="register-header">
          <h1>{config.formTitle}</h1>
          <p className="register-subtitle">{config.formSubtitle}</p>
        </div>

        {error && <div className="register-error">❌ {error}</div>}

        <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
          {renderFields()}

          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
            <label htmlFor="_hp">Leave this empty</label>
            <input id="_hp" name="_hp" type="text" tabIndex={-1} autoComplete="off"
              value={values._hp || ''} onChange={(e) => updateValue('_hp', e.target.value)} />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <><Loader2 size={16} className="spin" /> Submitting...</>
              ) : (
                config.submitButtonText || 'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{STYLES}</style>
    </div>
  )
}
