/**
 * Registration Form Config Auto-Fix API
 *
 * PATCH /api/content/admin/registration-form-config/autofix
 *
 * Scans all registration form configs and automatically fixes:
 * - Fields with missing/undefined order values (assigns based on array position)
 * - Forms with missing slug (generates from name or key)
 * - Forms with missing name (uses formTitle or key)
 *
 * This eliminates the need to run the migration script manually.
 * Safe to call multiple times — idempotent operation.
 */

import { NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import RegistrationFormConfig from '@/models/RegistrationFormConfig'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { generateSlug } from '@/lib/registration-utils'

export const dynamic = 'force-dynamic'

export async function PATCH() {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectCMSDb()
    const allForms = await RegistrationFormConfig.find({}).lean()

    let totalFormsFixed = 0
    let totalFieldsFixed = 0
    const results: { form: string; fixes: string[] }[] = []
    // Track all existing slugs to avoid collisions within a single run
    const usedSlugs = new Set(allForms.filter(f => f.slug).map(f => f.slug))

    for (const config of allForms) {
      const fixes: string[] = []
      const updateData: Record<string, any> = {}

      // 1. Fix missing slug
      if (!config.slug) {
        let newSlug = config.key === 'registration-form'
          ? 'register'
          : generateSlug(config.name || config.formTitle || config.key || '')
        // Ensure uniqueness within this run
        if (usedSlugs.has(newSlug)) {
          newSlug = newSlug + '-' + Date.now()
        }
        usedSlugs.add(newSlug)
        updateData.slug = newSlug
        fixes.push(`Added slug "${newSlug}"`)
      }

      // 2. Fix missing name
      if (!config.name) {
        const newName = config.formTitle || config.key || 'Unnamed Form'
        updateData.name = newName
        fixes.push(`Added name "${newName}"`)
      }

      // 3. Fix missing/invalid order values on fields
      const fields = config.fields || []
      let maxOrder = 0
      for (const field of fields) {
        if (typeof field.order === 'number' && field.order > maxOrder) {
          maxOrder = field.order
        }
      }

      let fieldsFixed = 0
      for (let i = 0; i < fields.length; i++) {
        if (typeof fields[i].order !== 'number' || isNaN(fields[i].order)) {
          maxOrder++
          fields[i] = { ...fields[i], order: maxOrder }
          fieldsFixed++
        }
      }

      if (fieldsFixed > 0) {
        updateData.fields = fields
        totalFieldsFixed += fieldsFixed
        fixes.push(`Fixed ${fieldsFixed} field(s) with missing order values`)
      }

      // Apply updates if needed (per-form error isolation)
      if (fixes.length > 0) {
        try {
          await RegistrationFormConfig.updateOne(
            { _id: config._id },
            { $set: updateData }
          )
          totalFormsFixed++
        } catch (updateErr) {
          console.error(`[autofix] Failed to update form "${config.key}":`, updateErr)
          fixes.push(`⚠️ Failed to save: ${(updateErr as Error).message}`)
        }
      }

      if (fixes.length > 0) {
        results.push({ form: config.name || config.key, fixes })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-fix complete. ${totalFormsFixed} form(s) updated, ${totalFieldsFixed} field(s) fixed.`,
      formsScanned: allForms.length,
      formsFixed: totalFormsFixed,
      fieldsFixed: totalFieldsFixed,
      details: results,
    })
  } catch (err) {
    console.error('[cms] PATCH /api/content/admin/registration-form-config/autofix error:', err)
    return NextResponse.json({ error: 'Auto-fix failed' }, { status: 500 })
  }
}
