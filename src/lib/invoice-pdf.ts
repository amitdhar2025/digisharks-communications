/**
 * Premium invoice + delivery PDF generator for Digisharks Communications.
 *
 * Generates a single, professionally styled PDF document that includes:
 *   - Branded cover page with logo, order details, and a Code-128 barcode
 *   - Order summary table (items, qty, price, totals)
 *   - Customer & payment information
 *   - Terms, support details, and signature line
 *   - All pages of the original database PDF merged in
 *
 * Uses:
 *   - pdf-lib        → PDF construction / merging
 *   - bwip-js        → barcode generation (no native deps)
 *
 * Output: a single Uint8Array (PDF binary) that can be attached to the
 * delivery email or streamed to the browser as a download.
 */
// @ts-expect-error bwip-js has no first-party types; we use a small wrapper below.
import bwipjs from 'bwip-js'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'
import type { OrderDoc } from './products'

const COMPANY = {
  name: 'Digisharks Communications',
  tagline: 'Premium Digital Data Solutions',
  address: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301',
  email: 'marketing@digisharkscommunications.com',
  supportEmail: 'marketing@digisharkscommunications.com',
  phone: '+91 96273 32332',
  website: 'www.digisharkscommunications.com',
  gstin: '09ABCDE1234F1Z5',
}

// Brand palette (kept consistent with the website / email templates)
const BRAND = {
  primary: rgb(0.055, 0.647, 0.913),     // #0ea5e9
  secondary: rgb(0.388, 0.4, 0.945),     // #6366f1
  dark: rgb(0.043, 0.071, 0.125),        // #0b1220
  slate: rgb(0.2, 0.255, 0.333),         // #334155
  muted: rgb(0.45, 0.5, 0.58),           // #6b7280
  border: rgb(0.88, 0.9, 0.93),          // #e5e7eb
  success: rgb(0.09, 0.64, 0.29),        // #16a34a
  successBg: rgb(0.93, 0.99, 0.96),      // #ecfdf5
  white: rgb(1, 1, 1),
  offwhite: rgb(0.97, 0.98, 0.99),       // #f8fafc
  text: rgb(0.12, 0.16, 0.22),           // #1f2937
}

interface BuildArgs {
  order: OrderDoc
  /** Optional URL of the customer's database PDF that should be merged in. */
  databasePdfUrl?: string
  /** Optional local file path for the customer's database PDF. */
  databasePdfPath?: string
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function shortDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function safeText(s: string | undefined | null, fallback = '—'): string {
  return s && String(s).trim() ? String(s).trim() : fallback
}

function toAlnum(s: string): string {
  // Code 128 supports ASCII, but bwip-js encodes the raw string safely.
  return s.replace(/[^\x20-\x7E]/g, '')
}

/**
 * Generates a Code 128 barcode as a PNG buffer using bwip-js (no canvas,
 * no native deps — pure JS). We then embed the PNG in the PDF.
 */
async function makeBarcodePng(text: string): Promise<Uint8Array> {
  const buf = (bwipjs as any).toBuffer({
    bcid: 'code128',
    text: toAlnum(text) || 'DS-0000',
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: 'center',
    textsize: 10,
  })
  return buf as Uint8Array
}

/**
 * Try to fetch the database PDF from a URL (WordPress, etc.) and return
 * the bytes, or null on failure. We never throw so that a missing PDF
 * does not block the invoice itself.
 */
async function fetchDatabasePdf(url?: string): Promise<Uint8Array | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) return null
    const buf = new Uint8Array(await res.arrayBuffer())
    if (buf.length < 100) return null
    // PDF files start with %PDF
    const head = new TextDecoder('utf-8').decode(buf.slice(0, 5))
    if (!head.startsWith('%PDF')) return null
    return buf
  } catch {
    return null
  }
}

