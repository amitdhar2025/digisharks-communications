import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayConfig } from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

/**
 * GET /api/test/razorpay
 *
 * Diagnostic endpoint: pings Razorpay with the credentials currently
 * in `process.env` and reports the result. Safe to call in the browser
 * — it does NOT echo back the secret, only the key ID prefix and a
 * boolean status.
 *
 *   curl -i http://localhost:3000/api/test/razorpay
 *
 * Returns:
 *   {
 *     mode: 'live' | 'test' | 'sandbox',
 *     keyIdPrefix: 'rzp_live_4z5...',
 *     reachable: true | false,
 *     httpStatus: 200 | 401 | ...,
 *     razorpayMessage: 'Authentication failed' | ...,
 *     hint: '...'
 *   }
 */
export async function GET(_req: NextRequest) {
  const cfg = getRazorpayConfig()

  if (cfg.mode === 'sandbox') {
    return NextResponse.json({
      mode: 'sandbox',
      keyIdPrefix: '',
      reachable: false,
      httpStatus: 0,
      razorpayMessage: 'No Razorpay credentials configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are empty).',
      hint: 'Add valid keys to .env.local to enable real payments. Checkout will run in sandbox mode until then.',
    })
  }

  const keyIdPrefix = cfg.keyId.slice(0, 12) + '…'
  const auth = Buffer.from(cfg.keyId + ':' + cfg.keySecret).toString('base64')
  const body = new URLSearchParams({
    amount: '100',
    currency: 'INR',
    receipt: 'selftest_' + Date.now(),
  })

  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    const txt = await res.text()
    let parsed: any = null
    try { parsed = JSON.parse(txt) } catch { /* leave as text */ }

    return NextResponse.json({
      mode: cfg.mode,
      keyIdPrefix,
      reachable: res.ok,
      httpStatus: res.status,
      razorpayMessage: parsed?.error?.description || txt.slice(0, 200),
      hint: res.status === 401
        ? 'Razorpay rejected these keys. Regenerate them at https://dashboard.razorpay.com/app/keys, paste the new Key ID + Key Secret into .env.local, and restart the dev server.'
        : res.ok
        ? 'Credentials work — Razorpay API is reachable.'
        : 'Unexpected response from Razorpay. Check the message and dashboard status.',
    })
  } catch (err: any) {
    return NextResponse.json({
      mode: cfg.mode,
      keyIdPrefix,
      reachable: false,
      httpStatus: 0,
      razorpayMessage: err?.message || String(err),
      hint: 'Network error reaching api.razorpay.com. Check firewall / proxy / DNS.',
    }, { status: 500 })
  }
}

/**
 * POST also supported — same behavior, lets the checkout view trigger
 * a fresh self-test from the browser without dealing with query params.
 */
export async function POST(req: NextRequest) {
  return GET(req)
}
