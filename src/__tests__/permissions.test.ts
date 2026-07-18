/**
 * Unit tests for sub-admin permission functions.
 *
 * Tests are pure functions and do NOT require MongoDB or a test framework.
 * Run with: npx tsx src/__tests__/permissions.test.ts
 */

import { hasPermission, isSuperAdmin, DEFAULT_SUBADMIN_PERMISSIONS, FULL_PERMISSIONS } from '../lib/auth'
import { canViewSection, deepMergePermissions } from '../lib/permissions'
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

// ── Test Data ──────────────────────────────────────────────────────────

const adminPayload: AdminPayload = { username: 'superadmin', role: 'admin' }
const subAdminPayload: AdminPayload = { username: 'editor1', role: 'sub-admin', subAdminId: 'abc123' }

// Permissions where orders has view+edit, products has view-only, coupons has all, reports has view+export
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

// ── Tests: isSuperAdmin ────────────────────────────────────────────────

console.log('\n📋 isSuperAdmin')

assertEqual(isSuperAdmin(adminPayload), true, 'admin role returns true')
assertEqual(isSuperAdmin(subAdminPayload), false, 'sub-admin role returns false')
assertEqual(isSuperAdmin(null), false, 'null payload returns false')
assertEqual(isSuperAdmin({ username: 'test', role: 'admin' }), true, 'admin payload without subAdminId')
assertEqual(isSuperAdmin({ username: 'test', role: 'sub-admin', subAdminId: 'x' } as AdminPayload), false, 'sub-admin payload')

// ── Tests: hasPermission — super admin ─────────────────────────────────

console.log('\n📋 hasPermission — super admin (always true)')

// Super admin should always have access regardless of permissions
assertEqual(hasPermission(adminPayload, 'orders', 'view', null), true, 'super admin can view orders')
assertEqual(hasPermission(adminPayload, 'orders', 'edit', null), true, 'super admin can edit orders')
assertEqual(hasPermission(adminPayload, 'orders', 'delete', null), true, 'super admin can delete orders')
assertEqual(hasPermission(adminPayload, 'orders', 'export', null), true, 'super admin can export orders')
assertEqual(hasPermission(adminPayload, 'products', 'create', null), true, 'super admin can create products')
assertEqual(hasPermission(adminPayload, 'products', 'view', null), true, 'super admin can view products')
assertEqual(hasPermission(adminPayload, 'products', 'edit', null), true, 'super admin can edit products')
assertEqual(hasPermission(adminPayload, 'products', 'delete', null), true, 'super admin can delete products')
assertEqual(hasPermission(adminPayload, 'coupons', 'view', null), true, 'super admin can view coupons')
assertEqual(hasPermission(adminPayload, 'reports', 'view', null), true, 'super admin can view reports')
assertEqual(hasPermission(adminPayload, 'reports', 'export', null), true, 'super admin can export reports')

// ── Tests: hasPermission — sub-admin with custom permissions ───────────

console.log('\n📋 hasPermission — sub-admin with custom permissions')

// orders: view=true, edit=true, delete=false, export=false
assertEqual(hasPermission(subAdminPayload, 'orders', 'view', CUSTOM_PERMS), true, 'sub-admin can view orders')
assertEqual(hasPermission(subAdminPayload, 'orders', 'edit', CUSTOM_PERMS), true, 'sub-admin can edit orders')
assertEqual(hasPermission(subAdminPayload, 'orders', 'delete', CUSTOM_PERMS), false, 'sub-admin cannot delete orders')
assertEqual(hasPermission(subAdminPayload, 'orders', 'export', CUSTOM_PERMS), false, 'sub-admin cannot export orders')

// products: view=true, create=false, edit=false, delete=false
assertEqual(hasPermission(subAdminPayload, 'products', 'view', CUSTOM_PERMS), true, 'sub-admin can view products')
assertEqual(hasPermission(subAdminPayload, 'products', 'create', CUSTOM_PERMS), false, 'sub-admin cannot create products')
assertEqual(hasPermission(subAdminPayload, 'products', 'edit', CUSTOM_PERMS), false, 'sub-admin cannot edit products')
assertEqual(hasPermission(subAdminPayload, 'products', 'delete', CUSTOM_PERMS), false, 'sub-admin cannot delete products')

// coupons: all true
assertEqual(hasPermission(subAdminPayload, 'coupons', 'view', CUSTOM_PERMS), true, 'sub-admin can view coupons')
assertEqual(hasPermission(subAdminPayload, 'coupons', 'create', CUSTOM_PERMS), true, 'sub-admin can create coupons')
assertEqual(hasPermission(subAdminPayload, 'coupons', 'edit', CUSTOM_PERMS), true, 'sub-admin can edit coupons')
assertEqual(hasPermission(subAdminPayload, 'coupons', 'delete', CUSTOM_PERMS), true, 'sub-admin can delete coupons')