async function loadDatabasePdf(args: BuildArgs): Promise<Uint8Array | null> {
  if (args.databasePdfPath) {
    try {
      // Restrict local PDF reads to a `data/` subfolder so bundlers like
      // Turbopack can statically scope the require trace.
      const rel = path.posix.normalize(args.databasePdfPath).replace(/^\.\//, '')
      const scoped = rel.startsWith('data/') ? rel : `data/${rel}`
      const abs = path.isAbsolute(scoped)
        ? scoped
        : /* turbopackIgnore: true */ path.join(process.cwd(), scoped)
      const buf = await fs.readFile(abs)
      return new Uint8Array(buf)
    } catch {
      /* fall through to URL */
    }
  }
  return await fetchDatabasePdf(args.databasePdfUrl)
}

/* ------------------------------------------------------------------ */
/* Drawing helpers — keep the page-composer readable                  */
/* ------------------------------------------------------------------ */

interface DrawCtx {
  page: import('pdf-lib').PDFPage
  font: import('pdf-lib').PDFFont
  bold: import('pdf-lib').PDFFont
  italic: import('pdf-lib').PDFFont
}

function drawText(
  ctx: DrawCtx,
  text: string,
  x: number,
  y: number,
  options: {
    size?: number
    color?: import('pdf-lib').Color
    font?: import('pdf-lib').PDFFont
  } = {}
) {
  const size = options.size ?? 10
  const color = options.color ?? BRAND.text
  const font = options.font ?? ctx.font
  ctx.page.drawText(text || '', { x, y, size, font, color })
}

function drawAlignedText(
  ctx: DrawCtx,
  text: string,
  xRight: number,
  y: number,
  options: {
    size?: number
    color?: import('pdf-lib').Color
    font?: import('pdf-lib').PDFFont
  } = {}
) {
  const size = options.size ?? 10
  const font = options.font ?? ctx.font
  const textWidth = font.widthOfTextAtSize(text || '', size)
  ctx.page.drawText(text || '', {
    x: xRight - textWidth,
    y,
    size,
    font,
    color: options.color ?? BRAND.text,
  })
}

function drawRect(
  page: import('pdf-lib').PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  color: import('pdf-lib').Color,
  options: { opacity?: number; borderColor?: import('pdf-lib').Color; borderWidth?: number } = {}
) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color,
    opacity: options.opacity,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth ?? 0,
  })
}

/* ------------------------------------------------------------------ */
/* Cover / invoice page                                                */
/* ------------------------------------------------------------------ */

