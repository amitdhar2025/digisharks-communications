/**
 * CMS Admin Change Password API
 *
 * POST /api/content/admin/change-password
 *
 * Accepts { currentPassword, newPassword }, verifies the current
 * password, and updates to the new password.
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import AdminUser from '@/models/AdminUser'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { sendMail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const admin = await getCMSAdminFromCookies()
    if (!admin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    await connectCMSDb()

    const adminUser = await AdminUser.findOne({ username: admin.username.toLowerCase() })
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, adminUser.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await AdminUser.updateOne(
      { _id: adminUser._id },
      { $set: { passwordHash } }
    )

    console.log('[cms] CMS admin password changed:', admin.username)

    // Send email notification
    const toEmail =
      process.env.CMS_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      ''

    if (toEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      await sendMail({
        to: toEmail,
        subject: 'Digisharks CMS — Password Changed',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0b1220; padding: 32px 24px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: rgba(34,197,94,0.15); color: #4ade80; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(34,197,94,0.35);">
                Password Changed
              </div>
            </div>
            <h1 style="color: #f1f5f9; font-size: 22px; margin: 0 0 16px; text-align: center;">
              Your CMS admin password has been changed
            </h1>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
              The password for CMS admin account <strong style="color: #e2e8f0;">${admin.username}</strong> was successfully changed.
            </p>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 20px; text-align: center;">
              If you did not make this change, please contact the site administrator immediately.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${siteUrl}/content/admin/login" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Go to CMS Admin Login
              </a>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
              This is an automated security notification.
            </p>
          </div>
        `,
        text: `Your CMS admin password has been changed.\n\nAccount: ${admin.username}\n\nIf you did not make this change, contact the site administrator immediately.`,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. A confirmation email has been sent.',
    })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/change-password error:', err)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
