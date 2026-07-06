import winston from 'winston'
import path from 'path'
import fs from 'fs'

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
  logger.info('API request', {
    ip,
    method,
    path,
    statusCode,
    durationMs,
    ...extra,
  })
}

/**
 * Log an authentication event (login, logout, failed attempt).
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'login_failed',
  username: string,
  ip: string,
  extra: Record<string, unknown> = {},
): void {
  const level = event === 'login_failed' ? 'warn' : 'info'
  logger.log(level, `Auth: ${event}`, { event, username, ip, ...extra })
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
