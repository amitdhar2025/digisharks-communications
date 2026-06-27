import connectMongoose from './mongoose'
import SeoAudit from './models/SeoAudit'
import SeoAuditConfig from './models/SeoAuditConfig'

export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface CheckResult {
  name: string
  status: CheckStatus
  score?: number
  details: string
  raw?: any
}

/* ─────── helpers ─────── */

function normalizeUrl(raw: string): string {
  let u = raw.trim()
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  try {
    const parsed = new URL(u)
    return parsed.origin
  } catch {
    return u
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function checkStatus(score: number | undefined | null, thresholds: { pass: number; warn: number }): CheckStatus {
  if (score === undefined || score === null) return 'fail'
  if (score >= thresholds.pass) return 'pass'
  if (score >= thresholds.warn) return 'warn'
  return 'fail'
}

/* ─────── individual checks ─────── */

async function checkPageSpeed(url: string, googleApiKey: string): Promise<{
  mobile?: Record<string, any>
  desktop?: Record<string, any>
  result: CheckResult
}> {
  const apiKey = googleApiKey
  if (!apiKey) {
    return {
      result: { name: 'PageSpeed Insights', status: 'fail', details: 'Google API key is not configured. Add GOOGLE_API_KEY to your .env file or configure it in Admin > SEO Audit > Settings.' },
    }
  }

  const strategies = ['mobile', 'desktop'] as const
  const results: Record<string, any> = {}

  const fetches = strategies.map(async (strategy) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`,
        { signal: AbortSignal.timeout(60000) }
      )
      if (!res.ok) {
        results[strategy] = { error: `HTTP ${res.status}` }
        return
      }
      const data = await res.json()
      const lh = data?.lighthouseResult
      if (!lh) {
        results[strategy] = { error: 'No lighthouse result' }
        return
      }
      const perfScore = lh.categories?.performance?.score
      const seoScore = lh.categories?.seo?.score
      const a11yScore = lh.categories?.accessibility?.score
      const bpScore = lh.categories?.['best-practices']?.score

      results[strategy] = {
        performance: perfScore != null ? Math.round(perfScore * 100) : null,
        seo: seoScore != null ? Math.round(seoScore * 100) : null,
        accessibility: a11yScore != null ? Math.round(a11yScore * 100) : null,
        bestPractices: bpScore != null ? Math.round(bpScore * 100) : null,
        lcp: lh.audits?.['largest-contentful-paint']?.displayValue,
        fid: lh.audits?.['max-potential-fid']?.displayValue,
        cls: lh.audits?.['cumulative-layout-shift']?.displayValue,
        tbt: lh.audits?.['total-blocking-time']?.displayValue,
        fullyLoaded: lh.audits?.['interactive']?.displayValue,
      }
    } catch (err: any) {
      results[strategy] = { error: err?.message || 'Request failed' }
    }
  })

  await Promise.allSettled(fetches)

  const mobilePerf = results.mobile?.performance
  const desktopPerf = results.desktop?.performance
  const avgPerf = [mobilePerf, desktopPerf].filter((s) => s !== undefined && s !== null)
  const avg = avgPerf.length > 0 ? Math.round(avgPerf.reduce((a, b) => a + b, 0) / avgPerf.length) : undefined

  const status = checkStatus(avg, { pass: 80, warn: 50 })
  let details = ''
  if (avg !== undefined) {
    details = `Average performance score: ${avg}/100`
    if (results.mobile?.performance !== undefined) details += ` | Mobile: ${results.mobile.performance}`
    if (results.desktop?.performance !== undefined) details += ` | Desktop: ${results.desktop.performance}`
    if (results.mobile?.lcp) details += ` | LCP: ${results.mobile.lcp}`
    if (results.mobile?.cls) details += ` | CLS: ${results.mobile.cls}`
  } else {
    details = results.mobile?.error || results.desktop?.error || 'Could not fetch PageSpeed data.'
  }

  return {
    mobile: results.mobile,
    desktop: results.desktop,
    result: { name: 'PageSpeed Insights', status, score: avg, details, raw: results },
  }
}

async function checkSsl(url: string): Promise<CheckResult> {
  const domain = extractDomain(url)

  // Strategy 1: Try SSL Labs API v3 (still functional as of 2025)
  try {
    const res = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&all=done`,
      { signal: AbortSignal.timeout(20000) }
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.status === 'READY' || data?.status === 'ERROR') {
        const grade = data.endpoints?.[0]?.grade || 'N/A'
        if (!grade || grade === 'N/A') {
          // Fall through to HTTPS check
        } else {
          const status = ['A+', 'A', 'A-'].includes(grade) ? 'pass' : ['B', 'C'].includes(grade) ? 'warn' : 'fail'
          return { name: 'SSL Certificate', status, score: grade === 'A+' ? 100 : grade === 'A' ? 95 : grade === 'A-' ? 85 : grade === 'B' ? 70 : grade === 'C' ? 50 : 30, details: `SSL Grade: ${grade}`, raw: { grade } }
        }
      } else if (data?.status === 'DNS') {
        // Still resolving — fall through to HTTPS check
      } else {
        // Still analyzing or other status — fall through to HTTPS check
      }
    } else {
      // API returned non-OK — fall through to HTTPS check
    }
  } catch {
    // SSL Labs API unavailable — fall through to HTTPS check
  }

  // Strategy 2: Direct HTTPS certificate inspection via HEAD request
  try {
    // First try fetching the page itself to verify HTTPS works
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })
    
    // Check for security headers that indicate proper SSL setup
    const hsts = !!res.headers.get('strict-transport-security')
    const hasCsp = !!res.headers.get('content-security-policy')
    
    // Extract certificate info from the response (limited in fetch API)
    const certInfo: string[] = []
    if (hsts) certInfo.push('HSTS enabled')
    if (hasCsp) certInfo.push('CSP header present')
    
    const details = certInfo.length > 0
      ? `HTTPS connection successful. ${certInfo.join(', ')}.`
      : 'HTTPS connection successful. No additional security headers detected.'
    
    return {
      name: 'SSL Certificate',
      status: 'pass',
      score: hsts ? 90 : 75,
      details,
      raw: { hsts, csp: hasCsp, statusCode: res.status },
    }
  } catch (err: any) {
    // Final fallback: try HTTP to see if the site redirects
    try {
      const httpUrl = url.replace(/^https:/i, 'http:')
      const httpRes = await fetch(httpUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(6000),
        redirect: 'manual',
      })
      const isRedirectToHttps = httpRes.status >= 300 && httpRes.status < 400 &&
        (httpRes.headers.get('location') || '').startsWith('https')
      if (isRedirectToHttps) {
        return { name: 'SSL Certificate', status: 'warn', score: 60, details: 'HTTP redirects to HTTPS (good), but HTTPS HEAD request failed. SSL Labs API also unavailable.', raw: { httpStatus: httpRes.status } }
      }
      return { name: 'SSL Certificate', status: 'fail', score: 20, details: 'HTTPS connection failed and no HTTP-to-HTTPS redirect detected. Site may not support HTTPS.', raw: { httpStatus: httpRes.status } }
    } catch {
      return { name: 'SSL Certificate', status: 'fail', score: 10, details: 'Could not establish any secure connection to the server. SSL Labs API also unavailable.', raw: {} }
    }
  }
}

