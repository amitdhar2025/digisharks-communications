// Branded HTML email templates for Digisharks Communications.
// Uses String.fromCharCode-based entity construction to avoid HTML stripping.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'
const FROM_NAME = 'Digisharks Communications'
const LOGO_URL = SITE_URL + '/Digis.png'

const ENT = {
  amp: String.fromCharCode(38) + 'amp;',
  lt: String.fromCharCode(38) + 'lt;',
  gt: String.fromCharCode(38) + 'gt;',
  quot: String.fromCharCode(38) + 'quot;',
  apos: String.fromCharCode(38) + '#39;',
  mdash: String.fromCharCode(38) + 'mdash;',
  copy: String.fromCharCode(38) + 'copy;',
  middot: String.fromCharCode(38) + 'middot;',
  rsquo: String.fromCharCode(38) + 'rsquo;',
}

const COLORS = {
  bg: '#0b1220', cardBg: '#ffffff', text: '#1f2937', muted: '#6b7280',
  brandA: '#0ea5e9', brandB: '#6366f1', border: '#e5e7eb',
  success: '#16a34a', successBg: '#ecfdf5', footerBg: '#f3f4f6', buttonText: '#ffffff',
}

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, ENT.amp).replace(/</g, ENT.lt).replace(/>/g, ENT.gt)
    .replace(/"/g, ENT.quot).replace(/'/g, ENT.apos)
}

function header(eyebrow: string): string {
  return '<tr><td style="padding:0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="background:linear-gradient(135deg,' + COLORS.bg + ' 0%,#0f172a 50%,#111827 100%);padding:36px 24px 28px 24px;"><img src="' + LOGO_URL + '" alt="Digisharks Communications" width="180" style="display:block;width:180px;max-width:60%;height:auto;margin:0 auto 18px auto;"><div style="display:inline-block;background:rgba(14,165,233,.15);color:#7dd3fc;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:6px 14px;border-radius:999px;border:1px solid rgba(14,165,233,.35);">' + eyebrow + '</div></td></tr></table></td>'
}

export interface LegalUrls {
  privacyPolicyUrl?: string
  termsUrl?: string
  refundPolicyUrl?: string
}

function footer(legalUrls?: LegalUrls): string {
  const pp = legalUrls?.privacyPolicyUrl || '#'
  const tos = legalUrls?.termsUrl || '#'
  const refund = legalUrls?.refundPolicyUrl || '#'
  return '<tr><td style="background:' + COLORS.footerBg + ';padding:24px;text-align:center;border-top:1px solid ' + COLORS.border + ';"><div style="font-size:13px;color:' + COLORS.muted + ';line-height:1.6;"><strong style="color:' + COLORS.text + ';">Digisharks Communications</strong><br>B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301<br>Phone: <a href="tel:+919627332332" style="color:' + COLORS.brandA + ';text-decoration:none;">+91 96273 32332</a> &nbsp;' + ENT.middot + '&nbsp; Email: <a href="mailto:marketing@digisharkscommunications.com" style="color:' + COLORS.brandA + ';text-decoration:none;">marketing@digisharkscommunications.com</a></div><div style="margin-top:14px;"><a href="' + SITE_URL + '/about-us" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">About</a> ' + ENT.middot + ' <a href="' + SITE_URL + '/services-top-pr-digital-marketing/" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Services</a> ' + ENT.middot + ' <a href="' + SITE_URL + '/contact-us" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Contact</a> ' + ENT.middot + ' <a href="' + SITE_URL + '/press-release/" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Press</a></div><div style="margin-top:8px;"><a href="' + pp + '" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Privacy Policy</a> ' + ENT.middot + ' <a href="' + tos + '" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Terms and Conditions</a> ' + ENT.middot + ' <a href="' + refund + '" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Refund Policy</a></div><div style="margin-top:14px;font-size:11px;color:#9ca3af;">' + ENT.copy + ' ' + new Date().getFullYear() + ' Digisharks Communications. All rights reserved.</div></td></tr>'
}

function stepRow(num: string, title: string, body: string): string {
  return '<tr><td width="32" valign="top" style="padding-top:4px;"><div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,' + COLORS.brandA + ',' + COLORS.brandB + ');color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">' + num + '</div></td><td style="padding:4px 0 14px 12px;font-size:14px;color:' + COLORS.text + ';line-height:1.5;"><strong>' + title + '</strong> ' + body + '</td></tr>'
}

function detailRow(label: string, value: string, isLast = false): string {
  const bottom = isLast ? '' : 'border-bottom:1px solid ' + COLORS.border + ';'
  return '<tr><td style="padding:12px 16px;background:#f9fafb;font-size:12px;font-weight:600;color:' + COLORS.muted + ';text-transform:uppercase;letter-spacing:.06em;width:35%;' + bottom + 'vertical-align:top;">' + label + '</td><td style="padding:12px 16px;font-size:14px;color:' + COLORS.text + ';line-height:1.55;' + bottom + '">' + value + '</td></tr>'
}