// reports: view=true, export=true
assertEqual(hasPermission(subAdminPayload, 'reports', 'view', CUSTOM_PERMS), true, 'sub-admin can view reports')
assertEqual(hasPermission(subAdminPayload, 'reports', 'export', CUSTOM_PERMS), true, 'sub-admin can export reports')

// ── Tests: hasPermission — sub-admin without permissions ───────────────

console.log('\n📋 hasPermission — sub-admin without permissions data')

assertEqual(hasPermission(subAdminPayload, 'orders', 'view', null), false, 'no permissions object → false')
assertEqual(hasPermission(subAdminPayload, 'orders', 'view', undefined), false, 'undefined permissions → false')
assertEqual(hasPermission(subAdminPayload, 'orders', 'view', DEFAULT_SUBADMIN_PERMISSIONS), false, 'default perms (all false) → false')

// ── Tests: hasPermission — no payload ─────────────────────────────────

console.log('\n📋 hasPermission — null/undefined payload')

assertEqual(hasPermission(null, 'orders', 'view', CUSTOM_PERMS), false, 'null payload → false')
assertEqual(hasPermission(undefined as unknown as AdminPayload, 'orders', 'view', CUSTOM_PERMS), false, 'undefined payload → false')

// ── Tests: hasPermission — missing section in permissions object ───────

console.log('\n📋 hasPermission — edge cases')

// Pass an incomplete permissions object (missing the requested section)
const incompletePerms = {
  ...CUSTOM_PERMS,
  orders: undefined as unknown as SubAdminPermissions['orders'],
}
assertEqual(hasPermission(subAdminPayload, 'orders', 'view', incompletePerms as SubAdminPermissions), false, 'undefined section in permissions → false')

// ── Tests: canViewSection ──────────────────────────────────────────────

console.log('\n📋 canViewSection')

// Super admin: always true
assertEqual(canViewSection(adminPayload, 'orders', null), true, 'super admin can always view')
assertEqual(canViewSection(adminPayload, 'products', null), true, 'super admin can always view products')
assertEqual(canViewSection(adminPayload, 'coupons', null), true, 'super admin can always view coupons')
assertEqual(canViewSection(adminPayload, 'reports', null), true, 'super admin can always view reports')
assertEqual(canViewSection(adminPayload, 'unknown_section' as any, null), true, 'super admin can view even unknown sections')

// Sub-admin with custom permissions: should return true if any action in the section is true
assertEqual(canViewSection(subAdminPayload, 'orders', CUSTOM_PERMS), true, 'sub-admin can view orders section (has view+edit)')
assertEqual(canViewSection(subAdminPayload, 'products', CUSTOM_PERMS), true, 'sub-admin can view products section (has view)')
assertEqual(canViewSection(subAdminPayload, 'coupons', CUSTOM_PERMS), true, 'sub-admin can view coupons section (has all)')
assertEqual(canViewSection(subAdminPayload, 'reports', CUSTOM_PERMS), true, 'sub-admin can view reports section (has view+export)')

// Sub-admin with no permissions for a section
assertEqual(canViewSection(subAdminPayload, 'store', CUSTOM_PERMS), false, 'sub-admin cannot view store (all false)')
assertEqual(canViewSection(subAdminPayload, 'blog', CUSTOM_PERMS), false, 'sub-admin cannot view blog (all false)')
assertEqual(canViewSection(subAdminPayload, 'career', CUSTOM_PERMS), false, 'sub-admin cannot view career (all false)')

// Sub-admin with default perms (all false)
assertEqual(canViewSection(subAdminPayload, 'orders', DEFAULT_SUBADMIN_PERMISSIONS), false, 'default perms → cannot view orders')
assertEqual(canViewSection(subAdminPayload, 'products', DEFAULT_SUBADMIN_PERMISSIONS), false, 'default perms → cannot view products')

// Sub-admin without permissions object
assertEqual(canViewSection(subAdminPayload, 'orders', null), false, 'null perms → cannot view')
assertEqual(canViewSection(subAdminPayload, 'orders', undefined), false, 'undefined perms → cannot view')

// Null/undefined payload
assertEqual(canViewSection(null, 'orders', CUSTOM_PERMS), false, 'null payload → cannot view')
assertEqual(canViewSection(undefined as unknown as AdminPayload, 'orders', CUSTOM_PERMS), false, 'undefined payload → cannot view')

// ── Tests: deepMergePermissions ────────────────────────────────────────

console.log('\n📋 deepMergePermissions')

// Starting from all-false defaults
const merged1 = deepMergePermissions(DEFAULT_SUBADMIN_PERMISSIONS, {
  orders: { view: true, edit: true },
  products: { view: true },
})
assertEqual(merged1.orders.view, true, 'orders view becomes true after merge')
assertEqual(merged1.orders.edit, true, 'orders edit becomes true after merge')
assertEqual(merged1.orders.delete, false, 'orders delete stays false (not in override)')
assertEqual(merged1.orders.export, false, 'orders export stays false (not in override)')
assertEqual(merged1.products.view, true, 'products view becomes true after merge')
assertEqual(merged1.products.create, false, 'products create stays false (not in override)')
assertEqual(merged1.blog.view, false, 'other sections are unaffected')

