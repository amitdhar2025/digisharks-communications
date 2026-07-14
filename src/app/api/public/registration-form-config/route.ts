/**
 * Public Registration Form Config API
 *
 * GET /api/public/registration-form-config?slug=register
 *
 * Returns the form field configuration for the public registration page.
 * Supports multiple forms via slug parameter.
 * Falls back to the default 'registration-form' if no slug is provided.
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import RegistrationFormConfig from '@/models/RegistrationFormConfig'
import { DEFAULT_CONFIG } from '@/lib/registration-defaults'
import { normalizeFields } from '@/lib/registration-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectCMSDb()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    let config
    if (slug) {
      config = await RegistrationFormConfig.findOne({ slug, isEnabled: true }).lean()
    }

    // Fallback to the default form
    if (!config) {
      config = await RegistrationFormConfig.findOne({ key: 'registration-form', isEnabled: true }).lean()
    }

    if (!config) {
      return NextResponse.json({ config: DEFAULT_CONFIG })
    }

    // Normalize fields: ensure type-specific properties are always present
    // (Mongoose .lean() may strip empty-string defaults)
    const normalizedConfig = {
      ...config,
      fields: normalizeFields(config.fields || []),
    }
    const { _id, __v, createdAt, updatedAt, ...data } = normalizedConfig
    return NextResponse.json({ config: data })
  } catch (err) {
    console.error('[public] GET /api/public/registration-form-config error:', err)
    return NextResponse.json({ config: DEFAULT_CONFIG })
  }
}
