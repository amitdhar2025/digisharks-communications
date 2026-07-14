/**
 * Registration Form Config API — Multi-form support
 *
 * GET    /api/content/admin/registration-form-config              — list all forms (or get one by ?key=)
 * POST   /api/content/admin/registration-form-config              — create a new form
 * PUT    /api/content/admin/registration-form-config              — update a form (body.key required)
 * DELETE /api/content/admin/registration-form-config?key=xxx      — delete a form
 *
 * Auto-fix: PATCH /api/content/admin/registration-form-config/autofix
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectCMSDb } from '@/lib/db-cms'
import RegistrationFormConfig from '@/models/RegistrationFormConfig'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { DEFAULT_FIELDS } from '@/lib/registration-defaults'
import { generateSlug, ensureValidOrders, normalizeFields } from '@/lib/registration-utils'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

async function getCollection() {
  await connectCMSDb()
  return RegistrationFormConfig
}

export async function GET(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const Model = await getCollection()
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    const slug = searchParams.get('slug')

    // Get a single form by key or slug
    if (key || slug) {
      const query: Record<string, any> = {}
      if (key) query.key = key
      if (slug) query.slug = slug

      let config = await Model.findOne(query).lean()

      if (!config && key === 'registration-form') {
        // Auto-create the default form in the DB so it can be edited/saved later
        config = await Model.create({
          key: 'registration-form',
          slug: 'register',
          name: 'Main Registration',
          formTitle: 'Register With Us',
          formSubtitle: 'Fill in the form below to register. We\'ll get back to you shortly.',
          successMessage: 'Thank you for registering with Digisharks Communications. Your submission has been received successfully.',
          submitButtonText: 'Submit Registration',
          isEnabled: true,
          formBannerUrl: '',
          fields: DEFAULT_FIELDS,
        })
        config = config.toObject()
      }

      if (!config) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 })
      }

      // Normalize fields: ensure type-specific defaults are always present
      const normalizedConfig = Array.isArray((config as any).fields) ? {
        ...config,
        fields: normalizeFields((config as any).fields),
      } : config
      const { _id, __v, ...data } = normalizedConfig
      return NextResponse.json({ config: data })
    }

    // List all forms
    const allConfigs = await Model.find({})
      .select('-fields') // Don't send full fields in list view
      .sort({ createdAt: -1 })
      .lean()

    const forms = allConfigs.map(({ _id, __v, ...rest }: any) => ({
      ...rest,
      fieldCount: rest.fields?.length || 0,
    }))

    return NextResponse.json({ forms, total: forms.length })
  } catch (err) {
    console.error('[cms] GET /api/content/admin/registration-form-config error:', err)
    return NextResponse.json({ error: 'Failed to fetch form config' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const Model = await getCollection()

    const name = body.name || 'New Form'
    const key = body.key || generateSlug(name)
    const slug = body.slug || generateSlug(name)

    // Check for duplicate key or slug
    const existing = await Model.findOne({ $or: [{ key }, { slug }] }).lean()
    if (existing) {
      return NextResponse.json(
        { error: `A form with key "${key}" or slug "${slug}" already exists` },
        { status: 409 }
      )
    }

    const newForm = await Model.create({
      key,
      slug,
      name,
      formTitle: body.formTitle || name,
      formSubtitle: body.formSubtitle || '',
      successMessage: body.successMessage || 'Thank you for your submission.',
      submitButtonText: body.submitButtonText || 'Submit',
      isEnabled: body.isEnabled !== undefined ? body.isEnabled : true,
      formBannerUrl: body.formBannerUrl || '',
      fields: body.fields || DEFAULT_FIELDS,
    })

    logActivity({ event: 'form_create', description: `Created registration form: ${name} (${key})`, username: admin.username, dashboard: 'cms', target: key }).catch(() => {})
    const { _id, __v, ...data } = newForm.toObject()
    return NextResponse.json({ config: data, success: true }, { status: 201 })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/registration-form-config error:', err)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const Model = await getCollection()

    const formKey = body.key
    if (!formKey) {
      return NextResponse.json({ error: 'Missing "key" in request body' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}

    // Allowed top-level fields
    const allowedFields = [
      'key', 'slug', 'name', 'formTitle', 'formSubtitle', 'successMessage',
      'submitButtonText', 'isEnabled', 'fields', 'formBannerUrl',
    ]
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // If slug is being changed, validate and check for uniqueness
    if (updateData.slug !== undefined) {
      if (!updateData.slug || updateData.slug.trim() === '') {
        return NextResponse.json({ error: 'Slug cannot be empty' }, { status: 400 })
      }
      updateData.slug = updateData.slug.toLowerCase().trim()
      const slugConflict = await Model.findOne({ slug: updateData.slug, key: { $ne: formKey } }).lean()
      if (slugConflict) {
        return NextResponse.json(
          { error: `Slug "${updateData.slug}" is already taken by another form` },
          { status: 409 }
        )
      }
    }

    // Validate and auto-fix field order values before persisting
    if (updateData.fields && Array.isArray(updateData.fields)) {
      const { fields: fixedFields, fixedCount } = ensureValidOrders(updateData.fields)
      if (fixedCount > 0) {
        updateData.fields = fixedFields
        console.warn(`[cms] Auto-fixed ${fixedCount} field(s) with missing order values for form "${formKey}"`)
      }
    }

    const updated = await Model.findOneAndUpdate(
      { key: formKey },
      { $set: updateData },
      { new: true }
    ).lean()

    if (!updated) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const { _id, __v, ...data } = updated
    logActivity({ event: 'form_update', description: `Updated registration form: ${data.name} (${formKey})`, username: admin.username, dashboard: 'cms', target: formKey }).catch(() => {})
    return NextResponse.json({ config: data, success: true })
  } catch (err) {
    console.error('[cms] PUT /api/content/admin/registration-form-config error:', err)
    return NextResponse.json({ error: 'Failed to save form config' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Missing "key" query parameter' }, { status: 400 })
    }

    // Prevent deleting the default form
    if (key === 'registration-form') {
      return NextResponse.json({ error: 'Cannot delete the default registration form' }, { status: 400 })
    }

    const Model = await getCollection()
    const result = await Model.deleteOne({ key })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    logActivity({ event: 'form_delete', description: `Deleted registration form: ${key}`, username: admin.username, dashboard: 'cms', target: key }).catch(() => {})
    return NextResponse.json({ success: true, message: 'Form deleted' })
  } catch (err) {
    console.error('[cms] DELETE /api/content/admin/registration-form-config error:', err)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
