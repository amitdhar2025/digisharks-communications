'use client'

import { useState, FormEvent } from 'react'

const SERVICE_OPTIONS = [
  'Digital PR',
  'SEO Services',
  'Social Media Marketing',
  'PPC Advertising',
  'Web Development',
  'Political Campaign',
  'Other',
]

export default function ContactForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState(SERVICE_OPTIONS[0])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, service, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send message')
        setSubmitting(false)
        return
      }
      setSuccess(true)
      setFullName('')
      setEmail('')
      setPhone('')
      setService(SERVICE_OPTIONS[0])
      setMessage('')
    } catch (err: any) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="contact-form fade-up stagger-2" id="contact-form" onSubmit={handleSubmit}>
      <h3>📝 Send Us a Message</h3>

      {success && (
        <div
          style={{
            background: 'rgba(34,197,94,.12)',
            color: '#86efac',
            border: '1px solid rgba(34,197,94,.3)',
            padding: '10px 12px',
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          ✅ Thanks! We received your message and will get back to you shortly.
        </div>
      )}

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,.12)',
            color: '#fecaca',
            border: '1px solid rgba(239,68,68,.3)',
            padding: '10px 12px',
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Service Interested In</label>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Your Message *</label>
        <textarea
          placeholder="Tell us about your brand and goals..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}
        disabled={submitting}
      >
        {submitting ? 'Sending…' : 'Send Message →'}
      </button>
    </form>
  )
}
