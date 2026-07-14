# Deployment Environment Variables Checklist

> Last updated: July 14, 2026
> Project: Digisharks Communications

---

## Part 1: Vercel Environment Variables

Go to **Vercel Dashboard** → Project → **Settings** → **Environment Variables**

### Required (App won't function without these)

| # | Variable | Value | Scope | Status |
|---|----------|-------|-------|--------|
| 1 | `NEXT_PUBLIC_SITE_URL` | `https://www.digisharkscommunications.com` | Production | ☐ |
| 2 | `MONGODB_URI` | `mongodb+srv://digiuser:Bc0KSrku4nQkQBFL@cluster0.hmwpzno.mongodb.net/digisharks?retryWrites=true&w=majority&appName=Cluster0` | Production, Preview, Dev | ☐ |
| 3 | `JWT_SECRET` | `e147be2c71770dd4e19cc95324a6268edd52ddd59e43ed7eb5966bc88943376a2e562439add38d7e6e38076b5496ad05d05594c2126e232f23564e2f8b903b41` | Production, Preview | ☐ |
| 4 | `ADMIN_SESSION_SECRET` | `25c3feeb2d1f225ae2fe8be4b8b2d6b3e4aec26ee84e3e40e96c055cb1b2edbf` | Production, Preview | ☐ |
| 5 | `ADMIN_USERNAME` | `admin` | Production, Preview | ☐ |
| 6 | `ADMIN_PASSWORD` | `Admin@123` | Production, Preview | ☐ |
| 7 | `CMS_ADMIN_USERNAME` | `cmsadmin` | Production, Preview | ☐ |
| 8 | `CMS_ADMIN_PASSWORD` | `CMS@789` | Production, Preview | ☐ |

### Required for Media (Cloudinary)

| # | Variable | Value | Scope | Status |
|---|----------|-------|-------|--------|
| 9 | `CLOUDINARY_CLOUD_NAME` | `df147mibj` | Production, Preview | ☐ |
| 10 | `CLOUDINARY_API_KEY` | `545678799687974` | Production, Preview | ☐ |
| 11 | `CLOUDINARY_API_SECRET` | `gNLZDkVGTyo5tcUAK_dcGf-O_N8` | Production, Preview | ☐ |

### Required for Payments (Razorpay)

| # | Variable | Value | Scope | Status |
|---|----------|-------|-------|--------|
| 12 | `RAZORPAY_KEY_ID` | `rzp_live_4z51Lz18Sczv` | **Production only** | ☐ |
| 13 | `RAZORPAY_KEY_SECRET` | `4IeIsIEiHyCI3TgDM6Y9j2aa` | **Production only** | ☐ |

### Required for Email (SMTP)

| # | Variable | Value | Scope | Status |
|---|----------|-------|-------|--------|
| 14 | `SMTP_HOST` | `smtp.gmail.com` | Production | ☐ |
| 15 | `SMTP_PORT` | `587` | Production | ☐ |
| 16 | `SMTP_USER` | `amitdhar9717@gmail.com` | Production | ☐ |
| 17 | `SMTP_PASS` | `mcmhtbtojybqhyfi` | Production | ☐ |
| 18 | `MAIL_FROM_NAME` | `Digisharks Communications` | Production | ☐ |
| 19 | `MAIL_FROM_EMAIL` | `noreply@digisharkscommunications.com` | Production | ☐ |
| 20 | `ADMIN_EMAIL` | `amitdhar9717@gmail.com` | Production | ☐ |
| 21 | `CMS_ADMIN_EMAIL` | `amitdhar9717@gmail.com` | Production | ☐ |

### Required for Digital Products

| # | Variable | Value | Scope | Status |
|---|----------|-------|-------|--------|
| 22 | `DATABASE_DOWNLOAD_URL` | `https://www.digisharkscommunications.com/wp-content/uploads/2025/07/Database-pqv5hy-bw-iv1bgt-1.pdf` | Production | ☐ |
| 23 | `HOW_TO_USE_VIDEO_URL` | `https://www.digisharkscommunications.com/wp-content/uploads/2025/07/database_demo-video-audio-1080p.mp4` | Production | ☐ |

### Optional Add-ons

| # | Variable | Value | Scope | Status |
|---|----------|-------|-------|--------|
| 24 | `SERPER_API_KEY` | `8044b6c45323b2a865672b63fbdcd70fb5e15365` | Production, Preview | ☐ |
| 25 | `IPIFY_API_KEY` | `at_ddnKG9K50CteUtXOfrJijto4LiEiC` | Production, Preview | ☐ |