async function checkSafeBrowsing(url: string, googleApiKey: string): Promise<CheckResult> {
  const apiKey = googleApiKey
  if (!apiKey) {
    return { name: 'Safe Browsing', status: 'warn', details: 'Google API key not configured. Add GOOGLE_API_KEY to your .env file or configure it in Admin > SEO Audit > Settings.' }
  }

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'digisharks-seo-audit', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) {
      return { name: 'Safe Browsing', status: 'warn', details: `Safe Browsing API returned HTTP ${res.status}` }
    }
    const data = await res.json()
    const threats = data?.matches
    if (threats && threats.length > 0) {
      const types = threats.map((t: any) => t.threatType).join(', ')
      return { name: 'Safe Browsing', status: 'fail', score: 0, details: `⚠️ Threats detected: ${types}`, raw: data }
    }
    return { name: 'Safe Browsing', status: 'pass', score: 100, details: 'No threats detected. Site is safe.', raw: data }
  } catch (err: any) {
    return { name: 'Safe Browsing', status: 'warn', details: `Safe Browsing check failed: ${err?.message || 'Unknown error'}` }
  }
}

async function checkRobotsTxt(url: string): Promise<CheckResult> {
  try {
    const robotsUrl = new URL('/robots.txt', url).href
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      if (res.status === 404) {
        return { name: 'Robots.txt', status: 'fail', score: 0, details: 'No robots.txt found (404). Search engines may crawl everything.' }
      }
      return { name: 'Robots.txt', status: 'warn', details: `HTTP ${res.status} when fetching robots.txt` }
    }
    const text = await res.text()
    const lines = text.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'))
    if (lines.length === 0) {
      return { name: 'Robots.txt', status: 'warn', score: 50, details: 'Robots.txt exists but is empty (no rules).', raw: text }
    }
    const hasSitemap = lines.some((l) => l.toLowerCase().startsWith('sitemap:'))
    const disallows = lines.filter((l) => l.toLowerCase().startsWith('disallow'))
    let details = `Found ${lines.length} rules`
    if (hasSitemap) details += ' | Includes sitemap reference'
    if (disallows.length > 0) details += ` | ${disallows.length} disallow rule(s)`
    return { name: 'Robots.txt', status: 'pass', score: 90, details, raw: text }
  } catch (err: any) {
    return { name: 'Robots.txt', status: 'fail', score: 0, details: `Could not fetch robots.txt: ${err?.message || 'Unknown error'}` }
  }
}

