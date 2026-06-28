'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './career.css'

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
}

interface JobApplication {
  jobId: string
  applicantName: string
  email: string
  phone: string
  coverLetter: string
}

const categoryIcons: Record<string, string> = {
  'full-time': '💼',
  'part-time': '🕐',
  'internship': '🎓',
  'contract': '📋',
  'remote': '🌐',
}

const categoryLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'internship': 'Internship',
  'contract': 'Contract',
  'remote': 'Remote',
}

const valueItems = [
  {
    icon: '🚀',
    iconBg: '#FFF1EB',
    iconColor: '#FF5B2E',
    title: 'Growth',
    desc: 'Continuous learning & career advancement opportunities.',
  },
  {
    icon: '💡',
    iconBg: '#EEF4FF',
    iconColor: '#3B82F6',
    title: 'Innovation',
    desc: 'Work with cutting-edge tools and creative strategies.',
  },
  {
    icon: '🤝',
    iconBg: '#FFF8E5',
    iconColor: '#E0A91D',
    title: 'Culture',
    desc: 'Collaborative, supportive, and inclusive environment.',
  },
  {
    icon: '🎯',
    iconBg: '#E8F8EE',
    iconColor: '#22A565',
    title: 'Impact',
    desc: 'Make a real difference for 500+ clients.',
  },
]

