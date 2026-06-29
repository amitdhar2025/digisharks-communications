'use client'

import { useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import toast, { Toaster } from 'react-hot-toast'

interface PreviewItem {
  question: string
  answer: string
  category: string
}

export default function UploadPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'excel' | 'manual'>('excel')

  // Excel upload
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewItem[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Manual entry
  const [manualQ, setManualQ] = useState('')
  const [manualA, setManualA] = useState('')
  const [manualC, setManualC] = useState('')
  const [manualSaving, setManualSaving] = useState(false)

  function handleFile(f: File) {
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      toast.error('Please upload an .xlsx or .xls file')
      return
    }
    setFile(f)
    setPreview(null)
    setErrors([])
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/chatbot/upload', { method: 'POST', body: formData })
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPreview(data.preview || [])
      setErrors(data.errors || [])
      if (data.validCount > 0) toast.success(`Found ${data.validCount} valid entries`)
      if (data.errors?.length) toast.error(`${data.errors.length} rows had errors`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleConfirm() {
    if (!preview || preview.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/chatbot/upload', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: preview }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      const data = await res.json()
      toast.success(`Saved ${data.count} Q&A entries!`)
      setPreview(null)
      setFile(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleManual(e: FormEvent) {
    e.preventDefault()
    if (!manualQ.trim() || !manualA.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setManualSaving(true)
    try {
      const res = await fetch('/api/chatbot/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: manualQ, answer: manualA, category: manualC }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      toast.success('Q&A saved!')
      setManualQ('')
      setManualA('')
      setManualC('')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setManualSaving(false)
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

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
            <h1>📤 Upload Q&A</h1>
            <div className="sub">Import questions and answers from Excel or add manually</div>
          </div>
        </div>

        <div className="toolbar" style={{ marginBottom: 20 }}>
          <button className={`btn ${tab === 'excel' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('excel')}>📊 Excel Upload</button>
          <button className={`btn ${tab === 'manual' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('manual')}>✏ Manual Entry</button>
        </div>

        {tab === 'excel' && (
          <>
            <div
              className="table-wrap"
              style={{
                padding: 40,
                textAlign: 'center',
                border: dragOver ? '2px dashed #0ea5e9' : '2px dashed #334155',
                background: dragOver ? 'rgba(14,165,233,0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <div style={{ color: '#94a3b8', marginBottom: 8 }}>Drag and drop your Excel file here, or click to browse</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Supports .xlsx and .xls files with Question, Answer, Category columns</div>
              {file && <div style={{ marginTop: 12, color: '#7dd3fc', fontWeight: 600 }}>Selected: {file.name}</div>}
            </div>

            <div className="cell-actions" style={{ marginTop: 12, justifyContent: 'center' }}>
              <a className="btn btn-ghost" href="/api/chatbot/download-template" style={{ textDecoration: 'none' }}>📥 Download Sample Template</a>
              {file && !preview && (
                <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? <><span className="spinner" /> Processing…</> : '🔍 Preview'}
                </button>
              )}
            </div>

            {errors.length > 0 && (
              <div className="alert alert-error" style={{ marginTop: 16 }}>
                <strong>{errors.length} row{errors.length > 1 ? 's' : ''} had errors:</strong>
                <ul style={{ margin: '6px 0 0', fontSize: 12 }}>
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {preview && preview.length > 0 && (
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <div style={{ padding: '12px 14px', fontWeight: 700, fontSize: 14, borderBottom: '1px solid #1e293b' }}>
                  Preview — {preview.length} entries ready to save
                </div>
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  <table className="queries">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th style={{ width: 100 }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((item, i) => (
                        <tr key={i}>
                          <td style={{ color: '#64748b' }}>{i + 1}</td>
                          <td>{item.question}</td>
                          <td style={{ color: '#94a3b8' }}>{item.answer}</td>
                          <td>{item.category ? <span className="badge">{item.category}</span> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pager">
                  <div>{preview.length} entries</div>
                  <div className="btns">
                    <button className="btn btn-ghost" onClick={() => { setPreview(null); setFile(null) }}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
                      {saving ? <><span className="spinner" /> Saving…</> : `✅ Confirm & Save (${preview.length})`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'manual' && (
          <div className="table-wrap" style={{ padding: 24, maxWidth: 600 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>✏ Add One Q&A</h2>
            <form onSubmit={handleManual}>
              <div className="field">
                <label>Question *</label>
                <input value={manualQ} onChange={e => setManualQ(e.target.value)} placeholder="e.g. What are your business hours?" required />
              </div>
              <div className="field">
                <label>Answer *</label>
                <textarea value={manualA} onChange={e => setManualA(e.target.value)} placeholder="e.g. We are open Monday to Friday 9am to 6pm" required style={{ minHeight: 80 }} />
              </div>
              <div className="field">
                <label>Category (optional)</label>
                <input value={manualC} onChange={e => setManualC(e.target.value)} placeholder="e.g. General" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={manualSaving}>
                {manualSaving ? <><span className="spinner" /> Saving…</> : '💾 Save'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
