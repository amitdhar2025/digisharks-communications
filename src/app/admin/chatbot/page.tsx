'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatbotDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<{
    total: number
    active: number
    inactive: number
    topQuestions: { question: string; hitCount: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/chatbot/stats')
      .then(async (res) => {
        if (res.status === 401) { router.push('/admin/login'); return }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        setStats(data.stats)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand"><span className="dot" /> Digisharks</div>
        <a className="nav-item" href="/admin/dashboard">📋 Queries</a>
        <a className="nav-item" href="/admin/store">🛒 Products</a>
        <a className="nav-item" href="/admin/blog">📝 Blog</a>
        <a className="nav-item" href="/admin/rss">📡 RSS</a>
        <div className="nav-section">🤖 Chatbot</div>
        <a className="nav-item active" href="/admin/chatbot">📊 Dashboard</a>
        <a className="nav-item" href="/admin/chatbot/qna">💬 Q&A Manager</a>
        <a className="nav-item" href="/admin/chatbot/upload">📤 Upload</a>
        <a className="nav-item" href="/admin/chatbot/settings">⚙ Settings</a>
        <div className="spacer" />
        <a className="nav-item" href="/" target="_blank">🌐 View Site</a>
        <div className="nav-section">Account</div>
        <button className="nav-item" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin/login'); router.refresh() }} style={{ color: '#fca5a5' }}>🚪 Sign out</button>
        <div style={{ padding: '10px 12px', fontSize: 11, color: '#64748b', borderTop: '1px solid #1e293b' }}>v1.0 · Chatbot</div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar" style={{ marginTop: 0 }}>
          <div>
            <h1>🤖 Chatbot Dashboard</h1>
            <div className="sub">Overview of your chatbot Q&A system</div>
          </div>
          <div className="cell-actions">
            <a className="btn btn-primary" href="/admin/chatbot/qna" style={{ textDecoration: 'none' }}>Manage Q&A →</a>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="empty"><span className="spinner" /> Loading dashboard…</div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card total">
                <div className="label">Total Q&A</div>
                <div className="value">{stats?.total ?? 0}</div>
              </div>
              <div className="stat-card completed">
                <div className="label">Active</div>
                <div className="value">{stats?.active ?? 0}</div>
              </div>
              <div className="stat-card pending">
                <div className="label">Inactive</div>
                <div className="value">{stats?.inactive ?? 0}</div>
              </div>
              <div className="stat-card followup">
                <div className="label">Total Hits</div>
                <div className="value">{stats?.topQuestions?.reduce((s, q) => s + q.hitCount, 0) ?? 0}</div>
              </div>
            </div>

            <div className="table-wrap" style={{ marginTop: 24 }}>
              <div style={{ padding: '14px 14px 0', fontWeight: 700, fontSize: 15 }}>🔥 Most Asked Questions</div>
              <table className="queries" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Question</th>
                    <th style={{ width: 100 }}>Hits</th>
                  </tr>
                </thead>
                <tbody>
                  {(!stats?.topQuestions || stats.topQuestions.length === 0) ? (
                    <tr><td colSpan={3} className="empty"><div className="icon">📭</div><div>No questions have been asked yet</div></td></tr>
                  ) : (
                    stats.topQuestions.map((q, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: '#7dd3fc' }}>#{i + 1}</td>
                        <td>{q.question}</td>
                        <td><span className="badge">👁 {q.hitCount}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
