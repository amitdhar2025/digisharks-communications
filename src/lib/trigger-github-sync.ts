/**
 * triggerGithubSync — Fire-and-forget utility to dispatch a GitHub sync.
 *
 * Sends a `repository_dispatch` event to trigger the "Sync CMS Data to GitHub"
 * GitHub Actions workflow. This is a non-blocking call — it never throws,
 * so it's safe to call from any CMS save handler.
 *
 * Environment variables required (silently ignored if missing):
 *   GH_PAT   — GitHub Personal Access Token
 *   GH_REPO  — Repository in format "owner/repo"
 *                  Falls back to VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG
 */

export async function triggerGithubSync(
  triggeredBy: string = 'system'
): Promise<void> {
  try {
    const pat = process.env.GH_PAT
    if (!pat) return // silently skip if not configured

    // Determine repo slug
    const explicit = process.env.GH_REPO
    const owner = process.env.VERCEL_GIT_REPO_OWNER
    const slug = process.env.VERCEL_GIT_REPO_SLUG
    const repo = explicit || (owner && slug ? `${owner}/${slug}` : null)
    if (!repo) return // silently skip if not configured

    const url = `https://api.github.com/repos/${repo}/dispatches`

    await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'digisharks-cms-sync',
      },
      body: JSON.stringify({
        event_type: 'sync-cms-to-github',
        client_payload: {
          triggered_by: triggeredBy,
          source: 'cms-save',
          timestamp: new Date().toISOString(),
        },
      }),
    })
  } catch {
    // Fire-and-forget — never throw
  }
}
