import { NextRequest, NextResponse } from 'next/server'
import { getQueriesCollection, ContactQuery } from '@/lib/db'
import { buildContactConfirmationEmail } from '@/lib/email-templates'
import { sendMail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, phone, service, message } = body || {}

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'fullName, email and message are required' },
        { status: 400 }
      )
    }

    // basic email check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))
    if (!emailOk) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const now = new Date()
    const doc: ContactQuery = {
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      service: service ? String(service).trim() : 'Other',
      message: String(message).trim(),
      status: 'pending',
      comments: [],
      createdAt: now,
      updatedAt: now,
    }

    const collection = await getQueriesCollection()
    const result = await collection.insertOne(doc)

    // Build the branded confirmation email and send it. We don't fail the
    // API call if email sending fails - the enquiry is already safely
    // persisted to the database.
    let emailStatus: { sent: boolean; mode?: string; error?: string } = { sent: false }
    try {
      const built = buildContactConfirmationEmail({
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        service: doc.service,
        message: doc.message,
      })
      const sendResult = await sendMail({
        to: doc.email,
        subject: built.subject,
        html: built.html,
        text: built.text,
      })
      emailStatus = { sent: sendResult.ok, mode: sendResult.mode, error: sendResult.error }
    } catch (emailErr: any) {
      console.error('Contact confirmation email failed:', emailErr)
      emailStatus = { sent: false, error: emailErr?.message || String(emailErr) }
    }

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId.toString(),
        email: emailStatus,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/contact error', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
