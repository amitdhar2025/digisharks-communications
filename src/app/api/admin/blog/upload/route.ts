import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

// --------------------------------------------------------------------------
// Lossless image compression via sharp before uploading to Cloudinary.
// Each format uses different settings — all preserve original quality.
// --------------------------------------------------------------------------
function getOptimisedFormat(ext: string): { format: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff'; options: Record<string, any> } {
  switch (ext) {
    case '.png':
      return {
        format: 'png',
        options: { compressionLevel: 9, force: true },
      }
    case '.jpg':
    case '.jpeg':
      return {
        format: 'jpeg',
        options: {
          quality: 100,
          chromaSubsampling: '4:4:4',
          mozjpeg: true,
          trellisQuantisation: true,
          overshootDeringing: true,
          optimiseScans: true,
          force: true,
        },
      }
    case '.webp':
      return {
        format: 'webp',
        options: { quality: 100, lossless: true, reductionEffort: 6, force: true },
      }
    case '.avif':
      return {
        format: 'avif',
        options: { quality: 100, lossless: true, force: true },
      }
    case '.tiff':
      return {
        format: 'tiff',
        options: { compression: 'lzw', force: true },
      }
    default:
      // For unknown formats, keep as-is by re-encoding to png losslessly
      return {
        format: 'png',
        options: { compressionLevel: 9, force: true },
      }
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 10MB after compression overhead)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be less than 10MB' }, { status: 400 })
    }

    // Read the raw file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine the file extension from MIME type
    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/avif': '.avif',
      'image/tiff': '.tiff',
    }
    const ext = extMap[file.type] || '.png'

    // ----------------------------------------------------------------------
    // Step 1: Losslessly compress via sharp (runs on the server via Next.js)
    // ----------------------------------------------------------------------
    const { format, options } = getOptimisedFormat(ext)
    let compressedBuffer: Buffer
    try {
      compressedBuffer = await sharp(buffer)
        .toFormat(format, options)
        .toBuffer()
    } catch (compressErr) {
      // If sharp fails for any reason, fall back to the original buffer
      console.warn('Sharp compression failed, uploading original:', compressErr)
      compressedBuffer = buffer
    }

    // Determine the correct MIME type for the compressed output
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      avif: 'image/avif',
      tiff: 'image/tiff',
    }
    const compressedMime = mimeMap[format] || file.type

    const compressionRatio = ((1 - compressedBuffer.length / buffer.length) * 100).toFixed(1)
    console.log(`Blog upload: compressed ${file.name} (${(buffer.length / 1024).toFixed(1)} KB → ${(compressedBuffer.length / 1024).toFixed(1)} KB, -${compressionRatio}%)`)

    // Convert compressed buffer to base64 for Cloudinary upload
    const base64 = compressedBuffer.toString('base64')
    const dataUri = `data:${compressedMime};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'digisharks/blog',
      resource_type: 'image',
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (err) {
    console.error('POST /api/admin/blog/upload error', err)
    return NextResponse.json({ error: 'Failed to upload image. Check Cloudinary config.' }, { status: 500 })
  }
}