export default function CareerPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [applyJob, setApplyJob] = useState<CareerJob | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobApplication>({
    jobId: '',
    applicantName: '',
    email: '',
    phone: '',
    coverLetter: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    try {
      const res = await fetch('/api/career/jobs')
      const data = await res.json()
      setJobs(data.jobs || [])
      setCategories(data.categories || [])
    } catch (e) {
      console.error('Failed to fetch jobs', e)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = activeCategory === 'all'
    ? jobs
    : jobs.filter((j) => j.category === activeCategory)

  function handleApply(job: CareerJob) {
    setApplyJob(job)
    setFormData({
      jobId: job._id,
      applicantName: '',
      email: '',
      phone: '',
      coverLetter: '',
    })
    setResumeFile(null)
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!applyJob) return
    if (!resumeFile) {
      setError('Please upload your resume/CV')
      return
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      setError('Resume file must be under 5MB')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('jobId', formData.jobId)
      fd.append('applicantName', formData.applicantName)
      fd.append('email', formData.email)
      fd.append('phone', formData.phone)
      fd.append('coverLetter', formData.coverLetter)
      fd.append('resume', resumeFile)

      const res = await fetch('/api/career/apply', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleViewDetails(jobId: string) {
    setExpandedJob(expandedJob === jobId ? null : jobId)
  }

  const openPositions = jobs.filter((j) => j.category === 'full-time').length + jobs.filter((j) => j.category === 'part-time').length

  return (
    <div className="career-page">
      <div className="career-container">
        {/* Hero Section */}
        <div className="career-hero">
          <img
            src="/career%20hero%20image.png"
            alt="Join the DigiSharks Team — We are always looking for passionate, creative, and driven individuals to help us deliver exceptional digital PR and marketing solutions"
            className="career-hero-image"
          />
        </div>

        {/* Stats */}
        <div className="career-stats-row">
          <div className="career-stat-card">
            <div className="career-stat-icon career-stat-icon--orange">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>
            </div>
            <div className="career-stat-meta">
              <div className="career-stat-number">{jobs.length}</div>
              <div className="career-stat-label">Open Positions</div>
            </div>
          </div>
          <div className="career-stat-card">
            <div className="career-stat-icon career-stat-icon--blue">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div className="career-stat-meta">
              <div className="career-stat-number career-stat-number--blue">{categories.length}</div>
              <div className="career-stat-label">Job Categories</div>
            </div>
          </div>
          <div className="career-stat-card">
            <div className="career-stat-icon career-stat-icon--yellow">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M17 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="career-stat-meta">
              <div className="career-stat-number career-stat-number--yellow">{jobs.reduce((sum, j) => sum + j.numberOfPositions, 0)}</div>
              <div className="career-stat-label">Hiring For</div>
            </div>
          </div>
          <div className="career-stat-card">
            <div className="career-stat-icon career-stat-icon--green">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="career-stat-meta">
              <div className="career-stat-number career-stat-number--green">{jobs.filter((j) => j.location).length}</div>
              <div className="career-stat-label">Locations</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {categories.length > 0 && (
          <div className="career-filter-bar">
            <button
              className={`career-filter-chip${activeCategory === 'all' ? ' active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              📋 All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`career-filter-chip${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {categoryIcons[cat] || '📌'} {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="career-empty-state">
            <div className="career-loading-icon">⏳</div>
            <p>Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="career-empty-state">
            <div className="career-empty-state-icon-circle">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h3 className="career-empty-state-title">No open positions</h3>
            <p className="career-empty-state-text">
              {activeCategory !== 'all'
                ? `No ${categoryLabels[activeCategory] || activeCategory} positions available at the moment.`
                : 'No positions available at the moment. Check back later!'}
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="career-job-card"
              onClick={() => handleViewDetails(job._id)}
            >
              <div className="career-job-header">
                <div className="career-job-title-area">
                  <h2 className="career-job-title">{job.title}</h2>
                  <div className="career-job-meta">
                    <span className="career-job-meta-item">
                      <span className="career-meta-icon">📍</span> {job.location || 'Remote'}
                    </span>
                    <span className="career-job-meta-item">
                      <span className="career-meta-icon">🎯</span> {job.experienceRequired}
                    </span>
                    <span className="career-job-meta-item">
                      <span className="career-meta-icon">👥</span> {job.numberOfPositions} {job.numberOfPositions === 1 ? 'position' : 'positions'}
                    </span>
                  </div>
                </div>
                <div className="career-job-badges">
                  <span className="career-category-badge">
                    {categoryIcons[job.category] || '📌'} {categoryLabels[job.category] || job.category}
                  </span>
                  <span className="career-salary-badge">
                    💰 {job.salaryPackage}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {expandedJob === job._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="career-expanded-content">
                      {job.department && (
                        <div className="career-expanded-section">
                          <div className="career-section-title">Department</div>
                          <p className="career-description" style={{ marginBottom: 0 }}>{job.department}</p>
                        </div>
                      )}

                      {job.workProfile && (
                        <div className="career-expanded-section">
                          <div className="career-section-title">Work Profile</div>
                          <p className="career-description">{job.workProfile}</p>
                        </div>
                      )}

                      {job.jobDescription && (
                        <div className="career-expanded-section" style={{ marginBottom: '20px' }}>
                          <div className="career-section-title">Job Description</div>
                          <p className="career-description">{job.jobDescription}</p>
                        </div>
                      )}

                      <div className="career-expanded-actions">
                        <button
                          className="career-btn-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApply(job)
                          }}
                        >
                          ✉ Apply Now
                        </button>
                        <button
                          className="career-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedJob(null)
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {expandedJob !== job._id && (
                <div className="career-view-details-footer">
                  <button
                    className="career-btn-secondary career-btn-secondary--small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(job._id)
                    }}
                  >
                    View Details →
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}

        {/* Company Values Section */}
        <div className="career-values-section">
          <div className="career-values-decor-dots" aria-hidden="true" />
          <h2 className="career-values-title">
            Why Work at <span className="career-values-accent">Digisharks</span>?
          </h2>
          <p className="career-values-sub">
            We foster a culture of innovation, growth, and collaboration.
          </p>
          <div className="career-values-grid">
            {valueItems.map((item) => (
              <div key={item.title} className="career-value-card">
                <div
                  className="career-value-icon"
                  style={{ background: item.iconBg, color: item.iconColor }}
                >
                  <span>{item.icon}</span>
                </div>
                <div className="career-value-card-body">
                  <h3 className="career-value-card-title">{item.title}</h3>
                  <p className="career-value-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="career-cta-banner">
          <div className="career-cta-banner-inner">
            <h2 className="career-cta-title">Ready to Make Waves With Us?</h2>
            <p className="career-cta-sub">
              Send your resume to <a href="mailto:marketing@digisharkscommunications.com">marketing@digisharkscommunications.com</a> and we'll get back to you when the right opportunity opens up.
            </p>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {applyJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="career-modal-backdrop"
            onClick={() => !submitting && setApplyJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="career-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {success ? (
                <div className="career-success-box">
                  <div className="career-success-icon">✅</div>
                  <h2 className="career-success-title">Application Submitted!</h2>
                  <p className="career-success-text">
                    Thank you for applying for <strong>{applyJob.title}</strong>. 
                    Our HR team will review your application and get back to you soon.
                    A confirmation email has been sent to your email address.
                  </p>
                  <button
                    className="career-btn-primary"
                    onClick={() => setApplyJob(null)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="career-modal-header">
                    <h2 className="career-modal-title">
                      Apply for {applyJob.title}
                    </h2>
                    <p className="career-modal-sub">
                      {applyJob.location} · {applyJob.experienceRequired} · {applyJob.salaryPackage}
                    </p>
                  </div>

                  {error && (
                    <div className="career-error-box">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="career-form-group">
                      <label className="career-label">Full Name *</label>
                      <input
                        className="career-input"
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.applicantName}
                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      />
                    </div>

                    <div className="career-form-row">
                      <div className="career-form-group">
                        <label className="career-label">Email *</label>
                        <input
                          className="career-input"
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="career-form-group">
                        <label className="career-label">Phone</label>
                        <input
                          className="career-input"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="career-form-group">
                      <label className="career-label">Cover Letter (Optional)</label>
                      <textarea
                        className="career-textarea"
                        placeholder="Tell us why you are the perfect fit for this role..."
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      />
                    </div>

                    <div className="career-form-group">
                      <label className="career-label">Upload Resume/CV * (PDF, DOCX — Max 5MB)</label>
                      <div
                        className={`career-file-upload${resumeFile ? ' has-file' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer.files[0]
                          if (file) setResumeFile(file)
                        }}
                        onClick={() => document.getElementById('resume-upload')?.click()}
                      >
                        {resumeFile ? (
                          <div>
                            <span className="career-file-icon">📄</span>
                            <p className="career-file-name">{resumeFile.name}</p>
                            <p className="career-file-size">
                              {(resumeFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="career-file-upload-icon">📎</span>
                            <p className="career-file-upload-text">Click or drag to upload your CV</p>
                            <p className="career-file-upload-hint">PDF or DOCX, up to 5MB</p>
                          </div>
                        )}
                      </div>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="career-hidden-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setResumeFile(file)
                        }}
                      />
                    </div>

                    <div className="career-form-actions">
                      <button
                        type="button"
                        className="career-btn-secondary"
                        onClick={() => setApplyJob(null)}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="career-btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? '⏳ Submitting...' : '✉ Submit Application'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
