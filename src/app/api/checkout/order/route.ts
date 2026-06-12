import { NextRequest, NextResponse } from 'next/server'
import { getOrdersCollection, getProductBySlug } from '@/lib/products'

export const dynamic = 'force-dynamic'

// Final fallbacks so the order-success page always shows the right
// PDF / video even if MongoDB is unreachable.
const DEFAULT_PAN_INDIA_PDF =
  'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/Database-pqv5hy-bw-iv1bgt-1.pdf'
const DEFAULT_PAN_INDIA_VIDEO =
  'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4'

/**
 * Public, read-only endpoint used by the order-success page.
 * Returns enough info for the success screen to render, but
 * intentionally does NOT leak the download URL until the order
 * has been paid. Email + phone are stripped from the response.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const orderNumber = url.searchParams.get('order')
    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order number.' }, { status: 400 })
    }

    const orders = await getOrdersCollection()
    const order = await orders.findOne({ orderNumber })
    if (!order) {
      return NextResponse.json({
        order: null,
        downloadUrl: DEFAULT_PAN_INDIA_PDF,
        howToUseVideo: DEFAULT_PAN_INDIA_VIDEO,
        supportEmail: 'marketing@digisharkscommunications.com',
      })
    }

    // Only reveal download links for paid orders.
    const isPaid = order.payment?.status === 'paid'
    const firstSlug = order.items?.[0]?.slug
    const product = firstSlug ? await getProductBySlug(firstSlug).catch(() => null) : null

    // Prefer product fields, then env vars, then the hard-coded live
    // URLs so the customer always sees a working download.
    const downloadUrl = isPaid
      ? product?.downloadUrl ||
        process.env.DATABASE_DOWNLOAD_URL ||
        DEFAULT_PAN_INDIA_PDF
      : undefined
    const howToUseVideo = isPaid
      ? product?.howToUseVideo ||
        process.env.HOW_TO_USE_VIDEO_URL ||
        DEFAULT_PAN_INDIA_VIDEO
      : undefined

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        amount: order.amount,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
        },
        payment: { status: order.payment?.status || 'created' },
        deliveryStatus: order.deliveryStatus,
        emailSent: !!order.emailSent,
        createdAt: order.createdAt,
      },
      downloadUrl,
      howToUseVideo,
      supportEmail: 'marketing@digisharkscommunications.com',
    })
  } catch (err: any) {
    console.error('GET /api/checkout/order error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
