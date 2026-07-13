/**
 * POST /api/admin/backups/trigger
 *
 * Manually trigger a backup via the admin dashboard.
 * Protected — requires admin authentication.
 *
 * Body: { type: 'full' | 'database' | 'media' }
 *
 * This endpoint dispatches a `workflow_dispatch` event to the GitHub
 * Actions "Database & Media Backup" workflow. The workflow must exist
 * at .github/workflows/backup.yml in your repository.
 *
 * Environment variables required:
 *   GITHUB_PAT   — GitHub Personal Access Token with `repo` + `workflow` scopes
 *   GITHUB_REPO  — Repository in format "owner/repo" (e.g. "digisharks/digisharks-communications")
 *                  Falls back to VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG if set.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

async function getRepoSlug(): Promise<string | null> {
  // Try explicit env var first (set by the user)
  const explicit = process.env.GITHUB_REPO
  if (explicit) return explicit

  // Fall back to Vercel's automatic git env vars
  const owner = process.env.VERCEL_GIT_REPO_OWNER
  const slug = process.env.VERCEL_GIT_REPO_SLUG
  if (owner && slug) return `${owner}/${slug}`

  return null
}

export async function POST(req: NextRequest) {
  // ── Auth check ──
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const type = body.type || 'full'

  if (!['full', 'database', 'media'].includes(type)) {
    logActivity({ event: 'backup_trigger_failed', description: `Invalid backup type requested: ${type}`, username: admin.username, dashboard: 'admin' }).catch(() => {})
    return NextResponse.json(
      { error: 'Invalid backup type. Use: full, database, media' },
      { status: 400 }
    )
  }

  // ── Check that GitHub env vars are configured ──
  const pat = process.env.GITHUB_PAT
  const repo = await getRepoSlug()

  if (!pat || !repo) {
    const missing = []
    if (!pat) missing.push('GITHUB_PAT')
    if (!repo) missing.push('GITHUB_REPO')
    logActivity({ event: 'backup_trigger_failed', description: `Backup trigger failed: missing ${missing.join(', ')}${admin.username ? ` (by ${admin.username})` : ''}`, username: admin.username, dashboard: 'admin' }).catch(() => {})
    return NextResponse.json(
      {
        error: `GitHub API not configured. Missing env vars: ${missing.join(', ')}. ` +
          'Set these in your hosting environment (e.g. Vercel) to enable manual backup triggers. ' +
          'Alternatively, trigger backups directly from the GitHub Actions "Database & Media Backup" workflow page.',
      },
      { status: 400 }
    )
  }

  try {
    // Dispatch workflow via GitHub API
    const workflowFile = 'backup.yml'
    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`

    const ghResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'digisharks-backup-system',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          type,
        },
      }),
    })

    if (ghResponse.status === 204) {
      logActivity({ event: 'backup_trigger', description: `Backup triggered: ${type} (by ${admin.username})`, username: admin.username, dashboard: 'admin', target: type }).catch(() => {})
      return NextResponse.json({
        success: true,
        message: `Backup dispatched successfully (type: ${type}). It will start shortly on GitHub Actions.`,
      })
    }

    // Handle common GitHub API errors
    const ghError = await ghResponse.text().catch(() => 'Unknown error')
    if (ghResponse.status === 401 || ghResponse.status === 403) {
      logActivity({ event: 'backup_trigger_failed', description: `Backup trigger failed (${type}): GitHub API auth error (HTTP ${ghResponse.status})`, username: admin.username, dashboard: 'admin' }).catch(() => {})
      return NextResponse.json(
        {
          error: 'GitHub API authentication failed. Check that your GITHUB_PAT has `repo` and `workflow` scopes and is still valid.',
        },
        { status: 502 }
      )
    }
    if (ghResponse.status === 404) {
      logActivity({ event: 'backup_trigger_failed', description: `Backup trigger failed (${type}): GitHub API 404 — repo or workflow not found`, username: admin.username, dashboard: 'admin' }).catch(() => {})
      return NextResponse.json(
        {
          error: `GitHub repository or workflow file not found. Check that GITHUB_REPO is correct and .github/workflows/backup.yml exists.`,
        },
        { status: 502 }
      )
    }

    logActivity({ event: 'backup_trigger_failed', description: `Backup trigger failed (${type}): GitHub API HTTP ${ghResponse.status}`, username: admin.username, dashboard: 'admin' }).catch(() => {})
    return NextResponse.json(
      { error: `GitHub API returned HTTP ${ghResponse.status}: ${ghError.slice(0, 200)}` },
      { status: 502 }
    )
  } catch (err) {
    console.error('[backups] Failed to dispatch workflow:', err)
    logActivity({ event: 'backup_trigger_failed', description: `Backup trigger failed (${type}): network error`, username: admin.username, dashboard: 'admin' }).catch(() => {})
    return NextResponse.json(
      { error: 'Failed to reach GitHub API. Check your network and GITHUB_PAT.' },
      { status: 502 }
    )
  }
}