---

## Part 2: GitHub Secrets

Go to **GitHub** → Repo → **Settings** → **Secrets and variables** → **Actions**

### Required for Backup Workflow (`backup.yml`)

| # | Secret Name | Value | Status |
|---|-------------|-------|--------|
| 1 | `MONGODB_URI` | `mongodb+srv://digiuser:Bc0KSrku4nQkQBFL@cluster0.hmwpzno.mongodb.net/digisharks?retryWrites=true&w=majority&appName=Cluster0` | ☐ |
| 2 | `CLOUDINARY_CLOUD_NAME` | `df147mibj` | ☐ |
| 3 | `CLOUDINARY_API_KEY` | `545678799687974` | ☐ |
| 4 | `CLOUDINARY_API_SECRET` | `gNLZDkVGTyo5tcUAK_dcGf-O_N8` | ☐ |
| 5 | `B2_KEY_ID` | ⚠️ *Get from Backblaze B2 Dashboard > App Keys* | ☐ |
| 6 | `B2_APPLICATION_KEY` | ⚠️ *Get from Backblaze B2 Dashboard* | ☐ |
| 7 | `B2_BUCKET_NAME` | ⚠️ *Your B2 bucket name (e.g. `digisharks-backups`)* | ☐ |

### Required for Backup & GitHub Sync Triggers

Both the **Backup** and **CMS Sync to GitHub** features use these GitHub API credentials.

| # | Secret Name | Value | Used By | Status |
|---|-------------|-------|---------|--------|
| 8 | `GH_PAT` | ⚠️ *Your GitHub Personal Access Token with `repo` and `workflow` scopes* | Backup trigger + CMS sync trigger | ☐ |
| 9 | `GH_REPO` | `amitdhar2025/digisharks-communications` | Backup trigger + CMS sync trigger | ☐ |

> **Note:** The `sync-cms-to-github.yml` workflow also uses `secrets.MONGODB_URI` (same secret as row 1 above) to connect to MongoDB and export CMS collections to JSON files in the `cms-data/` directory.

---

## Part 2b: GitHub Actions Workflow Configuration

The following workflows are configured:

| Workflow File | Trigger | Description |
|---------------|---------|-------------|
| `.github/workflows/sync-cms-to-github.yml` | Manual dispatch (Admin Dashboard → Sync to GitHub) + Auto on CMS save | Exports CMS collections (pages, settings, menus, etc.) from MongoDB → `cms-data/*.json` and commits to GitHub |
| `.github/workflows/backup.yml` | Manual dispatch (Admin Dashboard → Backups → Run Backup Now) | Creates full MongoDB + Media backup and uploads to Backblaze B2 |

---

## Part 3: Quick Configuration Links

| Service | Link | What to Do |
|---------|------|------------|
| **Vercel Env Vars** | https://vercel.com/dashboard → Project → Settings → Environment Variables | Add all variables from Part 1 |
| **GitHub Secrets** | https://github.com/amitdhar2025/digisharks-communications/settings/secrets/actions | Add all secrets from Part 2 |
| **MongoDB Atlas** | https://cloud.mongodb.com | Whitelist Vercel & GitHub IPs |
| **Cloudinary** | https://cloudinary.com/console | Verify API keys are active |
| **Razorpay** | https://dashboard.razorpay.com | Verify live API keys |
| **Backblaze B2** | https://secure.backblaze.com | Generate App Key for backup uploads |
| **Serper.dev** | https://serper.dev | Verify API key is valid |

---

## Part 4: Post-Deployment Verification

After configuring everything and deploying:

- [ ] Visit `https://www.digisharkscommunications.com/` — site loads without errors
- [ ] Visit `https://www.digisharkscommunications.com/api/test` — MongoDB connection OK
- [ ] Visit `https://www.digisharkscommunications.com/admin/login` — admin panel loads
- [ ] Visit `https://www.digisharkscommunications.com/api/admin/debug` — all env vars present
- [ ] Submit a contact form — check email is sent
- [ ] Run a test checkout — Razorpay payment flow works
- [ ] Trigger a backup from Admin → Backups → Run Backup Now
- [ ] Click **Sync to GitHub** on Admin Dashboard or CMS Dashboard — verify GitHub Action triggers successfully
- [ ] After sync, verify `cms-data/*.json` files appear in the GitHub repository
- [ ] Edit a CMS page, save it — verify the sync is automatically triggered
