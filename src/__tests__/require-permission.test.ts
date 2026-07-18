/**
 * Integration tests for requirePermission API middleware.
 *
 * Tests the async middleware function that returns NextResponse | null.
 * Run with: npx tsx src/__tests__/require-permission.test.ts
 */

import { requirePermission, type PermissionSection } from '../lib/permissions'
import { DEFAULT_SUBADMIN_PERMISSIONS, FULL_PERMISSIONS } from '../lib/auth'
import type { AdminPayload } from '../lib/auth'
import type { SubAdminPermissions } from '../lib/db'

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

async function assertAllowed(promise: Promise<any>, label: string) {
  const result = await promise
  if (result === null) {
    passed++
  } else {
    failed++
    const body = await result.json().catch(() => ({}))
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: null (allowed)`)
    console.error(`     actual:   ${result.status} — ${JSON.stringify(body)}`)
  }
}

async function assertDenied(
  promise: Promise<any>,
  expectedStatus: number,
  expectedErrorContains: string,
  label: string,
) {
  const result = await promise
  if (result !== null && result.status === expectedStatus) {
    const body = await result.json().catch(() => ({}))
    if (body.error && body.error.includes(expectedErrorContains)) {
      passed++
    } else {
      failed++
      console.error(`  ❌ FAIL: ${label}`)
      console.error(`     expected status ${expectedStatus} with error containing "${expectedErrorContains}"`)
      console.error(`     actual:   status=${result.status}, body=${JSON.stringify(body)}`)
    }
  } else if (result === null) {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: denied (${expectedStatus}), got: null (allowed)`)
  } else {
    failed++
    console.error(`  ❌ FAIL: ${label}`)
    console.error(`     expected: ${expectedStatus}, got: ${result.status}`)
  }
}

// ── Test Data ──────────────────────────────────────────────────────────

const adminPayload: AdminPayload = { username: 'superadmin', role: 'admin' }
const subAdminPayload: AdminPayload = { username: 'editor1', role: 'sub-admin', subAdminId: 'abc123' }

// Sub-admin with NO subAdminId (triggers DB-fetch-failure path)
const subAdminNoId: AdminPayload = { username: 'orphan', role: 'sub-admin' }

// Custom permissions for granular testing
const CUSTOM_PERMS: SubAdminPermissions = {
  blog: { view: false, create: false, edit: false, delete: false },
  store: { view: false, create: false, edit: false, delete: false },
  orders: { view: true, edit: true, delete: false, export: false },
  products: { view: true, create: false, edit: false, delete: false },
  coupons: { view: true, create: true, edit: true, delete: true },
  reports: { view: true, export: true },
  career: { view: false, create: false, edit: false, delete: false },
  chatbot: { view: false, manage: false, settings: false },
  seoAudit: { view: false, delete: false },
  rss: { view: false, create: false, edit: false, delete: false },
  queries: { view: false, edit: false, delete: false, export: false },
}

// ── Main test runner ──────────────────────────────────────────────────

