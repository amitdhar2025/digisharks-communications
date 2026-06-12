'use client'

import { useState, FormEvent } from 'react'
import { QueryItem, SERVICE_OPTIONS, STATUS_OPTIONS, Status, statusLabel } from './types'

type Props = {
  item: QueryItem
  onClose: () => void
  onSaved: (it: QueryItem) => void
}

export default function EditModal({ item, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState(item.fullName)
  const [email, setEmail] = useState(item.email)
  const [phone, setPhone] = useState(item.phone || '')
  const [service, setService] = useState(item.service)
  const [message, setMessage] = useState(item.message)
  const [status, setStatus] = useState<Status>(item.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/queries/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, service, message, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      onSaved(data.item)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <h2>✏️ Edit query</h2>
        <div className="modal-sub">
          Changes are saved directly to the database.
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="field">
              <label>Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Service</label>
              <select value={service} onChange={(e) => setService(e.target.value)}>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : '💾'} Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