async function drawCoverPage(
  pdf: PDFDocument,
  ctx: DrawCtx,
  args: BuildArgs,
  barcodePng: Uint8Array
) {
  const { order } = args
  const W = PageSizes.A4[0]
  const H = PageSizes.A4[1]
  const margin = 50

  // White background
  ctx.page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BRAND.white })

  // Top gradient band (approximated with two solid rectangles)
  drawRect(ctx.page, 0, H - 14, W, 14, BRAND.primary)
  drawRect(ctx.page, 0, H - 18, W, 4, BRAND.secondary)

  // Header — company brand block
  let y = H - 60
  drawText(ctx, COMPANY.name.toUpperCase(), margin, y, {
    size: 20,
    font: ctx.bold,
    color: BRAND.primary,
  })
  drawText(ctx, COMPANY.tagline, margin, y - 14, {
    size: 9,
    color: BRAND.muted,
    font: ctx.italic,
  })

  // Document type — right aligned
  drawAlignedText(ctx, 'INVOICE', W - margin, y + 6, {
    size: 26,
    font: ctx.bold,
    color: BRAND.dark,
  })
  drawAlignedText(ctx, 'Premium Digital Delivery', W - margin, y - 10, {
    size: 9,
    color: BRAND.muted,
  })

  // Divider
  y -= 36
  drawRect(ctx.page, margin, y, W - margin * 2, 0.8, BRAND.border)

  // Two-column block: Billed to (left) + Order meta (right)
  y -= 24
  const colW = (W - margin * 2 - 30) / 2

  // LEFT — Billed To
  drawText(ctx, 'BILLED TO', margin, y, {
    size: 9,
    color: BRAND.muted,
    font: ctx.bold,
  })
  let yL = y - 16
  drawText(ctx, safeText(order.customer.name), margin, yL, {
    size: 12,
    font: ctx.bold,
    color: BRAND.text,
  })
  yL -= 14
  drawText(ctx, safeText(order.customer.email), margin, yL, { size: 10, color: BRAND.slate })
  yL -= 12
  drawText(ctx, safeText(order.customer.phone, '—'), margin, yL, {
    size: 10,
    color: BRAND.slate,
  })
  if (order.customer.company) {
    yL -= 12
    drawText(ctx, order.customer.company, margin, yL, { size: 10, color: BRAND.slate })
  }
  if (order.customer.gst) {
    yL -= 12
    drawText(ctx, `GSTIN: ${order.customer.gst}`, margin, yL, {
      size: 10,
      color: BRAND.slate,
    })
  }

  // RIGHT — Order meta
  const xR = margin + colW + 30
  let yR = y
  drawText(ctx, 'ORDER DETAILS', xR, yR, { size: 9, color: BRAND.muted, font: ctx.bold })
  yR -= 16
  drawText(ctx, 'Order #', xR, yR, { size: 9, color: BRAND.muted })
  drawAlignedText(ctx, order.orderNumber, W - margin, yR, {
    size: 11,
    font: ctx.bold,
    color: BRAND.text,
  })
  yR -= 14
  drawText(ctx, 'Order Date', xR, yR, { size: 9, color: BRAND.muted })
  drawAlignedText(ctx, shortDate(order.createdAt), W - margin, yR, {
    size: 10,
    color: BRAND.text,
  })
  yR -= 12
  drawText(ctx, 'Payment', xR, yR, { size: 9, color: BRAND.muted })
  const rawPay = order.payment?.status
  const payStatus: string = rawPay
    ? rawPay.charAt(0).toUpperCase() + rawPay.slice(1)
    : '—'
  drawAlignedText(ctx, payStatus, W - margin, yR, {
    size: 10,
    font: ctx.bold,
    color: payStatus === 'Paid' ? BRAND.success : BRAND.text,
  })
  yR -= 12
  drawText(ctx, 'Method', xR, yR, { size: 9, color: BRAND.muted })
  drawAlignedText(
    ctx,
    (order.payment?.provider || 'razorpay').toUpperCase(),
    W - margin,
    yR,
    { size: 10, color: BRAND.text }
  )
  if (order.payment?.razorpayPaymentId) {
    yR -= 12
    drawText(ctx, 'Txn ID', xR, yR, { size: 9, color: BRAND.muted })
    drawAlignedText(ctx, order.payment.razorpayPaymentId, W - margin, yR, {
      size: 9,
      color: BRAND.slate,
    })
  }

  // Section divider
  y = Math.min(yL, yR) - 22
  drawRect(ctx.page, margin, y, W - margin * 2, 0.6, BRAND.border)

  // Items table header
  y -= 22
  drawText(ctx, 'ITEMS', margin, y, { size: 9, color: BRAND.muted, font: ctx.bold })

  // Table header row
  y -= 18
  const rowH = 22
  drawRect(ctx.page, margin, y - 4, W - margin * 2, rowH, BRAND.offwhite)

  const cols = {
    item: margin + 12,
    qty: W - margin - 220,
    price: W - margin - 130,
    total: W - margin - 12,
  }
  drawText(ctx, 'Description', cols.item, y + 4, {
    size: 9,
    color: BRAND.muted,
    font: ctx.bold,
  })
  drawAlignedText(ctx, 'Qty', cols.qty + 40, y + 4, {
    size: 9,
    color: BRAND.muted,
    font: ctx.bold,
  })
  drawAlignedText(ctx, 'Unit Price', cols.price + 90, y + 4, {
    size: 9,
    color: BRAND.muted,
    font: ctx.bold,
  })
  drawAlignedText(ctx, 'Amount', cols.total, y + 4, {
    size: 9,
    color: BRAND.muted,
    font: ctx.bold,
  })

  // Items
  let subtotal = 0
  for (const it of order.items) {
    y -= rowH
    const lineTotal = it.price * it.qty
    subtotal += lineTotal
    drawText(ctx, safeText(it.title), cols.item, y + 4, {
      size: 10,
      color: BRAND.text,
    })
    drawAlignedText(ctx, String(it.qty), cols.qty + 40, y + 4, {
      size: 10,
      color: BRAND.text,
    })
    drawAlignedText(ctx, formatINR(it.price), cols.price + 90, y + 4, {
      size: 10,
      color: BRAND.text,
    })
    drawAlignedText(ctx, formatINR(lineTotal), cols.total, y + 4, {
      size: 10,
      font: ctx.bold,
      color: BRAND.text,
    })
    drawRect(ctx.page, margin, y - 4, W - margin * 2, 0.4, BRAND.border)
  }

  // Totals
  y -= 26
  const tax = 0 // Digital products currently excluded from GST for this SKU
  const grandTotal = subtotal + tax

  const labelX = W - margin - 200
  const valX = W - margin - 12
  drawText(ctx, 'Subtotal', labelX, y, { size: 10, color: BRAND.muted })
  drawAlignedText(ctx, formatINR(subtotal), valX, y, { size: 10, color: BRAND.text })
  y -= 14
  drawText(ctx, 'Tax (GST)', labelX, y, { size: 10, color: BRAND.muted })
  drawAlignedText(ctx, formatINR(tax), valX, y, { size: 10, color: BRAND.text })
  y -= 6
  drawRect(ctx.page, labelX, y, 200, 0.4, BRAND.border)
  y -= 16
  drawText(ctx, 'Grand Total', labelX, y, { size: 12, font: ctx.bold, color: BRAND.dark })
  drawAlignedText(ctx, formatINR(grandTotal), valX, y, {
    size: 12,
    font: ctx.bold,
    color: BRAND.primary,
  })

  // Barcode section
  y -= 50
  drawText(ctx, 'VERIFICATION', margin, y, {
    size: 9,
    color: BRAND.muted,
    font: ctx.bold,
  })
  y -= 14
  drawText(
    ctx,
    'Scan to verify your order with Digisharks Communications.',
    margin,
    y,
    { size: 9, color: BRAND.muted }
  )

  // Embed barcode image
  try {
    const barcode = await pdf.embedPng(barcodePng)
    const bw = 180
    const bh = (barcode.height / barcode.width) * bw
    ctx.page.drawImage(barcode, {
      x: margin,
      y: y - bh - 4,
      width: bw,
      height: bh,
    })
  } catch {
    // ignore — text fallback below is enough
  }

  // Order reference in plain text under barcode (for humans)
  y -= 75
  drawText(ctx, `Order reference: ${order.orderNumber}`, margin, y, {
    size: 10,
    font: ctx.bold,
    color: BRAND.text,
  })
  y -= 14
  drawText(
    ctx,
    `Generated: ${shortDate(order.createdAt)} · ${COMPANY.website}`,
    margin,
    y,
    { size: 9, color: BRAND.muted }
  )

  // ----- Footer block (terms + signature) -----
  const footerY = 110
  drawRect(ctx.page, margin, footerY + 28, W - margin * 2, 0.6, BRAND.border)
  drawText(ctx, 'TERMS & NOTES', margin, footerY + 14, {
    size: 8,
    color: BRAND.muted,
    font: ctx.bold,
  })
  const terms = [
    '• This is a digitally delivered product; access is granted upon successful payment.',
    '• Lifetime access is included for the originally purchased edition.',
    '• Resale or redistribution of the database is strictly prohibited.',
    '• For support, contact us at ' + COMPANY.supportEmail + ' or ' + COMPANY.phone + '.',
  ]
  let ty = footerY
  for (const t of terms) {
    drawText(ctx, t, margin, ty, { size: 8, color: BRAND.slate })
    ty -= 10
  }

  // Signature line
  const sigY = 56
  drawText(ctx, 'Authorised Signatory', margin, sigY, {
    size: 8,
    color: BRAND.muted,
    font: ctx.bold,
  })
  drawRect(ctx.page, margin, sigY + 14, 180, 0.4, BRAND.border)
  drawText(ctx, 'For Digisharks Communications', margin, sigY + 22, {
    size: 8,
    color: BRAND.muted,
  })

  drawAlignedText(ctx, COMPANY.address, W - margin, sigY + 22, {
    size: 8,
    color: BRAND.muted,
  })
  drawAlignedText(ctx, COMPANY.email + ' · ' + COMPANY.phone, W - margin, sigY + 12, {
    size: 8,
    color: BRAND.muted,
  })
  drawAlignedText(ctx, 'Page 1 of invoice', W - margin, sigY + 2, {
    size: 8,
    color: BRAND.muted,
  })
}

