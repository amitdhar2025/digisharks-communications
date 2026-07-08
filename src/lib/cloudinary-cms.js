/**
 * Cloudinary Configuration & Helpers — for the /content/admin CMS
 *
 * Provides:
 *   uploadToCloudinary(file)   — accepts a File object, uploads to Cloudinary
 *                                 under the 'digisharks/cms' folder, returns
 *                                 { url, publicId }
 *   deleteFromCloudinary(publicId) — deletes a file by its public_id
 */

import { v2 as cloudinary } from 'cloudinary'

// ── Configure Cloudinary with env vars ────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

/**
 * Upload a file to Cloudinary.
 *
 * @param {File} file - The file from a form upload (must be an image or video)
 * @param {Object} [options] - Optional overrides
 * @param {string} [options.folder='digisharks/cms'] - Cloudinary folder
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(file, options = {}) {
  const folder = options.folder || 'digisharks/cms'

  // Read the file as a buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Convert to base64 data URI so we can upload it directly
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'auto', // auto-detect image / video / raw
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

/**
 * Delete a file from Cloudinary by its public_id.
 *
 * This is a best-effort operation — it logs errors but never throws,
 * so deleting a post won't fail just because the image is already gone.
 *
 * @param {string} publicId - The Cloudinary public_id to delete
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId) return

  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true })

    if (result.result === 'ok') {
      console.log(`[cms] Cloudinary: Deleted "${publicId}"`)
    } else if (result.result === 'not found') {
      console.log(`[cms] Cloudinary: "${publicId}" not found (already deleted)`)
    } else {
      console.warn(
        `[cms] Cloudinary: Unexpected result for "${publicId}":`,
        result.result
      )
    }
  } catch (err) {
    console.error(`[cms] Cloudinary: Failed to delete "${publicId}":`, err)
  }
}
