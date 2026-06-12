'use client'

import { useState, FormEvent } from 'react'
import {
  Comment,
  QueryItem,
  STATUS_OPTIONS,
  Status,
  fmtDate,
  statusClass,
  statusLabel,
} from './types'

type Props = {
  item: QueryItem
  onClose: () => void
  onChangeStatus: (s: Status) => void
  onUpdate: (it: QueryItem) => void
}

export default function ViewModal({ item, onClose, onChangeStatus, onUpdate }: Props) {
  const [comments, setComments] = useState<Comment[]>(item.comments || [])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function addComment(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/queries/${item.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add comment')
      setComments(data.item.comments)
      onUpdate(data.item)
      setText('')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSending(false)
    }
  }

  async function deleteComment(cid: string) {
    if (!confirm('Delete this comment?')) return
    setDeletingId(cid)
    try {
      const res = await fetch(`/api/admin/queries/${item.id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: cid }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete comment')
      setComments(data.item.comments)
      onUpdate(data.item)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <h2>📩 Query details</h2>
        <div className="modal-sub">
          Created {fmtDate(item.createdAt)} · Updated {fmtDate(item.updatedAt)}
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Full Name</label>
            <input value={item.fullName} readOnly />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={item.email} readOnly />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={item.phone || ''} readOnly />
          </div>
          <div className="field">
            <label>Service</label>
            <input value={item.service} readOnly />
          </div>
        </div>

        <div className="field">
          <label>Message</label>
          <textarea readOnly value={item.message} />
        </div>

        <div className="field">
          <label>Status</label>
          <div className="cell-actions">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`status-pill ${statusClass(s)}`}
                style={{
                  opacity: item.status === s ? 1 : 0.55,
                  borderStyle: item.status === s ? 'solid' : 'dashed',
                }}
                onClick={() => onChangeStatus(s)}
                type="button"
              >
                <span className="dot" /> {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>💬 Comments / Activity ({comments.length})</label>
          <div className="comment-list">
            {comments.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>
                No comments yet — add the first update below.
              </div>
            ) : (
              comments.map((c) => (
                <div className="comment-item" key={c._id || `${c.author}-${c.createdAt}`}>
                  <div className="head">
                    <div>
                      <span className="author">{c.author}</span>
                      <span style={{ marginLeft: 8 }}>{fmtDate(c.createdAt)}</span>
                    </div>
                    {c._id && (
                      <button
                        className="del"
                        onClick={() => deleteComment(c._id!)}
                        disabled={deletingId === c._id}
                      >
                        {deletingId === c._id ? '…' : '✕ Delete'}
                      </button>
                    )}
                  </div>
                  <div className="body">{c.text}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={addComment}>
            <textarea
              placeholder="Add a comment — what's happening with this query?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: 70 }}
            />
            <div className="row" style={{ marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || !text.trim()}
              >
                {sending ? <span className="spinner" /> : '＋'} Add comment
              </button>
            </div>
          </form>
        </div>

        <div className="row">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
