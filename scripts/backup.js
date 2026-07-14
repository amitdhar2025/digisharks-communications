#!/usr/bin/env node

/**
 * Backup Orchestrator Script
 *
 * Runs on GitHub Actions (or manually) to:
 *   1. Export MongoDB collections to JSON
 *   2. Download Cloudinary media assets
 *   3. Zip everything into a single archive
 *   4. Upload to Backblaze B2
 *   5. Save a record in MongoDB
 *   6. Clean up old backups (retention policy)
 *
 * Usage: node scripts/backup.js [type]
 *   type: 'full' | 'database' | 'media'  (default: 'full')
 *
 * Environment variables required:
 *   MONGODB_URI          — MongoDB Atlas connection string
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME
 */

// ── Setup ────────────────────────────────────────────────────────────

const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const os = require('os')
const { MongoClient } = require('mongodb')
const cloudinary = require('cloudinary').v2
const B2 = require('backblaze-b2')
const { Archiver } = require('archiver')
const https = require('https')

const BACKUP_TYPE = process.argv[2] || 'full'
const VALID_TYPES = ['full', 'database', 'media']
if (!VALID_TYPES.includes(BACKUP_TYPE)) {
  console.error(`Invalid backup type "${BACKUP_TYPE}". Use: full, database, media`)
  process.exit(1)
}

const DATE = new Date().toISOString().slice(0, 10) // 2026-07-13
const IS_FIRST_OF_MONTH = new Date().getDate() === 1

// ── Helpers ──────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function getEnv(name) {
  const val = process.env[name]
  if (!val) {
    console.error(`[FATAL] Missing required env var: ${name}`)
    process.exit(1)
  }
  return val
}

function humanSize(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return bytes + ' B'
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlink(destPath, () => {})
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlink(destPath, () => {})
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      fs.unlink(destPath, () => {})
      reject(err)
    })
  })
}

// ── Step 1: Export MongoDB Collections ──────────────────────────────

async function exportMongoDB(workDir) {
  if (BACKUP_TYPE === 'media') {
    log('[DB] Skipping database export (media-only backup)')
    return { collectionsCount: 0 }
  }

  const uri = getEnv('MONGODB_URI')
  const dbDir = path.join(workDir, 'database')
  await fsp.mkdir(dbDir, { recursive: true })

  log('[DB] Connecting to MongoDB...')
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  await client.connect()
  log('[DB] Connected successfully')

  const db = client.db()
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map((c) => c.name)
  log(`[DB] Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`)

  // Skip internal/system collections
  const skipCollections = ['backuprecords'] // don't export our own backup records
  let exportedCount = 0

  for (const name of collectionNames) {
    if (skipCollections.includes(name.toLowerCase())) {
      log(`[DB] Skipping collection: ${name}`)
      continue
    }

    log(`[DB] Exporting collection: ${name}...`)
    const docs = await db.collection(name).find({}).toArray()
    const filePath = path.join(dbDir, `${name}.json`)
    await fsp.writeFile(filePath, JSON.stringify(docs, null, 2), 'utf-8')
    log(`[DB] Exported ${docs.length} documents from "${name}"`)
    exportedCount++
  }

  await client.close()
  log(`[DB] MongoDB export complete — ${exportedCount} collections exported`)
  return { collectionsCount: exportedCount }
}

// ── Step 2: Download Cloudinary Assets ──────────────────────────────

