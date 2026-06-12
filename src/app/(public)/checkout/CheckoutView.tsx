'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

declare global {
  interface Window {
    Razorpay?: any
  }
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount)
}

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

export default function CheckoutView() {
  const router = useRouter()
  const { items, hydrated, subtotal, clear } = useCart()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('India')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  const [error, setError] = useState<string | null>(null)
  // True when the most recent server error was a Razorpay 401, so we
  // can show an actionable hint and a one-click self-test link.
  const [razorpayAuthError, setRazorpayAuthError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sandboxMode, setSandboxMode] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    // Load Razorpay checkout script
    if (typeof document === 'undefined') return
    if (document.getElementById('razorpay-script')) {
      setScriptReady(true)
      return
    }
    const s = document.createElement('script')
    s.id = 'razorpay-script'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => setScriptReady(true)
    s.onerror = () => setScriptReady(true) // we'll fall back to sandbox
    document.body.appendChild(s)
  }, [])

  if (!hydrated) {
    return (
      <div className="co-page">
        <h1 className="co-title">Checkout</h1>
        <div className="co-state">Loading…</div>
        <CoStyles />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="co-page">
        <h1 className="co-title">Checkout</h1>
        <div className="co-state">
          <div className="co-state-icon" aria-hidden="true">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add a product before checking out.</p>
          <Link href="/digital-products" className="co-btn co-btn-primary">
            Browse Digital Products →
          </Link>
        </div>
        <CoStyles />
      </div>
    )
  }

  const validate = (): string | null => {
    if (!firstName.trim()) return 'Please enter your first name.'
    if (!lastName.trim()) return 'Please enter your last name.'
    if (!country.trim()) return 'Please select your country / region.'
    if (!address1.trim()) return 'Please enter your street address.'
    if (!city.trim()) return 'Please enter your town / city.'
    if (!stateName.trim()) return 'Please select your state.'
    if (!pincode.trim()) return 'Please enter your PIN code.'
    if (!/^\d{6}$/.test(pincode.trim())) return 'Please enter a valid 6-digit PIN code.'
    if (!phone.trim()) return 'Please enter your phone number.'
    if (!/^[+\d][\d\s\-()]{6,}$/.test(phone.trim())) return 'Please enter a valid phone number.'
    if (!email.trim()) return 'Email is required — we will email your download link here.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'Please enter a valid email address.'
    return null
  }

  const handlePay = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    if (subtotal <= 0) {
      setError('Cart total is invalid.')
      return
    }

    setSubmitting(true)
    try {
      // 1) Create a pending order server-side and a Razorpay order.
      const createRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            company: company.trim() || undefined,
            country: country.trim(),
            address1: address1.trim(),
            address2: address2.trim() || undefined,
            city: city.trim(),
            state: stateName.trim(),
            pincode: pincode.trim(),
            marketingOptIn,
          },
          items: items.map((it) => ({ slug: it.slug, title: it.title, price: it.price, qty: it.qty })),
        }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        const msg = createData.error || 'Failed to create order.'
        setError(msg)
        // Detect the specific Razorpay 401 so we can show a clearer
        // remediation hint instead of just the raw server error.
        if (createRes.status === 500 && /401/.test(msg) && /Razorpay/i.test(msg)) {
          setRazorpayAuthError(true)
        } else {
          setRazorpayAuthError(false)
        }
        setSubmitting(false)
        return
      }

      setRazorpayAuthError(false)
      setSandboxMode(!!createData.sandbox)

      const razorpayOrderId: string = createData.razorpayOrderId
      const amountPaise: number = createData.amountPaise
      const orderNumber: string = createData.orderNumber

      // 2) If sandbox (no real keys) or Razorpay script didn't load, simulate success.
      const useLive = !createData.sandbox && scriptReady && window.Razorpay && createData.razorpayKeyId

      if (!useLive) {
        // Sandbox: directly verify with magic signature.
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            razorpayOrderId,
            razorpayPaymentId: 'rzp_sandbox_pay_' + Date.now(),
            razorpaySignature: 'sandbox_ok',
          }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyRes.ok || !verifyData.success) {
          setError(verifyData.error || 'Sandbox payment failed.')
          setSubmitting(false)
          return
        }
        clear()
        router.push('/order-success?order=' + encodeURIComponent(orderNumber))
        return
      }

      // 3) Open Razorpay checkout.
      const options: any = {
        key: createData.razorpayKeyId,
        amount: amountPaise,
        currency: 'INR',
        name: 'Digisharks Communications',
        description: 'Order ' + orderNumber,
        order_id: razorpayOrderId,
        prefill: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        notes: { orderNumber },
        theme: { color: '#3b9fd4' },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok || !verifyData.success) {
              setError(verifyData.error || 'Payment verification failed.')
              setSubmitting(false)
              return
            }
            clear()
            router.push('/order-success?order=' + encodeURIComponent(orderNumber))
          } catch (err: any) {
            setError('Verification error: ' + (err?.message || String(err)))
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false)
            setError('Payment cancelled. Your order is saved — you can retry from the cart.')
          },
        },
      }
      const rz = new window.Razorpay(options)
      rz.on('payment.failed', function (resp: any) {
        setError('Payment failed: ' + (resp?.error?.description || 'Unknown error'))
        setSubmitting(false)
      })
      rz.open()
    } catch (err: any) {
      setError(err?.message || 'Checkout failed.')
      setSubmitting(false)
    }
  }

  return (
    <div className="co-page">
      <h1 className="co-title">Checkout</h1>

      <form className="co-grid" onSubmit={handlePay} noValidate>
        {/* ---------- LEFT: BILLING DETAILS ---------- */}
        <section className="co-card co-billing">
          <h2 className="co-card-title">Billing Details</h2>

          {error && <div className="co-error" role="alert">{error}</div>}

          {razorpayAuthError && (
            <div className="co-rzp-hint" role="alert">
              <strong>⚠ Razorpay rejected the API keys.</strong>
              <p>
                The Key ID and Key Secret in <code>.env.local</code> are not accepted by
                Razorpay. Most often this means they were rotated in the dashboard and the
                old values are still on disk, or the account is not yet KYC-activated for
                live payments.
              </p>
              <p>
                <a href="/api/test/razorpay" target="_blank" rel="noopener noreferrer">
                  Run the Razorpay self-test →
                </a>{' '}
                (opens in a new tab; you can paste the response back to the developer).
              </p>
            </div>
          )}

          <div className="co-grid-2">
            <div className="co-field">
              <label htmlFor="co-first">First Name <span className="req">*</span></label>
              <input id="co-first" type="text" autoComplete="given-name" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
            </div>
            <div className="co-field">
              <label htmlFor="co-last">Last Name <span className="req">*</span></label>
              <input id="co-last" type="text" autoComplete="family-name" value={lastName}
                onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
            </div>
          </div>

          <div className="co-field">
            <label htmlFor="co-company">Company Name (optional)</label>
            <input id="co-company" type="text" autoComplete="organization" value={company}
              onChange={(e) => setCompany(e.target.value)} placeholder="Company Name" />
          </div>

          <div className="co-field">
            <label htmlFor="co-country">Country / Region <span className="req">*</span></label>
            <select id="co-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="India">India</option>
            </select>
          </div>

          <div className="co-field">
            <label htmlFor="co-addr1">Street address <span className="req">*</span></label>
            <input id="co-addr1" type="text" autoComplete="address-line1" value={address1}
              onChange={(e) => setAddress1(e.target.value)} placeholder="House number and street name" />
            <input id="co-addr2" type="text" autoComplete="address-line2" value={address2}
              onChange={(e) => setAddress2(e.target.value)} placeholder="Apartment, suite, unit, etc. (optional)"
              style={{ marginTop: '0.5rem' }} />
          </div>

          <div className="co-field">
            <label htmlFor="co-city">Town / City <span className="req">*</span></label>
            <input id="co-city" type="text" autoComplete="address-level2" value={city}
              onChange={(e) => setCity(e.target.value)} placeholder="Town / City" />
          </div>

          <div className="co-field">
            <label htmlFor="co-state">State <span className="req">*</span></label>
            <select id="co-state" value={stateName} onChange={(e) => setStateName(e.target.value)}>
              <option value="">Select a state…</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="co-field">
            <label htmlFor="co-pin">PIN Code <span className="req">*</span></label>
            <input id="co-pin" type="text" inputMode="numeric" autoComplete="postal-code" value={pincode}
              onChange={(e) => setPincode(e.target.value)} placeholder="PIN Code" />
          </div>

          <div className="co-field">
            <label htmlFor="co-phone">Phone <span className="req">*</span></label>
            <input id="co-phone" type="tel" autoComplete="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          </div>

          <div className="co-field">
            <label htmlFor="co-email">Email Address <span className="req">*</span></label>
            <input id="co-email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
          </div>

          <label className="co-check">
            <input type="checkbox" checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)} />
            <span>I would like to receive exclusive emails with discounts and product information</span>
          </label>
        </section>

        {/* ---------- RIGHT: YOUR ORDER ---------- */}
        <aside className="co-right" aria-label="Your order">
          <section className="co-card co-order">
            <h2 className="co-card-title">Your Order</h2>

            <div className="co-order-row co-order-head">
              <span>Product</span>
              <span className="co-right-text">Subtotal</span>
            </div>

            {items.map((it) => (
              <div className="co-order-row" key={it.slug}>
                <span className="co-order-name">
                  {it.title} <strong>× {it.qty}</strong>
                </span>
                <span className="co-right-text">{formatINR(it.price * it.qty)}</span>
              </div>
            ))}

            <div className="co-order-row">
              <span>Subtotal</span>
              <span className="co-right-text">{formatINR(subtotal)}</span>
            </div>
            <div className="co-order-row co-order-total">
              <span>Total</span>
              <span className="co-right-text">{formatINR(subtotal)}</span>
            </div>
          </section>

          <section className="co-card co-payment">
            <p className="co-pay-method">Credit Card/Debit Card/NetBanking</p>

            <div className="co-razorpay">
              <span className="co-rzp-mark" aria-hidden="true" />
              <span className="co-rzp-text">Pay by Razorpay</span>
            </div>

            <div className="co-pay-desc">
              Pay securely by Credit or Debit card or Internet Banking through Razorpay.
            </div>

            <p className="co-privacy">
              Your personal data will be used to process your order, support your experience
              throughout this website, and for other purposes described in our{' '}
              <Link href="/privacy-policy">privacy policy</Link>.
            </p>

            <button type="submit" className="co-btn co-place-order" disabled={submitting}>
              {submitting ? 'Processing…' : 'Place order'}
            </button>

            {sandboxMode && (
              <div className="co-sandbox-note">
                ⚙ Sandbox mode: no Razorpay keys configured. Place order will simulate a successful payment so you can test the full flow.
              </div>
            )}

            <p className="co-secure">🔒 Payments are processed securely.</p>
          </section>
        </aside>
      </form>

      <CoStyles />
    </div>
  )
}

