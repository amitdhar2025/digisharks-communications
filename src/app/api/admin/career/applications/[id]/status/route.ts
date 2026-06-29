import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'
import CareerJob from '@/lib/models/CareerJob'
import mongoose from 'mongoose'
import { sendMail } from '@/lib/mailer'
import { buildApplicationStatusEmail, buildAdminStatusChangeEmail, type CareerStatus } from '@/lib/email-templates'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/career/applications/[id]/status - Update application status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check edit permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'career', 'edit', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 })
    }

    const body = await req.json()
    const { status: newStatus, adminNotes } = body

    const validStatuses = ['under-review', 'shortlisted', 'under-process', 'selected', 'not-selected']
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const application = await CareerApplication.findById(id).populate('jobId', 'title slug location').lean()
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Update the application
    const updateData: any = {
      status: newStatus,
      statusUpdatedAt: new Date(),
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    await CareerApplication.findByIdAndUpdate(id, { $set: updateData })

    // Send email notification to applicant on any status change
    const jobTitle = (application.jobId as any)?.title || 'Unknown Position'
    const emailData = buildApplicationStatusEmail({
      name: application.applicantName,
      email: application.email,
      jobTitle,
      status: newStatus as CareerStatus,
      adminNotes: adminNotes || '',
    })

    const emailResult = await sendMail({
      to: application.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    }).catch((err) => {
      console.error('Failed to send application status email:', err)
      return { ok: false, error: err?.message }
    })

    // Notify admin about status change
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER
    if (ADMIN_EMAIL) {
      try {
        const adminEmail = buildAdminStatusChangeEmail({
          applicantName: application.applicantName,
          email: application.email,
          jobTitle,
          oldStatus: application.status,
          newStatus,
          adminNotes: adminNotes || '',
          applicationId: id,
        })
        const adminResult = await sendMail({
          to: ADMIN_EMAIL,
          subject: adminEmail.subject,
          html: adminEmail.html,
          text: adminEmail.text,
          fromEmail: process.env.SMTP_USER || undefined,
          fromName: 'Digisharks Career (Admin)',
        })
        console.log('Admin status notification sent:', { to: ADMIN_EMAIL, ok: adminResult.ok })
        if (!adminResult.ok) {
          console.error('Admin status notification failed:', adminResult.error)
        }
      } catch (adminErr) {
        console.error('Admin status notification error:', adminErr)
      }
    } else {
      console.log('ADMIN_EMAIL not set — skipping admin status notification')
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      emailSent: emailResult?.ok || false,
    })
  } catch (err: any) {
    console.error('PATCH /api/admin/career/applications/[id]/status error', err)
    return NextResponse.json({ error: err.message || 'Failed to update status' }, { status: 500 })
  }
}
