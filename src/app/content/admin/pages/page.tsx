/**
 * CMS Admin — Page Content List
 *
 * Shows all pages with their CMS content status.
 * Each page has an "Edit" button to open the content editor.
 *
 * Styled to match the card-based Tailwind layout of other CMS pages.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit, ExternalLink, CheckCircle, Clock, ArrowLeft, FileText } from 'lucide-react'
import {
  BTN_PRIMARY_XS,
  BTN_VIEW,
  PILL_SAVED_CLASS,
  PILL_DRAFT_CLASS,
  SPINNER_CLASS,
  LOADING_WRAPPER_CLASS,
  BACK_LINK_CLASS,
  TOAST_ERROR_CLASS,
  CARD_CLASS,
} from '@/app/content/admin/lib/cms-styles'

export default function CMSPagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadPages() }, [])

  async function loadPages() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/content/pages')
      if (!res.ok) throw new Error('Failed to load pages')
      const data = await res.json()
      setPages(data.pages || [])
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  function fmtDate(iso: string | null) {
    if (!iso) return 'Never'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return 'Never'
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function getPublicUrl(page: any) {
    if (page.isRegistrationForm) {
      return '/' + page.slug
    }
    if (page.slug === 'home') return '/'
    return '/' + page.slug
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-5">
        <Link
          href="/content/admin"
          className={BACK_LINK_CLASS + ' mb-1'}
        >
          <ArrowLeft size={13} />
          Dashboard
        </Link>
        <h1 className="text-xl font-bold text-slate-100">Page Content</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage text, images, and content for each page of your website
        </p>
      </div>

      {error && (
        <div className={TOAST_ERROR_CLASS}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={LOADING_WRAPPER_CLASS}>
          <div className={SPINNER_CLASS} />
          <p className="text-sm">Loading pages…</p>
        </div>
      ) : (
        <div className={CARD_CLASS + ' overflow-hidden !p-0'}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40">
                  <th className="text-left px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">Page</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">CMS Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">Last Updated</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider" style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500 text-sm">No pages found.</td>
                  </tr>
                ) : (                    pages.map((page: any) => (
                    <tr key={page.slug} className="border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/10 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{page.pageName}</span>
                          {page.isRegistrationForm && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '2px 7px', borderRadius: 20,
                              background: 'rgba(139,92,246,0.15)',
                              border: '1px solid rgba(139,92,246,0.3)',
                              color: '#c4b5fd', fontSize: 10, fontWeight: 600,
                              letterSpacing: '0.02em', whiteSpace: 'nowrap',
                            }}>
                              <FileText size={10} />
                              FORM
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">
                          /{page.isRegistrationForm ? page.slug : (page.slug === 'home' ? '' : page.slug)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {page.isRegistrationForm ? (
                          <span className={PILL_SAVED_CLASS}>
                            <FileText size={11} />
                            Form Configured
                          </span>
                        ) : page.hasContent ? (
                          <span className={PILL_SAVED_CLASS}>
                            <CheckCircle size={11} />
                            Content Saved
                          </span>
                        ) : (
                          <span className={PILL_DRAFT_CLASS}>
                            <Clock size={11} />
                            Not Edited Yet
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {fmtDate(page.updatedAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          {page.isRegistrationForm ? (
                            <Link
                              href={`/content/admin/registration-form-builder?key=${page.formKey}`}
                              className={BTN_PRIMARY_XS}
                              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                            >
                              <FileText size={12} />
                              Edit Form
                            </Link>
                          ) : (
                            <Link
                              href={`/content/admin/pages/${page.slug}/edit`}
                              className={BTN_PRIMARY_XS}
                            >
                              <Edit size={12} />
                              Edit Content
                            </Link>
                          )}
                          <a
                            href={getPublicUrl(page)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={BTN_VIEW}
                          >
                            <ExternalLink size={12} />
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