async function checkSitemap(url: string): Promise<CheckResult> {
  // Try common sitemap locations
  const candidates = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemaps/sitemap.xml',
  ]
  for (const candidate of candidates) {
    try {
      const sitemapUrl = new URL(candidate, url).href
      const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(6000) })
      if (res.ok) {
        const text = await res.text()
        // Count <url> or <sitemap> tags
        const urlCount = (text.match(/<url>/g) || []).length
        const sitemapIndexCount = (text.match(/<sitemap>/g) || []).length
        const total = urlCount || sitemapIndexCount || 1
        const isIndex = sitemapIndexCount > 0
        let details = `Sitemap found at ${candidate}`
        if (urlCount > 0) details += ` | ${urlCount} URL(s) listed`
        if (isIndex) details += ` | Sitemap index with ${sitemapIndexCount} sub-sitemaps`
        return { name: 'Sitemap', status: 'pass', score: 90, details, raw: { path: candidate, urlCount: total, isIndex } }
      }
    } catch {
      continue
    }
  }
  return { name: 'Sitemap', status: 'fail', score: 0, details: 'No sitemap found at common locations (/sitemap.xml, /sitemap_index.xml).' }
}

async function checkMetaTags(url: string): Promise<CheckResult> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) {
      return { name: 'Meta Tags', status: 'fail', details: `HTTP ${res.status} when fetching page.` }
    }
    const html = await res.text()

    const extract = (pattern: RegExp): string | null => {
      const m = pattern.exec(html)
      return m ? m[1]?.trim() || null : null
    }

    const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const description = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || extract(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
    const canonical = extract(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) || extract(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i)
    const viewport = extract(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i) || extract(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']viewport["']/i)
    const ogTitle = extract(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) || extract(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i)
    const ogDesc = extract(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) || extract(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i)
    const ogImage = extract(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i) || extract(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i)

    const issues: string[] = []
    let score = 100

    if (!title) { issues.push('Missing <title> tag'); score -= 25 }
    else if (title.length < 30) { issues.push(`Title too short (${title.length} chars, min 30)`); score -= 10 }
    else if (title.length > 65) { issues.push(`Title too long (${title.length} chars, max 65)`); score -= 10 }
    else issues.push(`Title: "${title}" (${title.length} chars)`)

    if (!description) { issues.push('Missing meta description'); score -= 25 }
    else if (description.length < 50) { issues.push(`Description too short (${description.length} chars)`); score -= 10 }
    else if (description.length > 165) { issues.push(`Description too long (${description.length} chars)`); score -= 10 }
    else issues.push(`Description: "${description.substring(0, 80)}…" (${description.length} chars)`)

    if (!canonical) { issues.push('No canonical tag'); score -= 10 }
    else issues.push(`Canonical: ✓`)

    if (!viewport) { issues.push('No viewport meta tag'); score -= 15 }
    else issues.push('Viewport: ✓')

    if (!ogTitle) { issues.push('Missing og:title'); score -= 10 }
    else issues.push('og:title: ✓')
    if (!ogDesc) { issues.push('Missing og:description'); score -= 10 }
    else issues.push('og:description: ✓')
    if (!ogImage) { issues.push('Missing og:image'); score -= 10 }
    else issues.push('og:image: ✓')

    const status = checkStatus(score, { pass: 80, warn: 50 })
    return {
      name: 'Meta Tags',
      status,
      score: Math.max(0, score),
      details: issues.join(' | '),
      raw: { title, description, canonical, viewport, ogTitle, ogDesc, ogImage },
    }
  } catch (err: any) {
    return { name: 'Meta Tags', status: 'fail', details: `Could not fetch page: ${err?.message || 'Unknown error'}` }
  }
}

