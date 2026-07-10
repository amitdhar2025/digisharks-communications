'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PaymentSettings {
  razorpayKeyId: string
  razorpayKeySecret: string
  razorpayMode: 'sandbox' | 'live'
  upiId: string
  bankName: string
  bankAccount: string
  bankIfsc: string
  paymentMethods: string[]
}

const ALL_PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
]

export default function PaymentSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const [razorpayKeyId, setRazorpayKeyId] = useState('')
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('')
  const [razorpayMode, setRazorpayMode] = useState<'sandbox' | 'live'>('sandbox')
  const [upiId, setUpiId] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankIfsc, setBankIfsc] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['card', 'upi', 'netbanking', 'wallet'])

  // Test connection state
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/settings/payments', { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) { router.push('/admin/login'); return }
        const data = await r.json()
        const s = data.settings || {}
        setRazorpayKeyId(s.razorpayKeyId || '')
        setRazorpayKeySecret(s.razorpayKeySecret || '')
        setRazorpayMode(s.razorpayMode || 'sandbox')
        setUpiId(s.upiId || '')
        setBankName(s.bankName || '')
        setBankAccount(s.bankAccount || '')
        setBankIfsc(s.bankIfsc || '')
        setPaymentMethods(s.paymentMethods || ['card', 'upi', 'netbanking', 'wallet'])
      })
      .catch(() => setError('Failed to load payment settings'))
      .finally(() => setLoading(false))
  }, [router])

  function toggleMethod(id: string) {
    setPaymentMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          razorpayKeyId,
          razorpayKeySecret,
          razorpayMode,
          upiId,
          bankName,
          bankAccount,
          bankIfsc,
          paymentMethods,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setToast({ kind: 'success', text: 'Payment settings saved!' })
      // Mask secret after save
      if (razorpayKeySecret) setRazorpayKeySecret('••••••••')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function testConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/test/razorpay')
      const data = await res.json()
      setTestResult({
        ok: data.ok,
        message: data.razorpayMessage || (data.ok ? 'Connected!' : 'Connection failed'),
      })
    } catch {
      setTestResult({ ok: false, message: 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="empty"><span className="spinner" /> Loading payment settings…</div>
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>💳 Payment Settings</h1>
          <div className="sub">Configure Razorpay and other payment methods for the checkout page</div>
        </div>
        <div className="cell-actions">
          <Link href="/admin/dashboard" className="btn btn-ghost">← Dashboard</Link>
        </div>
      </div>

      {toast && <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">{toast.text}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSave} autoComplete="off">
        {/* ── Razorpay Section ── */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 18 }}>🔑 Razorpay Configuration</h2>
          <p className="text-xs text-slate-500 mb-4">
            Get your API keys from{' '}
            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#7dd3fc' }}>
              Razorpay Dashboard
            </a>
            . Test keys start with <code>rzp_test_</code>, live keys start with <code>rzp_live_</code>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label>Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_test_xxxxxxxxxxxx or rzp_live_xxxxxxxxxxxx"
              />
            </div>
            <div className="field">
              <label>Key Secret</label>
              <input
                type="password"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder={razorpayKeySecret === '••••••••' ? '••••••••' : 'Enter key secret'}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 8 }}>
            <label>Mode</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#cbd5e1', fontSize: 14 }}>
                <input
                  type="radio"
                  name="razorpayMode"
                  value="sandbox"
                  checked={razorpayMode === 'sandbox'}
                  onChange={() => setRazorpayMode('sandbox')}
                  style={{ accentColor: '#f59e0b' }}
                />
                ⚙ Sandbox (Test)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#cbd5e1', fontSize: 14 }}>
                <input
                  type="radio"
                  name="razorpayMode"
                  value="live"
                  checked={razorpayMode === 'live'}
                  onChange={() => setRazorpayMode('live')}
                  style={{ accentColor: '#22c55e' }}
                />
                ✅ Live (Real payments)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={testConnection} disabled={testing || !razorpayKeyId}>
              {testing ? <span className="spinner" /> : '🔌'} Test Connection
            </button>
            {testResult && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 8, fontSize: 12,
                background: testResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: testResult.ok ? '#86efac' : '#fca5a5',
                border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                {testResult.ok ? '✅' : '❌'} {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* ── Payment Methods ── */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>💳 Accepted Payment Methods</h2>
          <p className="text-xs text-slate-500 mb-4">Choose which payment methods to show on the checkout page.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {ALL_PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                  background: paymentMethods.includes(m.id) ? 'rgba(14,165,233,0.1)' : '#0b1220',
                  border: `1px solid ${paymentMethods.includes(m.id) ? 'rgba(14,165,233,0.3)' : '#1e293b'}`,
                  color: paymentMethods.includes(m.id) ? '#7dd3fc' : '#94a3b8',
                  fontWeight: paymentMethods.includes(m.id) ? 600 : 400,
                  transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={paymentMethods.includes(m.id)}
                  onChange={() => toggleMethod(m.id)}
                  style={{ display: 'none' }}
                />
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Bank Transfer ── */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>🏦 Bank Transfer Details</h2>
          <p className="text-xs text-slate-500 mb-4">Displayed to customers who choose direct bank transfer.</p>
          <div className="field">
            <label>UPI ID</label>
            <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@upi" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
            <div className="field">
              <label>Bank Name</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
            </div>
            <div className="field">
              <label>Account Number</label>
              <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Enter account number" />
            </div>
            <div className="field">
              <label>IFSC Code</label>
              <input type="text" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} placeholder="e.g. HDFC0001234" />
            </div>
          </div>
        </div>

        {/* ── How to Setup Guide ── */}
        <div style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.12)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>📖 Setup Guide</h3>
          <ol style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
            <li>Go to <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#7dd3fc' }}>Razorpay Dashboard → API Keys</a></li>
            <li>Copy your <strong>Key ID</strong> and <strong>Key Secret</strong> into the fields above</li>
            <li>Set mode to <strong>Sandbox</strong> for testing or <strong>Live</strong> for real payments</li>
            <li>Click <strong>Test Connection</strong> to verify your keys work</li>
            <li>If using <strong>Live mode</strong>, make sure your Razorpay account is KYC-verified</li>
            <li>Click <strong>Save Settings</strong> to apply changes</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Link href="/admin/dashboard" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
