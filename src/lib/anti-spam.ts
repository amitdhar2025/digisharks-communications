/**
 * Anti-Spam Engine for Digisharks Communications
 *
 * Central security module that checks form submissions against
 * banned IPs, blocked email domains, blocked countries, honeypot traps,
 * rate limits, and bot user-agents. Logs attacks and manages settings.
 */

import { NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'
import { getDb } from './db'
import { ObjectId } from 'mongodb'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type BlockReason =
  | 'banned_ip'
  | 'blocked_email_domain'
  | 'blocked_country'
  | 'honeypot_filled'
  | 'rate_limit'
  | 'bot_user_agent'

export interface SecurityAttack {
  _id?: ObjectId
  reason: BlockReason
  ip: string
  email?: string
  country?: string
  countryCode?: string
  userAgent?: string
  formType: string
  pageUrl?: string
  createdAt: Date
}

export interface SecuritySettings {
  _id?: ObjectId
  autoBlock: boolean
  honeypotEnabled: boolean
  loggingEnabled: boolean
  bannedIps: string[]
  blockedEmailDomains: string[]
  blockedCountries: string[]
  rateLimits: {
    contact: { max: number; windowMs: number }
    checkout: { max: number; windowMs: number }
    career: { max: number; windowMs: number }
    chatbot: { max: number; windowMs: number }
    registration: { max: number; windowMs: number }
  }
  updatedAt: Date
}

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────

/** Email providers that are always allowed (never auto-blocked) */
const SAFE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com',
  'outlook.com', 'outlook.in', 'icloud.com', 'protonmail.com',
  'proton.me', 'rediffmail.com', 'rediff.com', 'live.com',
  'live.in', 'msn.com', 'aol.com', 'zoho.com', 'mail.com',
  'gmx.com', 'yandex.com',
])

/** User-agent patterns that indicate a bot/crawler */
const BOT_PATTERNS = [
  'curl', 'wget', 'python', 'scrapy', 'selenium', 'phantomjs',
  'headless', 'crawler', 'spider', 'bot', 'crawl',
  'go-http-client', 'java/', 'php/', 'ruby/', 'libwww',
  'httpclient', 'okhttp', 'urllib', 'aiohttp', 'axios/',
]

// ──────────────────────────────────────────────────────────────
// Cache for settings (avoids hitting DB on every form submit)
// ──────────────────────────────────────────────────────────────

const settingsCache = new LRUCache<string, SecuritySettings>({
  max: 1,
  ttl: 60_000, // 1 minute
})

// ──────────────────────────────────────────────────────────────
// In-memory rate limiter (per form type per IP)
// ──────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimiters = new LRUCache<string, RateLimitEntry>({
  max: 10_000,
  ttl: 600_000, // 10 minutes max
})

// ──────────────────────────────────────────────────────────────
// DB Collection Helpers
// ──────────────────────────────────────────────────────────────

async function getAttacksCollection() {
  const db = await getDb()
  const col = db.collection<SecurityAttack>('security_attacks')
  // Create indexes for common queries
  await col.createIndex({ createdAt: -1 })
  await col.createIndex({ ip: 1 })
  await col.createIndex({ reason: 1 })
  return col
}

async function getSettingsCollection() {
  const db = await getDb()
  return db.collection<SecuritySettings>('security_settings')
}

