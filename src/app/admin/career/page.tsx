'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface CareerJob {
  _id: string
  title: string
  slug: string
  category: string
  department: string
  numberOfPositions: number
  salaryPackage: string
  experienceRequired: string
  workProfile: string
  jobDescription: string
  location: string
  status: 'active' | 'inactive' | 'filled'
  isActive: boolean
  applicationCount: number
  createdAt: string
  updatedAt: string
}

interface ApplicationItem {
  _id: string
  jobId: { _id: string; title: string; slug: string; category: string; location: string } | null
  applicantName: string
  email: string
  phone: string
  coverLetter: string
  resumeUrl: string
  status: 'under-review' | 'shortlisted' | 'under-process' | 'selected' | 'not-selected'
  adminNotes: string
  createdAt: string
  statusUpdatedAt: string | null
}

const CATEGORY_OPTIONS = ['full-time', 'part-time', 'internship', 'contract', 'remote']
const CATEGORY_LABELS: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'internship': 'Internship',
  'contract': 'Contract',
  'remote': 'Remote',
}
const STATUS_OPTIONS = ['active', 'inactive', 'filled']
const APP_STATUS_OPTIONS = ['under-review', 'shortlisted', 'under-process', 'selected', 'not-selected']
const APP_STATUS_LABELS: Record<string, string> = {
  'under-review': 'Under Review',
  'shortlisted': 'Shortlisted',
  'under-process': 'Under Process',
  'selected': 'Selected',
  'not-selected': 'Not Selected',
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminCareerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs')

  // Jobs state
  const [jobs, setJobs] = useState<CareerJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)

  // Applications state
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appsError, setAppsError] = useState<string | null>(null)
  const [appStats, setAppStats] = useState<Record<string, number>>({})
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all')
  const [appJobFilter, setAppJobFilter] = useState<string>('all')
  const [availableJobs, setAvailableJobs] = useState<{ _id: string; title: string }[]>([])

  // Modal states
  const [showJobModal, setShowJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState<CareerJob | null>(null)
  const [jobForm, setJobForm] = useState({
    title: '', category: 'full-time', department: '', numberOfPositions: 1,
    salaryPackage: 'Negotiable', experienceRequired: 'Fresher',
    workProfile: '', jobDescription: '', location: '', status: 'active' as string,
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  // Application modal
  const [viewApp, setViewApp] = useState<ApplicationItem | null>(null)
  const [appStatusUpdating, setAppStatusUpdating] = useState(false)

  // Delete confirm
  const [deleteJob, setDeleteJob] = useState<CareerJob | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Application delete confirm
  const [deleteApp, setDeleteApp] = useState<ApplicationItem | null>(null)
  const [deletingApp, setDeletingApp] = useState(false)

  // Bulk delete all confirm
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('')
  const [deletingAll, setDeletingAll] = useState(false)

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)

  const allSelected = applications.length > 0 && selectedIds.size === applications.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < applications.length


  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Load jobs
  const loadJobs = useCallback(async () => {
    setJobsLoading(true)
    setJobsError(null)
    try {
      const res = await fetch('/api/admin/career/jobs', { credentials: 'include' })
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setJobs(data.jobs || [])
    } catch (e: any) {
      setJobsError(e.message)
    } finally {
      setJobsLoading(false)
    }
  }, [router])

  // Load applications
  const loadApplications = useCallback(async () => {
    setAppsLoading(true)
    setAppsError(null)
    try {
      const params = new URLSearchParams()
      if (appStatusFilter !== 'all') params.set('status', appStatusFilter)
      if (appJobFilter !== 'all') params.set('jobId', appJobFilter)
      const res = await fetch(`/api/admin/career/applications?${params}`, { credentials: 'include' })
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setApplications(data.applications || [])
      setAppStats(data.stats || {})
      setAvailableJobs(data.jobs || [])
    } catch (e: any) {
      setAppsError(e.message)
    } finally {
      setAppsLoading(false)
    }
  }, [router, appStatusFilter, appJobFilter])

  useEffect(() => { loadJobs() }, [loadJobs])

  // Clear selection when filters change
  useEffect(() => { setSelectedIds(new Set()) }, [appStatusFilter, appJobFilter])

  // Open create modal
  function openCreateJob() {
    setEditingJob(null)
    setJobForm({
      title: '', category: 'full-time', department: '', numberOfPositions: 1,
      salaryPackage: 'Negotiable', experienceRequired: 'Fresher',
      workProfile: '', jobDescription: '', location: '', status: 'active',
    })
    setShowJobModal(true)
  }

  // Open edit modal
  function openEditJob(job: CareerJob) {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      category: job.category,
      department: job.department,
      numberOfPositions: job.numberOfPositions,
      salaryPackage: job.salaryPackage,
      experienceRequired: job.experienceRequired,
      workProfile: job.workProfile,
      jobDescription: job.jobDescription,
      location: job.location,
      status: job.status,
    })
    setShowJobModal(true)
  }

  // Save job (create or update)
  async function handleSaveJob(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingJob
        ? `/api/admin/career/jobs/${editingJob._id}`
        : '/api/admin/career/jobs'
      const method = editingJob ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(jobForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setToast({ kind: 'success', text: editingJob ? 'Job updated!' : 'Job created!' })
      setShowJobModal(false)
      loadJobs()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  // Delete job
  async function handleDeleteJob() {
    if (!deleteJob) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/career/jobs/${deleteJob._id}`, {
        method: 'DELETE', credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed')
      setToast({ kind: 'success', text: `"${deleteJob.title}" deleted.` })
      setDeleteJob(null)
      loadJobs()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeleting(false)
    }
  }

  // Delete application
  async function handleDeleteApp() {
    if (!deleteApp) return
    setDeletingApp(true)
    try {
      const res = await fetch(`/api/admin/career/applications/${deleteApp._id}`, {
        method: 'DELETE', credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setToast({ kind: 'success', text: `Application of "${deleteApp.applicantName}" deleted.` })
      setDeleteApp(null)
      loadApplications()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeletingApp(false)
    }
  }

  // Delete ALL applications (current filter)
  async function handleDeleteAll() {
    setDeletingAll(true)
    try {
      const params = new URLSearchParams()
      if (appStatusFilter !== 'all') params.set('status', appStatusFilter)
      if (appJobFilter !== 'all') params.set('jobId', appJobFilter)
      const url = `/api/admin/career/applications/delete-all${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setToast({ kind: 'success', text: data.message || `Deleted ${data.deletedCount} application(s).` })
      setShowDeleteAll(false)
      setDeleteAllConfirmText('')
      setSelectedIds(new Set())
      loadApplications()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setDeletingAll(false)
    }
  }

  // Delete selected (bulk)
  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} selected application(s)? This cannot be undone.`)) return
    setDeletingBulk(true)
    try {
      let okCount = 0
      let failCount = 0
      for (const id of selectedIds) {
        try {
          const res = await fetch(`/api/admin/career/applications/${id}`, {
            method: 'DELETE', credentials: 'include',
          })
          if (res.ok) okCount++
          else failCount++
        } catch { failCount++ }
      }
      setToast({
        kind: failCount === 0 ? 'success' : 'error',
        text: `Deleted ${okCount} application(s)${failCount ? `, ${failCount} failed.` : '.'}`,
      })
      setSelectedIds(new Set())
      loadApplications()
    } finally {
      setDeletingBulk(false)
    }
  }

  // Excel / CSV export of current filtered applications
  async function handleExportExcel() {
    try {
      const params = new URLSearchParams()
      if (appStatusFilter !== 'all') params.set('status', appStatusFilter)
      if (appJobFilter !== 'all') params.set('jobId', appJobFilter)
      const url = `/api/admin/career/applications/export${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Export failed')
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const m = disposition.match(/filename="([^"]+)"/)
      const filename = m?.[1] || `career-applicants-${Date.now()}.csv`
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
      setToast({ kind: 'success', text: `Excel/CSV exported (${filename}).` })
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    }
  }

  // Selection helpers
  function toggleSelectAll() {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(applications.map((a) => a._id)))
  }
  function toggleSelectOne(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  // Update application status
  async function updateAppStatus(appId: string, newStatus: string, notes: string) {
    setAppStatusUpdating(true)
    try {
      const res = await fetch(`/api/admin/career/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, adminNotes: notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setToast({
        kind: 'success',
        text: `Status updated to "${APP_STATUS_LABELS[newStatus] || newStatus}" & email sent to applicant!`,
      })
      setViewApp(null)
      loadApplications()
    } catch (e: any) {
      setToast({ kind: 'error', text: e.message })
    } finally {
      setAppStatusUpdating(false)
    }
  }

  const jobsStats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    filled: jobs.filter((j) => j.status === 'filled').length,
    totalApplications: jobs.reduce((s, j) => s + j.applicationCount, 0),
  }), [jobs])

  return (
    <div>
      {toast && (
        <div className={'alert ' + (toast.kind === 'success' ? 'alert-success' : 'alert-error')} role="status">
          {toast.text}
        </div>
      )}

      {/* Tab Navigation */}<div className="admin-topbar">
          <div>
            <h1>💼 Career Management</h1>
          <div className="sub">Manage job openings and applications</div>
        </div>
        <div className="cell-actions">
          <button
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('jobs')}
          >
            📋 Jobs ({jobsStats.total})
          </button>
          <button
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('applications'); loadApplications() }}
          >
            📩 Applications ({appStats.total || applications.length})
          </button>
        </div>
      </div>

      {/* ─────── JOBS TAB ─────── */}
      {activeTab === 'jobs' && (
        <div>
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card total">
              <div className="label">Total Jobs</div>
              <div className="value">{jobsStats.total}</div>
            </div>
            <div className="stat-card pending">
              <div className="label">Active</div>
              <div className="value">{jobsStats.active}</div>
            </div>
            <div className="stat-card completed">
              <div className="label">Filled</div>
              <div className="value">{jobsStats.filled}</div>
            </div>
            <div className="stat-card followup">
              <div className="label">Total Applications</div>
              <div className="value">{jobsStats.totalApplications}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="toolbar" style={{ justifyContent: 'space-between' }}>
            <div></div>
            <button className="btn btn-primary" onClick={openCreateJob}>
              ＋ Create Job
            </button>
          </div>

          {/* Jobs table */}
          {jobsError && <div className="alert alert-error">{jobsError}</div>}

          <div className="table-wrap">
            {jobsLoading ? (
              <div className="empty"><span className="spinner" /> Loading jobs…</div>
            ) : jobs.length === 0 ? (
              <div className="empty">
                <div className="icon">💼</div>
                <p>No jobs yet. Create your first job posting!</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openCreateJob}>
                  ＋ Create Job
                </button>
              </div>
            ) : (
              <table className="queries">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Experience</th>
                    <th>Salary</th>
                    <th>Positions</th>
                    <th>Status</th>
                    <th>Applications</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{job.title}</div>
                        {job.department && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{job.department}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge">{CATEGORY_LABELS[job.category] || job.category}</span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>{job.location || '—'}</td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>{job.experienceRequired}</td>
                      <td style={{ color: '#4ade80', fontWeight: 600, fontSize: 13 }}>{job.salaryPackage}</td>
                      <td style={{ textAlign: 'center' }}>{job.numberOfPositions}</td>
                      <td>
                        <span className={`status-pill ${job.status === 'active' ? 'status-completed' : job.status === 'filled' ? 'status-featured' : 'status-pending'}`}>
                          <span className="dot" /> {job.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 13, color: '#7dd3fc', fontWeight: 600 }}>
                        {job.applicationCount}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                        {fmtDate(job.createdAt)}
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button className="icon-btn" onClick={() => openEditJob(job)} title="Edit">
                            ✏ Edit
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => { setActiveTab('applications'); setAppJobFilter(job._id); loadApplications() }}
                            title="View applications"
                          >
                            📩 Apps
                          </button>
                          <button className="icon-btn danger" onClick={() => setDeleteJob(job)} title="Delete">
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─────── APPLICATIONS TAB ─────── */}
      {activeTab === 'applications' && (
        <div>
          {/* Filter toolbar */}
          <div className="toolbar">
            <select
              value={appStatusFilter}
              onChange={(e) => { setAppStatusFilter(e.target.value); setAppJobFilter('all') }}
              style={{ background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0', padding: '8px 10px', borderRadius: 8, fontSize: 13 }}
            >
              <option value="all">All statuses</option>
              {APP_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{APP_STATUS_LABELS[s]} ({appStats[s] || 0})</option>
              ))}
            </select>
            <select
              value={appJobFilter}
              onChange={(e) => { setAppJobFilter(e.target.value); setAppStatusFilter('all') }}
              style={{ background: '#0b1220', border: '1px solid #1e293b', color: '#e2e8f0', padding: '8px 10px', borderRadius: 8, fontSize: 13, minWidth: 200 }}
            >
              <option value="all">All jobs</option>
              {availableJobs.map((j) => (
                <option key={j._id} value={j._id}>{j.title}</option>
              ))}
            </select>
            <button className="btn btn-ghost" onClick={loadApplications}>↻ Refresh</button>
            <div style={{ flex: 1 }} />
            <button
              className="btn btn-ghost"
              onClick={handleExportExcel}
              title="Download all filtered applicants as Excel/CSV"
              disabled={appsLoading}
            >
              📊 Export Excel
            </button>
            {selectedIds.size > 0 && (
              <button
                className="btn btn-danger"
                onClick={handleDeleteSelected}
                disabled={deletingBulk}
                title="Delete selected applicants"
              >
                {deletingBulk ? <span className="spinner" /> : null} 🗑 Delete Selected ({selectedIds.size})
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteAll(true)}
              disabled={appsLoading || applications.length === 0}
              title="Delete ALL applicants matching current filter"
            >
              🗑 Delete All
            </button>
          </div>

          {appsError && <div className="alert alert-error">{appsError}</div>}

          {/* Applications table */}
          <div className="table-wrap">
            {appsLoading ? (
              <div className="empty"><span className="spinner" /> Loading applications…</div>
            ) : applications.length === 0 ? (
              <div className="empty">
                <div className="icon">📭</div>
                <p>No applications found matching your filters.</p>
              </div>
            ) : (
              <table className="queries">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected }}
                        onChange={toggleSelectAll}
                        title="Select all"
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Applicant</th>
                    <th>Applied For</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Resume</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} style={selectedIds.has(app._id) ? { background: 'rgba(125,211,252,0.06)' } : undefined}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app._id)}
                          onChange={() => toggleSelectOne(app._id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{app.applicantName}</td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>
                        {app.jobId?.title || '—'}
                      </td>
                      <td>
                        <a href={`mailto:${app.email}`} style={{ color: '#7dd3fc', textDecoration: 'none' }}>
                          {app.email}
                        </a>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{app.phone || '—'}</td>
                      <td>
                        <span className={`status-pill ${
                          app.status === 'selected' ? 'status-completed' :
                          app.status === 'shortlisted' ? 'status-featured' :
                          app.status === 'not-selected' ? 'status-pending' :
                          app.status === 'under-process' ? 'status-follow-up' :
                          'status-follow-up'
                        }`}>
                          <span className="dot" /> {APP_STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td>
                        {app.resumeUrl ? (
                          <a href={app.resumeUrl} target="_blank" rel="noopener" className="icon-btn" title="View Resume">
                            📄 CV
                          </a>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                        {fmtDate(app.createdAt)}
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button className="icon-btn" onClick={() => setViewApp(app)} title="Review / Update Status">
                            👁 Review
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => setDeleteApp(app)}
                            title="Delete Applicant"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─────── CREATE / EDIT JOB MODAL ─────── */}
      {showJobModal && (
        <div className="modal-backdrop" onClick={() => !saving && setShowJobModal(false)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editingJob ? 'Edit Job' : 'Create Job'}</h2>
            <p className="modal-sub">
              {editingJob ? `Update details for "${editingJob.title}"` : 'Fill in the details for the new job posting'}
            </p>

            <form onSubmit={handleSaveJob}>
              <div className="grid-2">
                <div className="field">
                  <label>Job Title *</label>
                  <input type="text" required value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
                </div>
                <div className="field">
                  <label>Category *</label>
                  <select value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Department</label>
                  <input type="text" value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    placeholder="e.g. Digital PR, Marketing" />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input type="text" value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Noida, Remote" />
                </div>
                <div className="field">
                  <label>Number of Positions</label>
                  <input type="number" min="1" value={jobForm.numberOfPositions}
                    onChange={(e) => setJobForm({ ...jobForm, numberOfPositions: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="field">
                  <label>Experience Required</label>
                  <input type="text" value={jobForm.experienceRequired}
                    onChange={(e) => setJobForm({ ...jobForm, experienceRequired: e.target.value })}
                    placeholder="e.g. 0-2 years, Fresher" />
                </div>
                <div className="field">
                  <label>Salary Package</label>
                  <input type="text" value={jobForm.salaryPackage}
                    onChange={(e) => setJobForm({ ...jobForm, salaryPackage: e.target.value })}
                    placeholder="e.g. ₹3L - ₹6L PA" />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={jobForm.status}
                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Work Profile</label>
                <textarea value={jobForm.workProfile}
                  onChange={(e) => setJobForm({ ...jobForm, workProfile: e.target.value })}
                  placeholder="Brief overview of the role..." />
              </div>

              <div className="field">
                <label>Job Description</label>
                <textarea value={jobForm.jobDescription}
                  onChange={(e) => setJobForm({ ...jobForm, jobDescription: e.target.value })}
                  placeholder="Detailed job description, requirements, and responsibilities..."
                  style={{ minHeight: 120 }} />
              </div>

              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => setShowJobModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : null} {editingJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────── VIEW / REVIEW APPLICATION MODAL ─────── */}
      {viewApp && (
        <div className="modal-backdrop" onClick={() => !appStatusUpdating && setViewApp(null)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <h2 style={{ margin: 0 }}>{viewApp.applicantName}</h2>
              <span className={`status-pill ${
                viewApp.status === 'selected' ? 'status-completed' :
                viewApp.status === 'shortlisted' ? 'status-featured' :
                viewApp.status === 'not-selected' ? 'status-pending' :
                viewApp.status === 'under-process' ? 'status-follow-up' :
                'status-follow-up'
              }`}>
                <span className="dot" /> {APP_STATUS_LABELS[viewApp.status]}
              </span>
            </div>
            <p className="modal-sub">
              Applied for: <strong>{viewApp.jobId?.title || 'Unknown Position'}</strong>
              {viewApp.jobId?.location ? ` · ${viewApp.jobId.location}` : ''}
            </p>

            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Email</label>
                  <div style={{ color: '#7dd3fc', padding: '8px 0', fontSize: 14 }}>
                    <a href={`mailto:${viewApp.email}`} style={{ color: '#7dd3fc', textDecoration: 'none' }}>{viewApp.email}</a>
                  </div>
                </div>
              </div>
              <div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Phone</label>
                  <div style={{ color: '#e2e8f0', padding: '8px 0', fontSize: 14 }}>{viewApp.phone || '—'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {viewApp.resumeUrl && (
                <a href={viewApp.resumeUrl} target="_blank" rel="noopener" className="btn btn-primary">
                  📄 View Resume / CV
                </a>
              )}
              <div style={{ color: '#94a3b8', fontSize: 12, alignSelf: 'center' }}>
                Applied: {fmtDate(viewApp.createdAt)}
              </div>
            </div>

            {viewApp.coverLetter && (
              <div className="field">
                <label>Cover Letter</label>
                <div style={{
                  background: '#0b1220', border: '1px solid #1e293b', borderRadius: 10,
                  padding: 12, fontSize: 14, color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>
                  {viewApp.coverLetter}
                </div>
              </div>
            )}

            {/* Status update */}
            <div style={{ borderTop: '1px solid #1e293b', marginTop: 20, paddingTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px' }}>
                Update Application Status
              </h3>
              <StatusUpdatePanel
                currentStatus={viewApp.status}
                currentNotes={viewApp.adminNotes}
                busy={appStatusUpdating}
                onUpdate={(status, notes) => updateAppStatus(viewApp._id, status, notes)}
              />
            </div>

            <div className="row">
              <button className="btn btn-ghost" onClick={() => setViewApp(null)} disabled={appStatusUpdating}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────── DELETE JOB CONFIRMATION ─────── */}
      {deleteJob && (
        <div className="modal-backdrop" onClick={() => !deleting && setDeleteJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Job</h2>
            <p className="modal-sub">
              Are you sure you want to delete <strong>{deleteJob.title}</strong>?
              This will also remove all applications for this position. This action cannot be undone.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteJob(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteJob} disabled={deleting}>
                {deleting ? <span className="spinner" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────── DELETE ALL APPLICANTS CONFIRMATION ─────── */}
      {showDeleteAll && (
        <div className="modal-backdrop" onClick={() => !deletingAll && setShowDeleteAll(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#fca5a5' }}>⚠️ Delete ALL Applicants</h2>
            <p className="modal-sub">
              This will permanently delete <strong>every</strong> applicant matching your current filters.
            </p>
            <div style={{
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 14,
            }}>
              <div style={{ marginBottom: 6 }}><strong>Total to delete:</strong> {applications.length} applicant(s)</div>
              {appStatusFilter !== 'all' && (
                <div style={{ marginBottom: 6 }}><strong>Status filter:</strong> {APP_STATUS_LABELS[appStatusFilter] || appStatusFilter}</div>
              )}
              {appJobFilter !== 'all' && (
                <div style={{ marginBottom: 6 }}><strong>Job filter:</strong> {availableJobs.find((j) => j._id === appJobFilter)?.title || appJobFilter}</div>
              )}
              <div style={{ marginTop: 10, color: '#fda4af', fontWeight: 600 }}>
                🚨 This action CANNOT be undone.
              </div>
            </div>
            <div className="field">
              <label>Type <code style={{ background: '#0b1220', padding: '2px 6px', borderRadius: 4 }}>DELETE ALL</code> to confirm:</label>
              <input
                type="text"
                value={deleteAllConfirmText}
                onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                placeholder="DELETE ALL"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="row">
              <button
                className="btn btn-ghost"
                onClick={() => { setShowDeleteAll(false); setDeleteAllConfirmText('') }}
                disabled={deletingAll}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAll}
                disabled={deletingAll || deleteAllConfirmText.trim().toUpperCase() !== 'DELETE ALL'}
              >
                {deletingAll ? <span className="spinner" /> : null} Delete All Applicants
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────── DELETE APPLICANT CONFIRMATION ─────── */}
      {deleteApp && (
        <div className="modal-backdrop" onClick={() => !deletingApp && setDeleteApp(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Applicant</h2>
            <p className="modal-sub">
              Are you sure you want to delete the application of <strong>{deleteApp.applicantName}</strong>?
            </p>
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 16,
            }}>
              <div style={{ marginBottom: 6 }}><strong>Applicant:</strong> {deleteApp.applicantName}</div>
              <div style={{ marginBottom: 6 }}><strong>Email:</strong> {deleteApp.email}</div>
              {deleteApp.jobId?.title && (
                <div style={{ marginBottom: 6 }}><strong>Applied For:</strong> {deleteApp.jobId.title}</div>
              )}
              <div style={{ marginTop: 10, color: '#fda4af' }}>
                ⚠️ This will permanently remove the application record and any associated resume link.
                This action cannot be undone.
              </div>
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setDeleteApp(null)} disabled={deletingApp}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteApp} disabled={deletingApp}>
                {deletingApp ? <span className="spinner" /> : null} Delete Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────── STATUS UPDATE PANEL ─────── */
function StatusUpdatePanel({
  currentStatus,
  currentNotes,
  busy,
  onUpdate,
}: {
  currentStatus: string
  currentNotes: string
  busy: boolean
  onUpdate: (status: string, notes: string) => void
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes)

  const isFinalizing = selectedStatus === 'selected' || selectedStatus === 'not-selected'
  const isProcessing = selectedStatus === 'under-process' || selectedStatus === 'shortlisted'

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {APP_STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`btn ${selectedStatus === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedStatus(s)}
            style={{ fontSize: 12, padding: '6px 12px' }}
            disabled={busy}
          >
            {APP_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="field">
        <label>Admin Notes {isFinalizing ? '(will be included in email to applicant)' : '(internal only)'}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this application..."
          style={{ minHeight: 60 }}
        />
      </div>

      {isFinalizing && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fbbf24', marginBottom: 12,
        }}>
          ⚠️ This will send a <strong>final decision</strong> email notification to the applicant.
        </div>
      )}

      {isProcessing && (
        <div style={{
          background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#7dd3fc', marginBottom: 12,
        }}>
          ℹ️ An email notification will be sent to the applicant informing them of this update.
        </div>
      )}

      {!isFinalizing && !isProcessing && selectedStatus === 'under-review' && (
        <div style={{
          background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c084fc', marginBottom: 12,
        }}>
          📋 An acknowledgement email will be sent to confirm receipt is under review.
        </div>
      )}

      <button
        type="button"
        className={`btn ${selectedStatus !== currentStatus || notes !== currentNotes ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => onUpdate(selectedStatus, notes)}
        disabled={busy || (selectedStatus === currentStatus && notes === currentNotes)}
      >
        {busy ? <span className="spinner" /> : null}
        {selectedStatus !== currentStatus || notes !== currentNotes ? 'Update Status' : 'No Changes'}
      </button>
    </div>
  )
}
