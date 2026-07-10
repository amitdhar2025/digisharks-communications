/**
 * Admin Payment Settings API
 *
 * GET  /api/admin/settings/payments  — get current payment settings
 * PUT  /api/admin/settings/payments  — update payment settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

interface PaymentSettings {
  _id?: string
  razorpayKeyId: string
  razorpayKeySecret: string
  razorpayMode: 'sandbox' | 'live'
  upiId: string
  bankName: string
  bankAccount: string
  bankIfsc: string
  paymentMethods: string[] // ['card', 'upi', 'netbanking', 'wallet']
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  razorpayKeyId: '',
  razorpayKeySecret: '',
  razorpayMode: 'sandbox',
  upiId: '',
  bankName: '',
  bankAccount: '',
  bankIfsc: '',
  paymentMethods: ['card', 'upi', 'netbanking', 'wallet'],
}

async function getCollection() {
  const db = await getDb()
  return db.collection('payment_settings')
}

export async function GET() {
  try {
    const col = await getCollection()
    let settings = await col.findOne({ _id: 'global' as any })
    if (!settings) {
      return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS })
    }
    const { _id, ...data } = settings
    return NextResponse.json({ settings: { ...DEFAULT_PAYMENT_SETTINGS, ...data } })
  } catch (err) {
    console.error('GET /api/admin/settings/payments error:', err)
    return NextResponse.json({ settings: DEFAULT_PAYMENT_SETTINGS })
  }
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const col = await getCollection()

    const updateData: Record<string, any> = {}
    const fields = ['razorpayKeyId', 'razorpayKeySecret', 'razorpayMode', 'upiId', 'bankName', 'bankAccount', 'bankIfsc', 'paymentMethods']
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f]
    }

    // Masked storage: never expose full key secret
    if (body.razorpayKeySecret && body.razorpayKeySecret !== '••••••••') {
      updateData.razorpayKeySecret = body.razorpayKeySecret
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Upsert — always use the singleton document
    await col.updateOne(
      { _id: 'global' as any },
      { $set: updateData },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/settings/payments error:', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