async function exportCloudinary(workDir) {
  if (BACKUP_TYPE === 'database') {
    log('[CLOUD] Skipping media export (database-only backup)')
    return { mediaCount: 0 }
  }

  const cloudName = getEnv('CLOUDINARY_CLOUD_NAME')
  const apiKey = getEnv('CLOUDINARY_API_KEY')
  const apiSecret = getEnv('CLOUDINARY_API_SECRET')

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })

  const mediaDir = path.join(workDir, 'media')
  const imagesDir = path.join(mediaDir, 'images')
  const videosDir = path.join(mediaDir, 'videos')
  const rawDir = path.join(mediaDir, 'raw')
  await fsp.mkdir(imagesDir, { recursive: true })
  await fsp.mkdir(videosDir, { recursive: true })
  await fsp.mkdir(rawDir, { recursive: true })

  log('[CLOUD] Connecting to Cloudinary...')

  let totalDownloaded = 0
  let nextCursor = null

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      next_cursor: nextCursor,
    })

    const assets = result.resources || []
    log(`[CLOUD] Fetched ${assets.length} assets (cursor: ${nextCursor || 'start'})`)

    for (const asset of assets) {
      const publicId = asset.public_id.replace(/\//g, '_')
      const ext = path.extname(asset.url) || '.bin'
      const filename = `${publicId}${ext}`

      let destDir
      if (asset.resource_type === 'video') {
        destDir = videosDir
      } else if (asset.resource_type === 'raw') {
        destDir = rawDir
      } else {
        destDir = imagesDir
      }

      const destPath = path.join(destDir, filename)

      try {
        await downloadFile(asset.secure_url, destPath)
        totalDownloaded++
        if (totalDownloaded % 100 === 0) {
          log(`[CLOUD] Downloaded ${totalDownloaded} assets so far...`)
        }
      } catch (err) {
        log(`[CLOUD] Failed to download ${asset.secure_url}: ${err.message}`)
      }
    }

    nextCursor = result.next_cursor || null
  } while (nextCursor)

  log(`[CLOUD] Media export complete — ${totalDownloaded} assets downloaded`)
  return { mediaCount: totalDownloaded }
}

// ── Step 3: Create Zip Archive ──────────────────────────────────────

async function createZip(workDir, outputPath) {
  log(`[ZIP] Creating archive: ${DATE}_${BACKUP_TYPE}.zip`)

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = new Archiver('zip', { zlib: { level: 6 } })

    output.on('close', () => {
      const stats = fs.statSync(outputPath)
      log(`[ZIP] Archive created: ${humanSize(stats.size)} (${stats.size} bytes)`)
      resolve({ fileSizeBytes: stats.size, fileSize: humanSize(stats.size) })
    })

    archive.on('error', (err) => reject(err))

    archive.pipe(output)

    // Add database directory if it exists
    const dbDir = path.join(workDir, 'database')
    if (fs.existsSync(dbDir)) {
      archive.directory(dbDir, 'database')
    }

    // Add media directory if it exists
    const mediaDir = path.join(workDir, 'media')
    if (fs.existsSync(mediaDir)) {
      archive.directory(mediaDir, 'media')
    }

    archive.finalize()
  })
}

// ── Step 4: Upload to Backblaze B2 ──────────────────────────────────

async function uploadToB2(filePath, fileName) {
  const b2KeyId = getEnv('B2_KEY_ID')
  const b2AppKey = getEnv('B2_APPLICATION_KEY')
  const bucketName = getEnv('B2_BUCKET_NAME')

  log('[B2] Authenticating with Backblaze B2...')
  const b2 = new B2({
    applicationKeyId: b2KeyId,
    applicationKey: b2AppKey,
  })

  await b2.authorize()
  log('[B2] Authenticated successfully')

  // Get bucket ID by name
  const { data: buckets } = await b2.listBuckets()
  const bucket = buckets.find((b) => b.bucketName === bucketName)
  if (!bucket) {
    throw new Error(`Bucket "${bucketName}" not found in B2 account`)
  }
  const bucketId = bucket.bucketId
  log(`[B2] Found bucket: ${bucketName} (ID: ${bucketId})`)

  // Upload to daily folder
  const dailyPath = `backups/daily/${fileName}`
  log(`[B2] Uploading to ${dailyPath}...`)

  const stats = fs.statSync(filePath)
  const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024 // 100 MB

  if (stats.size > LARGE_FILE_THRESHOLD) {
    // Use large file upload for files > 100 MB
    log(`[B2] File is large (${humanSize(stats.size)}), using large file upload...`)
    await uploadLargeFile(b2, bucketId, filePath, dailyPath)
  } else {
    const fileContent = fs.readFileSync(filePath)
    await b2.uploadFile({
      bucketId,
      fileName: dailyPath,
      data: fileContent,
      contentType: 'application/zip',
    })
  }

  log(`[B2] Uploaded to ${dailyPath} successfully`)

  // If it's the 1st of the month, also upload to monthly folder
  let monthlyPath = null
  if (IS_FIRST_OF_MONTH) {
    monthlyPath = `backups/monthly/${fileName}`
    log(`[B2] Also uploading to ${monthlyPath} (monthly archive)...`)

    if (stats.size > LARGE_FILE_THRESHOLD) {
      await uploadLargeFile(b2, bucketId, filePath, monthlyPath)
    } else {
      const fileContent = fs.readFileSync(filePath)
      await b2.uploadFile({
        bucketId,
        fileName: monthlyPath,
        data: fileContent,
        contentType: 'application/zip',
      })
    }
    log(`[B2] Uploaded to ${monthlyPath} successfully`)
  }

  // Generate download URL — B2 public bucket URL or signed URL
  const downloadUrl = `https://f001.backblazeb2.com/file/${bucketName}/${dailyPath}`
  const monthlyDownloadUrl = monthlyPath
    ? `https://f001.backblazeb2.com/file/${bucketName}/${monthlyPath}`
    : null

  return { downloadUrl, monthlyDownloadUrl }
}