// Starting from FULL, override specific sections
const merged2 = deepMergePermissions(FULL_PERMISSIONS, {
  orders: { delete: false, export: false },
  products: { create: false },
})
assertEqual(merged2.orders.view, true, 'orders view stays true (not overridden)')
assertEqual(merged2.orders.edit, true, 'orders edit stays true (not overridden)')
assertEqual(merged2.orders.delete, false, 'orders delete overridden to false')
assertEqual(merged2.orders.export, false, 'orders export overridden to false')
assertEqual(merged2.products.view, true, 'products view stays true')
assertEqual(merged2.products.create, false, 'products create overridden to false')
assertEqual(merged2.products.edit, true, 'products edit stays true (not overridden)')
assertEqual(merged2.reports.view, true, 'reports view stays true (not overridden)')
assertEqual(merged2.reports.export, true, 'reports export stays true (not overridden)')

// Override with empty object (no changes)
const merged3 = deepMergePermissions(DEFAULT_SUBADMIN_PERMISSIONS, {})
assertDeepEqual(merged3, DEFAULT_SUBADMIN_PERMISSIONS, 'empty override returns base unchanged')

// Override with unknown section (should be ignored if not in base)
const merged4 = deepMergePermissions(DEFAULT_SUBADMIN_PERMISSIONS, {
    orders: { view: true },
    nonexistent: { foo: true },
  } as any)
assertEqual(merged4.orders.view, true, 'orders view updated despite unknown section in override')
assertEqual(Object.keys(merged4).includes('nonexistent' as any), false, 'unknown section is NOT added to result')

// ── Tests: DEFAULT_SUBADMIN_PERMISSIONS has new sections ───────────────

console.log('\n📋 DEFAULT_SUBADMIN_PERMISSIONS — new section verification')

assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS, 'orders'), 'DEFAULT has orders section')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS, 'products'), 'DEFAULT has products section')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS, 'coupons'), 'DEFAULT has coupons section')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS, 'reports'), 'DEFAULT has reports section')

// Verify action keys are correct
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.orders, 'view'), 'orders has view')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.orders, 'edit'), 'orders has edit')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.orders, 'delete'), 'orders has delete')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.orders, 'export'), 'orders has export')

assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.products, 'view'), 'products has view')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.products, 'create'), 'products has create')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.products, 'edit'), 'products has edit')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.products, 'delete'), 'products has delete')

assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.coupons, 'view'), 'coupons has view')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.coupons, 'create'), 'coupons has create')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.coupons, 'edit'), 'coupons has edit')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.coupons, 'delete'), 'coupons has delete')

assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.reports, 'view'), 'reports has view')
assert(Object.hasOwn(DEFAULT_SUBADMIN_PERMISSIONS.reports, 'export'), 'reports has export')

// ── Tests: FULL_PERMISSIONS has new sections ──────────────────────────

console.log('\n📋 FULL_PERMISSIONS — new section verification')

assert(Object.hasOwn(FULL_PERMISSIONS, 'orders'), 'FULL has orders section')
assert(Object.hasOwn(FULL_PERMISSIONS, 'products'), 'FULL has products section')
assert(Object.hasOwn(FULL_PERMISSIONS, 'coupons'), 'FULL has coupons section')
assert(Object.hasOwn(FULL_PERMISSIONS, 'reports'), 'FULL has reports section')

// Verify all actions are set to true
assertEqual(FULL_PERMISSIONS.orders.view, true, 'FULL orders view = true')
assertEqual(FULL_PERMISSIONS.orders.edit, true, 'FULL orders edit = true')
assertEqual(FULL_PERMISSIONS.orders.delete, true, 'FULL orders delete = true')
assertEqual(FULL_PERMISSIONS.orders.export, true, 'FULL orders export = true')

assertEqual(FULL_PERMISSIONS.products.view, true, 'FULL products view = true')
assertEqual(FULL_PERMISSIONS.products.create, true, 'FULL products create = true')
assertEqual(FULL_PERMISSIONS.products.edit, true, 'FULL products edit = true')
assertEqual(FULL_PERMISSIONS.products.delete, true, 'FULL products delete = true')

assertEqual(FULL_PERMISSIONS.coupons.view, true, 'FULL coupons view = true')
assertEqual(FULL_PERMISSIONS.coupons.create, true, 'FULL coupons create = true')
assertEqual(FULL_PERMISSIONS.coupons.edit, true, 'FULL coupons edit = true')
assertEqual(FULL_PERMISSIONS.coupons.delete, true, 'FULL coupons delete = true')

assertEqual(FULL_PERMISSIONS.reports.view, true, 'FULL reports view = true')
assertEqual(FULL_PERMISSIONS.reports.export, true, 'FULL reports export = true')

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