// ──────────────────────────────────────────────────────────────
// Settings Management
// ──────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SecuritySettings = {
  autoBlock: true,
  honeypotEnabled: true,
  loggingEnabled: true,
  bannedIps: [],
  blockedEmailDomains: [],
  blockedCountries: [],
  rateLimits: {
    contact: { max: 5, windowMs: 10 * 60 * 1000 },      // 5 per 10 min
    checkout: { max: 10, windowMs: 60 * 1000 },           // 10 per min
    career: { max: 3, windowMs: 60 * 60 * 1000 },         // 3 per hour
    chatbot: { max: 20, windowMs: 60 * 1000 },            // 20 per min
    registration: { max: 3, windowMs: 10 * 60 * 1000 },   // 3 per 10 min
  },
  updatedAt: new Date(),
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  // Check cache first
  const cached = settingsCache.get('main')
  if (cached) return cached

  try {
    const col = await getSettingsCollection()
    let settings = await col.findOne({})

    if (!settings) {
      // Create default settings
      settings = { ...DEFAULT_SETTINGS, _id: new ObjectId() }
      await col.insertOne(settings)
    }

    settingsCache.set('main', settings)
    return settings
  } catch (err) {
    console.error('Failed to load security settings:', err)
    return { ...DEFAULT_SETTINGS }
  }
}

export async function saveSecuritySettings(updates: Partial<SecuritySettings>): Promise<SecuritySettings> {
  const col = await getSettingsCollection()
  const existing = await col.findOne({})

  const merged: SecuritySettings = {
    ...(existing || DEFAULT_SETTINGS),
    ...updates,
    updatedAt: new Date(),
  }

  if (existing?._id) {
    await col.updateOne({ _id: existing._id }, { $set: merged })
  } else {
    await col.insertOne(merged)
  }

  // Invalidate cache
  settingsCache.delete('main')

  return merged
}

// ──────────────────────────────────────────────────────────────
// IP Helper
// ──────────────────────────────────────────────────────────────

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

/** Get country info from Vercel/CF headers */
function getCountryFromHeaders(req: NextRequest): { country: string; countryCode: string } {
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'Unknown'
  return { country, countryCode: country.toUpperCase() }
}

// ──────────────────────────────────────────────────────────────
// Rate Limiter (form-specific)
// ──────────────────────────────────────────────────────────────

function checkFormRateLimit(
  ip: string,
  formType: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = `${ip}:${formType}`

  let entry = rateLimiters.get(key)

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs }
    rateLimiters.set(key, entry)
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count += 1
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}

// ──────────────────────────────────────────────────────────────
// Bot Detection
// ──────────────────────────────────────────────────────────────

function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true // No user-agent = likely a bot
  const lower = userAgent.toLowerCase()
  return BOT_PATTERNS.some(pattern => lower.includes(pattern))
}

// ──────────────────────────────────────────────────────────────
// Attack Logger
// ──────────────────────────────────────────────────────────────

async function logAttack(attack: Omit<SecurityAttack, '_id'>): Promise<void> {
  try {
    const settings = await getSecuritySettings()

    // Log the attack if logging is enabled
    if (settings.loggingEnabled) {
      const col = await getAttacksCollection()
      await col.insertOne(attack)
    }

    // Auto-block email domain if auto-block is enabled
    if (settings.autoBlock && attack.email) {
      const domain = attack.email.split('@')[1]?.toLowerCase()
      if (domain && !SAFE_EMAIL_DOMAINS.has(domain) && !settings.blockedEmailDomains.includes(domain)) {
        settings.blockedEmailDomains.push(domain)
        await saveSecuritySettings({ blockedEmailDomains: settings.blockedEmailDomains })
      }
    }

    // Auto-ban IP if it has 5+ attacks (use logged attacks only)
    if (settings.loggingEnabled) {
      const col = await getAttacksCollection()
      const ipCount = await col.countDocuments({ ip: attack.ip })
      if (ipCount >= 5 && !settings.bannedIps.includes(attack.ip)) {
        settings.bannedIps.push(attack.ip)
        await saveSecuritySettings({ bannedIps: settings.bannedIps })
      }
    } else if (!settings.bannedIps.includes(attack.ip)) {
      // Even without logging, auto-ban after bot/rate-limit detections (heuristic)
      if (attack.reason === 'bot_user_agent' || attack.reason === 'rate_limit') {
        settings.bannedIps.push(attack.ip)
        await saveSecuritySettings({ bannedIps: settings.bannedIps })
      }
    }
  } catch (err) {
    console.error('Failed to log security attack:', err)
  }
}

