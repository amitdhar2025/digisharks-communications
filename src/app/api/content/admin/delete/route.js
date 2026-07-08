/**
 * CMS Cloudinary Delete API
 *
 * POST /api/content/admin/delete
 *
 * Accepts a Cloudinary URL, extracts the public_id, and deletes
 * the file from Cloudinary. Called automatically when images/videos
 * are removed from CMS content to keep Cloudinary storage clean.
 *
 * Body: { url: string }
 * Response: { success: true, deleted: "..." } or { error: "..." }
 */

import { NextResponse } from 'next/server'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Only process Cloudinary URLs
    if (!url.includes('res.cloudinary.com/')) {
      return NextResponse.json(
        { error: 'Not a Cloudinary URL' },
        { status: 400 }
      )
    }

    // Import helper lazily (avoids circular deps)
    const { extractPublicId, detectResourceType, deleteFromCloudinary } = await import('@/lib/cloudinary-delete')

    const publicId = extractPublicId(url)
    if (!publicId) {
      return NextResponse.json(
        { error: 'Could not extract public_id from URL' },
        { status: 400 }
      )
    }

    const resourceType = detectResourceType(url)
    await deleteFromCloudinary(publicId, resourceType)

    return NextResponse.json({
      success: true,
      deleted: publicId,
      resourceType,
    })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/delete error:', err)
    return NextResponse.json(
      { error: 'Failed to delete file from Cloudinary' },
      { status: 500 }
    )
  }
}
