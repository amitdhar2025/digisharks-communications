/**
 * CMS Admin — Site Settings
 *
 * Manage global site configurations: phone, email, address,
 * social links, business hours, and branding text.
 *
 * Styled to match the page editor's card-based layout (Tailwind classes).
 */

'use client'

import { useState, useEffect } from 'react'
import { Save, Check, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import {
  INPUT_CLASS,
  TEXTAREA_CLASS,
  LABEL_CLASS,
  BTN_PRIMARY_LG,
  CARD_CLASS,
  ACCENT_COLORS,
  TOAST_SUCCESS_CLASS,
  TOAST_ERROR_CLASS,
  SPINNER_CLASS,
  LOADING_WRAPPER_CLASS,
  BACK_LINK_CLASS,
} from '@/app/content/admin/lib/cms-styles'

// ── Types ────────────────────────────────────────────────────────────

interface SettingsField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'toggle'
  placeholder?: string
  description?: string
  recommended?: string
  defaultReset?: string
  default?: string
  rows?: number
}

interface SettingsSection {
  label: string
  icon: string
  fields: SettingsField[]
}

// ── Richtext field (uses TipTapEditor) ──────────────────────────────────

function SettingsRichtextField({ value, onChange, label }: {
  value: string
  onChange: (val: string) => void
  label: string
}) {
  const [Editor, setEditor] = useState<React.ComponentType<{
    content: string
    onChange: (html: string) => void
    placeholder?: string
  }> | null>(null)
  const [editorError, setEditorError] = useState(false)

  useEffect(() => {
    import('@/components/admin/TipTapEditor')
      .then((mod) => setEditor(() => mod.default))
      .catch(() => setEditorError(true))
  }, [])

  if (editorError) {
    return (
      <div className="mb-3.5">
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
    <div className="mb-3.5">
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
  )
}

const FIELD_SECTIONS: SettingsSection[] = [
  {
    label: 'Contact Information',
    icon: '📞',
    fields: [
      { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '+91 96273 32332' },
      { key: 'email', label: 'Email Address', type: 'text', placeholder: 'marketing@digisharkscommunications.com' },
      { key: 'address', label: 'Office Address', type: 'textarea', placeholder: 'B-2, C-87, C Block, Sector 63...' },
      { key: 'businessHours', label: 'Business Hours', type: 'text', placeholder: 'Mon–Sat: 10:00 AM – 7:00 PM IST' },
    ],
  },
  {
    label: 'Social Media Links',
    icon: '🌐',
    fields: [
      { key: 'socialFacebook', label: 'Facebook URL', type: 'text', placeholder: 'https://www.facebook.com/digisharks' },
      { key: 'socialTwitter', label: 'Twitter / X URL', type: 'text', placeholder: 'https://twitter.com/digisharks' },
      { key: 'socialInstagram', label: 'Instagram URL', type: 'text', placeholder: 'https://www.instagram.com/digisharks' },
      { key: 'socialLinkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://www.linkedin.com/company/digisharks' },
      { key: 'socialYoutube', label: 'YouTube URL', type: 'text', placeholder: 'https://www.youtube.com/@digisharks' },
    ],
  },
  {
    label: 'Branding & Footer',
    icon: '🏷️',
    fields: [
      { key: 'siteName', label: 'Site Name', type: 'text', placeholder: 'Digisharks Communications' },
      { key: 'footerTagline', label: 'Footer Tagline', type: 'richtext', placeholder: 'Top AI-Powered Digital PR...' },
      { key: 'copyrightText', label: 'Copyright Text', type: 'text', placeholder: '© {year} Digisharks Communications...' },
    ],
  },
  {
    label: 'Legal Links',
    icon: '⚖️',
    fields: [
      { key: 'privacyPolicyUrl', label: 'Privacy Policy URL', type: 'text', placeholder: '/privacy-policy' },
      { key: 'termsUrl', label: 'Terms & Conditions URL', type: 'text', placeholder: '/terms-and-conditions' },
      { key: 'refundPolicyUrl', label: 'Refund Policy URL', type: 'text', placeholder: '/refund-policy' },
    ],
  },
  {
    label: 'Site Branding',
    icon: '🎨',
    fields: [
      { key: 'headerLogo', label: 'Header Logo URL', type: 'image', placeholder: 'Path or URL for site header logo', recommended: '200x60px, transparent PNG or SVG', defaultReset: '' },
      { key: 'headerLogoAlt', label: 'Header Logo Alt Text', type: 'text', placeholder: 'DigiSharks Logo', default: 'DigiSharks Logo' },
      { key: 'footerLogo', label: 'Footer Logo URL', type: 'image', placeholder: 'Path or URL for footer (inverted/white version)', recommended: '200x60px, transparent PNG/SVG on dark bg', defaultReset: '' },
      { key: 'footerLogoAlt', label: 'Footer Logo Alt Text', type: 'text', placeholder: 'DigiSharks Logo', default: 'DigiSharks Logo' },
      { key: 'favicon', label: 'Favicon URL', type: 'image', placeholder: 'Path or URL for favicon (32x32px)', defaultReset: '' },
    ],
  },
  {
    label: 'Maintenance Mode',
    icon: '🔧',
    fields: [
      { key: 'maintenanceMode', label: 'Enable Maintenance Mode', type: 'toggle', description: 'When enabled, public visitors see a maintenance message. Admin routes remain accessible.' },
      { key: 'maintenanceMessage', label: 'Maintenance Message', type: 'richtext', placeholder: "We're giving our website a performance upgrade..." },
    ],
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{kind: string; text: string} | null>(null)

  useEffect(() => { loadSettings() }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  async function loadSettings() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/content/admin/settings')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      setSettings(data.settings || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(key: string, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/content/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setToast({ kind: 'success', text: 'Settings saved successfully!' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={LOADING_WRAPPER_CLASS}>
        <div className={SPINNER_CLASS} />
        <p className="text-sm">Loading settings…</p>
      </div>
    )
  }

  // ── Field renderer ────────────────────────────────────────────────

  function renderField(field: SettingsField) {
    const fieldClass = 'mb-3.5'

    if (field.type === 'toggle') {
      return (
        <div key={field.key} className={fieldClass}>
          <label className={LABEL_CLASS}>{field.label}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={!!settings[field.key]}
              onClick={() => handleChange(field.key, !settings[field.key])}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                settings[field.key] ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-700 border-slate-600'
              } border`}
            >
              <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                settings[field.key] ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            {field.description && (
              <span className="text-xs text-slate-500 leading-relaxed">{field.description}</span>
            )}
          </div>
        </div>
      )
    }

    if (field.type === 'image') {
      return (
        <div key={field.key} className={fieldClass}>
          <label className={LABEL_CLASS}>{field.label}</label>
          {settings[field.key] ? (
            <div>
              <img
                src={settings[field.key]}
                alt=""
                className="max-w-[200px] max-h-[60px] rounded-lg border border-slate-700 mb-2"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`${INPUT_CLASS} flex-1`}
                  placeholder={field.placeholder}
                />
                <button
                  type="button"
                  className="flex-shrink-0 px-2.5 py-2 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors text-xs font-medium"
                  onClick={() => handleChange(field.key, '')}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={settings[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={`${INPUT_CLASS} flex-1`}
                placeholder={field.placeholder}
              />
            </div>
          )}
          {field.recommended && (
            <p className="text-xs text-slate-500 mt-1">Recommended: {field.recommended}</p>
          )}
          {field.defaultReset !== undefined && settings[field.key] !== field.defaultReset && (
            <button
              type="button"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-slate-500 hover:text-sky-400 transition-colors"
              onClick={() => handleChange(field.key, field.defaultReset!)}
            >
              ↩ Reset to default
            </button>
          )}
        </div>
      )
    }

    if (field.type === 'richtext') {
      return (
        <div key={field.key} className={fieldClass}>
          <label className={LABEL_CLASS}>{field.label}</label>
          <SettingsRichtextField
            value={settings[field.key] || ''}
            onChange={(val) => handleChange(field.key, val)}
            label={field.label}
          />
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className={fieldClass}>
          <label className={LABEL_CLASS}>{field.label}</label>
          <textarea
            value={settings[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className={TEXTAREA_CLASS}
            placeholder={field.placeholder}
            rows={field.rows || 2}
          />
        </div>
      )
    }

    // Text input (default)
    return (
      <div key={field.key} className={fieldClass}>
        <label className={LABEL_CLASS}>{field.label}</label>
        <input
          type="text"
          value={settings[field.key] || ''}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className={INPUT_CLASS}
          placeholder={field.placeholder}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/content/admin"
          className={BACK_LINK_CLASS + ' mb-1'}
        >
          <ArrowLeft size={13} />
          Dashboard
        </Link>
        <h1 className="text-xl font-bold text-slate-100">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage global site configuration — phone, email, social links, and footer text
        </p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`${TOAST_SUCCESS_CLASS}`}>
          <Check size={14} />
          {toast.text}
        </div>
      )}

      {error && (
        <div className={TOAST_ERROR_CLASS}>
          {error}
        </div>
      )}

      {/* Settings Sections as Cards */}
      <div className="space-y-5">
        {FIELD_SECTIONS.map((section, si) => (
          <div key={si} className={CARD_CLASS}>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className={`w-1.5 h-5 ${ACCENT_COLORS[si % ACCENT_COLORS.length]} rounded-full inline-block flex-shrink-0`} />
              <span className="text-base normal-case">{section.icon}</span>
              {section.label}
            </h3>
            <div>
              {section.fields.map((field) => renderField(field))}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="mt-6 pt-4 border-t border-slate-700/60 flex justify-end">
        <button
          className={BTN_PRIMARY_LG}
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
