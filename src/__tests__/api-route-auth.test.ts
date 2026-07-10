/**
 * Integration tests for sub-admin API route authentication.
 *
 * Tests the actual route handler patterns: admin extraction, permission checks,
 * and response codes for orders, products, coupons, and reports routes.
 *
 * Run with: npx tsx src/__tests__/api-route-auth.test.ts
 */

import { requirePermission, type PermissionSection } from '../lib/permissions'
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

// ── Route pattern simulators ───────────────────────────────────────────

/**
 * Simulates the auth pattern used in orders API routes.
 *
 * Pattern from source:
 *   if (!isSuperAdmin(admin)) {
 *     const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
 *     const denied = await requirePermission(admin, 'orders', action, subPerms)
 *     if (denied) return denied
 *   }
 */
async function checkOrdersRoute(
  admin: AdminPayload | null,
  action: string,
  subPerms: SubAdminPermissions | null,
): Promise<boolean> {
  if (!admin) return false // → 401
  const { isSuperAdmin } = await import('../lib/auth')
  if (!isSuperAdmin(admin)) {
    const { getSubAdminPermissions } = await import('../lib/auth')
    // Use provided perms directly; only DB-fetch when no perms given
    const perms = subPerms ?? (admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null)
    const denied = await requirePermission(admin, 'orders' as PermissionSection, action, perms)
    if (denied) return false // → 403
  }
  return true // allowed
}

/**
 * Simulates the auth pattern used in products API routes.
 *
 * Pattern from source:
 *   if (!admin) return 401
 *   if (!isSuperAdmin(admin)) {
 *     const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
 *     const denied = await requirePermission(admin, 'products', action, subPerms)
 *     if (denied) return denied
 *   }
 */
async function checkProductsRoute(
  admin: AdminPayload | null,
  action: string,
  subPerms: SubAdminPermissions | null,
): Promise<boolean> {
  if (!admin) return false // → 401
  const { isSuperAdmin } = await import('../lib/auth')
  if (!isSuperAdmin(admin)) {
    const { getSubAdminPermissions } = await import('../lib/auth')
    // Use provided perms directly; only DB-fetch when no perms given
    const perms = subPerms ?? (admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null)
    const denied = await requirePermission(admin, 'products' as PermissionSection, action, perms)
    if (denied) return false // → 403
  }
  return true // allowed
}

/**
 * Simulates the auth pattern used in coupons API routes.
 *
 * Pattern from source:
 *   if (!admin) return 401
 *   if (!isSuperAdmin(admin)) {
 *     const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
 *     const denied = await requirePermission(admin, 'coupons', action, subPerms)
 *     if (denied) return denied
 *   }
 */
async function checkCouponsRoute(
  admin: AdminPayload | null,
  action: string,
  subPerms: SubAdminPermissions | null,
): Promise<boolean> {
  if (!admin) return false // → 401
  const { isSuperAdmin } = await import('../lib/auth')
  if (!isSuperAdmin(admin)) {
    const { getSubAdminPermissions } = await import('../lib/auth')
    // Use provided perms directly; only DB-fetch when no perms given
    const perms = subPerms ?? (admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null)
    const denied = await requirePermission(admin, 'coupons' as PermissionSection, action, perms)
    if (denied) return false // → 403
  }
  return true // allowed
}

/**
 * Simulates the auth pattern used in reports API routes.
 *
 * Pattern from source:
 *   if (!admin) return 401
 *   if (!isSuperAdmin(admin)) {
 *     const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
 *     const denied = await requirePermission(admin, 'reports', action, subPerms)
 *     if (denied) return denied
 *   }
 */
async function checkReportsRoute(
  admin: AdminPayload | null,
  action: string,
  subPerms: SubAdminPermissions | null,
): Promise<boolean> {
  if (!admin) return false // → 401
  const { isSuperAdmin } = await import('../lib/auth')
  if (!isSuperAdmin(admin)) {
    const { getSubAdminPermissions } = await import('../lib/auth')
    // Use provided perms directly; only DB-fetch when no perms given
    const perms = subPerms ?? (admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null)
    const denied = await requirePermission(admin, 'reports' as PermissionSection, action, perms)
    if (denied) return false // → 403
  }
  return true // allowed
}

/**
 * Simulates the auth pattern used by OLD routes that still only use isSuperAdmin.
 *
 * Pattern:
 *   if (!admin || !isSuperAdmin(admin)) return 403
 */
