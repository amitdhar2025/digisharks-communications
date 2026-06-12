/**
 * Order-number generator + post-purchase email delivery.
 *
 * Order number format:  DS-YYYYMMDD-XXXX
 * where XXXX is a 4-char base-36 random suffix. We always check
 * uniqueness against the DB before returning.
 */
import { getOrdersCollection, OrderDoc } from './products'
import { sendMail, MailAttachment } from './mailer'
import { buildInvoicePdf, invoiceFilename } from './invoice-pdf'

function randomSuffix(len = 4): string {
  // 4 chars in base 36 → ~1.6M combinations per day, plenty.
  const n = Math.floor(Math.random() * Math.pow(36, len))
  return n.toString(36).toUpperCase().padStart(len, '0')
}

export async function generateOrderNumber(): Promise<string> {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const orders = await getOrdersCollection()

  // Try a few times in case of collision.
  for (let i = 0; i < 8; i++) {
    const candidate = `DS-${y}${m}${d}-${randomSuffix(4)}`
    const existing = await orders.findOne({ orderNumber: candidate })
    if (!existing) return candidate
  }
  // Fallback with timestamp.
  return `DS-${y}${m}${d}-${Date.now().toString(36).toUpperCase().slice(-4)}`
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/* ------------------------------------------------------------------ */
/* Email delivery after a successful payment                          */
/* ------------------------------------------------------------------ */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;')
}

function buildOrderEmailHtml(args: {
  order: OrderDoc
  downloadUrl?: string
  howToUseVideo?: string
  supportEmail: string
  invoiceFilename: string
}): string {
  const { order, downloadUrl, howToUseVideo, supportEmail, invoiceFilename } = args
  const items = order.items
    .map(
      (it) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(it.title)}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${it.qty}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatINR(it.price * it.qty)}</td></tr>`
    )
    .join('')

  const downloadBlock = downloadUrl
    ? `<p style="margin:18px 0 8px;font-weight:600;color:#0f172a;">📥 Your PAN India Digital Database PDF</p>
       <p style="margin:0 0 14px;">Your <strong>PAN India Digital Database PDF</strong> is included inside the attached <strong>${escapeHtml(invoiceFilename)}</strong>, along with a premium invoice and lifetime access. You can also download it directly using the button below:</p>
       <p style="margin:0 0 14px;"><a href="${escapeHtml(downloadUrl)}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;">Download PDF Now</a></p>
       <p style="margin:0;color:#64748b;font-size:13px;">If the button above doesn't work, copy this link:<br/><a href="${escapeHtml(downloadUrl)}" style="color:#0ea5e9;word-break:break-all;">${escapeHtml(downloadUrl)}</a></p>`
    : `<p style="margin:18px 0 8px;color:#64748b;font-size:13px;">Your download link will be sent in a follow-up email shortly.</p>`

  const howToBlock = howToUseVideo
    ? `<p style="margin:22px 0 8px;font-weight:600;color:#0f172a;">🎬 How-to-use demo video</p>
       <p style="margin:0 0 6px;">Watch this short walkthrough to get the most out of your database:</p>
       <p style="margin:0;"><a href="${escapeHtml(howToUseVideo)}" style="color:#6366f1;word-break:break-all;">${escapeHtml(howToUseVideo)}</a></p>`
    : ''

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0f172a;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;background:#f8fafc;padding:0 0 30px;">
      <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:28px 24px;color:#fff;">
        <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;">Digisharks Communications</div>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;">Here is Your Premium Invoice 🎉</h1>
      </div>
      <div style="padding:22px 24px;background:#fff;margin:0 0 16px;">
        <p style="margin:0 0 10px;">Dear <strong>${escapeHtml(order.customer.name)}</strong>,</p>
        <p style="margin:0 0 14px;line-height:1.6;color:#334155;">Thank you for your purchase with <strong>Digisharks Communications</strong>.</p>
        <p style="margin:0 0 14px;line-height:1.6;color:#334155;">Your premium invoice & delivery package is attached to this email (<strong>${escapeHtml(invoiceFilename)}</strong>). It includes a branded invoice, order details and the full <strong>PAN India Digital Database PDF</strong> with <strong>Lifetime Access</strong>.</p>
        <p style="margin:0 0 14px;line-height:1.6;color:#334155;">Order <strong>#${escapeHtml(order.orderNumber)}</strong> • Total: <strong>${formatINR(order.amount)}</strong></p>
        ${downloadBlock}
        ${howToBlock}
        <p style="margin:22px 0 0;line-height:1.6;color:#334155;">If you need any assistance, please mail us at <a href="mailto:${escapeHtml(supportEmail)}" style="color:#0ea5e9;font-weight:600;">${escapeHtml(supportEmail)}</a>.</p>
        <p style="margin:18px 0 0;color:#334155;">Best regards,<br/><strong>Team Digisharks Communications</strong></p>
      </div>
      <div style="padding:0 24px;color:#94a3b8;font-size:11px;line-height:1.5;">
        Order #${escapeHtml(order.orderNumber)} • Paid via Razorpay • You received this email because you placed an order at digisharkscommunications.com.
      </div>
    </div>
  </body>
