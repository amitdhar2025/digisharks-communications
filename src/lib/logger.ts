import winston from 'winston'
import path from 'path'
import fs from 'fs'

// ── Ensure the logs directory exists ────────────────────────────────────
const logsDir = path.resolve(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

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
  transports: [
    // Write all logs to logs/combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5 * 1024 * 1024, // 5 MB per file
      maxFiles: 5,
    }),
    // Write error-level logs to logs/error.log separately
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
})

// In development, also log to the console with a simpler format
if (process.env.NODE_ENV !== 'production') {
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
}

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