async function checkOldSuperAdminRoute(
  admin: AdminPayload | null,
): Promise<boolean> {
  if (!admin) return false // old route would return 401 or 403
  const { isSuperAdmin } = await import('../lib/auth')
  return isSuperAdmin(admin)
}

// ── Test Data ──────────────────────────────────────────────────────────

const adminPayload: AdminPayload = { username: 'super', role: 'admin' }
const subAdminPayload: AdminPayload = { username: 'sub', role: 'sub-admin', subAdminId: 'sub123' }
const subAdminNoId: AdminPayload = { username: 'orphan', role: 'sub-admin' }

// Sub-admin with granular permissions for each section
const ORDERS_PERMS: Partial<SubAdminPermissions> = {
  orders: { view: true, edit: true, delete: false, export: false },
  products: { view: false, create: false, edit: false, delete: false },
  coupons: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
}

const PRODUCTS_PERMS: Partial<SubAdminPermissions> = {
  orders: { view: false, edit: false, delete: false, export: false },
  products: { view: true, create: false, edit: false, delete: false },
  coupons: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
}

const COUPONS_PERMS: Partial<SubAdminPermissions> = {
  orders: { view: false, edit: false, delete: false, export: false },
  products: { view: false, create: false, edit: false, delete: false },
  coupons: { view: true, create: true, edit: true, delete: true },
  reports: { view: false, export: false },
}

const REPORTS_PERMS: Partial<SubAdminPermissions> = {
  orders: { view: false, edit: false, delete: false, export: false },
  products: { view: false, create: false, edit: false, delete: false },
  coupons: { view: false, create: false, edit: false, delete: false },
  reports: { view: true, export: true },
}

const NO_PERMS: Partial<SubAdminPermissions> = {
  orders: { view: false, edit: false, delete: false, export: false },
  products: { view: false, create: false, edit: false, delete: false },
  coupons: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
}

// ── Main test runner ──────────────────────────────────────────────────