async function checkStructuredData(url: string): Promise<CheckResult> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) {
      return { name: 'Structured Data', status: 'fail', details: `HTTP ${res.status} when fetching page.` }
    }
    const html = await res.text()

    // Extract JSON-LD blocks
    const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    const blocks: string[] = []
    let match
    while ((match = regex.exec(html)) !== null) {
      blocks.push(match[1].trim())
    }

    if (blocks.length === 0) {
      // Check for other structured data formats
      if (/itemscope|itemtype|itemprop/i.test(html)) {
        return { name: 'Structured Data', status: 'warn', score: 40, details: 'No JSON-LD found, but Microdata detected. JSON-LD is recommended.' }
      }
      return { name: 'Structured Data', status: 'fail', score: 0, details: 'No structured data (JSON-LD) found. Adding it can improve search visibility.' }
    }

    const types: string[] = []
    let validCount = 0
    for (const block of blocks) {
      try {
        const parsed = JSON.parse(block)
        const t = parsed['@type']
        if (t) {
          types.push(Array.isArray(t) ? t.join(', ') : t)
          validCount++
        }
      } catch {
        // Invalid JSON
      }
    }

    const typeList = [...new Set(types)].join(', ')
    const score = validCount >= 3 ? 90 : validCount >= 1 ? 60 : 30
    const details = `${validCount} valid JSON-LD block(s) found${typeList ? ` | Types: ${typeList}` : ''}`
    return { name: 'Structured Data', status: checkStatus(score, { pass: 70, warn: 30 }), score, details, raw: { blocks: validCount, types: typeList } }
  } catch (err: any) {
    return { name: 'Structured Data', status: 'fail', details: `Could not fetch page: ${err?.message || 'Unknown error'}` }
  }
}

async function checkHtmlValidation(url: string): Promise<CheckResult> {
  try {
    const res = await fetch(
      `https://validator.w3.org/nu/?doc=${encodeURIComponent(url)}&out=json`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigiSharks SeoAudit/1.0)' },
        signal: AbortSignal.timeout(15000),
      }
    )
    if (!res.ok) {
      return { name: 'HTML Validation', status: 'warn', details: `W3C Validator returned HTTP ${res.status}.` }
    }
    const data = await res.json()
    const messages = data?.messages || []
    const errors = messages.filter((m: any) => m.type === 'error').length
    const warnings = messages.filter((m: any) => m.type === 'info' || m.type === 'warning').length

    if (errors === 0 && warnings === 0) {
      return { name: 'HTML Validation', status: 'pass', score: 100, details: 'No errors or warnings found. HTML is valid!' }
    }

    const score = errors === 0 ? 90 : errors <= 5 ? 70 : errors <= 15 ? 40 : 10
    const errorMsg = errors > 0 ? `${errors} error(s)` : ''
    const warningMsg = warnings > 0 ? `${warnings} warning(s)` : ''
    const details = [errorMsg, warningMsg].filter(Boolean).join(', ')
    const topErrors = messages
      .filter((m: any) => m.type === 'error')
      .slice(0, 5)
      .map((m: any) => m.message)
      .join('; ')

    return {
      name: 'HTML Validation',
      status: checkStatus(score, { pass: 80, warn: 40 }),
      score,
      details: `${details}${topErrors ? ` | Top errors: ${topErrors}` : ''}`,
      raw: { errors, warnings, messages: messages.slice(0, 10) },
    }
  } catch (err: any) {
    return { name: 'HTML Validation', status: 'warn', details: `W3C Validator check failed: ${err?.message || 'Unknown error'}.` }
  }
}

