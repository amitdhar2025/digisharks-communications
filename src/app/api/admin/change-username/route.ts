import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminsCollection } from '@/lib/db'
import { getAdminFromCookies, signAdminToken, setAdminCookie } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'
import logger from '@/lib/logger'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookies()
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

    const trimmedUsername = newUsername.trim()
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (trimmedUsername.length > 50) {
      return NextResponse.json(
        { error: 'Username must not exceed 50 characters' },
        { status: 400 }
      )
    }

    const admins = await getAdminsCollection()
    const adminUser = await admins.findOne({ username: admin.username })

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
    const existingUser = await admins.findOne({
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
    await admins.updateOne(
      { _id: adminUser._id },
      { $set: { username: trimmedUsername } }
    )

    logger.info('Admin username changed', {
      oldUsername: admin.username,
      newUsername: trimmedUsername,
    })

    // Re-issue JWT with new username and update cookie
    const newToken = signAdminToken(trimmedUsername)
    await setAdminCookie(newToken)

    // Send email notification
    const toEmail =
      process.env.ADMIN_EMAIL ||
      process.env.CMS_ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      ''

    if (toEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      await sendMail({
        to: toEmail,
        subject: 'Digisharks Admin — Username Changed',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0b1220; padding: 32px 24px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: rgba(245,158,11,0.15); color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(245,158,11,0.35);">
                Username Changed
              </div>
            </div>
            <h1 style="color: #f1f5f9; font-size: 22px; margin: 0 0 16px; text-align: center;">
              Your admin username has been changed
            </h1>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
              The admin account username was changed from <strong style="color: #e2e8f0;">${admin.username}</strong> to <strong style="color: #e2e8f0;">${trimmedUsername}</strong>.
            </p>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 20px; text-align: center;">
              If you did not make this change, please contact the site administrator immediately.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${siteUrl}/admin/login" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Go to Admin Login
              </a>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px;">
              Use your new username to log in next time.
            </p>
          </div>
        `,
        text: `Your admin username has been changed.\\n\\nOld username: ${admin.username}\\nNew username: ${trimmedUsername}\\n\\nUse your new username to log in next time.`,
      })
    }

    logActivity({ event: 'username_change', description: `Admin username changed: ${admin.username} → ${trimmedUsername}`, username: admin.username, dashboard: 'admin' }).catch(() => {})
    return NextResponse.json({
      success: true,
      message: 'Username changed successfully. A confirmation email has been sent. Please use your new username next time you log in.',
      username: trimmedUsername,
    })
  } catch (err) {
    logger.error('POST /api/admin/change-username error', { error: String(err) })
    return NextResponse.json(
      { error: 'Failed to change username' },
      { status: 500 }
    )
  }
}