async function main() {

  // ── ORDERS Route Auth ─────────────────────────────────────────────

  console.log('\n📋 ORDERS API routes — permission checks')

  // Null admin → 401 (simulated as false)
  assert(
    !(await checkOrdersRoute(null, 'view', null)),
    'orders/GET  null admin → Unauthorized (401)',
  )

  // Super admin → always allowed for all actions
  assert(
    await checkOrdersRoute(adminPayload, 'view', null),
    'orders/GET  super admin → allowed to view',
  )
  assert(
    await checkOrdersRoute(adminPayload, 'edit', null),
    'orders/PATCH super admin → allowed to edit status',
  )
  assert(
    await checkOrdersRoute(adminPayload, 'delete', null),
    'orders/DELETE super admin → allowed to delete',
  )
  assert(
    await checkOrdersRoute(adminPayload, 'export', null),
    'orders/Export super admin → allowed to export',
  )

  // Sub-admin with orders.view=true → allowed for view routes
  assert(
    await checkOrdersRoute(subAdminPayload, 'view', ORDERS_PERMS as SubAdminPermissions),
    'orders/GET  sub-admin with view perm → allowed to list',
  )
  assert(
    await checkOrdersRoute(subAdminPayload, 'edit', ORDERS_PERMS as SubAdminPermissions),
    'orders/PATCH sub-admin with edit perm → allowed to update status',
  )

  // Sub-admin with orders.delete=false → denied for delete
  assert(
    !(await checkOrdersRoute(subAdminPayload, 'delete', ORDERS_PERMS as SubAdminPermissions)),
    'orders/DELETE sub-admin without delete perm → denied (403)',
  )

  // Sub-admin with orders.export=false → denied for export
  assert(
    !(await checkOrdersRoute(subAdminPayload, 'export', ORDERS_PERMS as SubAdminPermissions)),
    'orders/Export sub-admin without export perm → denied (403)',
  )

  // Sub-admin with no perms at all (null) → DB fetch fails → denied
  assert(
    !(await checkOrdersRoute(subAdminPayload, 'view', null)),
    'orders/GET  sub-admin with null perms → denied (DB fetch fails → 403)',
  )

  // Sub-admin without subAdminId → can't fetch perms → denied
  assert(
    !(await checkOrdersRoute(subAdminNoId, 'view', null)),
    'orders/GET  sub-admin no subAdminId → denied (DB fetch skipped → 403)',
  )

  // ── PRODUCTS Route Auth ──────────────────────────────────────────

  console.log('\n📋 PRODUCTS API routes — permission checks')

  // Null admin → 401
  assert(
    !(await checkProductsRoute(null, 'view', null)),
    'products/GET  null admin → Unauthorized (401)',
  )

  // Super admin → always allowed
  assert(
    await checkProductsRoute(adminPayload, 'view', null),
    'products/GET  super admin → allowed to list',
  )
  assert(
    await checkProductsRoute(adminPayload, 'create', null),
    'products/POST super admin → allowed to create',
  )
  assert(
    await checkProductsRoute(adminPayload, 'edit', null),
    'products/PUT  super admin → allowed to edit',
  )
  assert(
    await checkProductsRoute(adminPayload, 'delete', null),
    'products/DELETE super admin → allowed to delete',
  )

  // Sub-admin with products.view=true → allowed
  assert(
    await checkProductsRoute(subAdminPayload, 'view', PRODUCTS_PERMS as SubAdminPermissions),
    'products/GET  sub-admin with view perm → allowed to list',
  )

  // Sub-admin with products.create=false → denied
  assert(
    !(await checkProductsRoute(subAdminPayload, 'create', PRODUCTS_PERMS as SubAdminPermissions)),
    'products/POST sub-admin without create perm → denied (403)',
  )

  // Sub-admin with products.edit=false → denied
  assert(
    !(await checkProductsRoute(subAdminPayload, 'edit', PRODUCTS_PERMS as SubAdminPermissions)),
    'products/PUT  sub-admin without edit perm → denied (403)',
  )

  // Sub-admin with products.delete=false → denied
  assert(
    !(await checkProductsRoute(subAdminPayload, 'delete', PRODUCTS_PERMS as SubAdminPermissions)),
    'products/DELETE sub-admin without delete perm → denied (403)',
  )

  // Sub-admin with no perms → denied
  assert(
    !(await checkProductsRoute(subAdminPayload, 'view', null)),
    'products/GET  sub-admin with null perms → denied',
  )

  // ── COUPONS Route Auth ───────────────────────────────────────────

  console.log('\n📋 COUPONS API routes — permission checks')

  // Null admin → 401
  assert(
    !(await checkCouponsRoute(null, 'view', null)),
    'coupons/GET  null admin → Unauthorized (401)',
  )

  // Super admin → always allowed
  assert(
    await checkCouponsRoute(adminPayload, 'view', null),
    'coupons/GET  super admin → allowed to list',
  )
  assert(
    await checkCouponsRoute(adminPayload, 'create', null),
    'coupons/POST super admin → allowed to create',
  )
  assert(
    await checkCouponsRoute(adminPayload, 'edit', null),
    'coupons/PATCH super admin → allowed to edit',
  )
  assert(
    await checkCouponsRoute(adminPayload, 'delete', null),
    'coupons/DELETE super admin → allowed to delete',
  )

  // Sub-admin with all coupon perms → allowed for all
  assert(
    await checkCouponsRoute(subAdminPayload, 'view', COUPONS_PERMS as SubAdminPermissions),
    'coupons/GET  sub-admin with view perm → allowed',
  )
  assert(
    await checkCouponsRoute(subAdminPayload, 'create', COUPONS_PERMS as SubAdminPermissions),
    'coupons/POST sub-admin with create perm → allowed',
  )
  assert(
    await checkCouponsRoute(subAdminPayload, 'edit', COUPONS_PERMS as SubAdminPermissions),
    'coupons/PATCH sub-admin with edit perm → allowed',
  )
  assert(
    await checkCouponsRoute(subAdminPayload, 'delete', COUPONS_PERMS as SubAdminPermissions),
    'coupons/DELETE sub-admin with delete perm → allowed',
  )

  // Sub-admin without any coupon perms → denied
  assert(
    !(await checkCouponsRoute(subAdminPayload, 'view', NO_PERMS as SubAdminPermissions)),
    'coupons/GET  sub-admin without perms → denied',
  )

  // ── REPORTS Route Auth ─────────────────────────────────────────

  console.log('\n📋 REPORTS API routes — permission checks')

  // Null admin → 401
  assert(
    !(await checkReportsRoute(null, 'view', null)),
    'reports/GET  null admin → Unauthorized (401)',
  )

  // Super admin → always allowed
  assert(
    await checkReportsRoute(adminPayload, 'view', null),
    'reports/GET  super admin → allowed to view',
  )
  assert(
    await checkReportsRoute(adminPayload, 'export', null),
    'reports/GET super admin → allowed to export',
  )

  // Sub-admin with reports.view=true → allowed
  assert(
    await checkReportsRoute(subAdminPayload, 'view', REPORTS_PERMS as SubAdminPermissions),
    'reports/GET  sub-admin with view perm → allowed',
  )

  // Sub-admin with reports.export=true → allowed
  assert(
    await checkReportsRoute(subAdminPayload, 'export', REPORTS_PERMS as SubAdminPermissions),
    'reports/Export sub-admin with export perm → allowed',
  )

  // Sub-admin with no report perms → denied for view
  assert(
    !(await checkReportsRoute(subAdminPayload, 'view', NO_PERMS as SubAdminPermissions)),
    'reports/GET  sub-admin without perms → denied',
  )

  // ── CROSS-SECTION TESTING (boundary) ─────────────────────────────

  console.log('\n📋 Cross-section boundary tests')

  // A sub-admin with only ORDERS perms should NOT access PRODUCTS
  assert(
    !(await checkProductsRoute(subAdminPayload, 'view', ORDERS_PERMS as SubAdminPermissions)),
    'orders-only sub-admin → denied to view products',
  )

  // A sub-admin with only PRODUCTS perms should NOT access COUPONS
  assert(
    !(await checkCouponsRoute(subAdminPayload, 'view', PRODUCTS_PERMS as SubAdminPermissions)),
    'products-only sub-admin → denied to view coupons',
  )

  // A sub-admin with only COUPONS perms should NOT access REPORTS
  assert(
    !(await checkReportsRoute(subAdminPayload, 'view', COUPONS_PERMS as SubAdminPermissions)),
    'coupons-only sub-admin → denied to view reports',
  )

  // A sub-admin with only REPORTS perms should NOT access ORDERS
  assert(
    !(await checkOrdersRoute(subAdminPayload, 'view', REPORTS_PERMS as SubAdminPermissions)),
    'reports-only sub-admin → denied to view orders',
  )

  // Test that a sub-admin with no perms gets denied across ALL sections
  for (const section of ['orders', 'products', 'coupons', 'reports'] as const) {
    const denied = await requirePermission(
      subAdminPayload,
      section as PermissionSection,
      'view',
      NO_PERMS as SubAdminPermissions,
    )
    assert(denied !== null, `${section}/GET sub-admin with all-false perms → denied`)
  }

  // ── OLD vs NEW route comparison ──────────────────────────────────

  console.log('\n📋 Old vs New route auth comparison')

  // Old pattern: !admin || !isSuperAdmin(admin) → only super admins allowed
  assert(
    await checkOldSuperAdminRoute(adminPayload),
    'old pattern: super admin → allowed',
  )
  assert(
    !(await checkOldSuperAdminRoute(subAdminPayload)),
    'old pattern: sub-admin → denied (no sub-admin support)',
  )
  assert(
    !(await checkOldSuperAdminRoute(null)),
    'old pattern: null admin → denied',
  )

  // New orders route with sub-admin that has permissions
  assert(
    await checkOrdersRoute(subAdminPayload, 'view', ORDERS_PERMS as SubAdminPermissions),
    'new pattern: sub-admin with orders.view → allowed (unlike old route)',
  )

  // New products route with sub-admin that has permissions
  assert(
    await checkProductsRoute(subAdminPayload, 'view', PRODUCTS_PERMS as SubAdminPermissions),
    'new pattern: sub-admin with products.view → allowed (unlike old route)',
  )

  // New coupons route with sub-admin that has permissions
  assert(
    await checkCouponsRoute(subAdminPayload, 'view', COUPONS_PERMS as SubAdminPermissions),
    'new pattern: sub-admin with coupons.view → allowed (unlike old route)',
  )

  // New reports route with sub-admin that has permissions
  assert(
    await checkReportsRoute(subAdminPayload, 'view', REPORTS_PERMS as SubAdminPermissions),
    'new pattern: sub-admin with reports.view → allowed (unlike old route)',
  )

  // ── Summary ──────────────────────────────────────────────────────

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
