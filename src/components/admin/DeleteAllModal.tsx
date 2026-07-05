'use client'

import { useEffect, useState } from 'react'

type Props = {
  count: number
  scopeLabel: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
  busy?: boolean
}

export default function DeleteAllModal({
  count,
  scopeLabel,
  onClose,
  onConfirm,
  busy,
}: Props) {
  const [confirmText, setConfirmText] = useState('')
  const requiredWord = 'DELETE'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const canConfirm = confirmText.trim().toUpperCase() === requiredWord && !busy

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <h2 style={{ color: '#fca5a5' }}>⚠ Delete {count} {count === 1 ? 'query' : 'queries'}</h2>
        <div className="modal-sub">
          You are about to move{' '}
          <strong style={{ color: '#fca5a5' }}>
            {count} {count === 1 ? 'query' : 'queries'}
          </strong>{' '}
          {scopeLabel} to the Trash. Deleted items can be restored later from the Trash section.
        </div>

        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, color: '#fecaca', lineHeight: 1.5 }}>
            <strong>What will happen:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              <li>All contact submissions matching the current filter are moved to Trash</li>
              <li>They can be restored by a Super Admin from the Trash section</li>
            </ul>
          </div>
        </div>

        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="confirm-text">
            Type <code style={{ color: '#fca5a5' }}>{requiredWord}</code> to confirm
          </label>
          <input
            id="confirm-text"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={requiredWord}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
          />
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
            disabled={!canConfirm}
            title={
              canConfirm
                ? 'Permanently delete matching queries'
                : `Type ${requiredWord} to enable`
            }
          >
            {busy ? <span className="spinner" /> : '🗑'} Delete {count} {count === 1 ? 'query' : 'queries'}
          </button>
        </div>
      </div>
    </div>
  )
}
