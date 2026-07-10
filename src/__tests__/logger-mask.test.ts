/**
 * Unit tests for logger maskSensitiveData function.
 *
 * Tests are pure functions and do NOT require MongoDB or a test framework.
 * Run with: npx tsx src/__tests__/logger-mask.test.ts
 */

import { maskSensitiveData } from '../lib/logger'

// ── Helpers ────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
  }
}

function assertEqual<T>(actual: T, expected: T, label: string) {
  if (actual === expected) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: ${JSON.stringify(expected)}`)
    console.error(`     actual:   ${JSON.stringify(actual)}`)
  }
}

function assertDeepEqual<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a === b) {
    passed++
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: ${b}`)
    console.error(`     actual:   ${a}`)
  }
}

// ── Tests ──────────────────────────────────────────────────────────────

console.log('\n📋 maskSensitiveData — top-level sensitive keys')

// Single sensitive field
assertDeepEqual(
  maskSensitiveData({ password: 'hunter2' }),
  { password: '[REDACTED]' },
  'redacts "password" key',
)

// Multiple sensitive keys at once
assertDeepEqual(
  maskSensitiveData({ password: 'secret', token: 'abc123', apiKey: 'key_xyz' }),
  { password: '[REDACTED]', token: '[REDACTED]', apiKey: '[REDACTED]' },
  'redacts multiple sensitive keys',
)

// Non-sensitive fields are preserved unchanged
assertDeepEqual(
  maskSensitiveData({ name: 'John', email: 'john@example.com', message: 'Hello' }),
  { name: 'John', email: 'john@example.com', message: 'Hello' },
  'preserves non-sensitive fields',
)

console.log('\n📋 maskSensitiveData — known sensitive key patterns')

// Password variations
assertDeepEqual(
  maskSensitiveData({ password: 'x', passWord: 'y', PASSword: 'z' }),
  { password: '[REDACTED]', passWord: '[REDACTED]', PASSword: '[REDACTED]' },
  'redacts case variations of "password"',
)

// Auth variations
assertDeepEqual(
  maskSensitiveData({ auth: 'token123', authorization: 'Bearer xxx' }),
  { auth: '[REDACTED]', authorization: '[REDACTED]' },
  'redacts auth-related keys',
)

// API key patterns (with and without underscore/hyphen)
assertDeepEqual(
  maskSensitiveData({ apiKey: 'sk_test', api_key: 'key1', 'api-key': 'key2', key: 'secret' }),
  { apiKey: '[REDACTED]', api_key: '[REDACTED]', 'api-key': '[REDACTED]', key: '[REDACTED]' },
  'redacts apiKey, api_key, api-key, and bare key',
)

// Token variations
assertDeepEqual(
  maskSensitiveData({ token: 'abc', access_token: 'xyz', refreshToken: '123', jwt: 'header.payload.sig' }),
  { token: '[REDACTED]', access_token: '[REDACTED]', refreshToken: '[REDACTED]', jwt: '[REDACTED]' },
  'redacts token, access_token, refreshToken, jwt',
)

// OTP / PIN
assertDeepEqual(
  maskSensitiveData({ otp: '123456', pin: '9876' }),
  { otp: '[REDACTED]', pin: '[REDACTED]' },
  'redacts otp and pin',
)

// Personally identifiable information (PII)
assertDeepEqual(
  maskSensitiveData({ ssn: '123-45-6789', aadhaar: '1234-5678-9012', pan_card: 'ABCDE1234F' }),
  { ssn: '[REDACTED]', aadhaar: '[REDACTED]', pan_card: '[REDACTED]' },
  'redacts SSN, Aadhaar, and PAN card',
)

// Cookie
assertDeepEqual(
  maskSensitiveData({ cookie: 'session=abc123' }),
  { cookie: '[REDACTED]' },
  'redacts cookie',
)

// Bearer
assertDeepEqual(
  maskSensitiveData({ bearer: 'token_here' }),
  { bearer: '[REDACTED]' },
  'redacts bearer',
)

// Credential
assertDeepEqual(
  maskSensitiveData({ credential: 'some_cred' }),
  { credential: '[REDACTED]' },
  'redacts credential',
)

console.log('\n📋 maskSensitiveData — mixed sensitive + non-sensitive')

assertDeepEqual(
  maskSensitiveData({
    username: 'admin',
    password: 'supersecret',
    email: 'admin@example.com',
    message: 'Hello world',
  }),
  {
    username: 'admin',
    password: '[REDACTED]',
    email: 'admin@example.com',
    message: 'Hello world',
  },
  'redacts only sensitive fields, keeps others intact',
)

console.log('\n📋 maskSensitiveData — nested objects (recursive)')

// Single level of nesting
assertDeepEqual(
  maskSensitiveData({
    user: { username: 'john', password: 'hunter2' },
    meta: { requestId: 'abc' },
  }),
  {
    user: { username: 'john', password: '[REDACTED]' },
    meta: { requestId: 'abc' },
  },
  'recursively masks sensitive keys in nested objects',
)

// Deeply nested
assertDeepEqual(
  maskSensitiveData({
    outer: {
      inner: {
        token: 'deep_secret',
        name: 'test',
      },
    },
  }),
  {
    outer: {
      inner: {
        token: '[REDACTED]',
        name: 'test',
      },
    },
  },
  'recursively masks deeply nested sensitive keys',
)

