import { NextRequest, NextResponse } from 'next/server'
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

import getClient from '@/lib/mongodb'
import type { Cart } from '@/types/cart'

export const dynamic = 'force-dynamic'

type CartItem = Cart['items'][number]

type CartDoc = {
  cartId: string
  items: CartItem[]
  updatedAt: Date
}

function getCookieCartId(req: NextRequest) {
  const cookie = req.cookies.get('cartId')
  return cookie?.value
}

async function getCartCollection() {
  const client = await getClient()
  return client.db('digisharks').collection<CartDoc>('carts')
}

export async function GET(req: NextRequest) {
  const cartId = getCookieCartId(req)
  const cartCollection = await getCartCollection()

  if (!cartId) {
    // Return empty cart without setting cookie.
    const res = NextResponse.json({ cartId: null, items: [], updatedAt: null }, { status: 200 })
    res.headers.set('Cache-Control', 'no-cache, private')
    return res
  }

  const cart = await cartCollection.findOne({ cartId })

  if (!cart) {
    const res = NextResponse.json({ cartId, items: [], updatedAt: null }, { status: 200 })
    res.headers.set('Cache-Control', 'no-cache, private')
    return res
  }

  const res = NextResponse.json(cart, { status: 200 })
  res.headers.set('Cache-Control', 'no-cache, private')
  return res
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    slug: string
    title: string
    price: number
    quantity: number
  }

  if (!body?.slug || !body.title || typeof body.price !== 'number' || !Number.isFinite(body.quantity)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const cartCollection = await getCartCollection()

const existingCartId = getCookieCartId(req)
  const cartId = existingCartId || uuidv4()



  const quantity = Math.max(1, Math.floor(body.quantity))

  const existing = await cartCollection.findOne({ cartId })
  const items = existing?.items ?? []

  const idx = items.findIndex((i) => i.slug === body.slug)

  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      quantity: items[idx].quantity + quantity,
    }
  } else {
    items.push({ slug: body.slug, title: body.title, price: body.price, quantity })
  }

  const updatedAt = new Date()

  await cartCollection.updateOne(
    { cartId },
    { $set: { items, updatedAt } },
    { upsert: true }
  )

  const response = NextResponse.json({ cartId, items, updatedAt }, { status: 200 })
  if (!existingCartId) {
    response.cookies.set('cartId', cartId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as {
    slug: string
    quantity: number
  }

  if (!body?.slug || !Number.isFinite(body.quantity)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const cartId = getCookieCartId(req)
  if (!cartId) {
    return NextResponse.json({ error: 'Missing cart cookie' }, { status: 400 })
  }

  const cartCollection = await getCartCollection()

  const cart = await cartCollection.findOne({ cartId })
  if (!cart) {
    return NextResponse.json({ cartId, items: [], updatedAt: null }, { status: 200 })
  }

  const quantity = Math.floor(body.quantity)

  const items = cart.items
    .map((i) => (i.slug === body.slug ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0)

  const updatedAt = new Date()

  await cartCollection.updateOne({ cartId }, { $set: { items, updatedAt } })

  return NextResponse.json({ cartId, items, updatedAt }, { status: 200 })
}

