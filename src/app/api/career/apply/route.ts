import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'
import CareerJob from '@/lib/models/CareerJob'
import { sendMail } from '@/lib/mailer'
import { buildAdminNewApplicationEmail } from '@/lib/email-templates'
import slugify from 'slugify'
import { v2 as cloudinary } from 'cloudinary'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { validateFile } from '@/lib/validateFile'
import { stripHtml } from '@/lib/sanitize'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/career/apply - Submit a job application
export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 applications per minute per IP
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(ip, 5)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
    }

    await connectMongoose()

    const formData = await req.formData()
    const jobId = formData.get('jobId') as string
    const applicantName = (formData.get('applicantName') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim() || ''
    const coverLetter = (formData.get('coverLetter') as string)?.trim() || ''
    const resumeFile = formData.get('resume') as File | null

    // Validate required fields
    if (!jobId || !applicantName || !email) {
      return NextResponse.json({ error: 'Job ID, name and email are required' }, { status: 400 })
    }

    if (!resumeFile || resumeFile.size === 0) {
      return NextResponse.json({ error: 'Resume/CV is required' }, { status: 400 })
    }

    // Validate resume file type via magic bytes
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer())
    const fileCheck = await validateFile(resumeBuffer, resumeFile.type)
    if (!fileCheck.valid) {
      return NextResponse.json({ error: fileCheck.error }, { status: 400 })
    }

    // Validate job exists and is active
    const job = await CareerJob.findById(jobId).lean()
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.status !== 'active' || !job.isActive) {
      return NextResponse.json({ error: 'This position is no longer accepting applications' }, { status: 400 })
    }

    // Sanitize plain-text input fields
    const safeName = stripHtml(applicantName)
    const safeEmail = stripHtml(email)
    const safePhone = stripHtml(phone)
    const safeCoverLetter = stripHtml(coverLetter)

    // Upload resume to Cloudinary
    const buffer = resumeBuffer
    const fileExt = resumeFile.name.split('.').pop() || 'pdf'
    const fileName = `career/${slugify(safeName, { lower: true })}-${Date.now()}.${fileExt}`

    let resumeUrl = ''
    let resumePublicId = ''

    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            public_id: fileName.replace(/\.[^.]+$/, ''),
            folder: 'digisharks/career',
            format: fileExt,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })
      resumeUrl = uploadResult.secure_url
      resumePublicId = uploadResult.public_id
    } catch (uploadErr) {
      console.error('Resume upload failed:', uploadErr)
      return NextResponse.json({ error: 'Failed to upload resume. Please try again.' }, { status: 500 })
    }

    // Create application
    const application = new CareerApplication({
      jobId,
      applicantName: safeName,
      email: safeEmail,
      phone: safePhone,
      coverLetter: safeCoverLetter,
      resumeUrl,
      resumePublicId,
      status: 'under-review',
    })

    await application.save()

    // Notify admin about new application
    // Use SMTP_USER as FROM so Gmail doesn't filter the email (Gmail silently drops
    // mail sent FROM a different domain TO the same authenticated account)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER
    if (ADMIN_EMAIL) {
      try {
        const adminEmail = buildAdminNewApplicationEmail({
          applicantName,
          email,
          phone,
          jobTitle: (job as any).title || 'Unknown Position',
          jobCategory: (job as any).category || '',
          jobLocation: (job as any).location || '',
          coverLetter,
          resumeUrl,
          applicationId: String(application._id),
        })
        const adminResult = await sendMail({
          to: ADMIN_EMAIL,
          subject: adminEmail.subject,
          html: adminEmail.html,
          text: adminEmail.text,
          // Send from the SMTP user's email so Gmail doesn't flag it
          fromEmail: process.env.SMTP_USER || undefined,
          fromName: 'Digisharks Career (Admin)',
        })
        console.log('Admin notification sent:', { to: ADMIN_EMAIL, ok: adminResult.ok })
        if (!adminResult.ok) {
          console.error('Admin notification failed:', adminResult.error)
        }
      } catch (adminErr) {
        console.error('Admin notification error:', adminErr)
      }
    } else {
      console.log('ADMIN_EMAIL not set — skipping admin notification')
    }

    // Send confirmation email to applicant
    try {
      const confirmationHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0b1220, #0f172a); padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Application Received! 🎉</h1>
          </div>
          <div style="background: #fff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #1f2937;">Hi <strong>${applicantName.replace(/</g, '&lt;')}</strong>,</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
              Thank you for applying for the position of <strong>${(job as any).title?.replace(/</g, '&lt;') || 'Unknown Position'}</strong> at Digisharks Communications.
            </p>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #065f46;">
                ✅ Your application has been submitted successfully. Our HR team will review your application and get back to you soon.
              </p>
            </div>
            <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 20px;">
              <p style="font-size: 13px; color: #6b7280; margin: 0;">
                <strong>Digisharks Communications</strong><br>
                B-2, C-87, C Block, Sector 63, Noida, UP 201301<br>
                marketing@digisharkscommunications.com
              </p>
            </div>
          </div>
        </div>
      `

      const appResult = await sendMail({
        to: email,
        subject: `Application Received — ${(job as any).title || 'Job'} at Digisharks`,
        html: confirmationHtml,
        text: `Hi ${applicantName},\n\nThank you for applying for the position of ${(job as any).title || 'Unknown Position'} at Digisharks Communications.\n\nYour application has been submitted successfully. Our HR team will review your application and get back to you soon.\n\nBest regards,\nDigisharks Communications`,
      })
      console.log('Applicant confirmation sent:', { to: email, ok: appResult.ok })
      if (!appResult.ok) {
        console.error('Applicant confirmation failed:', appResult.error)
      }
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review your application and get back to you.',
    }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/career/apply error', err)
    return NextResponse.json({ error: err.message || 'Failed to submit application' }, { status: 500 })
  }
}
