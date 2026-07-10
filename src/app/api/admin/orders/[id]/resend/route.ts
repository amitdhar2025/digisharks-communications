import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAdminFromRequest, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { getOrdersCollection, getProductsCollection, OrderDoc } from '@/lib/products'
import { sendOrderDeliveryEmail } from '@/lib/store-orders'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/orders/[id]/resend
 * Re-sends the delivery email for a paid order and refreshes
 * deliveryStatus / emailSent fields on success.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check edit permission for sub-admins
    if (!isSuperAdmin(admin)) {
      const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
      const denied = await requirePermission(admin, 'orders', 'edit', subPerms)
      if (denied) return denied
    }
    const { id } = await params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const orders = await getOrdersCollection()
    const order = (await orders.findOne({ _id: new ObjectId(id) })) as OrderDoc | null
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.payment?.status !== 'paid') {
      return NextResponse.json({ error: 'Only paid orders can be resent.' }, { status: 400 })
    }

    const products = await getProductsCollection()
    const firstSlug = order.items?.[0]?.slug
    const product = firstSlug ? await products.findOne({ slug: firstSlug }) : null

    const result = await sendOrderDeliveryEmail({
      order,
      downloadUrl: product?.downloadUrl,
      howToUseVideo: product?.howToUseVideo,
      supportEmail: 'marketing@digisharkscommunications.com',
    })

    if (result.ok) {
      await orders.updateOne(
        { _id: order._id },
        {
          $set: {
            emailSent: true,
            emailSentAt: new Date(),
            emailError: undefined,
            deliveryStatus: 'delivered',
            updatedAt: new Date(),
          },
        }
      )
      return NextResponse.json({ success: true, emailSent: true })
    }

    // On failure: update email status but do NOT overwrite deliveryStatus
    await orders.updateOne(
      { _id: order._id },
      {
        $set: {
          emailSent: false,
          emailError: result.error || 'unknown',
          updatedAt: new Date(),
        },
      }
    )
    return NextResponse.json({ success: false, error: result.error || 'Send failed' }, { status: 500 })

    return NextResponse.json({ success: true, emailSent: true })
  } catch (err: any) {
    console.error('POST /api/admin/orders/[id]/resend error', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
