'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Optional fallback override */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AdminErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0b1220',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2
              style={{
                color: '#f8fafc',
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 8px',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: '#94a3b8',
                fontSize: 14,
                margin: '0 0 20px',
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred in the admin panel. This might be a
              temporary issue.
            </p>

            {this.state.error && (
              <details
                style={{
                  background: '#0b1220',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  textAlign: 'left',
                }}
              >
                <summary
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    cursor: 'pointer',
                    marginBottom: 8,
                  }}
                >
                  Error details
                </summary>
                <code
                  style={{
                    color: '#fca5a5',
                    fontSize: 12,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {this.state.error.message}
                </code>
              </details>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#0ea5e9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
