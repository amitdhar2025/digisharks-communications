'use client'

import { useState, useCallback } from 'react'
import { GitBranch, RefreshCw, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react'

/**
 * SyncToGitHubBox — A card with a "Sync to GitHub" button.
 *
 * Dispatches a repository_dispatch event to trigger the GitHub Actions
 * workflow "Sync CMS Data to GitHub", which exports CMS data from MongoDB
 * and commits it to the repository.
 *
 * Can optionally show a "Last synced" timestamp (pass via lastSynced prop).
 */

interface SyncToGitHubBoxProps {
  /** Optional "last synced" ISO date string */
  lastSynced?: string | null
  /** Optional callback after successful sync */
  onSyncComplete?: () => void
  /** Optional variant — 'main' (default) or 'cms' for CMS dashboard */
  variant?: 'main' | 'cms'
}

export default function SyncToGitHubBox({
  lastSynced,
  onSyncComplete,
  variant = 'main',
}: SyncToGitHubBoxProps) {
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle'
    message: string
  }>({ type: 'idle', message: '' })

  const triggerSync = useCallback(async () => {
    setSyncing(true)
    setStatus({ type: 'idle', message: '' })

    try {
      const res = await fetch('/api/admin/trigger-github-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Sync dispatched successfully!',
        })
        onSyncComplete?.()
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to trigger sync.',
        })
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Could not reach the server.',
      })
    } finally {
      setSyncing(false)
    }
  }, [onSyncComplete])

  function fmtDate(iso: string | null) {
    if (!iso) return null
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isMain = variant === 'main'

  // ── Shared styles ──────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    marginTop: 24,
    padding: '20px 24px',
    borderRadius: 14,
    border: `1px solid ${
      status.type === 'success'
        ? 'rgba(34,197,94,0.25)'
        : status.type === 'error'
        ? 'rgba(239,68,68,0.25)'
        : isMain
        ? 'rgba(99,102,241,0.2)'
        : 'rgba(99,102,241,0.2)'
    }`,
    background:
      status.type === 'success'
        ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(16,185,129,0.04))'
        : status.type === 'error'
        ? 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(220,38,38,0.04))'
        : 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
  }

  const iconColor = '#818cf8'
  const iconBg = 'rgba(99,102,241,0.12)'

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CloudUpload size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Sync CMS Data to GitHub
            {status.type === 'success' && (
              <CheckCircle size={13} style={{ color: '#22c55e' }} />
            )}
            {status.type === 'error' && (
              <AlertCircle size={13} style={{ color: '#ef4444' }} />
            )}
            {syncing && (
              <RefreshCw size={13} className="animate-spin" style={{ color: '#818cf8' }} />
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#94a3b8',
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            Export all CMS content (pages, settings, menus, blog posts, etc.) from MongoDB
            and commit them as JSON files to GitHub. This keeps your repository in sync with
            live site content changes.
          </div>

          {status.message && (
            <div
              style={{
                fontSize: 12,
                padding: '8px 12px',
                borderRadius: 8,
                marginBottom: 12,
                background:
                  status.type === 'success'
                    ? 'rgba(34,197,94,0.1)'
                    : status.type === 'error'
                    ? 'rgba(239,68,68,0.1)'
                    : 'transparent',
                color:
                  status.type === 'success'
                    ? '#4ade80'
                    : status.type === 'error'
                    ? '#f87171'
                    : '#94a3b8',
                lineHeight: 1.4,
              }}
            >
              {status.message}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={triggerSync}
              disabled={syncing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 600,
                cursor: syncing ? 'not-allowed' : 'pointer',
                border: '1px solid rgba(99,102,241,0.3)',
                background: syncing
                  ? 'rgba(99,102,241,0.15)'
                  : 'rgba(99,102,241,0.12)',
                color: syncing ? '#818cf8' : '#a5b4fc',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!syncing) {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                }
              }}
              onMouseLeave={(e) => {
                if (!syncing) {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                }
              }}
            >
              {syncing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <GitBranch size={13} />
                  Sync to GitHub
                </>
              )}
            </button>

            {lastSynced && (
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Last synced: {fmtDate(lastSynced)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
