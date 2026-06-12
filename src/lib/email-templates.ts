// Branded HTML email templates for Digisharks Communications.
// Uses String.fromCharCode-based entity construction to avoid HTML stripping.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://digisharks-communications.vercel.app'
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

function footer(): string {
  return '<tr><td style="background:' + COLORS.footerBg + ';padding:24px;text-align:center;border-top:1px solid ' + COLORS.border + ';"><div style="font-size:13px;color:' + COLORS.muted + ';line-height:1.6;"><strong style="color:' + COLORS.text + ';">Digisharks Communications</strong><br>B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301<br>Phone: <a href="tel:+919627332332" style="color:' + COLORS.brandA + ';text-decoration:none;">+91 96273 32332</a> &nbsp;' + ENT.middot + '&nbsp; Email: <a href="mailto:info@digisharkscommunications.com" style="color:' + COLORS.brandA + ';text-decoration:none;">info@digisharkscommunications.com</a></div><div style="margin-top:14px;"><a href="' + SITE_URL + '/about-us" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">About</a> ' + ENT.middot + ' <a href="' + SITE_URL + '/services-top-pr-digital-marketing/" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Services</a> ' + ENT.middot + ' <a href="' + SITE_URL + '/contact-us" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Contact</a> ' + ENT.middot + ' <a href="' + SITE_URL + '/press-release/" style="color:' + COLORS.muted + ';text-decoration:none;font-size:12px;margin:0 8px;">Press</a></div><div style="margin-top:14px;font-size:11px;color:#9ca3af;">' + ENT.copy + ' ' + new Date().getFullYear() + ' Digisharks Communications. All rights reserved.</div></td></tr>'
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

export function buildContactConfirmationEmail(enquiry: ContactEnquiry): BuiltEmail {
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
    footer()

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
    'info@digisharkscommunications.com\n' +
    SITE_URL + '\n'

  return { subject, html, text }
}