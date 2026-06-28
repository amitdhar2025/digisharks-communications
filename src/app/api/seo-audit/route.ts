import { NextRequest, NextResponse } from 'next/server'
import { createPendingAudit, runAuditAndUpdate, markAuditFailed } from '@/lib/seo-audit'
import { sendMail } from '@/lib/mailer'
import { buildSeoAuditReportEmail } from '@/lib/email-templates'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { sanitizePlainTextFields } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 audit requests per minute per IP
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(ip, 5)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
    }

    const body = await req.json()
    const { url, name, email, phone } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a URL to audit.' }, { status: 400 })
    }
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Please provide your email address.' }, { status: 400 })
    }
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Please provide your phone number.' }, { status: 400 })
    }

    // Sanitize plain-text user input
    const sanitized = sanitizePlainTextFields(
      { url: url.trim(), name: name.trim(), email: email.trim(), phone: phone.trim() },
      ['name', 'phone'],
    )

    // 1. Save user details instantly (pending audit)
    const pending = await createPendingAudit(sanitized.url, sanitized.name, sanitized.email, sanitized.phone)

    // 2. Fire off the full audit in the background (don't await)
    runAuditAndUpdate(pending.id, url)
      .then(async (result) => {
        // Send email report after audit completes
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000'

        const resultsUrl = `${siteUrl}/seo-audit/${result.id}`
        const emailContent = buildSeoAuditReportEmail({
          name,
          email,
          url: result.url,
          domain: result.domain,
          overall: result.overall,
          avgScore: result.avgScore,
          checks: result.checks.map((c: any) => ({
            name: c.name,
            status: c.status,
            score: c.score,
            details: c.details,
          })),
          pagespeed: result.pagespeed,
          resultsUrl,
        })

        await sendMail({
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        })
      })
      .catch(async (err) => {
        console.error('Background audit failed:', err)
        try {
          await markAuditFailed(pending.id, err?.message || 'The audit failed to complete.')
        } catch (dbErr) {
          console.error('Failed to update failed audit record:', dbErr)
        }
      })

    // 3. Return immediately with redirect (no waiting for audit)
    return NextResponse.json({
      success: true,
      auditId: pending.id,
      redirect: `/seo-audit/${pending.id}`,
    })
  } catch (err: any) {
    console.error('SEO audit error:', err)
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during the audit.' },
      { status: 500 }
    )
  }
}