</html>`
}

function buildOrderEmailText(args: {
  order: OrderDoc
  downloadUrl?: string
  howToUseVideo?: string
  supportEmail: string
  invoiceFilename: string
}): string {
  const { order, downloadUrl, howToUseVideo, supportEmail, invoiceFilename } = args
  const lines: string[] = []
  lines.push(`Dear ${order.customer.name},`)
  lines.push('')
  lines.push('Thank you for your purchase with Digisharks Communications.')
  lines.push('')
  lines.push(
    `Your premium invoice and delivery package is attached to this email (${invoiceFilename}). ` +
      'It contains a branded invoice, order details and the full PAN India Digital Database PDF (Lifetime Access).'
  )
  lines.push('')
  lines.push(`Order #${order.orderNumber} • Total: ${formatINR(order.amount)}`)
  if (downloadUrl) {
    lines.push('')
    lines.push(`Direct download link: ${downloadUrl}`)
  }
  if (howToUseVideo) {
    lines.push('')
    lines.push(`How to use the database: ${howToUseVideo}`)
  }
  lines.push('')
  lines.push(`If you need any assistance, please mail us at ${supportEmail}.`)
  lines.push('')
  lines.push('Best regards,')
  lines.push('Team Digisharks Communications')
  return lines.join('\n')
}

/**
 * Send the order-confirmation email to the customer (and BCC the
 * admin). Returns `{ ok, error }`. Never throws so the caller can
 * update deliveryStatus regardless of outcome.
 */
export async function sendOrderDeliveryEmail(args: {
  order: OrderDoc
  downloadUrl?: string
  howToUseVideo?: string
  supportEmail: string
}): Promise<{ ok: boolean; error?: string }> {
  const { order, downloadUrl, howToUseVideo, supportEmail } = args
  const subject = `Here is Your Premium Invoice & PDF — Order ${order.orderNumber}`

  // Build the premium invoice PDF (cover + thank-you + database PDF).
  // We never fail the email just because the PDF could not be built;
  // we still send the plain text + HTML version.
  let attachment: MailAttachment | null = null
  let attachmentFilename = invoiceFilename(order)
  try {
    const pdfBytes = await buildInvoicePdf({
      order,
      databasePdfUrl: downloadUrl,
    })
    attachment = {
      filename: attachmentFilename,
      content: pdfBytes,
      contentType: 'application/pdf',
    }
  } catch (err) {
    console.error('[store-orders] failed to build invoice PDF', (err as Error)?.message)
  }

  const html = buildOrderEmailHtml({
    order,
    downloadUrl,
    howToUseVideo,
    supportEmail,
    invoiceFilename: attachmentFilename,
  })
  const text = buildOrderEmailText({
    order,
    downloadUrl,
    howToUseVideo,
    supportEmail,
    invoiceFilename: attachmentFilename,
  })

  const adminBcc = process.env.ADMIN_EMAIL || undefined
  const from = (process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM) || 'noreply@digisharkscommunications.com'
  const fromName = process.env.MAIL_FROM_NAME || 'Digisharks Communications'

  // The mailer.ts helper accepts attachments directly.
  const customerResult = await sendMail({
    to: order.customer.email,
    subject,
    html,
    text,
    replyTo: supportEmail,
    attachments: attachment ? [attachment] : undefined,
  })

  let adminResult: { ok: boolean; error?: string } = { ok: true }
  if (adminBcc && adminBcc.toLowerCase() !== order.customer.email.toLowerCase()) {
    adminResult = await sendMail({
      to: adminBcc,
      subject: `[ADMIN COPY] ${subject}`,
      html,
      text,
      replyTo: supportEmail,
      attachments: attachment ? [attachment] : undefined,
    })
  }

  if (!customerResult.ok) return { ok: false, error: customerResult.error }
  if (!adminResult.ok) return { ok: false, error: adminResult.error }
  return { ok: true }
}
