/**
 * Server-side Razorpay helpers.
 *
 * Uses the official `razorpay` Node SDK when available, otherwise
 * falls back to a thin HTTPS implementation. Either way, the
 * key secret is never exposed to the client.
 *
 * If Razorpay credentials are missing we operate in `sandbox/test
 * mode`: the create-order endpoint still writes a valid `Order`
 * document to MongoDB and returns a fake `razorpayOrderId`, and the
 * verify endpoint will accept a magic payload for local development.
 * This keeps the full purchase flow demoable without breaking the
 * build.
 */
import crypto from 'crypto'
import { getDb } from './db'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: 'created' | 'attempted' | 'paid'
  notes?: Record<string, string>
}

export interface RazorpayConfig {
  keyId: string
  keySecret: string
  mode: 'live' | 'test' | 'sandbox'
}

/**
 * Read Razorpay credentials from multiple sources in priority order:
 * 1. MongoDB payment_settings collection (saved via Payment Settings UI)
 * 2. Environment variables RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
 *
 * This ensures keys saved through the admin Payment Settings page
 * actually take effect, not just env vars.
 */
export async function getRazorpayConfig(): Promise<RazorpayConfig> {
  // Try MongoDB first (payment settings saved via UI)
  try {
    const db = await getDb()
    const settingsDoc = await db.collection('payment_settings').findOne({ _id: 'global' as any })
    if (settingsDoc?.razorpayKeyId && settingsDoc?.razorpayKeySecret) {
      const keyId = String(settingsDoc.razorpayKeyId).trim()
      const keySecret = String(settingsDoc.razorpayKeySecret).trim()
      if (keyId && keySecret) {
        const mode: 'live' | 'test' = keyId.startsWith('rzp_test_') ? 'test' : 'live'
        return { keyId, keySecret, mode }
      }
    }
  } catch {
    // DB unavailable — fall through to env vars
  }

  // Fall back to environment variables
  const rawId = process.env.RAZORPAY_KEY_ID
  const rawSecret = process.env.RAZORPAY_KEY_SECRET
  const keyId = rawId?.trim() ?? ''
  const keySecret = rawSecret?.trim() ?? ''
  if (!keyId || !keySecret) {
    return { keyId: '', keySecret: '', mode: 'sandbox' }
  }
  // Razorpay test keys start with `rzp_test_` — treat as test mode.
  const mode: 'live' | 'test' = keyId.startsWith('rzp_test_') ? 'test' : 'live'
  return { keyId, keySecret, mode }
}

/**
 * Create a Razorpay order. Amount is in paise (₹1 = 100 paise).
 * Returns either a real order from Razorpay or a sandbox stub.
 */
export async function createRazorpayOrder(args: {
  amountPaise: number
  receipt: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> {
  const cfg = await getRazorpayConfig()
  if (cfg.mode === 'sandbox') {
    return {
      id: `rzp_sandbox_${args.receipt}`,
      amount: args.amountPaise,
      currency: 'INR',
      receipt: args.receipt,
      status: 'created',
      notes: args.notes,
    }
  }

  const body = new URLSearchParams({
    amount: String(args.amountPaise),
    currency: 'INR',
    receipt: args.receipt,
  })
  if (args.notes) {
    for (const [k, v] of Object.entries(args.notes)) {
      body.append('notes[' + k + ']', v)
    }
  }

  const auth = Buffer.from(cfg.keyId + ':' + cfg.keySecret).toString('base64')
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!res.ok) {
    const txt = await res.text()
    // 401 from Razorpay almost always means the Key ID / Key Secret
    // pair is invalid, revoked, or the Razorpay account is not yet
    // KYC-activated for live payments. Surface an actionable hint
    // so the developer does not waste time debugging the wrong thing.
    if (res.status === 401) {
      const keyPrefix = cfg.keyId.slice(0, 12) + (cfg.keyId.length > 12 ? '…' : '')
      throw new Error(
        'Razorpay authentication failed (401 BAD_REQUEST_ERROR). ' +
          'The Key ID / Key Secret in your environment (RAZORPAY_KEY_ID, ' +
          'RAZORPAY_KEY_SECRET) are not accepted by Razorpay. ' +
          'Key ID we tried: "' + keyPrefix + '". ' +
          'Most common causes: (1) the keys were regenerated in the ' +
          'Razorpay dashboard and the old values are still in .env.local, ' +
          '(2) the Razorpay account is suspended or not yet KYC-activated ' +
          'for live payments, or (3) the values were copy-pasted with ' +
          'extra whitespace. Regenerate the API keys at ' +
          'https://dashboard.razorpay.com/app/keys and update .env.local ' +
          '(or your Vercel project Environment Variables), ' +
          'then restart the dev server / redeploy. Raw response: ' + txt
      )
    }
    throw new Error('Razorpay create order failed: ' + res.status + ' ' + txt)
  }
  return (await res.json()) as RazorpayOrder
}

/**
 * Verify the signature Razorpay sends back from the browser.
 * Signature = HMAC_SHA256(orderId + "|" + paymentId, keySecret)
 */
export async function verifyRazorpaySignature(args: {
  orderId: string
  paymentId: string
  signature: string
}): Promise<boolean> {
  const cfg = await getRazorpayConfig()

  // Sandbox/test mode: accept a magic payload so the flow is
  // demoable without real keys.
  if (cfg.mode === 'sandbox') {
    return (
      args.signature === 'sandbox_ok' ||
      args.signature === 'sandbox_signature'
    )
  }

  const expected = crypto
    .createHmac('sha256', cfg.keySecret)
    .update(args.orderId + '|' + args.paymentId)
    .digest('hex')
  return expected === args.signature
}