/* ─────── Pending audit (instant save) ─────── */

export async function createPendingAudit(rawUrl: string, userName: string, userEmail: string, userPhone: string) {
  const url = normalizeUrl(rawUrl)
  const domain = extractDomain(url)

  await connectMongoose()

  const audit = await SeoAudit.create({
    url,
    domain,
    overall: 'pending',
    checks: [],
    pagespeed: undefined,
    userName: userName || 'Guest',
    userEmail: userEmail || '',
    userPhone: userPhone || '',
  })

  return {
    id: audit._id.toString(),
    url: audit.url,
    domain: audit.domain,
  }
}

/* ─────── Run audit and update existing record ─────── */

export async function runAuditAndUpdate(auditId: string, rawUrl: string) {
  const url = normalizeUrl(rawUrl)
  const domain = extractDomain(url)

  // Fetch config for check toggles
  await connectMongoose()
  let config = await SeoAuditConfig.findOne().lean()
  if (!config) {
    config = await SeoAuditConfig.create({})
    config = config.toObject()
  }

  const toggles = (config as any)?.checkToggles || []

  const isEnabled = (key: string) => {
    const toggle = toggles.find((t: any) => t.key === key)
    return toggle ? toggle.enabled : true
  }

  // Resolve API key: MongoDB config takes priority, fall back to env var
  const configApiKey = (config as any)?.googleApiKey || process.env.GOOGLE_API_KEY || ''

  // Fire all checks in parallel
  const checks: Promise<{ name: string; result: CheckResult; mobile?: Record<string, any>; desktop?: Record<string, any> }>[] = []

  if (isEnabled('pagespeed')) checks.push(checkPageSpeed(url, configApiKey).then((r) => ({ name: 'pagespeed', ...r })))
  if (isEnabled('ssl')) checks.push(checkSsl(url).then((r) => ({ name: 'ssl', result: r })))
  if (isEnabled('safebrowsing')) checks.push(checkSafeBrowsing(url, configApiKey).then((r) => ({ name: 'safebrowsing', result: r })))
  if (isEnabled('robotstxt')) checks.push(checkRobotsTxt(url).then((r) => ({ name: 'robotstxt', result: r })))
  if (isEnabled('sitemap')) checks.push(checkSitemap(url).then((r) => ({ name: 'sitemap', result: r })))
  if (isEnabled('metatags')) checks.push(checkMetaTags(url).then((r) => ({ name: 'metatags', result: r })))
  if (isEnabled('structureddata')) checks.push(checkStructuredData(url).then((r) => ({ name: 'structureddata', result: r })))
  if (isEnabled('htmlvalidation')) checks.push(checkHtmlValidation(url).then((r) => ({ name: 'htmlvalidation', result: r })))

  const settled = await Promise.allSettled(checks)

  const allResults: CheckResult[] = []
  let pagespeedData: { mobile?: Record<string, any>; desktop?: Record<string, any> } | undefined

  for (const s of settled) {
    if (s.status === 'fulfilled') {
      const val = s.value
      if (val.name === 'pagespeed') {
        pagespeedData = { mobile: val.mobile, desktop: val.desktop }
        allResults.push(val.result)
      } else {
        allResults.push(val.result)
      }
    }
  }

  // Determine overall status
  const scores = allResults.map((r) => r.score).filter((s) => s !== undefined) as number[]
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50
  const failCount = allResults.filter((r) => r.status === 'fail').length
  const warnCount = allResults.filter((r) => r.status === 'warn').length

  let overall: 'pass' | 'warn' | 'fail'
  if (failCount > 0) overall = 'fail'
  else if (warnCount > 2) overall = 'warn'
  else if (avgScore >= 70) overall = 'pass'
  else overall = 'warn'

  // Update the existing record
  await SeoAudit.findByIdAndUpdate(auditId, {
    $set: {
      overall,
      checks: allResults,
      pagespeed: pagespeedData,
    },
  })

  return {
    id: auditId,
    url,
    domain,
    overall,
    avgScore,
    checks: allResults,
    pagespeed: pagespeedData,
  }
}

