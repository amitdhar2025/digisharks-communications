import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { logAuthEvent } from '@/lib/logger'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const dynamic = 'force-dynamic'

// Determine logs directory — same logic as logger.ts
const isServerless = !!process.env.VERCEL
const LOGS_DIR = isServerless
  ? path.resolve('/tmp', 'logs')
  : path.resolve(process.cwd(), 'logs')
const ERROR_LOG = path.join(LOGS_DIR, 'error.log')
const COMBINED_LOG = path.join(LOGS_DIR, 'combined.log')

/** Read last N lines from a file */
function tail(filePath: string, lines: number = 100): string[] {
  try {
    if (!fs.existsSync(filePath)) return []
    const content = fs.readFileSync(filePath, 'utf-8')
    const allLines = content.split('\n').filter(Boolean)
    return allLines.slice(-lines)
  } catch {
    return []
  }
}

/** Get system info */
function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      total: Math.round(os.totalmem() / (1024 * 1024)),
      free: Math.round(os.freemem() / (1024 * 1024)),
    },
    uptime: Math.round(os.uptime() / 3600), // hours
    cpus: os.cpus().length,
    env: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL,
    pid: process.pid,
    cwd: process.cwd(),
  }
}

function getLogStats() {
  const stats: { file: string; size: string; lines: number; exists: boolean }[] = []
  for (const filepath of [ERROR_LOG, COMBINED_LOG]) {
    const exists = fs.existsSync(filepath)
    let size = '0 B'
    let lines = 0
    if (exists) {
      const stat = fs.statSync(filepath)
      size = stat.size < 1024 ? `${stat.size} B` : `${(stat.size / 1024).toFixed(1)} KB`
      lines = fs.readFileSync(filepath, 'utf-8').split('\n').filter(Boolean).length
    }
    stats.push({
      file: path.basename(filepath),
      size,
      lines,
      exists,
    })
  }
  return stats
}

export async function GET(req: NextRequest) {
  // Check main admin OR CMS admin auth
  const admin = getAdminFromRequest(req)
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Rate limiting ───────────────────────────────────────────────
  const ip = getClientIp(req)
  const rateCheck = checkRateLimit(ip, 30, 60_000) // 30 requests per minute
  if (!rateCheck.allowed) {
    logAuthEvent('access', 'anonymous', ip, {
      action: 'debug_rate_limited',
      userAgent: req.headers.get('user-agent') || '',
    })
    return NextResponse.json(
      { error: 'Too many requests. Please wait before refreshing.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  // ── Audit log ──────────────────────────────────────────────────
  const username = admin?.username || cmsAdmin?.username || 'unknown'
  logAuthEvent('access', username, ip, {
    action: 'debug_view',
    type: req.nextUrl.searchParams.get('type') || 'all',
    userAgent: req.headers.get('user-agent') || '',
  })

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'errors'
    const count = parseInt(searchParams.get('count') || '100', 10)
    const download = searchParams.get('download') === '1'

    // If download is requested, return the raw log file
    if (download) {
      const filePath = type === 'combined' ? COMBINED_LOG : ERROR_LOG
      const fileName = type === 'combined' ? 'combined.log.txt' : 'error.log.txt'

      let content = ''
      let fileExists = false
      try {
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath, 'utf-8')
          fileExists = true
        }
      } catch {
        content = 'Error reading log file.'
      }

      return new Response(content || (fileExists ? '' : 'Log file not found.'), {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-cache',
        },
      })
    }

    let data: Record<string, unknown> = {}

    switch (type) {
      case 'errors':
        data = {
          logs: tail(ERROR_LOG, count),
          stats: getLogStats(),
        }
        break
      case 'combined':
        data = {
          logs: tail(COMBINED_LOG, count),
          stats: getLogStats(),
        }
        break
      case 'system':
        data = { info: getSystemInfo() }
        break
      default:
        data = {
          errorLogs: tail(ERROR_LOG, count),
          combinedLogs: tail(COMBINED_LOG, count),
          stats: getLogStats(),
          systemInfo: getSystemInfo(),
        }
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/admin/debug error', err)
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  // Check main admin OR CMS admin auth
  const admin = getAdminFromRequest(req)
  const cmsAdmin = await getCMSAdminFromCookies()
  if (!admin && !cmsAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Rate limiting ───────────────────────────────────────────────
  const ip = getClientIp(req)
  const rateCheck = checkRateLimit(ip, 10, 60_000) // 10 delete operations per minute
  if (!rateCheck.allowed) {
    logAuthEvent('access', admin?.username || 'unknown', ip, {
      action: 'debug_delete_rate_limited',
      userAgent: req.headers.get('user-agent') || '',
    })
    return NextResponse.json(
      { error: 'Too many requests. Please wait.' },
      { status: 429 },
    )
  }

  // ── Audit log ──────────────────────────────────────────────────
  logAuthEvent('access', admin?.username || cmsAdmin?.username || 'unknown', ip, {
    action: 'debug_clear_logs',
    target: req.nextUrl.searchParams.get('target') || 'errors',
    userAgent: req.headers.get('user-agent') || '',
  })

  try {
    const { searchParams } = new URL(req.url)
    const target = searchParams.get('target') || 'errors'

    const filesToClear = target === 'all'
      ? [ERROR_LOG, COMBINED_LOG]
      : target === 'combined'
        ? [COMBINED_LOG]
        : [ERROR_LOG]

    let cleared = 0
    for (const filepath of filesToClear) {
      if (fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, '', 'utf-8')
        cleared++
      }
    }

    return NextResponse.json({ cleared: `${cleared} log file(s) cleared` })
  } catch (err) {
    console.error('DELETE /api/admin/debug error', err)
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 })
  }
}
