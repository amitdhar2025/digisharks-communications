import { fileTypeFromBuffer } from 'file-type'

/**
 * Allowed MIME types for file uploads.
 * Images: JPEG, PNG, WebP, GIF
 * Videos: MP4, WebM, QuickTime
 * Documents: PDF, DOCX, DOC (for resumes / career applications)
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
])

/** Maximum file size: 100 MB */
const MAX_FILE_SIZE = 100 * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error?: string
  /** Detected MIME type (from magic bytes, NOT the client-supplied value) */
  mime?: string
  /** File extension hint based on detected type */
  ext?: string
}

/**
 * Validate that a file:
 * 1. Does not exceed the maximum size (100 MB).
 * 2. Has a real MIME type (checked via magic bytes using `file-type`) that
 *    is in the allowed list.
 *
 * @param buffer     Raw file buffer.
 * @param clientMime Optional MIME type sent by the client (used only for
 *                   a more helpful error message).
 */
export async function validateFile(
  buffer: Buffer,
  _clientMime?: string,
): Promise<FileValidationResult> {
  // ── Size check ──────────────────────────────────────────────────────────
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds maximum size of 100 MB (received ${(buffer.length / (1024 * 1024)).toFixed(1)} MB)`,
    }
  }

  // ── Magic-byte MIME check ───────────────────────────────────────────────
  let detected: { mime: string; ext: string } | undefined

  try {
    detected = await fileTypeFromBuffer(buffer)
  } catch {
    // file-type may throw on very small or empty buffers
  }

  if (!detected) {
    return {
      valid: false,
      error: 'Unable to detect file type. The file may be empty or corrupted.',
    }
  }

  if (!ALLOWED_MIME_TYPES.has(detected.mime)) {
    return {
      valid: false,
      error: `File type "${detected.mime}" is not allowed. Accepted types: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      mime: detected.mime,
      ext: detected.ext,
    }
  }

  return { valid: true, mime: detected.mime, ext: detected.ext }
}
