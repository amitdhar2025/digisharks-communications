'use client'

import { QueryItem } from './types'

type Props = {
  target: QueryItem
  onClose: () => void
  onConfirm: () => Promise<void> | void
  busy?: boolean
}

export default function DeleteModal({ target, onClose, onConfirm, busy }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460 }}
      >
        <h2>🗑 Delete query</h2>
        <div className="modal-sub">
          This action permanently removes the record from the database.
        </div>

        <div
          style={{
            background: '#0b1220',
            border: '1px solid #1e293b',
            borderRadius: 10,
            padding: 14,
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 600 }}>{target.fullName}</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>{target.email}</div>
          <div
            style={{
              color: '#94a3b8',
              fontSize: 12,
              marginTop: 6,
              maxHeight: 80,
              overflow: 'auto',
            }}
          >
            {target.message}
          </div>
        </div>

        <div className="row">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="spinner" /> : '🗑'} Delete permanently
          </button>
        </div>
      </div>
    </div>
  )
}