/* ─────── Legacy runner (kept for backward compat) ─────── */

export async function runAudit(rawUrl: string, userName?: string, userEmail?: string, userPhone?: string) {
  const pending = await createPendingAudit(rawUrl, userName || 'Guest', userEmail || '', userPhone || '')
  return await runAuditAndUpdate(pending.id, rawUrl)
}

export async function getAuditHistory(page = 1, limit = 20, searchQuery = '') {
  await connectMongoose()
  const filter: Record<string, any> = {}
  if (searchQuery) {
    filter.$or = [
      { url: { $regex: searchQuery, $options: 'i' } },
      { domain: { $regex: searchQuery, $options: 'i' } },
    ]
  }
  const total = await SeoAudit.countDocuments(filter)
  const items = await SeoAudit.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('url domain overall checks.name checks.status userName userEmail userPhone createdAt')
    .lean()

  return {
    items: items.map((i: any) => ({
      id: i._id.toString(),
      url: i.url,
      domain: i.domain,
      overall: i.overall,
      checks: i.checks,
      userName: i.userName,
      userEmail: i.userEmail,
      userPhone: i.userPhone,
      createdAt: i.createdAt,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function getAuditById(id: string) {
  await connectMongoose()
  const audit = await SeoAudit.findById(id).lean()
  if (!audit) return null
  return {
    id: (audit as any)._id.toString(),
    url: (audit as any).url,
    domain: (audit as any).domain,
    overall: (audit as any).overall,
    avgScore: (() => {
      const scores = ((audit as any).checks || []).map((c: any) => c.score).filter((s: any) => s !== undefined) as number[]
      return scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 50
    })(),
    checks: (audit as any).checks || [],
    pagespeed: (audit as any).pagespeed,
    userName: (audit as any).userName,
    userEmail: (audit as any).userEmail,
    createdAt: (audit as any).createdAt,
  }
}

export async function getAuditStats() {
  await connectMongoose()
  const total = await SeoAudit.countDocuments()
  const passCount = await SeoAudit.countDocuments({ overall: 'pass' })
  const warnCount = await SeoAudit.countDocuments({ overall: 'warn' })
  const failCount = await SeoAudit.countDocuments({ overall: 'fail' })
  return { total, passCount, warnCount, failCount }
}

export async function markAuditFailed(auditId: string, errorMessage: string) {
  await connectMongoose()
  await SeoAudit.findByIdAndUpdate(auditId, {
    $set: {
      overall: 'fail',
      checks: [{ name: 'Audit Error', status: 'fail', details: errorMessage }],
    },
  })
}

export async function deleteAudit(id: string) {
  await connectMongoose()
  const result = await SeoAudit.findByIdAndDelete(id)
  if (!result) return null
  return { id: result._id.toString() }
}

export async function deleteAllAudits() {
  await connectMongoose()
  const result = await SeoAudit.deleteMany({})
  return { deleted: result.deletedCount }
}

export async function exportAudits() {
  await connectMongoose()
  const items = await SeoAudit.find()
    .sort({ createdAt: -1 })
    .select('url domain overall userName userEmail userPhone checks createdAt')
    .lean()

  return items.map((i: any) => ({
    id: i._id.toString(),
    url: i.url,
    domain: i.domain,
    overall: i.overall,
    checks: i.checks || [],
    userName: i.userName || '',
    userEmail: i.userEmail || '',
    userPhone: i.userPhone || '',
    createdAt: i.createdAt,
  }))
}