/* ------------------------------------------------------------------ */
/* Optional: standalone "Thank You" page                             */
/* ------------------------------------------------------------------ */

async function drawThankYouPage(
  pdf: PDFDocument,
  ctx: DrawCtx,
  args: BuildArgs
) {
  const { order } = args
  const W = PageSizes.A4[0]
  const H = PageSizes.A4[1]
  const margin = 50

  ctx.page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BRAND.white })

  // Brand bar
  drawRect(ctx.page, 0, H - 10, W, 10, BRAND.primary)

  let y = H - 120
  drawText(ctx, 'THANK YOU', margin, y, {
    size: 36,
    font: ctx.bold,
    color: BRAND.primary,
  })
  y -= 28
  drawText(
    ctx,
    'for your purchase of the PAN India Digital Database.',
    margin,
    y,
    { size: 12, color: BRAND.slate }
  )

  y -= 36
  drawText(ctx, 'What you get', margin, y, {
    size: 10,
    color: BRAND.muted,
    font: ctx.bold,
  })
  y -= 14
  const benefits = [
    '• Full PAN India database in PDF / CSV / XLS — verified & up-to-date',
    '• Lifetime access — re-download anytime at no extra cost',
    '• Free future updates for the same edition',
    '• Priority email support for any questions',
  ]
  for (const b of benefits) {
    drawText(ctx, b, margin, y, { size: 11, color: BRAND.text })
    y -= 14
  }

  y -= 18
  drawText(ctx, 'Need help?', margin, y, {
    size: 10,
    color: BRAND.muted,
    font: ctx.bold,
  })
  y -= 14
  drawText(ctx, 'Email: ' + COMPANY.supportEmail, margin, y, {
    size: 11,
    color: BRAND.text,
  })
  y -= 12
  drawText(ctx, 'Phone: ' + COMPANY.phone, margin, y, {
    size: 11,
    color: BRAND.text,
  })
  y -= 12
  drawText(ctx, 'Web: ' + COMPANY.website, margin, y, {
    size: 11,
    color: BRAND.text,
  })

  // Footer
  drawText(
    ctx,
    `Order #${order.orderNumber} · ${shortDate(order.createdAt)}`,
    margin,
    56,
    { size: 9, color: BRAND.muted }
  )
  drawAlignedText(ctx, 'Page · Thank you', W - margin, 56, {
    size: 9,
    color: BRAND.muted,
  })
}

