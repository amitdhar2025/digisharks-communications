# Backup System — Setup Guide

This document explains how to set up and connect the automated backup system for your Digisharks Communications website.

## Overview

The backup system backs up your MongoDB Atlas database and Cloudinary media assets daily, stores them in **Backblaze B2** (free tier, 10 GB), and provides an admin dashboard to view/trigger backups.

### What's Included

| Deliverable | Location |
|-------------|----------|
| GitHub Actions workflow | `.github/workflows/backup.yml` |
| Backup orchestrator script | `scripts/backup.js` |
| Trigger API endpoint | `POST /api/admin/backups/trigger` |
| List backups endpoint | `GET /api/admin/backups` |
| Admin dashboard page | `/admin/backups` |
| MongoDB model | `src/lib/models/BackupRecord.ts` |

## Prerequisites

1. **Backblaze B2 account** — [Sign up free](https://www.backblaze.com/cloud-storage) (10 GB free tier)
2. **GitHub repository** — The workflow file runs in your repo's Actions
3. **Cloudinary account** — Already configured in your project
4. **MongoDB Atlas** — Already configured in your project

## Environment Variables

### Required by the backup script

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `MONGODB_URI` | MongoDB Atlas connection string | Already in your `.env.local` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Already in your `.env.local` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Already in your `.env.local` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Already in your `.env.local` |
| `B2_KEY_ID` | Backblaze B2 Application Key ID | B2 Dashboard → App Keys |
| `B2_APPLICATION_KEY` | Backblaze B2 Application Key | B2 Dashboard → App Keys |
| `B2_BUCKET_NAME` | Backblaze B2 bucket name | Create a bucket in B2 Dashboard |

### For the admin dashboard trigger (optional)

To enable the manual "Back up now" button on `/admin/backups`, you need to set these additional env vars in your **hosting environment** (e.g. Vercel Project Settings → Environment Variables):

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GH_PAT` | GitHub Personal Access Token with `repo` and `workflow` scopes | See guide below |
| `GH_REPO` | Repository in format "owner/repo" (e.g. `digisharks/digisharks-communications`) | Your GitHub repo URL |

If you deploy on Vercel, `GH_REPO` is automatically detected from `VERCEL_GIT_REPO_OWNER` and `VERCEL_GIT_REPO_SLUG` — you only need to set `GH_PAT`.

### Creating a GitHub Personal Access Token (PAT)

The dashboard trigger button dispatches the backup workflow via the GitHub API, which requires a Personal Access Token with the right permissions. Follow these steps:

#### Option A: Fine-Grained Token (Recommended)

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token**
3. **Token name**: `digisharks-backup-trigger`
4. **Expiration**: Choose `90 days`, `180 days`, or `Custom` (set a reminder to renew it before it expires)
5. **Repository access**: Select **Only select repositories** and choose your repository (e.g. `digisharks/digisharks-communications`)
6. **Permissions** — expand the following sections:

   | Section | Permission | Setting |
   |---------|-----------|---------|
   | Actions | **Read and write** | `actions:write` |
   | Contents | **Read and write** | `contents:write` |
   | Metadata | **Read** (auto-granted) | `metadata:read` |

7. Click **Generate token**
8. **Copy the token immediately** (it looks like `github_pat_...`). GitHub will not show it again

#### Option B: Classic Token (Simpler)

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. **Note**: `digisharks-backup-trigger`
4. **Expiration**: Select a reasonable expiry (90 days recommended)
5. **Scopes**: Check the following two scopes:
   - `repo` — Full control of private repositories
   - `workflow` — Update GitHub Actions workflows
6. Scroll down and click **Generate token**
7. **Copy the token immediately** (it looks like `ghp_...`). GitHub will not show it again

#### Once you have the token:

1. Go to your hosting provider's dashboard (e.g. Vercel Project Settings → Environment Variables)
2. Add `GH_PAT` with the copied token as the value
3. Optionally add `GH_REPO` as `digisharks/digisharks-communications` (not needed if deploying on Vercel — it's auto-detected)
4. Redeploy the project for the env vars to take effect

> ⚠️ **Security note**: Treat your PAT like a password. Never commit it to version control, share it, or log it. The token is stored as a secure environment variable in your hosting provider's dashboard.

## Step-by-Step Setup

### 1. Create a Backblaze B2 Bucket

1. Log in to your [Backblaze B2 Dashboard](https://secure.backblaze.com/)
2. Go to **Buckets** → **Create a Bucket**
3. Name: Choose a name (e.g. `digisharks-backups`)
4. Type: **Private** (recommended) or **Public** if you want direct download links without auth
5. Click **Create**

### 2. Generate B2 Application Keys

1. Go to **App Keys** in the B2 Dashboard
2. Click **Generate New Application Key**
3. Key name: `digisharks-backup-system`
4. Bucket access: Select your backup bucket
5. Capabilities: Select at minimum:
   - `listBuckets`
   - `listFiles`
   - `readFiles`
   - `writeFiles`
   - `deleteFiles`
6. Click **Generate**
7. **Copy the Application Key** — it's shown only once

### 3. Set GitHub Repository Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add these secrets:

| Secret Name | Value |
|-------------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `B2_KEY_ID` | Your B2 Application Key ID |
| `B2_APPLICATION_KEY` | Your B2 Application Key |
| `B2_BUCKET_NAME` | Your B2 bucket name |

Also add a variable (not secret):
| Variable Name | Value |
|---------------|-------|
| `SITE_URL` | `https://digisharkscommunications.com` (or your domain) |

### 4. Set Hosting Environment Variables (Vercel / others)

To enable manual backup triggering from the admin dashboard (the "Back up now" button on `/admin/backups`), add `GH_PAT` and (if not on Vercel) `GH_REPO` to your hosting provider's environment variables.

**How it works:** The trigger endpoint dispatches the backup workflow via the [GitHub Actions API](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event) (`POST /repos/{owner}/{repo}/actions/workflows/backup.yml/dispatches`). It doesn't run the backup script directly — the actual backup executes on GitHub Actions runners, so no additional dependencies are needed on your hosting platform.

### 5. Verify the GitHub Actions Workflow

The workflow file is at `.github/workflows/backup.yml`. It:
- **Runs automatically** every day at 2:00 AM UTC (scheduled cron)
- **Can be triggered manually** from GitHub Actions tab with a backup type dropdown
- Uses the `workflow_dispatch` event for manual triggers

To test it:
1. Go to your repo on GitHub.com
2. Click **Actions** tab
3. Find **Database & Media Backup** workflow
4. Click **Run workflow**
5. Select backup type and click **Run**

## Backup Types

| Type | What it backs up |
|------|-----------------|
| `full` | Both MongoDB data and Cloudinary media assets |
| `database` | Only MongoDB collections (exported as JSON) |
| `media` | Only Cloudinary images, videos, and raw files |

## Retention Policy

| Backup type | Retention | Cleanup trigger |
|-------------|-----------|-----------------|
| Daily | Last 7 days | Runs at end of each backup |
| Monthly (1st of month) | 12 months | Runs at end of each backup |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│                                                         │
│  Schedule (2 AM UTC) ─┐                                 │
│  Manual Trigger ──────┤→ node scripts/backup.js [type]  │
│  Dashboard Trigger ───┘                                 │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  scripts/backup.js                       │
│                                                         │
│  1. Export MongoDB collections → JSON files             │
│  2. Download Cloudinary assets → files                  │
│  3. Zip everything into a single archive (.zip)         │
│  4. Upload to Backblaze B2 (backups/daily/ and/or       │
│     backups/monthly/)                                   │
│  5. Save backup record in MongoDB (backuprecords)       │
│  6. Retention cleanup (delete old backups)              │
└─────────────────────────────────────────────────────────┘
```

## Admin Dashboard

Navigate to `/admin/backups` in your admin panel:

- **Stats cards**: Total backups, daily count, monthly count, last backup info
- **Trigger panel**: Dropdown to select backup type + "Back up now" button
- **Daily backups table**: Shows last 7 daily backups with status, size, duration, download link
- **Monthly archives table**: Shows monthly archive copies with download links

### Security / Auth

- **Placeholder auth**: The backup API routes use the same JWT-based admin authentication as the rest of the admin panel (`getAdminFromRequest` / `getCMSAdminFromCookies`)
- **The trigger endpoint** (`POST /api/admin/backups/trigger`) checks for a valid admin session before starting the backup process
- **The list endpoint** (`GET /api/admin/backups`) requires either a main admin or CMS admin session
- **No additional auth** is needed — the existing admin auth system handles it

## Troubleshooting

### Backup fails with "Missing required env var"
Make sure all required environment variables are set in GitHub Secrets AND your hosting environment (Vercel, etc.)

### Backup runs but no files in B2
Check the GitHub Actions log for errors. Common issues:
- B2 bucket name is wrong (case-sensitive)
- B2 Application Key doesn't have write permissions
- MongoDB URI is invalid or blocked by IP allowlist

### Dashboard shows "GitHub API not configured"
The trigger endpoint requires `GH_PAT` and `GH_REPO` environment variables to dispatch the workflow. If these aren't set, the dashboard will show this error. To fix it:
- Set `GH_PAT` (GitHub Personal Access Token with `repo` and `workflow` scopes) in your hosting environment
- Set `GH_REPO` as `owner/repo` format (auto-detected on Vercel)
- Alternatively, trigger backups directly from the **Actions** tab on GitHub

### MongoDB connection timeout
If your MongoDB Atlas cluster has IP allowlisting enabled, you need to allow GitHub Actions runner IPs or your hosting provider's IPs. For GitHub Actions, you can use the `mongo-ip-whitelist` action or allow all IPs (0.0.0.0/0) if security is not a concern for your cluster.

## Manual Testing

You can test the backup script locally (if you have the required env vars set):

```bash
# Test database-only backup
node scripts/backup.js database

# Test full backup
node scripts/backup.js full

# Test media-only backup
node scripts/backup.js media
```

## Customization

- **Change retention period**: Edit `scripts/backup.js` — look for `sevenDaysAgo.setDate` and `twelveMonthsAgo.setMonth`
- **Change schedule**: Edit `.github/workflows/backup.yml` — modify the `cron` expression
- **Change B2 folder structure**: Edit the `dailyPath` / `monthlyPath` variables in `scripts/backup.js`