// ──────────────────────────────────────────────────────────────
// MAIN SECURITY CHECK FUNCTION
// ──────────────────────────────────────────────────────────────

export interface SecurityCheckResult {
  allowed: boolean
  reason?: BlockReason
  message?: string
}

export interface SecurityCheckParams {
  req: NextRequest
  email?: string
  formType: string   // 'contact' | 'checkout' | 'career' | 'chatbot'
  pageUrl?: string
  honeypotValue?: string   // Value from the hidden honeypot field
}

export async function checkSecurity(params: SecurityCheckParams): Promise<SecurityCheckResult> {
  const { req, email, formType, pageUrl, honeypotValue } = params

  const ip = getClientIp(req)
  const userAgent = req.headers.get('user-agent') || ''
  const { country, countryCode } = getCountryFromHeaders(req)

  const settings = await getSecuritySettings()

  // 1) Check banned IP
  if (settings.bannedIps.includes(ip)) {
    await logAttack({
      reason: 'banned_ip',
      ip,
      email,
      country,
      countryCode,
      userAgent,
      formType,
      pageUrl,
      createdAt: new Date(),
    })
    return { allowed: false, reason: 'banned_ip', message: 'Access denied.' }
  }

  // 2) Check blocked email domain
  if (email) {
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain && settings.blockedEmailDomains.includes(domain)) {
      await logAttack({
        reason: 'blocked_email_domain',
        ip,
        email,
        country,
        countryCode,
        userAgent,
        formType,
        pageUrl,
        createdAt: new Date(),
      })
      return { allowed: false, reason: 'blocked_email_domain', message: 'This email domain is not allowed.' }
    }
  }

  // 3) Check blocked country
  if (settings.blockedCountries.includes(countryCode)) {
    await logAttack({
      reason: 'blocked_country',
      ip,
      email,
      country,
      countryCode,
      userAgent,
      formType,
      pageUrl,
      createdAt: new Date(),
    })
    return { allowed: false, reason: 'blocked_country', message: 'Access denied from your region.' }
  }

  // 4) Check honeypot trap
  if (settings.honeypotEnabled && honeypotValue !== undefined && honeypotValue !== '') {
    await logAttack({
      reason: 'honeypot_filled',
      ip,
      email,
      country,
      countryCode,
      userAgent,
      formType,
      pageUrl,
      createdAt: new Date(),
    })
    return { allowed: false, reason: 'honeypot_filled', message: 'Spam detected.' }
  }

  // 5) Check form-specific rate limit
  const rateLimit = settings.rateLimits[formType as keyof typeof settings.rateLimits]
  if (rateLimit) {
    const rateCheck = checkFormRateLimit(ip, formType, rateLimit.max, rateLimit.windowMs)
    if (!rateCheck.allowed) {
      await logAttack({
        reason: 'rate_limit',
        ip,
        email,
        country,
        countryCode,
        userAgent,
        formType,
        pageUrl,
        createdAt: new Date(),
      })
      return { allowed: false, reason: 'rate_limit', message: 'Too many requests. Please slow down.' }
    }
  }

  // 6) Check bot user-agent
  if (isBotUserAgent(userAgent)) {
    await logAttack({
      reason: 'bot_user_agent',
      ip,
      email,
      country,
      countryCode,
      userAgent,
      formType,
      pageUrl,
      createdAt: new Date(),
    })
    return { allowed: false, reason: 'bot_user_agent', message: 'Automated requests are not allowed.' }
  }

  return { allowed: true }
}

// ──────────────────────────────────────────────────────────────
// Query Helpers (for dashboard)
// ──────────────────────────────────────────────────────────────