function layout(content: string): string {
  return '<!doctype html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>' + FROM_NAME + '</title></head><body style="margin:0;padding:0;background:' + COLORS.bg + ';font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,sans-serif;"><span style="display:none;visibility:hidden;mso-hide:all;font-size:1px;color:' + COLORS.bg + ';line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Thanks for contacting Digisharks ' + ENT.mdash + ' we received your enquiry and will be in touch shortly.</span><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:' + COLORS.bg + ';"><tr><td align="center" style="padding:32px 16px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:' + COLORS.cardBg + ';border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35);">' + content + '</table></td></tr></table></body></html>'
}

export interface ContactEnquiry {
  fullName: string; email: string; phone?: string; service: string; message: string
}

export interface BuiltEmail {
  subject: string; html: string; text: string
}

export function buildContactConfirmationEmail(enquiry: ContactEnquiry, legalUrls?: LegalUrls): BuiltEmail {
  const firstName = (enquiry.fullName || '').split(' ')[0] || enquiry.fullName || 'there'
  const nameSafe = escapeHtml(firstName)
  const fullNameSafe = escapeHtml(enquiry.fullName || '')
  const emailSafe = escapeHtml(enquiry.email || '')
  const phoneRaw = (enquiry.phone || '').trim()
  const serviceSafe = escapeHtml(enquiry.service || 'General Enquiry')
  const messageHtml = escapeHtml(enquiry.message || '').replace(/\n/g, '<br>')
  const reference = 'DS-' + Date.now().toString(36).toUpperCase()

  const subject = 'Thanks for your enquiry, ' + firstName + '! - Digisharks'
  const phoneCell = phoneRaw
    ? '<a href="tel:' + escapeHtml(phoneRaw) + '" style="color:' + COLORS.brandA + ';text-decoration:none;">' + escapeHtml(phoneRaw) + '</a>'
    : ENT.mdash

  const body =
    header('Enquiry Received') +
    '<tr><td style="padding:36px 36px 8px 36px;"><h1 style="margin:0 0 12px 0;font-size:28px;line-height:34px;color:' + COLORS.text + ';font-weight:700;">Thanks for reaching out, ' + nameSafe + '!</h1><p style="margin:0 0 22px 0;font-size:16px;line-height:24px;color:' + COLORS.muted + ';">We' + ENT.rsquo + 've received your enquiry and our team will get back to you shortly. Below is a copy of what you submitted for your records.</p></td></tr>' +
    '<tr><td style="padding:0 36px 8px 36px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:' + COLORS.successBg + ';border:1px solid #a7f3d0;border-radius:12px;"><tr><td style="padding:18px 22px;"><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:' + COLORS.success + ';margin-bottom:6px;">Submission received</div><div style="font-size:14px;color:' + COLORS.text + ';line-height:1.5;">Reference: <strong>' + reference + '</strong></div></td></tr></table></td></tr>' +
    '<tr><td style="padding:24px 36px 0 36px;"><h2 style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">Your enquiry details</h2><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + COLORS.border + ';border-radius:12px;overflow:hidden;">' +
    detailRow('Name', fullNameSafe) +
    detailRow('Email', '<a href="mailto:' + emailSafe + '" style="color:' + COLORS.brandA + ';text-decoration:none;">' + emailSafe + '</a>') +
    detailRow('Phone', phoneCell) +
    detailRow('Service', serviceSafe) +
    detailRow('Message', messageHtml, true) +
    '</table></td></tr>' +
    '<tr><td style="padding:28px 36px 8px 36px;"><h3 style="margin:0 0 10px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">What happens next?</h3><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">' +
    stepRow('1', 'Triage.', 'Our team reviews your message within 1 business hour.') +
    stepRow('2', 'Expert match.', 'We assign the right specialist for your service.') +
    stepRow('3', 'Connect.', 'Expect a personal reply with next steps and a free consultation slot.') +
    '</table></td></tr>' +
    '<tr><td align="center" style="padding:18px 36px 32px 36px;"><a href="' + SITE_URL + '/services-top-pr-digital-marketing/" style="background:linear-gradient(135deg,' + COLORS.brandA + ' 0%,' + COLORS.brandB + ' 100%);border-radius:8px;color:' + COLORS.buttonText + ';display:inline-block;font-weight:600;padding:14px 32px;text-decoration:none;font-size:15px;">Explore Our Services</a><div style="margin-top:14px;font-size:12px;color:' + COLORS.muted + ';">or call us directly at <a href="tel:+919627332332" style="color:' + COLORS.brandA + ';text-decoration:none;font-weight:600;">+91 96273 32332</a></div></td></tr>' +
    footer(legalUrls)

  const html = layout(body)
  const text =
    'Hi ' + firstName + ',\n\n' +
    "Thanks for your enquiry! We've received your message and our team will get back to you shortly.\n\n" +
    'Reference: ' + reference + '\n\n' +
    '--- Your enquiry ---\n' +
    'Name: ' + (enquiry.fullName || '') + '\n' +
    'Email: ' + (enquiry.email || '') + '\n' +
    'Phone: ' + (enquiry.phone || 'N/A') + '\n' +
    'Service: ' + (enquiry.service || 'General Enquiry') + '\n' +
    'Message: ' + (enquiry.message || '') + '\n\n' +
    '--- What happens next? ---\n' +
    '1. Triage. Our team reviews your message within 1 business hour.\n' +
    '2. Expert match. We assign the right specialist for your service.\n' +
    '3. Connect. Expect a personal reply with next steps and a free consultation slot.\n\n' +
    'Explore our services: ' + SITE_URL + '/services-top-pr-digital-marketing/\n' +
    'Or call us directly at +91 96273 32332.\n\n' +
    '---\n' +
    'Digisharks Communications\n' +
    'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301\n' +
    'marketing@digisharkscommunications.com\n' +
    SITE_URL + '\n'

  return { subject, html, text }
}

