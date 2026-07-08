/**
 * CMS Cloudinary Upload API
 *
 * POST /api/content/admin/upload
 *
 * Accepts an image file via FormData, uploads it to Cloudinary
 * under the 'digisharks/cms' folder, and returns the secure URL
 * and public_id.
 */

import { NextResponse } from 'next/server'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { uploadToCloudinary } from '@/lib/cloudinary-cms'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const admin = await getCMSAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('image')

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images + videos)
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
      'image/tiff',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type "${file.type}". Allowed: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, MP4, WebM, OGG, MOV`,
        },
        { status: 400 }
      )
    }

    // Validate file size (images: 10 MB, videos: 100 MB)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${isVideo ? '100 MB' : '10 MB'}.` },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file)

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    })
  } catch (err) {
    console.error('[cms] POST /api/content/admin/upload error:', err)
    return NextResponse.json(
      { error: 'Failed to upload image. Check Cloudinary configuration.' },
      { status: 500 }
    )
  }
}
