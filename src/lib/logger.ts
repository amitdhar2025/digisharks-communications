import winston from 'winston'
import path from 'path'
import fs from 'fs'

// ── Sensitive field patterns (for masking in logs) ────────────────────────
const SENSITIVE_KEYS = [
  /password/i,
  /secret/i,
  /token/i,
  /auth/i,
  /jwt/i,
  /key/i,
  /api[-_]?key/i,
  /authorization/i,
  /cookie/i,
  /credential/i,
  /access[-_]?token/i,
  /refresh[-_]?token/i,
  /bearer/i,
  /otp/i,
  /pin/i,
  /ssn/i,
  /aadhaar/i,
  /pan[-_]?card/i,
]

/**
 * Recursively mask sensitive fields in an object before logging.
 * Replaces the value with '[REDACTED]' for matching keys.
 */
export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((pattern) => pattern.test(key))
    if (isSensitive) {
      masked[key] = '[REDACTED]'
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      masked[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? maskSensitiveData(item as Record<string, unknown>)
          : item,
      )
    } else {
      masked[key] = value
    }
  }
  return masked
}

// ── Detect serverless / Vercel environment ──────────────────────────────
const isServerless = !!process.env.VERCEL

// ── Define log format ───────────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// ── Create the logger instance ──────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'digisharks-api' },
  transports: [],
})

// ── Determine logs directory ───────────────────────────────────────────
// On Vercel serverless, /tmp is the only writable directory (~512 MB limit,
// shared across all functions in the same instance). Logs written there are
// ephemeral — they survive for the lifetime of the serverless instance and
// are useful for debugging within a single invocation.
const logsDir = isServerless
  ? path.resolve('/tmp', 'logs')
  : path.resolve(process.cwd(), 'logs')

// ── Ensure the logs directory exists ────────────────────────────────────
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Use conservative sizes on serverless /tmp to stay within the 512 MB limit
const fileMaxSize = isServerless ? 1 * 1024 * 1024 : 5 * 1024 * 1024 // 1 MB / 5 MB
const combinedMaxFiles = isServerless ? 3 : 5
const errorMaxFiles = isServerless ? 2 : 3

// Write all logs to logs/combined.log
logger.add(
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: fileMaxSize,
    maxFiles: combinedMaxFiles,
  }),
)
// Write error-level logs to logs/error.log separately
logger.add(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: fileMaxSize,
    maxFiles: errorMaxFiles,
  }),
)

// Always log to the console with a simpler format
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length > 1
          ? ` ${JSON.stringify(omit(meta, ['service']))}`
          : ''
        return `${timestamp} [${level}]: ${message}${metaStr}`
      }),
    ),
  }),
)

/**
 * Log an API request with structured metadata.
 */
export function logApiRequest(
  ip: string,
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  extra: Record<string, unknown> = {},
): void {
  const safeExtra = maskSensitiveData(extra)
  logger.info('API request', {
    ip,
    method,
    path,
    statusCode,
    durationMs,
    ...safeExtra,
  })
}

/**
 * Log an authentication event (login, logout, failed attempt).
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'login_failed' | 'access',
  username: string,
  ip: string,
  extra: Record<string, unknown> = {},
): void {
  const level = event === 'login_failed' ? 'warn' : 'info'
  const safeExtra = maskSensitiveData(extra)
  logger.log(level, `Auth: ${event}`, { event, username, ip, ...safeExtra })
}

// ── Helpers ─────────────────────────────────────────────────────────────

function omit<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): Partial<T> {
  const result = { ...obj }
  for (const key of keys) {
    delete (result as any)[key]
  }
  return result
}

export default logger