// Multiple nested keys
// Note: the key "auth" matches /auth/i, so the entire nested object gets redacted
assertDeepEqual(
  maskSensitiveData({
    auth: {
      jwt: 'eyJ.xxx.yyy',
      apiKey: 'sk_live_xxx',
      scope: 'read_write',
    },
    payload: { data: 'ok' },
  }),
  {
    auth: '[REDACTED]',
    payload: { data: 'ok' },
  },
  'redacts entire auth object because key name matches /auth/i',
)

console.log('\n📋 maskSensitiveData — arrays')

// Array of primitives
assertDeepEqual(
  maskSensitiveData({ tags: ['a', 'b', 'c'] }),
  { tags: ['a', 'b', 'c'] },
  'preserves arrays of strings',
)

// Array of objects with sensitive keys
assertDeepEqual(
  maskSensitiveData({
    users: [
      { username: 'alice', password: 'alice123' },
      { username: 'bob', password: 'bob456' },
    ],
  }),
  {
    users: [
      { username: 'alice', password: '[REDACTED]' },
      { username: 'bob', password: '[REDACTED]' },
    ],
  },
  'masks sensitive keys in array of objects',
)

// Sensitive key on array itself
assertDeepEqual(
  maskSensitiveData({ tokens: ['abc', 'def'] }),
  { tokens: '[REDACTED]' },
  'redacts entire array when key is sensitive',
)

// Mixed array with nulls
assertDeepEqual(
  maskSensitiveData({
    items: [
      { secret: 'my_secret', name: 'item1' },
      null,
      { secret: 'other_secret', name: 'item2' },
    ],
  }),
  {
    items: [
      { secret: '[REDACTED]', name: 'item1' },
      null,
      { secret: '[REDACTED]', name: 'item2' },
    ],
  },
  'handles null items in arrays',
)

console.log('\n📋 maskSensitiveData — edge cases')

// Empty object
assertDeepEqual(
  maskSensitiveData({}),
  {},
  'handles empty object',
)

// Null / undefined values
assertDeepEqual(
  maskSensitiveData({ key: null, password: null, name: undefined }),
  { key: '[REDACTED]', password: '[REDACTED]', name: undefined },
  'redacts sensitive fields even when value is null; preserves undefined',
)

// Numeric values
assertDeepEqual(
  maskSensitiveData({ count: 42, price: 99.99, pin: 1234 }),
  { count: 42, price: 99.99, pin: '[REDACTED]' },
  'preserves numbers for non-sensitive, redacts pin even when numeric',
)

// Boolean values
assertDeepEqual(
  maskSensitiveData({ isActive: true, isAdmin: false, auth: true }),
  { isActive: true, isAdmin: false, auth: '[REDACTED]' },
  'preserves booleans for non-sensitive, redacts auth even when boolean',
)

// Sensitive key in sub-key name (substring match via /password/i)
// All keys containing "password" as a substring match the /password/i pattern
assertDeepEqual(
  maskSensitiveData({
    passwordResetUrl: '/reset?token=abc',
    resetPasswordEmail: 'user@example.com',
    confirmPassword: '123',
  }),
  {
    passwordResetUrl: '[REDACTED]',
    resetPasswordEmail: '[REDACTED]',
    confirmPassword: '[REDACTED]',
  },
  'all keys containing "password" as substring are redacted (substring match)',
)

console.log('\n📋 maskSensitiveData — real-world API request shapes')

// Typical API request body from contact form
assertDeepEqual(
  maskSensitiveData({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    service: 'SEO',
    message: 'I need help with SEO',
  }),
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    service: 'SEO',
    message: 'I need help with SEO',
  },
  'preserves all fields in a typical contact form payload',
)

// Admin login request
assertDeepEqual(
  maskSensitiveData({
    username: 'admin',
    password: 'supersecret',
    rememberMe: true,
  }),
  {
    username: 'admin',
    password: '[REDACTED]',
    rememberMe: true,
  },
  'redacts password in login request, preserves username and rememberMe',
)

// Payment payload
assertDeepEqual(
  maskSensitiveData({
    razorpayOrderId: 'order_abc123',
    razorpayPaymentId: 'pay_xyz456',
    amount: 50000,
    currency: 'INR',
  }),
  {
    razorpayOrderId: 'order_abc123',
    razorpayPaymentId: 'pay_xyz456',
    amount: 50000,
    currency: 'INR',
  },
  'preserves payment fields (not sensitive)',
)

// Razorpay webhook with sensitive data
assertDeepEqual(
  maskSensitiveData({
    event: 'payment.captured',
    payload: {
      payment: {
        id: 'pay_abc',
        amount: 50000,
        method: 'upi',
        token: 'sensitive_token',
      },
    },
  }),
  {
    event: 'payment.captured',
    payload: {
      payment: {
        id: 'pay_abc',
        amount: 50000,
        method: 'upi',
        token: '[REDACTED]',
      },
    },
  },
  'masks nested token in payment webhook payload',
)

// Headers object with auth
assertDeepEqual(
  maskSensitiveData({
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.xxx',
      'content-type': 'application/json',
      cookie: 'session=abc; token=xyz',
    },
    body: { query: 'SELECT * FROM users' },
  }),
  {
    headers: {
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      cookie: '[REDACTED]',
    },
    body: { query: 'SELECT * FROM users' },
  },
  'masks authorization and cookie in headers, preserves content-type',
)

// ── Summary ────────────────────────────────────────────────────────────

console.log('')
console.log('='.repeat(50))
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📊 Total:  ${passed + failed}`)
console.log('='.repeat(50))

if (failed > 0) {
  process.exit(1)
}
