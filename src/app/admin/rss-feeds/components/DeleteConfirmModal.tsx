'use client'

interface DeleteConfirmModalProps {
  feedName: string
  onClose: () => void
  onConfirm: () => void
  busy: boolean
}

export default function DeleteConfirmModal({ feedName, onClose, onConfirm, busy }: DeleteConfirmModalProps) {
  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h2>Delete Feed</h2>
        <p className="modal-sub" style={{ marginTop: 8 }}>
          Are you sure you want to move <strong>"{feedName}"</strong> to the Trash? It can be restored later from the Trash section.
        </p>
        <div className="row">
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? <span className="spinner" /> : '🗑'} Delete Feed
          </button>
        </div>
      </div>
    </div>
  )
}
