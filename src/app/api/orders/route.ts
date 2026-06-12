import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}


type OrderDoc = {
  orderId: string
  cartId: string
  name: string
  email: string
  phone: string
  items: { slug: string; title: string; price: number; quantity: number }[]
  total: number
  status: 'pending'
  createdAt: Date
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    name: string
    email: string
    phone: string
    items: { slug: string; title: string; price: number; quantity: number }[]
    total: number
    cartId: string
  }

  if (
    !body?.name ||
    !body?.email ||
    !body?.phone ||
    !Array.isArray(body?.items) ||
    typeof body?.total !== 'number' ||
    !body?.cartId
  ) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const client = await clientPromise
  const db = client.db('digisharks')

  const orderId = uuidv4()


  const createdAt = new Date()

  const orders = db.collection<OrderDoc>('orders')
  const carts = db.collection<{ cartId: string; items: any[] }>('carts')

  const order: OrderDoc = {
    orderId,
    cartId: body.cartId,
    name: body.name,
    email: body.email,
    phone: body.phone,
    items: body.items,
    total: body.total,
    status: 'pending',
    createdAt,
  }

  await orders.insertOne(order)

  // Clear cart
  await carts.updateOne({ cartId: body.cartId }, { $set: { items: [], updatedAt: createdAt } })

  return NextResponse.json({ orderId, status: 'pending' }, { status: 200 })
}

