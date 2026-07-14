import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder, getRazorpayConfig } from '@/lib/razorpay'
import { generateOrderNumber } from '@/lib/store-orders'
import { getOrdersCollection, getProductsCollection, OrderItem } from '@/lib/products'
import { checkSecurity } from '@/lib/anti-spam'

export const dynamic = 'force-dynamic'

interface Body {
  customer: { name: string; email: string; phone: string; company?: string; gst?: string }
  items: { slug: string; title: string; price: number; qty: number }[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body

    // ── Anti-spam check ──
    const securityResult = await checkSecurity({
      req,
      email: body?.customer?.email ? body.customer.email.trim().toLowerCase() : undefined,
      formType: 'checkout',
      pageUrl: req.headers.get('referer') || '/checkout',
      honeypotValue: (body as any)?._hp,
    })
    if (!securityResult.allowed) {
      return NextResponse.json({ error: securityResult.message || 'Access denied.' }, { status: 403 })
    }

    if (!body?.customer?.name || !body?.customer?.email || !body?.customer?.phone) {
      return NextResponse.json({ error: 'Name, email and phone are required.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.customer.email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 })
    }

    // Re-validate prices against the products collection so the
    // client can never tamper with the amount.
    const products = await getProductsCollection()
    const finalItems: OrderItem[] = []
    let amount = 0
    for (const it of body.items) {
      if (!it?.slug || typeof it?.qty !== 'number' || it.qty <= 0) {
        return NextResponse.json({ error: 'Invalid cart item.' }, { status: 400 })
      }
      const p = await products.findOne({ slug: it.slug, isActive: true })
      if (!p) {
        return NextResponse.json({ error: `Product not available: ${it.slug}` }, { status: 400 })
      }
      const lineItem: OrderItem = {
        slug: p.slug,
        title: p.title,
        price: p.price,
        qty: it.qty,
      }
      amount += lineItem.price * lineItem.qty
      finalItems.push(lineItem)
    }

    const amountPaise = Math.round(amount * 100)
    const orderNumber = await generateOrderNumber()

    const cfg = await getRazorpayConfig()
    const receipt = orderNumber.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40)

    const rpOrder = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: { orderNumber },
    })

    // Persist the pending order in MongoDB.
    const orders = await getOrdersCollection()
    const now = new Date()
    await orders.insertOne({
      orderNumber,
      customer: {
        name: body.customer.name.trim(),
        email: body.customer.email.trim().toLowerCase(),
        phone: body.customer.phone.trim(),
        company: body.customer.company?.trim() || undefined,
        gst: body.customer.gst?.trim() || undefined,
      },
      items: finalItems,
      amount,
      currency: 'INR',
      payment: {
        provider: 'razorpay',
        razorpayOrderId: rpOrder.id,
        status: 'created',
      },
      deliveryStatus: 'pending',
      emailSent: false,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      success: true,
      orderNumber,
      razorpayOrderId: rpOrder.id,
      razorpayKeyId: cfg.mode === 'sandbox' ? '' : cfg.keyId,
      amountPaise,
      sandbox: cfg.mode === 'sandbox',
    })
  } catch (err: any) {
    console.error('POST /api/checkout/create-order error', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
