'use client'

import { useEffect, useState } from 'react'

interface AdminOrderLite {
  _id: string
  orderNumber: string
  customer: { name?: string; email?: string }
}

type Props = {
  /** When `count > 1` we are in "bulk delete" mode and `target` is null. */
  target?: AdminOrderLite | null
  count?: number
  scopeLabel?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
  busy?: boolean
}

/**
 * Shared delete-confirmation modal for orders — used both for single
 * and bulk delete actions. Bulk mode requires typing DELETE; single
 * mode just requires a click confirm.
 */
export default function DeleteOrderModal({
  target,
  count = 1,
  scopeLabel = '',
  onClose,
  onConfirm,
  busy,
}: Props) {
  const [confirmText, setConfirmText] = useState('')
  const requiredWord = 'DELETE'
  const isBulk = count > 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const canConfirm = isBulk
    ? confirmText.trim().toUpperCase() === requiredWord && !busy
    : !busy

  const heading = isBulk
    ? `⚠ Delete ${count} ${count === 1 ? 'order' : 'orders'}`
    : '⚠ Delete order'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <h2 style={{ color: '#fca5a5' }}>{heading}</h2>
        <div className="modal-sub">
          {isBulk ? (
            <>
              You are about to permanently delete{' '}
              <strong style={{ color: '#fca5a5' }}>{count} orders</strong>{' '}
              {scopeLabel}. This action cannot be undone.
            </>
          ) : (
            <>
              You are about to permanently delete order{' '}
              <strong style={{ color: '#fca5a5' }}>
                #{target?.orderNumber}
              </strong>{' '}
              from{' '}
              <strong style={{ color: '#fca5a5' }}>
                {target?.customer?.name || target?.customer?.email}
              </strong>
              . This action cannot be undone.
            </>
          )}
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
            <strong>What will be removed:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              <li>
                {isBulk
                  ? `All ${count} orders matching the current filter / selection`
                  : 'This order and its customer details'}
              </li>
              <li>Email-delivery status and metadata</li>
            </ul>
          </div>
        </div>

        {isBulk && (
          <div className="field" style={{ marginBottom: 8 }}>
            <label htmlFor="confirm-text">
              Type <code style={{ color: '#fca5a5' }}>{requiredWord}</code> to
              confirm
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
        )}

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
          >
            {busy ? <span className="spinner" /> : '🗑'}{' '}
            {isBulk
              ? `Delete ${count} ${count === 1 ? 'order' : 'orders'}`
              : 'Delete order'}
          </button>
        </div>
      </div>
    </div>
  )
}
