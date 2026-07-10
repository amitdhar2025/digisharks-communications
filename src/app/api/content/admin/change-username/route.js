/**
 * CMS Admin Change Username API
 *
 * POST /api/content/admin/change-username
 *
 * Accepts { currentPassword, newUsername }, verifies the current
 * password, and updates to the new username. Re-issues the JWT cookie.
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import AdminUser from '@/models/AdminUser'
import { connectCMSDb } from '@/lib/db-cms'
import { getCMSAdminFromCookies, signCMSToken, setCMSCookie } from '@/lib/auth-cms'
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

    const { currentPassword, newUsername } = await req.json()

    if (!currentPassword || !newUsername) {
      return NextResponse.json(
        { error: 'Current password and new username are required' },
        { status: 400 }
      )
    }

    const trimmedUsername = newUsername.trim().toLowerCase()
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (trimmedUsername.length > 100) {
      return NextResponse.json(
        { error: 'Username must not exceed 100 characters' },
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

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, adminUser.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      )
    }

    // Check if new username is already taken (excluding current user)
    const existingUser = await AdminUser.findOne({
      username: trimmedUsername,
      _id: { $ne: adminUser._id },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Update username
    await AdminUser.updateOne(
      { _id: adminUser._id },
      { $set: { username: trimmedUsername } }
    )

    console.log('[cms] CMS admin username changed:', {
      oldUsername: admin.username,
      newUsername: trimmedUsername,
    })

    // Re-issue JWT with new username and update cookie
    const newToken = signCMSToken(trimmedUsername)
    await setCMSCookie(newToken)

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
        subject: 'Digisharks CMS — Username Changed',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0b1220; padding: 32px 24px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(245,158,11,0.35);">
                Username Changed
              </div>
            </div>
            <h1 style="color: #f1f5f9; font-size: 22px; margin: 0 0 16px; text-align: center;">
              Your CMS admin username has been changed
            </h1>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
              The CMS admin account username was changed from <strong style="color: #e2e8f0;">${admin.username}</strong> to <strong style="color: #e2e8f0;">${trimmedUsername}</strong>.
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
              Use your new username to log in next time.
            </p>
          </div>
        `,
        text: `Your CMS admin username has been changed.\\n\\nOld username: ${admin.username}\\nNew username: ${trimmedUsername}\\n\\nUse your new username to log in next time.`,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Username changed successfully. A confirmation email has been sent. Please use your new username next time you log in.',
      username: trimmedUsername,
    })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/change-username error:', err)
    return NextResponse.json(
      { error: 'Failed to change username' },
      { status: 500 }
    )
  }
}
