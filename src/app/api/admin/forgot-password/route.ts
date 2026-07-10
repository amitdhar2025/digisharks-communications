import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminsCollection } from '@/lib/db'
import { sendMail } from '@/lib/mailer'
import logger from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const providedEmail = String(email || '').trim().toLowerCase()

    if (!providedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify the provided email matches a configured admin notification email
    const configuredEmails = [
      process.env.ADMIN_EMAIL,
      process.env.CMS_ADMIN_EMAIL,
      process.env.SMTP_USER,
      process.env.MAIL_FROM_EMAIL,
    ]
      .filter(Boolean)
      .map((e) => e!.toLowerCase())

    const isEmailValid = configuredEmails.some((e) => e === providedEmail)

    if (!isEmailValid) {
      return NextResponse.json(
        { error: 'The provided email does not match any admin account on file' },
        { status: 403 }
      )
    }

    // Generate a random 12-character alphanumeric password
    // (alphanumeric only to avoid HTML/email escaping issues)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let newPassword = ''
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Find and update all admin accounts (or create from env vars)
    const admins = await getAdminsCollection()
    const allAdmins = await admins.find({}).toArray()

    if (allAdmins.length > 0) {
      await admins.updateMany(
        {},
        { $set: { passwordHash } }
      )
    } else {
      // No admins in DB — create from env var
      const envUser = process.env.ADMIN_USERNAME
      if (envUser) {
        await admins.insertOne({
          username: envUser.toLowerCase(),
          passwordHash,
          createdAt: new Date(),
        })
      }
    }

    // Send the new password to the verified email
    const toEmail = providedEmail

    // Send email with new password
    const subject = 'Digisharks Admin — Password Reset'
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0b1220; padding: 32px 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: rgba(14,165,233,0.15); color: #7dd3fc; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(14,165,233,0.35);">
            Admin Password Reset
          </div>
        </div>
        <h1 style="color: #f1f5f9; font-size: 22px; margin: 0 0 16px; text-align: center;">
          Your admin password has been reset
        </h1>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
            New Password
          </div>
          <div style="font-family: 'Courier New', monospace; font-size: 22px; font-weight: 700; color: #7dd3fc; letter-spacing: 0.05em; word-break: break-all;">
            ${newPassword}
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
          Please log in with this new password and change it after logging in for security purposes.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/login"
             style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Log In to Admin
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
          If you did not request this password reset, please contact the site administrator immediately.
        </p>
      </div>
    `
    const text = `Your admin password has been reset.\n\nNew Password: ${newPassword}\n\nLog in at: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/login\n\nIf you did not request this reset, contact the site administrator immediately.`

    const result = await sendMail({
      to: toEmail,
      subject,
      html,
      text,
    })

    if (!result.ok) {
      logger.error('Forgot-password email send failed', { error: result.error })
      // Still return the password as fallback
      return NextResponse.json({
        success: true,
        message: 'Password reset was successful but email delivery failed. See new password below.',
        newPassword,
        emailError: result.error,
      })
    }

    logger.info('Admin password reset email sent', { to: toEmail })
    return NextResponse.json({
      success: true,
      message: `A new password has been sent to ${toEmail}. Please check your inbox.`,
    })
  } catch (err) {
    logger.error('POST /api/admin/forgot-password error', { error: String(err) })
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