// ── B2 Large File Upload (files > 100 MB) ──────────────────────────

async function uploadLargeFile(b2, bucketId, filePath, b2FileName) {
  const PART_SIZE = 5 * 1024 * 1024 // 5 MB minimum per B2 spec
  const fileSize = fs.statSync(filePath).size
  const numParts = Math.ceil(fileSize / PART_SIZE)

  log(`[B2:LARGE] Starting large file upload: ${b2FileName} (${numParts} parts)`)

  // Start the large file
  const { data: largeFile } = await b2.startLargeFile({
    bucketId,
    fileName: b2FileName,
    contentType: 'application/zip',
  })

  const fileId = largeFile.fileId
  log(`[B2:LARGE] File ID: ${fileId}`)

  // Get upload URLs for each part
  const { data: uploadUrlData } = await b2.getUploadPartUrl({ fileId })

  // Upload each part
  const fd = fs.openSync(filePath, 'r')
  const sha1s = []

  try {
    for (let i = 0; i < numParts; i++) {
      const start = i * PART_SIZE
      const end = Math.min(start + PART_SIZE, fileSize)
      const partSize = end - start
      const partNumber = i + 1

      const buffer = Buffer.alloc(partSize)
      fs.readSync(fd, buffer, 0, partSize, start)

      log(`[B2:LARGE] Uploading part ${partNumber}/${numParts} (${humanSize(partSize)})...`)

      const { data: partResult } = await b2.uploadPart({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        partNumber,
        data: buffer,
      })

      sha1s.push(partResult.contentSha1)

      if (partNumber % 10 === 0) {
        log(`[B2:LARGE] ${partNumber}/${numParts} parts uploaded`)
      }
    }
  } finally {
    fs.closeSync(fd)
  }

  // Finish the large file
  await b2.finishLargeFile({
    fileId,
    partSha1Array: sha1s,
  })

  log(`[B2:LARGE] Large file upload complete: ${b2FileName}`)
}

// ── Activity Log Helper ────────────────────────────────────────────

/**
 * Log an activity entry directly to the activitylogs collection.
 * Uses native MongoDB driver (no Mongoose dependency in this script).
 */