export async function getAttackStats(dateRange?: { start: Date; end: Date }) {
  const col = await getAttacksCollection()
  const match: any = {}
  if (dateRange) {
    match.createdAt = { $gte: dateRange.start, $lte: dateRange.end }
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const allTimeTotal = await col.countDocuments({})
  const todayTotal = await col.countDocuments({ createdAt: { $gte: todayStart } })

  // Count by reason (all time)
  const byReason = await col.aggregate([
    ...(match.createdAt ? [{ $match: { createdAt: match.createdAt } }] : []),
    { $group: { _id: '$reason', count: { $sum: 1 } } },
  ]).toArray()

  const reasonCounts: Record<string, number> = {}
  byReason.forEach(r => { reasonCounts[r._id] = r.count })

  // Auto-banned IPs (IPs with 5+ attacks)
  const topIps = await col.aggregate([
    { $group: { _id: '$ip', count: { $sum: 1 }, lastSeen: { $max: '$createdAt' }, country: { $first: '$country' }, countryCode: { $first: '$countryCode' } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]).toArray()

  // Top spam email domains
  const topDomains = await col.aggregate([
    { $match: { email: { $exists: true, $ne: '' } } },
    { $project: { domain: { $arrayElemAt: [{ $split: ['$email', '@'] }, 1] } } },
    { $match: { domain: { $exists: true, $ne: null } } },
    { $group: { _id: '$domain', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]).toArray()

  // Top attacking countries
  const topCountries = await col.aggregate([
    { $match: { countryCode: { $exists: true, $ne: '' } } },
    { $group: { _id: { country: '$country', code: '$countryCode' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]).toArray()

  // Count auto-banned IPs (IPs currently in bannedIps list)
  const settings = await getSecuritySettings()
  const autoBannedCount = settings.bannedIps.length

  return {
    totalAllTime: allTimeTotal,
    totalToday: todayTotal,
    blockedByIp: reasonCounts['banned_ip'] || 0,
    blockedByEmail: reasonCounts['blocked_email_domain'] || 0,
    blockedByCountry: reasonCounts['blocked_country'] || 0,
    honeypotCaught: reasonCounts['honeypot_filled'] || 0,
    botDetected: reasonCounts['bot_user_agent'] || 0,
    rateLimitHits: reasonCounts['rate_limit'] || 0,
    autoBanned: autoBannedCount,
    topIps,
    topDomains,
    topCountries,
  }
}

export async function getAttacksList(
  page: number = 1,
  limit: number = 50,
  dateRange?: { start: Date; end: Date },
) {
  const col = await getAttacksCollection()
  const filter: any = {}
  if (dateRange) {
    filter.createdAt = { $gte: dateRange.start, $lte: dateRange.end }
  }

  const total = await col.countDocuments(filter)
  const items = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  return { items, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function getHourlyChartData() {
  const col = await getAttacksCollection()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const hourly = await col.aggregate([
    { $match: { createdAt: { $gte: todayStart } } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).toArray()

  // Fill in all 24 hours
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    count: hourly.find((h: any) => h._id === i)?.count || 0,
  }))

  return chartData
}

export async function getDailyChartData() {
  const col = await getAttacksCollection()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const daily = await col.aggregate([
    { $match: { createdAt: { $gte: monthStart } } },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).toArray()

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    count: daily.find((d: any) => d._id === i + 1)?.count || 0,
  }))

  return chartData
}

export async function clearAllAttacks(): Promise<number> {
  const col = await getAttacksCollection()
  const result = await col.deleteMany({})
  return result.deletedCount
}

// ──────────────────────────────────────────────────────────────
// Export Helpers
// ──────────────────────────────────────────────────────────────

export async function getAllAttacksForExport(dateRange?: { start: Date; end: Date }): Promise<SecurityAttack[]> {
  const col = await getAttacksCollection()
  const filter: any = {}
  if (dateRange) {
    filter.createdAt = { $gte: dateRange.start, $lte: dateRange.end }
  }
  return col.find(filter).sort({ createdAt: -1 }).toArray()
}
