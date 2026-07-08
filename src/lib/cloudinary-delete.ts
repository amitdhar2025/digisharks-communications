/**
 * Cloudinary File Deletion Helper
 *
 * Extracts Cloudinary public IDs from URLs and deletes associated files
 * (images, videos, raw) via the Cloudinary API.
 */

/**
 * Extract the public_id from a Cloudinary URL.
 *
 * Examples:
 *   Input: https://res.cloudinary.com/df147mibj/image/upload/v1234/blog/my-image.jpg
 *   Output: blog/my-image
 *
 *   Input: https://res.cloudinary.com/df147mibj/video/upload/v5678/folder/video-file.mp4
 *   Output: folder/video-file
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') return null
  if (!cloudinaryUrl.includes('res.cloudinary.com/')) return null

  try {
    // Pattern: /upload/v<version>/<path-with-extension>
    const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)/)
    if (!match) return null

    let publicId = match[1]
    // Remove file extension
    const extDot = publicId.lastIndexOf('.')
    if (extDot > 0) publicId = publicId.substring(0, extDot)

    return publicId || null
  } catch {
    return null
  }
}

/**
 * Determine resource type from a Cloudinary URL.
 */
export function detectResourceType(cloudinaryUrl: string): 'image' | 'video' | 'raw' {
  if (!cloudinaryUrl) return 'image'
  if (cloudinaryUrl.includes('/video/upload/')) return 'video'
  if (cloudinaryUrl.includes('/raw/upload/')) return 'raw'

  // Check file extension as fallback
  const ext = cloudinaryUrl.split('.').pop()?.toLowerCase() || ''
  const videoExts = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'ogg', '3gp']
  const rawExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'gz', 'csv', 'json', 'xml', 'txt']

  if (videoExts.includes(ext)) return 'video'
  if (rawExts.includes(ext)) return 'raw'
  return 'image'
}

/**
 * Delete a single file from Cloudinary.
 * Logs success/failure and does NOT throw if the file is not found.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image',
): Promise<void> {
  try {
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    })

    const options: Record<string, string> = {
      invalidate: 'true',
    }
    if (resourceType !== 'image') options.resource_type = resourceType

    const result = await cloudinary.uploader.destroy(publicId, options)

    if (result.result === 'ok') {
      console.log(`Cloudinary: Deleted ${resourceType} "${publicId}"`)
    } else if (result.result === 'not found') {
      console.log(`Cloudinary: File "${publicId}" already deleted or not found`)
    } else {
      console.warn(`Cloudinary: Unexpected result for "${publicId}":`, result.result)
    }
  } catch (err) {
    console.error(`Cloudinary: Failed to delete "${publicId}" (${resourceType}):`, err)
    // Don't throw — Cloudinary cleanup is best-effort
  }
}

/**
 * Recursively find all Cloudinary URLs in an object and extract public IDs.
 */
export function findAllCloudinaryFiles(data: unknown, depth = 0): { publicId: string; resourceType: 'image' | 'video' | 'raw' }[] {
  if (depth > 20) return [] // prevent infinite recursion
  if (!data) return []

  const results: { publicId: string; resourceType: 'image' | 'video' | 'raw' }[] = []

  if (typeof data === 'string') {
    if (data.includes('res.cloudinary.com/')) {
      const publicId = extractPublicId(data)
      if (publicId) {
        results.push({
          publicId,
          resourceType: detectResourceType(data),
        })
      }
    }
    // Also check for Cloudinary URLs embedded in strings (e.g. HTML content)
    const urlRegex = /https?:\/\/res\.cloudinary\.com\/[^\s"']+/g
    let match
    while ((match = urlRegex.exec(data)) !== null) {
      const pid = extractPublicId(match[0])
      if (pid && !results.some(r => r.publicId === pid)) {
        results.push({
          publicId: pid,
          resourceType: detectResourceType(match[0]),
        })
      }
    }
  } else if (Array.isArray(data)) {
    for (const item of data) {
      results.push(...findAllCloudinaryFiles(item, depth + 1))
    }
  } else if (typeof data === 'object' && data !== null) {
    for (const value of Object.values(data as Record<string, unknown>)) {
      results.push(...findAllCloudinaryFiles(value, depth + 1))
    }
  }

  return results
}

/**
 * Delete all Cloudinary files associated with a document (or any data object).
 * Scans all fields for Cloudinary URLs and deletes each one.
 */
export async function deleteAllItemFiles(item: unknown): Promise<void> {
  if (!item) return

  const files = findAllCloudinaryFiles(item)
  if (files.length === 0) {
    console.log('Cloudinary: No files found to delete')
    return
  }

  // Deduplicate by publicId
  const seen = new Set<string>()
  const uniqueFiles = files.filter(f => {
    if (seen.has(f.publicId)) return false
    seen.add(f.publicId)
    return true
  })

  console.log(`Cloudinary: Deleting ${uniqueFiles.length} file(s)...`)

  await Promise.allSettled(
    uniqueFiles.map(f => deleteFromCloudinary(f.publicId, f.resourceType)),
  )

  console.log(`Cloudinary: Finished deleting ${uniqueFiles.length} file(s)`)
}

/**
 * Interface for items with Cloudinary data stored in trash.
 */
export interface CloudinaryCleanupItem {
  _id?: string
  data?: Record<string, unknown>
}
