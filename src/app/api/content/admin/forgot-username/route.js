/**
 * CMS Admin Forgot Username API
 *
 * POST /api/content/admin/forgot-username
 *
 * Accepts { email }, looks up admin usernames from the AdminUser
 * collection, and emails the username(s) to the provided address
 * if it matches a configured admin notification email.
 */

import { NextResponse } from 'next/server'
import AdminUser from '@/models/AdminUser'
import { connectCMSDb } from '@/lib/db-cms'
import { sendMail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { email } = await req.json()
    const userEmail = String(email || '').trim().toLowerCase()

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify the provided email matches a configured admin notification email
    const configuredEmails = [
      process.env.CMS_ADMIN_EMAIL,
      process.env.ADMIN_EMAIL,
      process.env.SMTP_USER,
      process.env.MAIL_FROM_EMAIL,
    ]
      .filter(Boolean)
      .map((e) => e.toLowerCase())

    const isEmailValid = configuredEmails.some((e) => e === userEmail)

    if (!isEmailValid) {
      return NextResponse.json({
        success: true,
        message:
          'If an admin account is associated with this email, the username has been sent.',
      })
    }

    // Connect to database and collect all admin usernames
    await connectCMSDb()
    const allAdmins = await AdminUser.find({}).select('username').lean()
    const usernames = allAdmins.map((a) => a.username).filter(Boolean)

    if (usernames.length === 0) {
      const envUser = process.env.CMS_ADMIN_USERNAME
      if (envUser) {
        usernames.push(envUser)
      }
    }

    if (usernames.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          'If an admin account is associated with this email, the username has been sent.',
      })
    }

    // Send email with username(s)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const subject = 'Digisharks CMS — Username Reminder'
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0b1220; padding: 32px 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: rgba(14,165,233,0.15); color: #7dd3fc; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(14,165,233,0.35);">
            CMS Admin Username Reminder
          </div>
        </div>
        <h1 style="color: #f1f5f9; font-size: 22px; margin: 0 0 16px; text-align: center;">
          Your CMS admin username${usernames.length > 1 ? 's' : ''}
        </h1>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align: center;">
          The following CMS admin account${usernames.length > 1 ? 's are' : ' is'} registered in the system:
        </p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
          ${usernames
            .map(
              (u) =>
                `<div style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #7dd3fc; letter-spacing: 0.05em; padding: 6px 0;${usernames.length > 1 ? ' border-bottom: 1px solid #334155;' : ''}">${u}</div>`
            )
            .join('')}
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
          Use your username along with your password to log in. If you have also forgotten your password,
          use the "Forgot Password" option on the login page.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${siteUrl}/content/admin/login"
             style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Log In to CMS Admin
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
          If you did not request this username reminder, please contact the site administrator immediately.
        </p>
      </div>
    `
    const text = `Your CMS admin username${usernames.length > 1 ? 's' : ''}:\n\n${usernames.join('\n')}\n\nLog in at: ${siteUrl}/content/admin/login\n\nIf you did not request this reminder, contact the site administrator immediately.`

    const result = await sendMail({
      to: userEmail,
      subject,
      html,
      text,
    })

    if (!result.ok) {
      console.error('[cms] Forgot-username email send failed:', result.error)
      return NextResponse.json({
        success: true,
        message:
          'If an admin account is associated with this email, the username has been sent.',
        emailError: result.error,
      })
    }

    console.log('[cms] CMS admin username reminder email sent to:', userEmail)
    return NextResponse.json({
      success: true,
      message:
        'If an admin account is associated with this email, the username has been sent.',
    })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/forgot-username error:', err)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