/* Namespaced global styles — kept under `.co-page` so a dark app theme
   can't bleed in, and so they don't leak out to the rest of the app. */
function CoStyles() {
  return (
    <style jsx global>{`
      .co-page {
        max-width: 1080px;
        margin: 0 auto;
        padding: 1.5rem;
        font-family: Arial, 'Hind Madurai', sans-serif;
        color: #2b2b2b !important;
        background: transparent;
      }
      .co-page * {
        box-sizing: border-box;
      }

      .co-title {
        font-size: 2.1rem;
        font-weight: 800;
        margin: 0 0 1.25rem;
        color: #1a1a1a !important;
        padding-bottom: 1rem;
        border-bottom: 1px solid #ededed;
      }

      .co-grid {
        display: flex;
        gap: 1.75rem;
        align-items: flex-start;
      }
      .co-billing {
        flex: 1 1 58%;
        min-width: 0;
      }
      .co-right {
        flex: 1 1 38%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .co-card {
        background: #ffffff !important;
        border: 1px solid #e3e3e3 !important;
        border-radius: 6px;
        padding: 1.5rem;
        box-shadow: none !important;
      }
      .co-card-title {
        font-size: 1.05rem;
        font-weight: 700;
        margin: 0 0 1.25rem;
        color: #1a1a1a !important;
      }

      /* ---------- FORM FIELDS ---------- */
      .co-field {
        margin-bottom: 1.1rem;
      }
      .co-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .co-field label {
        display: block;
        font-size: 0.85rem;
        color: #333 !important;
        margin-bottom: 0.4rem;
      }
      .co-field .req {
        color: #d32f2f !important;
      }
      .co-field input,
      .co-field select {
        width: 100%;
        height: 42px;
        padding: 0 0.75rem;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: #fafafa !important;
        color: #2b2b2b !important;
        font-size: 0.92rem;
        outline: none;
      }
      .co-field input::placeholder {
        color: #aaa !important;
      }
      .co-field input:focus,
      .co-field select:focus {
        border-color: #3b9fd4;
        background: #fff !important;
      }
      .co-field select {
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23777' d='M1 1l5 5 5-5'/></svg>");
        background-repeat: no-repeat;
        background-position: right 0.85rem center;
        padding-right: 2rem;
      }

      .co-check {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: #444 !important;
        cursor: pointer;
      }
      .co-check input {
        margin-top: 0.15rem;
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        accent-color: #3b9fd4;
      }

      .co-error {
        background: #fdecea;
        border: 1px solid #f5c6cb;
        color: #b3261e !important;
        padding: 0.7rem 0.9rem;
        border-radius: 4px;
        font-size: 0.88rem;
        margin-bottom: 1.1rem;
      }

      .co-rzp-hint {
        background: #fff7e6;
        border: 1px solid #f0b400;
        color: #5a4400 !important;
        padding: 0.85rem 1rem;
        border-radius: 4px;
        font-size: 0.88rem;
        margin-bottom: 1.1rem;
        line-height: 1.5;
      }
      .co-rzp-hint strong {
        display: block;
        margin-bottom: 0.4rem;
        color: #3a2a00 !important;
      }
      .co-rzp-hint p {
        margin: 0.4rem 0;
      }
      .co-rzp-hint code {
        background: #fff2cc;
        padding: 0 0.3rem;
        border-radius: 3px;
        font-size: 0.82rem;
      }
      .co-rzp-hint a {
        color: #2f8cc0 !important;
        font-weight: 600;
        text-decoration: none;
      }
      .co-rzp-hint a:hover {
        text-decoration: underline;
      }

      /* ---------- ORDER SUMMARY ---------- */
      .co-order-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
        font-size: 0.9rem;
        color: #555 !important;
      }
      .co-order-head {
        font-weight: 700;
        color: #1a1a1a !important;
      }
      .co-order-name {
        color: #555 !important;
      }
      .co-order-name strong {
        color: #1a1a1a !important;
      }
      .co-right-text {
        text-align: right;
        white-space: nowrap;
        color: #555 !important;
      }
      .co-order-total {
        background: #f6f6f6;
        font-weight: 700;
        color: #1a1a1a !important;
        border-bottom: none;
        padding: 0.85rem 0.6rem;
        margin: 0.25rem -0.6rem 0;
        border-radius: 4px;
      }
      .co-order-total .co-right-text {
        color: #1a1a1a !important;
      }

      /* ---------- PAYMENT ---------- */
      .co-pay-method {
        font-size: 0.9rem;
        font-weight: 700;
        color: #1a1a1a !important;
        margin: 0 0 0.9rem;
      }
      .co-razorpay {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .co-rzp-mark {
        width: 22px;
        height: 22px;
        background: linear-gradient(135deg, #3b9fd4 55%, #1c2e5a 55%);
        clip-path: polygon(20% 0, 100% 0, 60% 100%, 0 100%);
        display: inline-block;
      }
      .co-rzp-text {
        font-weight: 700;
        color: #1a1a1a !important;
        font-size: 0.95rem;
      }
      .co-pay-desc {
        background: #f6f6f6;
        border-radius: 4px;
        padding: 0.75rem 0.9rem;
        font-size: 0.82rem;
        color: #555 !important;
        margin-bottom: 1rem;
      }
      .co-privacy {
        font-size: 0.78rem;
        color: #777 !important;
        line-height: 1.55;
        margin: 0 0 1.1rem;
      }
      .co-privacy a {
        color: #3b9fd4 !important;
        text-decoration: none;
      }
      .co-privacy a:hover {
        text-decoration: underline;
      }

      /* ---------- BUTTONS ---------- */
      .co-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.8rem 1.4rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.15s ease, opacity 0.15s ease;
      }
      .co-place-order {
        width: 100%;
        background: #3b9fd4 !important;
        color: #fff !important;
      }
      .co-place-order:hover:not(:disabled) {
        background: #2f8cc0 !important;
      }
      .co-place-order:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .co-btn-primary {
        background: #3b9fd4 !important;
        color: #fff !important;
      }
      .co-btn-primary:hover {
        background: #2f8cc0 !important;
      }

      .co-sandbox-note {
        margin-top: 0.9rem;
        background: #fff8e1;
        border: 1px solid #ffe082;
        color: #6b5200 !important;
        padding: 0.7rem 0.85rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }
      .co-secure {
        text-align: center;
        font-size: 0.78rem;
        color: #888 !important;
        margin: 0.9rem 0 0;
      }

      /* ---------- STATES ---------- */
      .co-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #555 !important;
      }
      .co-state h2 {
        color: #1a1a1a !important;
        margin: 0.5rem 0;
      }
      .co-state-icon {
        font-size: 2.5rem;
      }

      /* ---------- RESPONSIVE ---------- */
      @media (max-width: 880px) {
        .co-grid {
          flex-direction: column;
        }
        .co-billing,
        .co-right {
          width: 100%;
          flex: 1 1 auto;
        }
      }
      @media (max-width: 480px) {
        .co-page {
          padding: 1rem;
        }
        .co-title {
          font-size: 1.6rem;
        }
        .co-grid-2 {
          grid-template-columns: 1fr;
        }
        .co-card {
          padding: 1.1rem;
        }
      }
    `}</style>
  )
}