async function logActivityToDB(event, description, username, dashboard) {
  try {
    const uri = getEnv('MONGODB_URI')
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
    await client.connect()
    const db = client.db()
    await db.collection('activitylogs').insertOne({
      event,
      description,
      username,
      dashboard: dashboard || 'admin',
      target: BACKUP_TYPE,
      metadata: {},
      ip: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await client.close()
  } catch (err) {
    // Don't fail the backup if activity logging fails
    console.error(`[ACTIVITY] Failed to log event: ${err.message}`)
  }
}

// ── Step 5: Save Record in MongoDB ──────────────────────────────────

async function saveRecord(record) {
  const uri = getEnv('MONGODB_URI')
  log('[RECORD] Saving backup record to MongoDB...')

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  await client.connect()

  const db = client.db()
  const collection = db.collection('backuprecords')

  await collection.insertOne({
    ...record,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // If it's the 1st, also save a monthly record
  if (IS_FIRST_OF_MONTH && record.monthlyDownloadUrl) {
    await collection.insertOne({
      type: record.type,
      period: 'monthly',
      date: record.date,
      fileName: record.fileName,
      fileSizeBytes: record.fileSizeBytes,
      fileSize: record.fileSize,
      downloadUrl: record.monthlyDownloadUrl,
      durationSeconds: record.durationSeconds,
      collectionsCount: record.collectionsCount,
      mediaCount: record.mediaCount,
      status: record.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    log('[RECORD] Monthly archive record saved')
  }

  await client.close()
  log('[RECORD] Backup record saved successfully')
}

// ── Step 6: Retention Cleanup ───────────────────────────────────────

async function retentionCleanup() {
  const uri = getEnv('MONGODB_URI')
  const b2KeyId = getEnv('B2_KEY_ID')
  const b2AppKey = getEnv('B2_APPLICATION_KEY')
  const bucketName = getEnv('B2_BUCKET_NAME')

  log('[RETENTION] Starting retention cleanup...')

  // Connect to MongoDB
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  await client.connect()
  const db = client.db()
  const collection = db.collection('backuprecords')

  // Connect to B2
  const b2 = new B2({
    applicationKeyId: b2KeyId,
    applicationKey: b2AppKey,
  })
  await b2.authorize()

  const { data: buckets } = await b2.listBuckets()
  const bucket = buckets.find((b) => b.bucketName === bucketName)
  if (!bucket) {
    throw new Error(`Bucket "${bucketName}" not found in B2 account`)
  }
  const bucketId = bucket.bucketId

  // ── Daily backups: keep last 7 days ──
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const expireDaily = await collection.find({
    period: 'daily',
    createdAt: { $lt: sevenDaysAgo },
  }).toArray()

  log(`[RETENTION] Found ${expireDaily.length} expired daily backup(s) to delete`)

  for (const record of expireDaily) {
    // Delete from B2
    try {
      const b2FileName = `backups/daily/${record.fileName}`
      const { data: fileInfo } = await b2.listFileNames({
        bucketId,
        startFileName: b2FileName,
        maxFileCount: 1,
      })
      const file = fileInfo.files?.find((f) => f.fileName === b2FileName)
      if (file) {
        await b2.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName,
        })
        log(`[RETENTION] Deleted from B2: ${b2FileName}`)
      }
    } catch (err) {
      log(`[RETENTION] Failed to delete from B2: ${err.message}`)
    }

    // Delete from MongoDB
    await collection.deleteOne({ _id: record._id })
  }

  // ── Monthly archives: keep last 12 months ──
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const expireMonthly = await collection.find({
    period: 'monthly',
    createdAt: { $lt: twelveMonthsAgo },
  }).toArray()

  log(`[RETENTION] Found ${expireMonthly.length} expired monthly archive(s) to delete`)

  for (const record of expireMonthly) {
    try {
      const b2FileName = `backups/monthly/${record.fileName}`
      const { data: fileInfo } = await b2.listFileNames({
        bucketId,
        startFileName: b2FileName,
        maxFileCount: 1,
      })
      const file = fileInfo.files?.find((f) => f.fileName === b2FileName)
      if (file) {
        await b2.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName,
        })
        log(`[RETENTION] Deleted monthly from B2: ${b2FileName}`)
      }
    } catch (err) {
      log(`[RETENTION] Failed to delete monthly from B2: ${err.message}`)
    }

    await collection.deleteOne({ _id: record._id })
  }

  await client.close()
  log(`[RETENTION] Cleanup complete — removed ${expireDaily.length} daily + ${expireMonthly.length} monthly backup(s)`)
}

// ── Main Orchestrator ───────────────────────────────────────────────

async function main() {
  const startTime = Date.now()
  log(`========================================`)
  log(`BACKUP START — Type: ${BACKUP_TYPE.toUpperCase()} — Date: ${DATE}`)
  log(`========================================`)
  log(`First of month: ${IS_FIRST_OF_MONTH}`)

  // Create working directory in OS temp
  const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'backup-'))
  const zipPath = path.join(workDir, `${DATE}_${BACKUP_TYPE}.zip`)
  log(`Working directory: ${workDir}`)

  // Log the backup start event
  await logActivityToDB(
    'backup_start',
    `Backup started: ${BACKUP_TYPE} (${DATE})`,
    'system',
    'admin'
  )

  let errorMessage = null
  let collectionsCount = 0
  let mediaCount = 0

  try {
    // Step 1: MongoDB export (if applicable)
    if (BACKUP_TYPE !== 'media') {
      const dbResult = await exportMongoDB(workDir)
      collectionsCount = dbResult.collectionsCount
    }

    // Step 2: Cloudinary export (if applicable)
    if (BACKUP_TYPE !== 'database') {
      const cloudResult = await exportCloudinary(workDir)
      mediaCount = cloudResult.mediaCount
    }

    // Step 3: Create zip archive
    const zipInfo = await createZip(workDir, zipPath)

    // Step 4: Upload to B2
    const uploadInfo = await uploadToB2(zipPath, `${DATE}_${BACKUP_TYPE}.zip`)

    // Step 5: Save record
    const durationSeconds = Math.round((Date.now() - startTime) / 1000)
    await saveRecord({
      type: BACKUP_TYPE,
      period: 'daily',
      date: DATE,
      fileName: `${DATE}_${BACKUP_TYPE}.zip`,
      fileSizeBytes: zipInfo.fileSizeBytes,
      fileSize: zipInfo.fileSize,
      downloadUrl: uploadInfo.downloadUrl,
      monthlyDownloadUrl: uploadInfo.monthlyDownloadUrl || null,
      durationSeconds,
      collectionsCount,
      mediaCount,
      status: 'success',
    })

    // Step 6: Retention cleanup
    await retentionCleanup()

    const totalDuration = Math.round((Date.now() - startTime) / 1000)
    // Log the backup completion event
    await logActivityToDB(
      'backup_complete',
      `Backup completed: ${BACKUP_TYPE} — ${zipInfo.fileSize}, ${collectionsCount} collections, ${mediaCount} assets (${totalDuration}s)`,
      'system',
      'admin'
    )

    log(`========================================`)
    log(`BACKUP COMPLETE — Duration: ${totalDuration}s`)
    log(`  Type: ${BACKUP_TYPE}`)
    log(`  File: ${DATE}_${BACKUP_TYPE}.zip (${zipInfo.fileSize})`)
    log(`  DB collections: ${collectionsCount}`)
    log(`  Media assets: ${mediaCount}`)
    log(`  Upload URL: ${uploadInfo.downloadUrl}`)
    log(`========================================`)
  } catch (err) {
    errorMessage = err.message
    log(`[FATAL] Backup failed: ${err.message}`)
    console.error(err)

    // Log the backup failure event
    await logActivityToDB(
      'backup_trigger_failed',
      `Backup failed: ${BACKUP_TYPE} — ${err.message.slice(0, 200)}`,
      'system',
      'admin'
    )

    // Try to save a failed record
    try {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000)
      await saveRecord({
        type: BACKUP_TYPE,
        period: 'daily',
        date: DATE,
        fileName: `${DATE}_${BACKUP_TYPE}.zip`,
        fileSizeBytes: 0,
        fileSize: '0 B',
        downloadUrl: '',
        durationSeconds,
        collectionsCount,
        mediaCount,
        status: 'failed',
        errorMessage: errorMessage,
      })
    } catch (saveErr) {
      log(`[FATAL] Could not save failure record: ${saveErr.message}`)
    }

    process.exit(1)
  } finally {
    // Clean up working directory
    try {
      await fsp.rm(workDir, { recursive: true, force: true })
      log(`[CLEANUP] Removed working directory: ${workDir}`)
    } catch (err) {
      log(`[CLEANUP] Warning: could not remove ${workDir}: ${err.message}`)
    }
  }
}

main()
