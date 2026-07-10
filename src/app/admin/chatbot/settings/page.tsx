'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import toast, { Toaster } from 'react-hot-toast'
import ChatBotIcon from '@/components/ChatBotIcon'

interface Settings {
  botName: string
  welcomeMessage: string
  fallbackMessage: string

  // Legacy chat-window colors
  primaryColor: string
  accentColor: string
  closeButtonColor: string

  // Bubble icon colors
  bubbleBgColor: string
  bubbleBorderColor: string
  bubbleShadowColor: string
  faceStrokeColor: string
  faceFillColor: string
  faceCheekColor: string
  antennaColor: string

  // Pill colors
  pillLabel: string
  pillBgColor: string
  pillTextColor: string
  pillBorderColor: string
  pillShadowColor: string

  // Size controls
  bubbleSize: number
  pillFontSize: number
  pillPaddingX: number
  pillPaddingY: number

  mobileBottomOffset: number

  isEnabled: boolean
}

const DEFAULTS: Settings = {
  botName: 'DigiSharks ChatBot',
  welcomeMessage: 'Hi! How can I help you today?',
  fallbackMessage: "Sorry, I don't have an answer for that.",
  primaryColor: '#FF5B2E',
  accentColor: '#0F1628',
  closeButtonColor: '#ffffff',
  bubbleBgColor: '#20B486',
  bubbleBorderColor: '#ffffff',
  bubbleShadowColor: 'rgba(32, 180, 134, 0.45)',
  faceStrokeColor: '#ffffff',
  faceFillColor: '#ffffff',
  faceCheekColor: '#FF8FA3',
  antennaColor: '#FF5B2E',
  pillLabel: 'Talk to us',
  pillBgColor: '#1E2336',
  pillTextColor: '#ffffff',
  pillBorderColor: 'transparent',
  pillShadowColor: 'rgba(15, 22, 40, 0.35)',
  bubbleSize: 72,
  pillFontSize: 15,
  pillPaddingX: 22,
  pillPaddingY: 10,
  mobileBottomOffset: 110,
  isEnabled: true,
}