async function main() {

  // ── Tests: null admin (unauthorized) ──────────────────────────────

  console.log('\n📋 requirePermission — null/undefined admin (Unauthorized 401)')

  const unauthCases: [string, string][] = [
    ['orders', 'view'],
    ['orders', 'edit'],
    ['products', 'create'],
    ['coupons', 'delete'],
    ['reports', 'export'],
  ]

  for (const [section, action] of unauthCases) {
    await assertDenied(
      requirePermission(null, section as PermissionSection, action, CUSTOM_PERMS),
      401,
      'Unauthorized',
      `null admin → 401 for ${section}:${action}`,
    )
  }

  await assertDenied(
    requirePermission(undefined as unknown as AdminPayload, 'orders', 'view', CUSTOM_PERMS),
    401,
    'Unauthorized',
    'undefined admin → 401',
  )

  // ── Tests: super admin (always allowed) ────────────────────────────

  console.log('\n📋 requirePermission — super admin (always null = allowed)')

  const sections: PermissionSection[] = ['orders', 'products', 'coupons', 'reports', 'blog', 'store', 'career']
  const actions = ['view', 'create', 'edit', 'delete', 'export', 'manage', 'settings']

  for (const section of sections) {
    for (const action of actions) {
      await assertAllowed(
        requirePermission(adminPayload, section, action, null),
        `super admin → allowed for ${section}:${action} (no perms object)`,
      )
    }
  }

  await assertAllowed(
    requirePermission(adminPayload, 'orders', 'view', null),
    'super admin → allowed with null perms',
  )
  await assertAllowed(
    requirePermission(adminPayload, 'orders', 'view', undefined),
    'super admin → allowed with undefined perms',
  )
  await assertAllowed(
    requirePermission(adminPayload, 'orders', 'view', DEFAULT_SUBADMIN_PERMISSIONS),
    'super admin → allowed even with all-false perms',
  )

  // ── Tests: sub-admin with custom permissions ──────────────────────

  console.log('\n📋 requirePermission — sub-admin with custom permissions')

  // orders: view=true, edit=true, delete=false, export=false
  await assertAllowed(
    requirePermission(subAdminPayload, 'orders', 'view', CUSTOM_PERMS),
    'sub-admin → allowed to view orders',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'orders', 'edit', CUSTOM_PERMS),
    'sub-admin → allowed to edit orders',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'delete', CUSTOM_PERMS),
    403,
    'do not have "delete" permission',
    'sub-admin → denied to delete orders',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'export', CUSTOM_PERMS),
    403,
    'do not have "export" permission',
    'sub-admin → denied to export orders',
  )

  // products: view=true, create=false, edit=false, delete=false
  await assertAllowed(
    requirePermission(subAdminPayload, 'products', 'view', CUSTOM_PERMS),
    'sub-admin → allowed to view products',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'products', 'create', CUSTOM_PERMS),
    403,
    'do not have "create" permission',
    'sub-admin → denied to create products',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'products', 'edit', CUSTOM_PERMS),
    403,
    'do not have "edit" permission',
    'sub-admin → denied to edit products',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'products', 'delete', CUSTOM_PERMS),
    403,
    'do not have "delete" permission',
    'sub-admin → denied to delete products',
  )

  // coupons: all true
  await assertAllowed(
    requirePermission(subAdminPayload, 'coupons', 'view', CUSTOM_PERMS),
    'sub-admin → allowed to view coupons',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'coupons', 'create', CUSTOM_PERMS),
    'sub-admin → allowed to create coupons',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'coupons', 'edit', CUSTOM_PERMS),
    'sub-admin → allowed to edit coupons',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'coupons', 'delete', CUSTOM_PERMS),
    'sub-admin → allowed to delete coupons',
  )

  // reports: view=true, export=true
  await assertAllowed(
    requirePermission(subAdminPayload, 'reports', 'view', CUSTOM_PERMS),
    'sub-admin → allowed to view reports',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'reports', 'export', CUSTOM_PERMS),
    'sub-admin → allowed to export reports',
  )

  // ── Tests: sub-admin without permissions (403) ────────────────────

  console.log('\n📋 requirePermission — sub-admin without permissions (403)')

  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'view', null),
    403,
    'no permissions found',
    'sub-admin → 403 with null perms',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'view', undefined),
    403,
    'no permissions found',
    'sub-admin → 403 with undefined perms',
  )
  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'view', DEFAULT_SUBADMIN_PERMISSIONS),
    403,
    'do not have "view" permission',
    'sub-admin → 403 with default (all false) perms',
  )

  // Sub-admin with no subAdminId and no perms → cannot DB-fetch → 403
  await assertDenied(
    requirePermission(subAdminNoId, 'orders', 'view', null),
    403,
    'no permissions found',
    'sub-admin without subAdminId → 403 (DB fetch skipped)',
  )

  // sub-admin with subAdminId but no perms → DB fetch fails (no MongoDB) → 403
  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'view', undefined),
    403,
    'no permissions found',
    'sub-admin with subAdminId but no perms → 403 (DB fetch fails)',
  )

  // ── Tests: missing section in permissions object ──────────────────

  console.log('\n📋 requirePermission — missing section in permissions')

  const incompletePerms = {
    ...CUSTOM_PERMS,
    orders: undefined as unknown as SubAdminPermissions['orders'],
  }

  await assertDenied(
    requirePermission(subAdminPayload, 'orders', 'view', incompletePerms as SubAdminPermissions),
    403,
    'no access to this section',
    'sub-admin → 403 when section is missing from perms object',
  )

  // ── Tests: FULL permissions ─────────────────────────────────────────

  console.log('\n📋 requirePermission — sub-admin with FULL permissions')

  await assertAllowed(
    requirePermission(subAdminPayload, 'orders', 'view', FULL_PERMISSIONS),
    'full perms → allowed to view orders',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'orders', 'edit', FULL_PERMISSIONS),
    'full perms → allowed to edit orders',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'orders', 'delete', FULL_PERMISSIONS),
    'full perms → allowed to delete orders',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'orders', 'export', FULL_PERMISSIONS),
    'full perms → allowed to export orders',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'products', 'create', FULL_PERMISSIONS),
    'full perms → allowed to create products',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'coupons', 'delete', FULL_PERMISSIONS),
    'full perms → allowed to delete coupons',
  )
  await assertAllowed(
    requirePermission(subAdminPayload, 'reports', 'export', FULL_PERMISSIONS),
    'full perms → allowed to export reports',
  )

  // ── Summary ──────────────────────────────────────────────────────────

  console.log('')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total:  ${passed + failed}`)
  console.log('='.repeat(50))

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