/* ─────── SEO Audit Report Email ─────── */

export interface SeoAuditReport {
  name: string
  email: string
  url: string
  domain: string
  overall: 'pass' | 'warn' | 'fail'
  avgScore: number
  checks: { name: string; status: string; score?: number; details?: string }[]
  pagespeed?: {
    mobile?: Record<string, any>
    desktop?: Record<string, any>
  }
  resultsUrl: string
}

function statusColor(status: string): string {
  if (status === 'pass') return '#22c55e'
  if (status === 'warn') return '#eab308'
  return '#ef4444'
}

function statusBg(status: string): string {
  if (status === 'pass') return '#ecfdf5'
  if (status === 'warn') return '#fefce8'
  return '#fef2f2'
}

function buildSeoAuditHtml(report: SeoAuditReport, legalUrls?: LegalUrls): string {
  const nameSafe = escapeHtml(report.name || 'there')
  const urlSafe = escapeHtml(report.url || '')
  const domainSafe = escapeHtml(report.domain || '')
  const overallLabel = report.overall === 'pass' ? '✅ Pass' : report.overall === 'warn' ? '⚠️ Warning' : '❌ Fail'
  const overallColor = statusColor(report.overall)
  const overallBg = statusBg(report.overall)

  const checksRows = report.checks
    .map((c) => {
      const cName = escapeHtml(c.name || '')
      const cScore = c.score !== undefined ? String(c.score) : 'N/A'
      const cStatus = c.status || 'fail'
      const stColor = statusColor(cStatus)
      const stBg = statusBg(cStatus)
      const stLabel = cStatus === 'pass' ? 'Pass' : cStatus === 'warn' ? 'Warn' : 'Fail'
      const cDetails = c.details ? escapeHtml(c.details).replace(/\n/g, '<br>') : ''
      return '<tr><td style="padding:10px 14px;border-bottom:1px solid ' + COLORS.border + ';font-size:14px;color:' + COLORS.text + ';">' + cName + '</td><td style="padding:10px 14px;border-bottom:1px solid ' + COLORS.border + ';font-size:14px;color:' + COLORS.text + ';text-align:center;font-weight:700;">' + cScore + '</td><td style="padding:10px 14px;border-bottom:1px solid ' + COLORS.border + ';text-align:center;"><span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:' + stBg + ';color:' + stColor + ';border:1px solid ' + stColor + '33;">' + stLabel + '</span></td></tr>'
    })
    .join('')

  // Build detailed breakdowns for each check
  const detailsRows = report.checks
    .filter((c) => c.details)
    .map((c) => {
      const cName = escapeHtml(c.name || '')
      const cDetails = escapeHtml(c.details || '').replace(/\|/g, '<br>• ')
      return '<tr><td style="padding:14px 16px;border-bottom:1px solid ' + COLORS.border + ';"><div style="font-size:13px;font-weight:700;color:' + COLORS.text + ';margin-bottom:4px;">' + cName + '</div><div style="font-size:13px;color:' + COLORS.muted + ';line-height:1.6;">• ' + cDetails + '</div></td></tr>'
    })
    .join('')

  // Build PageSpeed Insights section
  const pagespeedHtml = (() => {
    if (!report.pagespeed) return ''
    const psRows: string[] = []
    for (const strategy of ['mobile', 'desktop']) {
      const data = report.pagespeed?.[strategy as 'mobile' | 'desktop']
      if (!data || data.error) continue
      let detailStr = '<strong style="text-transform:capitalize;">' + strategy + '</strong>'
      if (data.performance !== undefined) detailStr += ' | Performance: ' + data.performance
      if (data.seo !== undefined) detailStr += ' | SEO: ' + data.seo
      if (data.accessibility !== undefined) detailStr += ' | Accessibility: ' + data.accessibility
      if (data.bestPractices !== undefined) detailStr += ' | Best Practices: ' + data.bestPractices
      if (data.lcp) detailStr += ' | LCP: ' + data.lcp
      if (data.cls) detailStr += ' | CLS: ' + data.cls
      psRows.push('<div style="font-size:13px;color:' + COLORS.muted + ';line-height:1.7;margin-bottom:6px;">' + detailStr + '</div>')
    }
    if (psRows.length === 0) return ''
    return '<tr><td style="padding:16px 36px 8px 36px;"><div style="background:#f9fafb;border:1px solid ' + COLORS.border + ';border-radius:12px;padding:16px 20px;"><div style="font-size:13px;font-weight:700;color:' + COLORS.text + ';margin-bottom:8px;">🚀 PageSpeed Insights</div>' + psRows.join('') + '</div></td></tr>'
  })()

  const headerContent =
    '<tr><td style="background:linear-gradient(135deg,' + COLORS.bg + ' 0%,#0f172a 50%,#111827 100%);padding:36px 24px 28px 24px;text-align:center;">' +
    '<img src="' + LOGO_URL + '" alt="Digisharks" width="140" style="display:block;margin:0 auto 16px;height:auto;">' +
    '<div style="color:#7dd3fc;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;border:1px solid rgba(14,165,233,.35);background:rgba(14,165,233,.15);display:inline-block;padding:6px 14px;border-radius:999px;">' +
    'SEO Audit Report' +
    '</div></td></tr>'

  const body =
    headerContent +
    '<tr><td style="padding:36px 36px 8px 36px;">' +
    '<h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;color:' + COLORS.text + ';font-weight:700;">Your SEO Audit Report Is Ready, ' + nameSafe + '!</h1>' +
    '<p style="margin:0 0 22px 0;font-size:16px;line-height:24px;color:' + COLORS.muted + ';">' +
    'We have completed the SEO health audit for <strong>' + domainSafe + '</strong>. ' +
    'Your full interactive report is available online with detailed breakdowns and recommendations.' +
    '</p></td></tr>' +
    // Overall Score
    '<tr><td style="padding:0 36px 24px 36px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:' + overallBg + ';border:1px solid ' + overallColor + '33;border-radius:12px;"><tr><td style="padding:20px 24px;text-align:center;"><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:' + COLORS.muted + ';margin-bottom:6px;">Overall Health Score</div><div style="font-size:42px;font-weight:800;color:' + overallColor + ';line-height:1;margin-bottom:6px;">' + String(report.avgScore) + '<span style="font-size:18px;opacity:.4;">/100</span></div><div style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;background:' + overallBg + ';color:' + overallColor + ';border:1px solid ' + overallColor + '33;">' + overallLabel + '</div></td></tr></table></td></tr>' +
    // Checks table
    '<tr><td style="padding:0 36px 8px 36px;"><h2 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">Check Results</h2><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + COLORS.border + ';border-radius:12px;overflow:hidden;"><thead><tr style="background:' + COLORS.footerBg + ';"><th style="padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + COLORS.muted + ';text-align:left;border-bottom:1px solid ' + COLORS.border + ';">Check</th><th style="padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + COLORS.muted + ';text-align:center;border-bottom:1px solid ' + COLORS.border + ';">Score</th><th style="padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:' + COLORS.muted + ';text-align:center;border-bottom:1px solid ' + COLORS.border + ';">Status</th></tr></thead><tbody>' +
    checksRows +
    '</tbody></table></td></tr>' +
    // Detailed breakdowns
    (detailsRows ? '<tr><td style="padding:24px 36px 8px 36px;"><h2 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">Detailed Analysis</h2><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + COLORS.border + ';border-radius:12px;overflow:hidden;"><tbody>' + detailsRows + '</tbody></table></td></tr>' : '') +

    // PageSpeed Details
    (report.pagespeed ? function() {
      const psRows: string[] = []
      for (const strategy of ['mobile', 'desktop']) {
        const data = report.pagespeed?.[strategy as 'mobile' | 'desktop']
        if (!data || data.error) continue
        let detailStr = '<strong style="text-transform:capitalize;">' + strategy + '</strong>'
        if (data.performance !== undefined) detailStr += ' | Performance: ' + data.performance
        if (data.seo !== undefined) detailStr += ' | SEO: ' + data.seo
        if (data.accessibility !== undefined) detailStr += ' | Accessibility: ' + data.accessibility
        if (data.bestPractices !== undefined) detailStr += ' | Best Practices: ' + data.bestPractices
        if (data.lcp) detailStr += ' | LCP: ' + data.lcp
        if (data.cls) detailStr += ' | CLS: ' + data.cls
        psRows.push('<div style="font-size:13px;color:' + COLORS.muted + ';line-height:1.7;margin-bottom:6px;">' + detailStr + '</div>')
      }
      return psRows.length > 0
        ? '<tr><td style="padding:16px 36px 8px 36px;"><div style="background:#f9fafb;border:1px solid ' + COLORS.border + ';border-radius:12px;padding:16px 20px;"><div style="font-size:13px;font-weight:700;color:' + COLORS.text + ';margin-bottom:8px;">🚀 PageSpeed Insights</div>' + psRows.join('') + '</div></td></tr>'
        : ''
    }() : '') +


    // Talk to an expert
    '<tr><td style="padding:24px 36px 8px 36px;"><div style="background:#f9fafb;border:1px solid ' + COLORS.border + ';border-radius:12px;padding:20px;">' +
    '<div style="font-size:15px;font-weight:700;color:' + COLORS.text + ';margin-bottom:8px;">💡 Need help improving your scores?</div>' +
    '<p style="font-size:14px;color:' + COLORS.muted + ';line-height:1.6;margin:0;">' +
    'Our team of SEO experts can help you fix the issues found in this audit. ' +
    '<a href="' + SITE_URL + '/contact-us" style="color:' + COLORS.brandA + ';text-decoration:none;font-weight:600;">Schedule a free consultation</a> ' +
    'or call us at <a href="tel:+919627332332" style="color:' + COLORS.brandA + ';text-decoration:none;font-weight:600;">+91 96273 32332</a>.' +
    '</p></div></td></tr>' +
    footer(legalUrls)

  return layout(body)
}

/* ─────── Career Application Status Email ─────── */

export type CareerStatus = 'under-review' | 'shortlisted' | 'under-process' | 'selected' | 'not-selected'

export interface ApplicationStatusInfo {
  name: string
  email: string
  jobTitle: string
  status: CareerStatus
  adminNotes: string
}

const STATUS_CONFIG: Record<CareerStatus, { eyebrow: string; icon: string; heading: (name: string) => string; message: (job: string) => string; subject: (job: string) => string; text: (name: string, job: string) => string }> = {
  'under-review': {
    eyebrow: 'Application Received - Under Review',
    icon: '📋',
    heading: (name) => 'Application Under Review, ' + name,
    message: (job) => 'Thank you for applying for <strong>' + job + '</strong> at Digisharks Communications! Your application has been received and is currently <strong>under review</strong> by our HR team. We will carefully evaluate your profile and get back to you with an update soon.',
    subject: (job) => 'Application under review for ' + job + ' at Digisharks',
    text: (name, job) => 'Hi ' + name + ',\n\nThank you for applying for ' + job + ' at Digisharks Communications! Your application is currently under review by our HR team. We will carefully evaluate your profile and get back to you with an update soon.\n\nBest regards,\nDigisharks Communications Team',
  },
  'shortlisted': {
    eyebrow: 'Application Status: Shortlisted ✨',
    icon: '✨',
    heading: (name) => 'You have been Shortlisted, ' + name + '!',
    message: (job) => 'Great news! We are pleased to inform you that you have been <strong>shortlisted</strong> for the position of <strong>' + job + '</strong> at Digisharks Communications. Our HR team will reach out to you shortly to schedule the next steps in the hiring process.',
    subject: (job) => 'You have been shortlisted for ' + job + ' at Digisharks!',
    text: (name, job) => 'Hi ' + name + ',\n\nGreat news! You have been shortlisted for ' + job + ' at Digisharks Communications! Our HR team will reach out to you shortly to schedule the next steps.\n\nBest regards,\nDigisharks Communications Team',
  },
  'under-process': {
    eyebrow: 'Application Status: In Process 🔄',
    icon: '🔄',
    heading: (name) => 'Your Application is In Process, ' + name,
    message: (job) => 'We wanted to update you that your application for <strong>' + job + '</strong> at Digisharks Communications is currently <strong>in process</strong>. Our hiring team is actively reviewing applications and conducting interviews. We appreciate your patience and will keep you informed of any developments.',
    subject: (job) => 'Update: Your application for ' + job + ' is in process',
    text: (name, job) => 'Hi ' + name + ',\n\nWe wanted to update you that your application for ' + job + ' at Digisharks Communications is currently in process. Our hiring team is actively reviewing applications and conducting interviews. We appreciate your patience and will keep you informed.\n\nBest regards,\nDigisharks Communications Team',
  },
  'selected': {
    eyebrow: 'Application Status: Selected 🎉',
    icon: '🎉',
    heading: (name) => 'Congratulations, ' + name + '! 🎉',
    message: (job) => 'We are pleased to inform you that you have been <strong>selected</strong> for the position of <strong>' + job + '</strong> at Digisharks Communications! Our HR team will reach out to you shortly with the next steps, including offer letter details and onboarding information.',
    subject: (job) => 'Congratulations! You have been selected for ' + job + ' at Digisharks',
    text: (name, job) => 'Hi ' + name + ',\n\nCongratulations! 🎉\n\nWe are pleased to inform you that you have been selected for the position of ' + job + ' at Digisharks Communications! Our HR team will reach out to you shortly with the next steps.\n\nBest regards,\nDigisharks Communications Team',
  },
  'not-selected': {
    eyebrow: 'Application Status Update',
    icon: '',
    heading: (name) => 'Update on Your Application, ' + name,
    message: (job) => 'Thank you for your interest in joining Digisharks Communications. After careful review, we regret to inform you that we have decided to move forward with other candidates for the position of <strong>' + job + '</strong>.',
    subject: (job) => 'Update on your application for ' + job + ' at Digisharks',
    text: (name, job) => 'Hi ' + name + ',\n\nThank you for your interest in joining Digisharks Communications. After careful review, we regret to inform you that we have decided to move forward with other candidates for the position of ' + job + '.\n\nBest regards,\nDigisharks Communications Team',
  },
}

export function buildApplicationStatusEmail(info: ApplicationStatusInfo, legalUrls?: LegalUrls): BuiltEmail {
  const nameSafe = escapeHtml(info.name || 'there')
  const jobSafe = escapeHtml(info.jobTitle || 'the position')
  const notesSafe = info.adminNotes ? escapeHtml(info.adminNotes).replace(/\n/g, '<br>') : ''

  const cfg = STATUS_CONFIG[info.status] || STATUS_CONFIG['under-review']
  const eyebrow = cfg.eyebrow
  const heading = cfg.heading(nameSafe)
  const message = cfg.message(jobSafe)
  const icon = cfg.icon

  const notesSection = notesSafe
    ? '<tr><td style="padding:16px 36px;"><div style="background:#f9fafb;border:1px solid ' + COLORS.border + ';border-radius:12px;padding:16px 20px;"><div style="font-size:13px;font-weight:700;color:' + COLORS.text + ';margin-bottom:6px;">📝 Notes from the Hiring Team</div><p style="font-size:14px;color:' + COLORS.muted + ';line-height:1.6;margin:0;">' + notesSafe + '</p></div></td></tr>'
    : ''

  const body =
    header(eyebrow) +
    '<tr><td style="padding:36px 36px 8px 36px;"><h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;color:' + COLORS.text + ';font-weight:700;">' + heading + '</h1><p style="margin:0 0 22px 0;font-size:16px;line-height:24px;color:' + COLORS.muted + ';">' + message + '</p></td></tr>' +
    notesSection +
    footer(legalUrls)

  const html = layout(body)

  return {
    subject: cfg.subject(jobSafe),
    html,
    text: cfg.text(info.name || 'there', info.jobTitle || 'the position') +
      '\n\n' +
      (info.adminNotes ? 'Notes from the Hiring Team:\n' + info.adminNotes + '\n\n' : '') +
      '---\nDigisharks Communications\n' + SITE_URL + '\n',
  }
}

/* ─────── Admin Notification: New Application ─────── */

export interface AdminNewApplicationInfo {
  applicantName: string
  email: string
  phone: string
  jobTitle: string
  jobCategory: string
  jobLocation: string
  coverLetter: string
  resumeUrl: string
  applicationId: string
}

export function buildAdminNewApplicationEmail(info: AdminNewApplicationInfo, legalUrls?: LegalUrls): BuiltEmail {
  const nameSafe = escapeHtml(info.applicantName || 'Unknown')
  const emailSafe = escapeHtml(info.email || '')
  const phoneSafe = escapeHtml(info.phone || '—')
  const jobSafe = escapeHtml(info.jobTitle || 'Unknown Position')
  const categorySafe = escapeHtml(info.jobCategory || '—')
  const locationSafe = escapeHtml(info.jobLocation || '—')
  const coverHtml = info.coverLetter ? escapeHtml(info.coverLetter).replace(/\n/g, '<br>') : '—'
  const adminUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com') + '/admin/career'

  const body =
    header('New Job Application Received') +
    '<tr><td style="padding:36px 36px 8px 36px;"><h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;color:' + COLORS.text + ';font-weight:700;">New Application: ' + nameSafe + '</h1><p style="margin:0 0 22px 0;font-size:16px;line-height:24px;color:' + COLORS.muted + ';">A new application has been submitted for <strong>' + jobSafe + '</strong>. Review the details below and take action in the admin panel.</p></td></tr>' +
    '<tr><td style="padding:0 36px 8px 36px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:' + COLORS.successBg + ';border:1px solid #a7f3d0;border-radius:12px;"><tr><td style="padding:18px 22px;"><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:' + COLORS.success + ';margin-bottom:4px;">Application ID</div><div style="font-size:16px;color:' + COLORS.text + ';font-weight:600;">' + escapeHtml(info.applicationId) + '</div></td></tr></table></td></tr>' +
    '<tr><td style="padding:24px 36px 8px 36px;"><h2 style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">Applicant Details</h2><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + COLORS.border + ';border-radius:12px;overflow:hidden;">' +
    detailRow('Name', nameSafe) +
    detailRow('Email', '<a href="mailto:' + emailSafe + '" style="color:' + COLORS.brandA + ';text-decoration:none;">' + emailSafe + '</a>') +
    detailRow('Phone', '<a href="tel:' + phoneSafe + '" style="color:' + COLORS.brandA + ';text-decoration:none;">' + phoneSafe + '</a>') +
    detailRow('Position', jobSafe) +
    detailRow('Category', categorySafe) +
    detailRow('Location', locationSafe) +
    detailRow('Resume', info.resumeUrl ? '<a href="' + escapeHtml(info.resumeUrl) + '" target="_blank" rel="noopener" style="color:' + COLORS.brandA + ';text-decoration:none;font-weight:600;">📄 View Resume / CV</a>' : '—') +
    detailRow('Cover Letter', coverHtml, true) +
    '</table></td></tr>' +
    footer(legalUrls)

  return {
    subject: 'New Application: ' + info.applicantName + ' for ' + info.jobTitle,
    html: layout(body),
    text: 'New Application Received\n\nApplicant: ' + info.applicantName + '\nEmail: ' + info.email + '\nPhone: ' + info.phone + '\nPosition: ' + info.jobTitle + '\nCategory: ' + info.jobCategory + '\nLocation: ' + info.jobLocation + '\nResume: ' + info.resumeUrl + '\n\nView in Admin: ' + adminUrl,
  }
}

/* ─────── Admin Notification: Status Change ─────── */

export interface AdminStatusChangeInfo {
  applicantName: string
  email: string
  jobTitle: string
  oldStatus: string
  newStatus: string
  adminNotes: string
  applicationId: string
}

export function buildAdminStatusChangeEmail(info: AdminStatusChangeInfo, legalUrls?: LegalUrls): BuiltEmail {
  const nameSafe = escapeHtml(info.applicantName || 'Unknown')
  const emailSafe = escapeHtml(info.email || '')
  const jobSafe = escapeHtml(info.jobTitle || 'Unknown Position')
  const oldStatusLabel = escapeHtml(info.oldStatus || '—').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const newStatusLabel = escapeHtml(info.newStatus || '—').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const notesSafe = info.adminNotes ? escapeHtml(info.adminNotes).replace(/\n/g, '<br>') : '—'
  const adminUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com') + '/admin/career'

  const body =
    header('Application Status Updated') +
    '<tr><td style="padding:36px 36px 8px 36px;"><h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;color:' + COLORS.text + ';font-weight:700;">Status Updated: ' + nameSafe + '</h1><p style="margin:0 0 22px 0;font-size:16px;line-height:24px;color:' + COLORS.muted + ';">The application status for <strong>' + jobSafe + '</strong> has been changed.</p></td></tr>' +
    '<tr><td style="padding:0 36px 8px 36px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border:1px solid ' + COLORS.border + ';border-radius:12px;"><tr><td style="padding:18px 22px;text-align:center;"><div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:' + COLORS.muted + ';margin-bottom:8px;">Status Change</div><div style="display:inline-block;padding:6px 16px;border-radius:999px;font-size:14px;font-weight:600;color:' + COLORS.muted + ';background:#e5e7eb;margin:0 4px;">' + oldStatusLabel + '</div><span style="font-size:20px;color:' + COLORS.muted + ';margin:0 8px;">→</span><div style="display:inline-block;padding:6px 16px;border-radius:999px;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,' + COLORS.brandA + ',' + COLORS.brandB + ');margin:0 4px;">' + newStatusLabel + '</div></td></tr></table></td></tr>' +
    '<tr><td style="padding:24px 36px 8px 36px;"><h2 style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">Details</h2><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + COLORS.border + ';border-radius:12px;overflow:hidden;">' +
    detailRow('Applicant', nameSafe) +
    detailRow('Email', '<a href="mailto:' + emailSafe + '" style="color:' + COLORS.brandA + ';text-decoration:none;">' + emailSafe + '</a>') +
    detailRow('Position', jobSafe) +
    detailRow('Admin Notes', notesSafe, true) +
    '</table></td></tr>' +
    footer(legalUrls)

  return {
    subject: 'Application status updated: ' + info.applicantName + ' → ' + newStatusLabel,
    html: layout(body),
    text: 'Status Updated\n\nApplicant: ' + info.applicantName + '\nEmail: ' + info.email + '\nPosition: ' + info.jobTitle + '\nOld Status: ' + oldStatusLabel + '\nNew Status: ' + newStatusLabel + '\nNotes: ' + info.adminNotes + '\n\nView in Admin: ' + adminUrl,
  }
}

/* ─────── Admin Alert: Failed Login Attempt ─────── */

export interface FailedLoginInfo {
  username: string
  ip: string
  userAgent: string
  reason: string
  attemptTime: string
  location?: string
  attemptsInWindow?: number
}

export function buildFailedLoginAlertEmail(info: FailedLoginInfo, legalUrls?: LegalUrls): BuiltEmail {
  const usernameSafe = escapeHtml(info.username || 'unknown')
  const ipSafe = escapeHtml(info.ip || 'unknown')
  const reasonLabel = info.reason === 'invalid_password' ? 'Wrong Password'
    : info.reason === 'invalid_credentials' ? 'Invalid Credentials'
    : info.reason === 'missing_credentials' ? 'Missing Credentials'
    : info.reason === 'sub_admin_disabled' ? 'Disabled Account'
    : info.reason === 'invalid_username' ? 'Unknown Username'
    : escapeHtml(info.reason || 'Unknown')
  const timeSafe = escapeHtml(info.attemptTime || new Date().toISOString())
  const uaSafe = escapeHtml(info.userAgent || '—')
  const locationSafe = info.location ? escapeHtml(info.location) : '—'

  const body =
    header('⚠️ Failed Login Attempt') +
    '<tr><td style="padding:36px 36px 8px 36px;">' +
    '<h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;color:' + COLORS.text + ';font-weight:700;">Failed Admin Login Attempt</h1>' +
    '<p style="margin:0 0 22px 0;font-size:16px;line-height:24px;color:' + COLORS.muted + ';">' +
    'Someone attempted to log into the admin panel with incorrect credentials. ' +
    'If this was not you, please review the details below and take action if needed.' +
    '</p></td></tr>' +
    '<tr><td style="padding:0 36px 8px 36px;">' +
    '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.25);border-radius:12px;">' +
    '<tr><td style="padding:18px 22px;text-align:center;">' +
    '<div style="display:inline-block;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;background:rgba(239,68,68,0.12);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);">' + reasonLabel + '</div>' +
    '</td></tr></table></td></tr>' +
    '<tr><td style="padding:24px 36px 8px 36px;">' +
    '<h2 style="margin:0 0 14px 0;font-size:15px;font-weight:700;color:' + COLORS.text + ';text-transform:uppercase;letter-spacing:.08em;">Attempt Details</h2>' +
    '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid ' + COLORS.border + ';border-radius:12px;overflow:hidden;">' +
    detailRow('Time', timeSafe) +
    detailRow('Username Attempted', usernameSafe) +
    detailRow('IP Address', ipSafe) +
    detailRow('Location', locationSafe) +
    detailRow('User Agent', uaSafe, true) +
    '</table></td></tr>' +
    (info.attemptsInWindow !== undefined
      ? '<tr><td style="padding:16px 36px 0 36px;"><div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 20px;"><div style="font-size:13px;font-weight:700;color:#ef4444;margin-bottom:4px;">🔴 ' + String(info.attemptsInWindow) + ' failed attempts in the last 15 minutes</div><p style="font-size:13px;color:' + COLORS.muted + ';line-height:1.5;margin:0;">If these continue, consider temporarily locking the account or changing the password from the admin panel.</p></div></td></tr>'
      : '') +
    '<tr><td align="center" style="padding:24px 36px 32px 36px;">' +
    '<a href="' + SITE_URL + '/admin/login-logs" style="background:linear-gradient(135deg,' + COLORS.brandA + ' 0%,' + COLORS.brandB + ' 100%);border-radius:8px;color:' + COLORS.buttonText + ';display:inline-block;font-weight:600;padding:14px 32px;text-decoration:none;font-size:15px;">View Login Logs</a>' +
    '</td></tr>' +
    footer(legalUrls)

  const html = layout(body)
  const text =
    '⚠️ Failed Admin Login Attempt\n\n' +
    'Someone attempted to log into the admin panel with incorrect credentials.\n\n' +
    'Reason: ' + reasonLabel + '\n' +
    'Time: ' + timeSafe + '\n' +
    'Username Attempted: ' + usernameSafe + '\n' +
    'IP Address: ' + ipSafe + '\n' +
    'Location: ' + locationSafe + '\n' +
    'User Agent: ' + uaSafe + '\n\n' +
    'View Login Logs: ' + SITE_URL + '/admin/login-logs\n' +
    '---\n' +
    'Digisharks Communications\n' +
    SITE_URL + '\n'

  return {
    subject: '⚠️ Failed Admin Login Attempt — ' + usernameSafe + ' (' + reasonLabel + ')',
    html,
    text,
  }
}

export function buildSeoAuditReportEmail(report: SeoAuditReport, legalUrls?: LegalUrls): BuiltEmail {
  const firstName = (report.name || '').split(' ')[0] || report.name || 'there'
  const subject = 'Your SEO Audit Report for ' + escapeHtml(report.domain) + ' is Ready!'
  const html = buildSeoAuditHtml(report, legalUrls)
  const text =
    'Hi ' + firstName + ',\n\n' +
    'Your SEO audit report for ' + report.domain + ' is ready!\n\n' +
    'Overall Score: ' + report.avgScore + '/100 (' + report.overall + ')\n\n' +
    '--- Quick Summary ---\n' +
    report.checks
      .map((c) => {
        const scoreStr = c.score !== undefined ? ' (' + c.score + ')' : ''
        return c.name + ': ' + c.status.toUpperCase() + scoreStr
      })
      .join('\n') +
    '\n\n' +

    'Need help improving your scores? Our SEO experts can help.\n' +
    'Contact us at ' + SITE_URL + '/contact-us or call +91 96273 32332.\n\n' +
    '---\n' +
    'Digisharks Communications\n' +
    SITE_URL + '\n'

  return { subject, html, text }
}