/* ------------------------------------------------------------------ */
/* Main entry point                                                    */
/* ------------------------------------------------------------------ */

export interface BuildInvoiceOptions {
  /** Set false to skip embedding the database PDF (cover + thank-you only). */
  includeDatabase?: boolean
}

/**
 * Build a single premium PDF document (cover + thank-you + database).
 * Returns the binary Uint8Array suitable for streaming or attaching to email.
 */
export async function buildInvoicePdf(
  args: BuildArgs,
  options: BuildInvoiceOptions = {}
): Promise<Uint8Array> {
  const { includeDatabase = true } = options
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Invoice ${args.order.orderNumber} — ${COMPANY.name}`)
  pdf.setAuthor(COMPANY.name)
  pdf.setSubject(`Invoice & delivery document for order ${args.order.orderNumber}`)
  pdf.setKeywords(['digisharks', 'invoice', args.order.orderNumber, 'pan-india-database'])
  pdf.setProducer(`${COMPANY.name} · PDF Delivery Service`)
  pdf.setCreationDate(new Date())

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  // Cover page
  const cover = pdf.addPage(PageSizes.A4)
  const barcodePng = await makeBarcodePng(args.order.orderNumber)
  await drawCoverPage(pdf, { page: cover, font, bold, italic }, args, barcodePng)

  // Thank-you page
  const thankYou = pdf.addPage(PageSizes.A4)
  await drawThankYouPage(pdf, { page: thankYou, font, bold, italic }, args)

  // Merge customer database PDF (if available)
  if (includeDatabase) {
    const dbBytes = await loadDatabasePdf(args)
    if (dbBytes) {
      try {
        const donor = await PDFDocument.load(dbBytes, { ignoreEncryption: true })
        const copied = await pdf.copyPages(donor, donor.getPageIndices())
        for (const p of copied) pdf.addPage(p)
      } catch (err) {
        // On failure, leave the cover + thank-you in place; the email
        // will still include a premium document.
        console.warn(
          '[invoice-pdf] could not merge database PDF for order',
          args.order.orderNumber,
          (err as Error)?.message
        )
      }
    }
  }

  return await pdf.save()
}

/**
 * A safe, deterministic filename for the customer's invoice.
 */
export function invoiceFilename(order: { orderNumber: string }): string {
  return `Digisharks-Invoice-${order.orderNumber}.pdf`
}
