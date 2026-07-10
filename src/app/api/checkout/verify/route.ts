import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import {
  getOrdersCollection,
  getProductBySlug,
  OrderDoc,
} from '@/lib/products'
import { sendOrderDeliveryEmail } from '@/lib/store-orders'

export const dynamic = 'force-dynamic'

// Final fallbacks so the customer always gets the actual PDF + video
// even if MongoDB is unreachable or the seed product is missing the
// downloadUrl field.
const DEFAULT_PAN_INDIA_PDF =
  'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/Database-pqv5hy-bw-iv1bgt-1.pdf'
const DEFAULT_PAN_INDIA_VIDEO =
  'https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4'

interface Body {
  orderNumber: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    if (!body?.orderNumber || !body?.razorpayOrderId || !body?.razorpayPaymentId || !body?.razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 })
    }

    const ok = verifyRazorpaySignature({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    })
    if (!ok) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 })
    }

    const orders = await getOrdersCollection()
    const order = await orders.findOne({ orderNumber: body.orderNumber })
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }
    if (order.payment.status === 'paid' && order.payment.razorpayPaymentId) {
      // Idempotent: already verified.
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        alreadyVerified: true,
      })
    }
    if (order.payment.razorpayOrderId && order.payment.razorpayOrderId !== body.razorpayOrderId) {
      return NextResponse.json({ error: 'Order / payment mismatch.' }, { status: 400 })
    }

    const now = new Date()
    await orders.updateOne(
      { _id: order._id },
      {
        $set: {
          payment: {
            ...order.payment,
            status: 'paid',
            razorpayOrderId: body.razorpayOrderId,
            razorpayPaymentId: body.razorpayPaymentId,
            razorpaySignature: body.razorpaySignature,
          },
          updatedAt: now,
        },
      }
    )

    // Refresh the in-memory copy so the email is built from the
    // post-verification state.
    const updated = (await orders.findOne({ _id: order._id })) as OrderDoc | null
    if (!updated) {
      return NextResponse.json({ error: 'Order vanished after verify.' }, { status: 500 })
    }

    // Look up the first product to grab the download + how-to-use links.
    // getProductBySlug falls back to the static seed product when MongoDB
    // is unreachable, so the customer always receives the right PDF.
    const firstSlug = updated.items?.[0]?.slug
    const product = firstSlug ? await getProductBySlug(firstSlug).catch(() => null) : null

    const supportEmail = 'marketing@digisharkscommunications.com'

    // Pick the actual PDF / video links. Prefer product fields, then
    // environment variables, then the hard-coded live URLs so the
    // customer always gets a working download.
    const downloadUrl =
      product?.downloadUrl ||
      process.env.DATABASE_DOWNLOAD_URL ||
      DEFAULT_PAN_INDIA_PDF
    const howToUseVideo =
      product?.howToUseVideo ||
      process.env.HOW_TO_USE_VIDEO_URL ||
      DEFAULT_PAN_INDIA_VIDEO

    // Trigger the delivery email asynchronously, but reflect status
    // in the DB afterwards. We intentionally do NOT block the
    // payment-success response on email.
    void (async () => {
      try {
        const result = await sendOrderDeliveryEmail({
          order: updated,
          downloadUrl,
          howToUseVideo,
          supportEmail,
        })
        await orders.updateOne(
          { _id: updated._id },
          {
            $set: {
              emailSent: result.ok,
              emailSentAt: result.ok ? new Date() : undefined,
              emailError: result.ok ? undefined : (result.error || 'unknown'),
              deliveryStatus: result.ok ? 'delivered' : 'pending',
              updatedAt: new Date(),
            },
          }
        )
      } catch (err: any) {
        console.error('Delivery email error for', updated.orderNumber, err)
        await orders.updateOne(
          { _id: updated._id },
          {
            $set: {
              emailSent: false,
              emailError: err?.message || String(err),
              updatedAt: new Date(),
            },
          }
        )
      }
    })()

    return NextResponse.json({
      success: true,
      orderNumber: updated.orderNumber,
    })
  } catch (err: any) {
    console.error('POST /api/checkout/verify error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