export default function ChatbotSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    fetch('/api/chatbot/settings')
      .then(async (res) => {
        if (res.status === 401) { router.push('/admin/login'); return }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        // Merge with defaults so the form always has every field
        setSettings({ ...DEFAULTS, ...data.settings })
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/chatbot/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      const data = await res.json()
      setSettings({ ...DEFAULTS, ...data.settings })
      toast.success('Settings saved!')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  function resetToDefaults() {
    if (!settings) return
    if (confirm('Reset all color & text settings to defaults?')) {
      setSettings({ ...settings, ...DEFAULTS })
    }
  }

  const [loadingSidebar, setLoadingSidebar] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="admin-layout">
        <div className={`sidebar-backdrop${loadingSidebar ? ' open' : ''}`} onClick={() => setLoadingSidebar(false)} />
        <button className="sidebar-toggle" onClick={() => setLoadingSidebar(!loadingSidebar)} aria-label="Toggle sidebar">
          ☰
        </button>
        <AdminSidebar isOpen={loadingSidebar} onNavClick={() => setLoadingSidebar(false)} />
        <main className="admin-main">
          <div className="empty"><span className="spinner" /> Loading settings…</div>
        </main>
      </div>
    )
  }

  if (!settings) return null

  // Re-usable color picker control
  const ColorField = ({
    label,
    value,
    onChange,
    hint,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    hint?: string
  }) => (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 50, height: 40, padding: 2, background: 'transparent', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: '#0b1220',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '8px 10px',
            color: '#e2e8f0',
            fontSize: 13,
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
      </div>
      {hint && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{hint}</div>}
    </div>
  )

  // Re-usable switch to set a color back to "transparent"
  const isTransparent = (c: string) =>
    !c || c === 'transparent' || c === 'rgba(0,0,0,0)' || c === 'rgba(0, 0, 0, 0)'

  // Re-usable size control with +/- buttons + slider + number input
  const SizeField = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = 'px',
    hint,
  }: {
    label: string
    value: number
    onChange: (v: number) => void
    min: number
    max: number
    step?: number
    unit?: string
    hint?: string
  }) => {
    const dec = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100))
    const inc = () => onChange(Math.min(max, Math.round((value + step) * 100) / 100))
    const sliderPct = ((value - min) / (max - min)) * 100
    return (
      <div className="field">
        <label>{label}</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={dec}
            aria-label="Decrease size"
            style={{
              width: 36, height: 36,
              background: '#0b1220',
              color: '#7dd3fc',
              border: '1px solid #334155',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            −
          </button>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: '#0ea5e9',
              cursor: 'pointer',
            }}
          />
          <button
            type="button"
            onClick={inc}
            aria-label="Increase size"
            style={{
              width: 36, height: 36,
              background: '#0b1220',
              color: '#7dd3fc',
              border: '1px solid #334155',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            +
          </button>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, Math.round(n * 100) / 100)))
            }}
            style={{
              width: 70,
              background: '#0b1220',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '8px 10px',
              color: '#e2e8f0',
              fontSize: 13,
              fontFamily: 'monospace',
              outline: 'none',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: 12, color: '#64748b', minWidth: 14 }}>{unit}</span>
        </div>
        {hint && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{hint}</div>}
        <div style={{ marginTop: 4, height: 3, background: '#0b1220', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${sliderPct}%`, height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' } }} />
      <div className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>⚙ Chatbot Settings</h1>
            <div className="sub">Configure your chatbot appearance and behavior — all colors are dynamic</div>
          </div>
          <div className="cell-actions" style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={resetToDefaults} style={{ background: '#1e293b', color: '#94a3b8' }}>
              ↺ Reset Colors
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>
          {/* ============ SETTINGS FORM ============ */}
          <div className="table-wrap" style={{ padding: 24 }}>
            <form onSubmit={handleSave}>
              {/* ===== General ===== */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                💬 General
              </div>

              <div className="field">
                <label>Bot Name</label>
                <input value={settings.botName} onChange={e => setSettings({ ...settings, botName: e.target.value })} placeholder="DigiBot" />
              </div>
              <div className="field">
                <label>Welcome Message</label>
                <textarea value={settings.welcomeMessage} onChange={e => setSettings({ ...settings, welcomeMessage: e.target.value })} style={{ minHeight: 60 }} />
              </div>
              <div className="field">
                <label>Fallback Message (when no answer found)</label>
                <textarea value={settings.fallbackMessage} onChange={e => setSettings({ ...settings, fallbackMessage: e.target.value })} style={{ minHeight: 60 }} />
              </div>

              {/* ===== Bubble Icon (the floating round button) ===== */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 24, marginBottom: 12 }}>
                🟢 Chat Bubble Icon (floating button)
              </div>

              <ColorField
                label="Bubble Background Color"
                value={settings.bubbleBgColor}
                onChange={(v) => setSettings({ ...settings, bubbleBgColor: v })}
                hint="The colored circle behind the robot face"
              />
              <ColorField
                label="Bubble Border Color"
                value={settings.bubbleBorderColor}
                onChange={(v) => setSettings({ ...settings, bubbleBorderColor: v })}
                hint="Outline ring around the bubble"
              />
              <ColorField
                label="Bubble Shadow Color"
                value={settings.bubbleShadowColor}
                onChange={(v) => setSettings({ ...settings, bubbleShadowColor: v })}
                hint="Drop-shadow tint (supports rgba)"
              />
              <ColorField
                label="Face Outline Color"
                value={settings.faceStrokeColor}
                onChange={(v) => setSettings({ ...settings, faceStrokeColor: v })}
                hint="Color of the robot's face lines"
              />
              <ColorField
                label="Face Inner Fill (eyes)"
                value={settings.faceFillColor}
                onChange={(v) => setSettings({ ...settings, faceFillColor: v })}
              />
              <ColorField
                label="Cheek Blush Color"
                value={settings.faceCheekColor}
                onChange={(v) => setSettings({ ...settings, faceCheekColor: v })}
              />
              <ColorField
                label="Antenna Dot Color"
                value={settings.antennaColor}
                onChange={(v) => setSettings({ ...settings, antennaColor: v })}
              />

              {/* ===== Talk To Us Pill ===== */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 24, marginBottom: 12 }}>
                🏷 "Talk to us" Pill Button
              </div>

              <div className="field">
                <label>Pill Label Text</label>
                <input value={settings.pillLabel} onChange={e => setSettings({ ...settings, pillLabel: e.target.value })} placeholder="Talk to us" />
              </div>
              <ColorField
                label="Pill Background Color"
                value={settings.pillBgColor}
                onChange={(v) => setSettings({ ...settings, pillBgColor: v })}
              />
              <ColorField
                label="Pill Text Color"
                value={settings.pillTextColor}
                onChange={(v) => setSettings({ ...settings, pillTextColor: v })}
              />
              <div className="field">
                <label>Pill Border Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={isTransparent(settings.pillBorderColor) ? '#000000' : settings.pillBorderColor}
                    onChange={(e) => setSettings({ ...settings, pillBorderColor: e.target.value })}
                    style={{ width: 50, height: 40, padding: 2, background: 'transparent', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={settings.pillBorderColor}
                    onChange={(e) => setSettings({ ...settings, pillBorderColor: e.target.value })}
                    style={{
                      flex: 1,
                      background: '#0b1220',
                      border: '1px solid #334155',
                      borderRadius: 6,
                      padding: '8px 10px',
                      color: '#e2e8f0',
                      fontSize: 13,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, pillBorderColor: 'transparent' })}
                    style={{
                      padding: '8px 12px',
                      background: '#1e293b',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    None
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Use "None" for no border, or pick a color</div>
              </div>
              <ColorField
                label="Pill Shadow Color"
                value={settings.pillShadowColor}
                onChange={(v) => setSettings({ ...settings, pillShadowColor: v })}
                hint="Drop-shadow tint (supports rgba)"
              />

              {/* ===== Size Controls ===== */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 24, marginBottom: 12 }}>
                📏 Size Controls (increase / decrease)
              </div>

              <SizeField
                label="Chat Bubble Size"
                value={settings.bubbleSize}
                onChange={(v) => setSettings({ ...settings, bubbleSize: v })}
                min={40}
                max={160}
                step={2}
                hint="Diameter of the round chat button (40–160 px)"
              />
              <SizeField
                label="Pill Font Size"
                value={settings.pillFontSize}
                onChange={(v) => setSettings({ ...settings, pillFontSize: v })}
                min={10}
                max={28}
                step={1}
                hint="Text size of the pill label (10–28 px)"
              />
              <SizeField
                label="Pill Horizontal Padding"
                value={settings.pillPaddingX}
                onChange={(v) => setSettings({ ...settings, pillPaddingX: v })}
                min={8}
                max={48}
                step={1}
                hint="Left & right padding of the pill (8–48 px)"
              />
              <SizeField
                label="Pill Vertical Padding"
                value={settings.pillPaddingY}
                onChange={(v) => setSettings({ ...settings, pillPaddingY: v })}
                min={4}
                max={28}
                step={1}
                hint="Top & bottom padding of the pill (4–28 px)"
              />

              {/* ===== Mobile Positioning ===== */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 24, marginBottom: 12 }}>
                📱 Mobile Positioning
              </div>

              <SizeField
                label="Mobile Bottom Offset"
                value={settings.mobileBottomOffset}
                onChange={(v) => setSettings({ ...settings, mobileBottomOffset: v })}
                min={20}
                max={300}
                step={5}
                hint="Distance from bottom on mobile product pages (20–300 px). Increase if chatbot overlaps the mobile bottom bar."
              />

              {/* ===== Advanced (chat-window internals) ===== */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  marginTop: 24,
                  background: 'transparent',
                  border: 'none',
                  color: '#7dd3fc',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {showAdvanced ? '▼' : '▶'} Advanced — Chat window internals
              </button>

              {showAdvanced && (
                <div style={{ marginTop: 12, padding: 16, background: '#0b1220', borderRadius: 10, border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                    These colors control the open chat window (header, messages, send button), not the floating launcher.
                  </div>
                  <ColorField
                    label="Header / Primary Color"
                    value={settings.primaryColor}
                    onChange={(v) => setSettings({ ...settings, primaryColor: v })}
                    hint="Chat header background & accents"
                  />
                  <ColorField
                    label="Accent Color (visitor messages)"
                    value={settings.accentColor}
                    onChange={(v) => setSettings({ ...settings, accentColor: v })}
                  />
                  <ColorField
                    label="Close Button Color"
                    value={settings.closeButtonColor}
                    onChange={(v) => setSettings({ ...settings, closeButtonColor: v })}
                  />
                </div>
              )}

              {/* ===== Enable / Save ===== */}
              <div className="field" style={{ marginTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={e => setSettings({ ...settings, isEnabled: e.target.checked })}
                    style={{ accentColor: '#0ea5e9', width: 18, height: 18 }}
                  />
                  Enable Chatbot on website
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>
                {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Settings'}
              </button>
            </form>
          </div>

          {/* ============ LIVE PREVIEW ============ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="table-wrap" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 4, color: '#94a3b8' }}>👁 Live Preview — Floating Launcher</h3>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
                This is exactly how it will look on your website
              </div>

              <div style={{
                background: '#0b1220',
                borderRadius: 12,
                padding: 24,
                minHeight: 320,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, rgba(125,211,252,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(167,139,250,0.06) 0%, transparent 50%)',
              }}>
                {/* Preview of the bubble + pill */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: settings.bubbleSize,
                    height: settings.bubbleSize,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 24px ${settings.bubbleShadowColor}`,
                  }}>
                    <ChatBotIcon
                      bubbleBg={settings.bubbleBgColor}
                      bubbleBorder={settings.bubbleBorderColor}
                      bubbleShadow={settings.bubbleShadowColor}
                      faceStroke={settings.faceStrokeColor}
                      faceFill={settings.faceFillColor}
                      faceCheek={settings.faceCheekColor}
                      antennaColor={settings.antennaColor}
                      size={settings.bubbleSize}
                    />
                  </div>
                  <div
                    style={{
                      background: settings.pillBgColor,
                      color: settings.pillTextColor,
                      border: isTransparent(settings.pillBorderColor)
                        ? '1.5px solid transparent'
                        : `1.5px solid ${settings.pillBorderColor}`,
                      borderRadius: 999,
                      padding: `${settings.pillPaddingY}px ${settings.pillPaddingX}px`,
                      fontSize: settings.pillFontSize,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow: `0 6px 18px ${settings.pillShadowColor}`,
                    }}
                  >
                    {settings.pillLabel || 'Talk to us'}
                  </div>
                </div>

                {!settings.isEnabled && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(11,18,32,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    fontSize: 15,
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}>
                    🚫 Chatbot is currently disabled
                  </div>
                )}
              </div>
            </div>

            <div className="table-wrap" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 16, color: '#94a3b8' }}>💡 Open Chat Window Preview</h3>
              <div style={{
                background: '#0b1220',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: 380,
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: 320,
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ background: settings.primaryColor, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{settings.botName}</span>
                    </div>
                    <span style={{ color: settings.closeButtonColor, fontSize: 18, cursor: 'pointer' }}>✕</span>
                  </div>
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 180 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        background: '#1e293b',
                        color: '#e2e8f0',
                        padding: '8px 12px',
                        borderRadius: '0 12px 12px 12px',
                        fontSize: 13,
                        maxWidth: '80%',
                      }}>
                        {settings.welcomeMessage}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{
                        background: settings.primaryColor,
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '12px 0 12px 12px',
                        fontSize: 13,
                        maxWidth: '80%',
                      }}>
                        What are your business hours?
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        background: '#1e293b',
                        color: '#e2e8f0',
                        padding: '8px 12px',
                        borderRadius: '0 12px 12px 12px',
                        fontSize: 13,
                        maxWidth: '80%',
                      }}>
                        We are open Monday to Friday 9am to 6pm.
                      </div>
                    </div>
                  </div>
                  <div style={{
                    borderTop: '1px solid #1e293b',
                    padding: '8px 12px',
                    display: 'flex',
                    gap: 8,
                  }}>
                    <div style={{
                      flex: 1,
                      background: '#0b1220',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 13,
                      color: '#64748b',
                    }}>
                      Type your message…
                    </div>
                    <div style={{
                      background: settings.primaryColor,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                      Send
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
