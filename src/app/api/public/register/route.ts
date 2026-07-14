/**
 * Public Registration API
 *
 * POST /api/public/register — submit a registration form entry
 * Stores form data in the 'registrations' collection and sends
 * a confirmation email to the registrant.
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import Registration from '@/models/Registration'
import RegistrationFormConfig from '@/models/RegistrationFormConfig'
import { sendMail } from '@/lib/mailer'
import SiteSettings from '@/models/SiteSettings'
import { checkSecurity } from '@/lib/anti-spam'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, phone, formData, formSlug, _hp } = body

    // ── Anti-spam check ──
    const securityResult = await checkSecurity({
      req,
      email: email ? String(email).trim().toLowerCase() : undefined,
      formType: 'registration',
      pageUrl: req.headers.get('referer') || '/register',
      honeypotValue: _hp,
    })
    if (!securityResult.allowed) {
      return NextResponse.json({ error: securityResult.message || 'Access denied.' }, { status: 403 })
    }

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // ── Server-side validation against form config (by slug or default) ───
    await connectCMSDb()
    try {
      const query: Record<string, any> = { isEnabled: true }
      if (formSlug) {
        query.$or = [{ slug: formSlug }, { key: formSlug }]
      } else {
        query.key = 'registration-form'
      }
      const config = await RegistrationFormConfig.findOne(query).lean()
      if (config && Array.isArray(config.fields)) {
        const configObj: any = config
        const mergedData = { ...(formData || {}), fullName, email, phone }
        const missingRequired: string[] = []
        for (const field of configObj.fields) {
          if (field.isActive && field.required && !['heading', 'label'].includes(field.type)) {
            const val = mergedData[field.key]
            if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0) || val === false) {
              missingRequired.push(field.label || field.key)
            }
          }
        }
        if (missingRequired.length > 0) {
          return NextResponse.json(
            { error: `Missing required fields: ${missingRequired.join(', ')}` },
            { status: 400 }
          )
        }
      }
    } catch (configErr) {
      console.warn('[public] Could not validate against form config:', configErr)
    }

    await connectCMSDb()

    // Create the registration entry
    const registration = await Registration.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      formData: formData || {},
      formSlug: formSlug || 'registration',
    })

    // ── Send confirmation email ──────────────────────────────────
    const nameSafe = fullName.trim()
    const reference = registration.reference

    // Fetch legal URLs for email footer
    let privacyUrl = '#'
    let termsUrl = '#'
    let refundUrl = '#'
    try {
      const settings = await SiteSettings.findOne({ key: 'global' }).lean()
      if (settings) {
        privacyUrl = settings.privacyPolicyUrl || '#'
        termsUrl = settings.termsUrl || '#'
        refundUrl = settings.refundPolicyUrl || '#'
      }
    } catch { /* ignore */ }

    const subject = `Registration Successful, ${nameSafe}! - Digisharks Communications`
    const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Registration Successful</title></head>
<body style="margin:0;padding:0;background:#0b1220;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#0b1220;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35);">
<tr><td align="center" style="background:linear-gradient(135deg,#0f172a,#111827);padding:36px 24px 28px;">
<div style="display:inline-block;background:rgba(34,197,94,.15);color:#4ade80;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:6px 14px;border-radius:999px;border:1px solid rgba(34,197,94,.35);">Registration Successful</div>
</td></tr>
<tr><td style="padding:36px 36px 8px;">
<h1 style="margin:0 0 12px;font-size:26px;line-height:32px;color:#1f2937;font-weight:700;">Welcome, ${nameSafe}! 🎉</h1>
<p style="margin:0 0 22px;font-size:16px;line-height:24px;color:#6b7280;">Thank you for registering with Digisharks Communications. Your registration has been completed successfully.</p>
</td></tr>
<tr><td style="padding:0 36px 8px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;">
<tr><td style="padding:18px 22px;">
<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#16a34a;margin-bottom:6px;">Reference Number</div>
<div style="font-size:18px;color:#1f2937;font-weight:700;">${reference}</div>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 36px;">
<h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#1f2937;text-transform:uppercase;letter-spacing:.08em;">What happens next?</h2>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td width="32" valign="top" style="padding-top:4px;"><div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">1</div></td><td style="padding:4px 0 14px 12px;font-size:14px;color:#1f2937;line-height:1.5;"><strong>Confirmation.</strong> Your details have been saved in our system.</td></tr>
<tr><td width="32" valign="top" style="padding-top:4px;"><div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">2</div></td><td style="padding:4px 0 14px 12px;font-size:14px;color:#1f2937;line-height:1.5;"><strong>Review.</strong> Our team will review your submission.</td></tr>
<tr><td width="32" valign="top" style="padding-top:4px;"><div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">3</div></td><td style="padding:4px 0 14px 12px;font-size:14px;color:#1f2937;line-height:1.5;"><strong>Connect.</strong> We'll reach out to you with further details.</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:18px 36px 32px;">
<a href="${SITE_URL}/contact-us" style="background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:8px;color:#ffffff;display:inline-block;font-weight:600;padding:14px 32px;text-decoration:none;font-size:15px;">Contact Us</a>
</td></tr>
<tr><td style="background:#f3f4f6;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
<div style="font-size:13px;color:#6b7280;line-height:1.6;">
<strong style="color:#1f2937;">Digisharks Communications</strong><br>
B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301<br>
Phone: <a href="tel:+919627332332" style="color:#0ea5e9;text-decoration:none;">+91 96273 32332</a> &middot; Email: <a href="mailto:marketing@digisharkscommunications.com" style="color:#0ea5e9;text-decoration:none;">marketing@digisharkscommunications.com</a>
</div>
<div style="margin-top:14px;">
<a href="${privacyUrl}" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 8px;">Privacy Policy</a> &middot;
<a href="${termsUrl}" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 8px;">Terms and Conditions</a> &middot;
<a href="${refundUrl}" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 8px;">Refund Policy</a>
</div>
<div style="margin-top:14px;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} Digisharks Communications. All rights reserved.</div>
</td></tr>
</table></td></tr></table></body></html>`

    const text = `Hi ${nameSafe},\n\nThank you for registering with Digisharks Communications. Your registration has been completed successfully.\n\nReference: ${reference}\n\n--- What happens next? ---\n1. Confirmation. Your details have been saved in our system.\n2. Review. Our team will review your submission.\n3. Connect. We'll reach out to you with further details.\n\nContact us: ${SITE_URL}/contact-us\nPhone: +91 96273 32332\nEmail: marketing@digisharkscommunications.com\n\n---\nDigisharks Communications\nB-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301`

    const sendResult = await sendMail({
      to: email.trim(),
      subject,
      html,
      text,
    })

    // Update email sent status
    if (sendResult.ok) {
      registration.emailSent = true
      registration.emailSentAt = new Date()
    } else {
      registration.emailError = sendResult.error || 'Email send failed'
    }
    await registration.save()

    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully!',
      reference: registration.reference,
      emailSent: sendResult.ok,
    })
  } catch (err: any) {
    console.error('[public] POST /api/public/register error:', err)
    return NextResponse.json(
      { error: err.message || 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
