import nodemailer, { Transporter } from 'nodemailer'
import type { Attachment } from 'nodemailer/lib/mailer'

const FROM_NAME = process.env.MAIL_FROM_NAME || 'Digisharks Communications'
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'noreply@digisharkscommunications.com'

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'

  // If no SMTP configured, fall back to a JSON transport that captures
  // the email and returns it in the sendMail callback. Useful for dev.
  if (!host || !user || !pass) {
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
  return cachedTransporter
}

export interface MailAttachment {
  /** File name shown in the mail client. */
  filename: string
  /** Raw file content. */
  content: Uint8Array | Buffer
  /** Optional mime type, e.g. "application/pdf". */
  contentType?: string
}

export interface SendArgs {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  /** Optional file attachments. */
  attachments?: MailAttachment[]
  /** Optional override for "from" email (e.g. billing@). */
  fromEmail?: string
  /** Optional override for "from" name. */
  fromName?: string
}

export interface SendResult {
  ok: boolean
  mode: 'smtp' | 'console'
  preview?: string
  info?: unknown
  error?: string
}

export async function sendMail(args: SendArgs): Promise<SendResult> {
  const transporter = getTransporter()

  if (!transporter) {
    // Dev fallback: log the email to the server console so the
    // developer can see it in the dev-server terminal.
    console.log('\n========== EMAIL (dev mode - no SMTP configured) ==========')
    console.log('From:    ' + (args.fromName || FROM_NAME) + ' <' + (args.fromEmail || FROM_EMAIL) + '>')
    console.log('To:      ' + args.to)
    console.log('Subject: ' + args.subject)
    console.log('Reply-To: ' + (args.replyTo || 'n/a'))
    if (args.attachments?.length) {
      console.log(
        'Attachments: ' +
          args.attachments.map((a) => `${a.filename} (${a.content.byteLength} bytes)`).join(', ')
      )
    }
    console.log('--- HTML (first 600 chars) ---')
    console.log(args.html.substring(0, 600) + '...')
    console.log('=============================================================\n')
    return { ok: true, mode: 'console', preview: args.html.substring(0, 600) }
  }

  try {
    // Helps catch SMTP auth/host/port issues early in Vercel serverless.
    await transporter.verify()

    const attachments: Attachment[] = (args.attachments || []).map((a) => ({
      filename: a.filename,
      content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
      contentType: a.contentType,
    }))

    const info = await transporter.sendMail({
      from:
        '"' + (args.fromName || FROM_NAME) + '" <' + (args.fromEmail || FROM_EMAIL) + '>',
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
      attachments,
    })

    const anyInfo = info as any
    console.log('sendMail success:', {
      to: args.to,
      accepted: anyInfo?.accepted,
      rejected: anyInfo?.rejected,
      envelope: anyInfo?.envelope,
      response: anyInfo?.response,
      messageId: anyInfo?.messageId,
      attachmentCount: attachments.length,
    })

    return { ok: true, mode: 'smtp', info }
  } catch (err: any) {
    console.error('sendMail error:', {
      to: args.to,
      message: err?.message || String(err),
      stack: err?.stack,
    })
    return { ok: false, mode: 'smtp', error: err?.message || String(err) }
  }
}

export const FROM = FROM_EMAIL
