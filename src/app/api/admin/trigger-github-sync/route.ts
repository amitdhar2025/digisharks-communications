/**
 * POST /api/admin/trigger-github-sync
 *
 * Trigger a CMS data sync from MongoDB → GitHub.
 * Protected — requires admin authentication (both main admin & CMS admin).
 *
 * This endpoint dispatches a `repository_dispatch` event to the GitHub
 * Actions "Sync CMS Data to GitHub" workflow.
 *
 * Environment variables required:
 *   GH_PAT   — GitHub Personal Access Token with `repo` scopes
 *   GH_REPO  — Repository in format "owner/repo" (e.g. "digisharks/digisharks-communications")
 *                  Falls back to VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG if set.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getCMSAdminFromCookies } from '@/lib/auth-cms'
import { logActivity } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

async function getRepoSlug(): Promise<string | null> {
  // Try explicit env var first
  const explicit = process.env.GH_REPO
  if (explicit) return explicit

  // Fall back to Vercel's automatic git env vars
  const owner = process.env.VERCEL_GIT_REPO_OWNER
  const slug = process.env.VERCEL_GIT_REPO_SLUG
  if (owner && slug) return `${owner}/${slug}`

  return null
}

export async function POST(req: NextRequest) {
  // ── Auth check (both main admin and CMS admin) ──
  const admin = getAdminFromRequest(req)
  const cmsAdmin = !admin ? await getCMSAdminFromCookies() : null
  const authedUser = admin?.username || cmsAdmin?.username || null
  const dashboard = cmsAdmin ? 'cms' : 'admin'

  if (!authedUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Check that GitHub env vars are configured ──
  const pat = process.env.GH_PAT
  const repo = await getRepoSlug()

  if (!pat || !repo) {
    const missing: string[] = []
    if (!pat) missing.push('GH_PAT')
    if (!repo) missing.push('GH_REPO')

    await logActivity({
      event: 'github_sync_failed',
      description: `GitHub sync trigger failed: missing ${missing.join(', ')} (by ${authedUser})`,
      username: authedUser,
      dashboard,
    }).catch(() => {})

    return NextResponse.json(
      {
        error: `GitHub API not configured. Missing env vars: ${missing.join(', ')}. ` +
          'Set these in your hosting environment (e.g. Vercel) to enable GitHub sync. ' +
          'Alternatively, trigger the sync manually from the GitHub Actions "Sync CMS Data to GitHub" workflow page.',
      },
      { status: 400 }
    )
  }

  try {
    // Dispatch repository_dispatch event to trigger the workflow
    const url = `https://api.github.com/repos/${repo}/dispatches`

    const ghResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'digisharks-cms-sync',
      },
      body: JSON.stringify({
        event_type: 'sync-cms-to-github',
        client_payload: {
          triggered_by: authedUser,
          source: 'admin-dashboard',
          timestamp: new Date().toISOString(),
        },
      }),
    })

    if (ghResponse.status === 204) {
      await logActivity({
        event: 'github_sync',
        description: `GitHub CMS sync triggered (by ${authedUser})`,
        username: authedUser,
        dashboard,
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'CMS data sync dispatched successfully. It will start shortly on GitHub Actions.',
      })
    }

    // Handle common GitHub API errors
    const ghError = await ghResponse.text().catch(() => 'Unknown error')

    if (ghResponse.status === 401 || ghResponse.status === 403) {
      await logActivity({
        event: 'github_sync_failed',
        description: `GitHub sync trigger failed: GitHub API auth error (HTTP ${ghResponse.status}) (by ${authedUser})`,
        username: authedUser,
        dashboard,
      }).catch(() => {})

      return NextResponse.json(
        {
          error: 'GitHub API authentication failed. Check that your GH_PAT has `repo` scopes and is still valid.',
        },
        { status: 502 }
      )
    }

    if (ghResponse.status === 404) {
      await logActivity({
        event: 'github_sync_failed',
        description: `GitHub sync trigger failed: GitHub API 404 — repo not found (by ${authedUser})`,
        username: authedUser,
        dashboard,
      }).catch(() => {})

      return NextResponse.json(
        {
          error: 'GitHub repository not found. Check that GH_REPO is correct.',
        },
        { status: 502 }
      )
    }

    await logActivity({
      event: 'github_sync_failed',
      description: `GitHub sync trigger failed: GitHub API HTTP ${ghResponse.status} (by ${authedUser})`,
      username: authedUser,
      dashboard,
    }).catch(() => {})

    return NextResponse.json(
      { error: `GitHub API returned HTTP ${ghResponse.status}: ${ghError.slice(0, 200)}` },
      { status: 502 }
    )
  } catch (err) {
    console.error('[github-sync] Failed to dispatch workflow:', err)
    await logActivity({
      event: 'github_sync_failed',
      description: `GitHub sync trigger failed: network error (by ${authedUser})`,
      username: authedUser,
      dashboard,
    }).catch(() => {})

    return NextResponse.json(
      { error: 'Failed to reach GitHub API. Check your network and GH_PAT.' },
      { status: 502 }
    )
  }
}
