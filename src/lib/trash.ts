/**
 * Trash / Recycle Bin System
 *
 * Generic soft-delete infrastructure that works with both native MongoDB
 * collections and Mongoose models. Deleted items are stored in a single
 * `trash_items` collection with full audit trail metadata.
 */

import { ObjectId } from 'mongodb'
import { getDb } from './db'
import { connectMongoose } from './mongoose'
import { SECTION_TO_COLLECTION, SECTION_LABELS as MAP_SECTION_LABELS } from './trash-model-map'

/* ─── Types ────────────────────────────────────────────── */

export interface TrashActor {
  username: string
  role: 'admin' | 'sub-admin'
}

/** A single item in the trash collection. */
export interface TrashItem {
  _id?: ObjectId
  /** Logical grouping, e.g. "queries", "blogposts", "orders", "rss", etc. */
  collectionName: string
  /** Human-readable label for the section, e.g. "Contact Queries", "Blog Posts" */
  sectionLabel: string
  /** The original document _id stored as a string (so it round-trips safely). */
  originalId: string
  /** Short display title (e.g. blog-post title, query name, order number). */
  title: string
  /** Full original document data (serialised via JSON). */
  data: Record<string, unknown>
  /** Who deleted it. */
  deletedBy: TrashActor
  deletedAt: Date
  /** Restore audit — populated when restored. */
  restoredAt: Date | null
  restoredBy: TrashActor | null
  /** When permanently deleted from trash (for audit / auto-cleanup). */
  permanentlyDeletedAt: Date | null
}

/* ─── Section Labels ──────────────────────────────────── */

export function getSectionLabel(collectionName: string): string {
  return MAP_SECTION_LABELS[collectionName] || collectionName
}

/* ─── Collection Helper ───────────────────────────────── */

export async function getTrashCollection() {
  const db = await getDb()
  return db.collection<TrashItem>('trash_items')
}

/* ─── Soft Delete ─────────────────────────────────────── */

/**
 * Read a document from the given **native** MongoDB collection, then move it
 * into the trash.  The original document is deleted from its collection.
 *
 * @param collectionName - Logical group name used to namespace trash items.
 * @param nativeCollection - Name of the native MongoDB collection to read from.
 * @param id - The ObjectId `_id` to delete.
 * @param deletedBy - Admin / sub-admin who performed the delete.
 * @param titleFn - Optional function to derive a display title from the doc.
 * @returns The inserted trash item _id.
 */
export async function softDeleteFromNative(
  collectionName: string,
  nativeCollection: string,
  id: string | ObjectId,
  deletedBy: TrashActor,
  titleFn?: (doc: Record<string, unknown>) => string,
): Promise<string> {
  const db = await getDb()
  const col = db.collection(nativeCollection)
  const oid = typeof id === 'string' ? new ObjectId(id) : id

  const doc = await col.findOne({ _id: oid })
  if (!doc) throw new Error(`Document not found in ${nativeCollection}`)

  // Delete the original
  await col.deleteOne({ _id: oid })

  // Build the title
  const title = titleFn ? titleFn(doc) : String(doc._id)

  // Insert into trash
  const trashCol = await getTrashCollection()
  const trashDoc: TrashItem = {
    collectionName,
    sectionLabel: getSectionLabel(collectionName),
    originalId: String(doc._id),
    title,
    data: doc as unknown as Record<string, unknown>,
    deletedBy,
    deletedAt: new Date(),
    restoredAt: null,
    restoredBy: null,
    permanentlyDeletedAt: null,
  }
  const result = await trashCol.insertOne(trashDoc)
  return result.insertedId.toString()
}

/**
 * Soft-delete a Mongoose-model document.  Reads it first, stores it in the
 * trash collection, then deletes it from its Mongoose collection.
 *
 * @param collectionName - Logical group name.
 * @param model - Mongoose model class (must have findById and findByIdAndDelete).
 * @param id - String _id.
 * @param deletedBy - Who performed the delete.
 * @param titleFn - Derive a display title from the document.
 */
export async function softDeleteFromMongoose<T extends { _id: unknown; toObject?: () => Record<string, unknown> }>(
  collectionName: string,
  model: { findById: (id: string) => Promise<T | null>; findByIdAndDelete: (id: string) => Promise<T | null> },
  id: string,
  deletedBy: TrashActor,
  titleFn?: (doc: Record<string, unknown>) => string,
): Promise<string> {
  await connectMongoose()

  const doc = await model.findById(id)
  if (!doc) throw new Error(`Document not found in ${collectionName}`)

  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc }
  // Deep-serialize to strip Mongoose-specific BSON types (ObjectId, Date, etc.)
  // so they are compatible with the native MongoDB BSON 6.x driver
  const safeData = JSON.parse(JSON.stringify(plain))

  // Delete via Mongoose
  await model.findByIdAndDelete(id)

  const title = titleFn ? titleFn(safeData) : String(safeData._id || id)

  const trashCol = await getTrashCollection()
  const trashDoc: TrashItem = {
    collectionName,
    sectionLabel: getSectionLabel(collectionName),
    originalId: String(safeData._id || id),
    title,
    data: safeData as unknown as Record<string, unknown>,
    deletedBy,
    deletedAt: new Date(),
    restoredAt: null,
    restoredBy: null,
    permanentlyDeletedAt: null,
  }
  const result = await trashCol.insertOne(trashDoc)
  return result.insertedId.toString()
}

/* ─── Restore ──────────────────────────────────────────── */

/**
 * Convert string-encoded ObjectId values back to ObjectId instances.
 * When documents are stored via JSON.stringify (e.g. softDeleteFromMongoose),
 * ObjectId instances become plain strings. This reverses that conversion
 * so documents can be re-inserted into their original collections.
 */
function convertObjectIdStrings(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_bsontype') {
      result[key] = value
    } else if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
      try { result[key] = new ObjectId(value) } catch { result[key] = value }
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string' && /^[0-9a-fA-F]{24}$/.test(item)) {
          try { return new ObjectId(item) } catch { return item }
        }
        if (typeof item === 'object' && item !== null && !(item instanceof Date)) {
          return convertObjectIdStrings(item as Record<string, unknown>)
        }
        return item
      })
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      result[key] = convertObjectIdStrings(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Complete mapping from trash collectionName to the actual MongoDB collection name.
 * Native collections use different names than Mongoose-pluralized collections.
 */
// Re-export the shared collection name map
const COLLECTION_NAME_MAP = SECTION_TO_COLLECTION

/**
 * Restore a trashed item back into its original collection.
 * Supports both trash_items entries and source-collection items (isDeleted=true).
 */
export async function restoreFromTrash(
  trashId: string,
  restoredBy: TrashActor,
  section?: string,
): Promise<{ success: boolean; collectionName: string }> {
  const trashCol = await getTrashCollection()

  // First try: find in trash_items collection
  const trashDoc = await trashCol.findOne({ _id: new ObjectId(trashId) })

  if (trashDoc) {
    // Restore from trash_items
    if (trashDoc.restoredAt) throw new Error('Item has already been restored')
    if (trashDoc.permanentlyDeletedAt) throw new Error('Item has been permanently deleted')

    const db = await getDb()
    const oid = new ObjectId(trashDoc.originalId)

    const nativeColName = COLLECTION_NAME_MAP[trashDoc.collectionName] || trashDoc.collectionName

    // Convert string ObjectIds back to ObjectId instances (from JSON serialization)
    let restoredData = convertObjectIdStrings(trashDoc.data as Record<string, unknown>)
    // Ensure _id is the correct ObjectId
    restoredData._id = oid

    // Check if a document with this _id already exists in the target collection
    const existing = await db.collection(nativeColName).findOne({ _id: oid })
    if (existing) {
      // Document already exists — update it with the restored data instead of creating a duplicate
      const { _id, ...updateData } = restoredData
      await db.collection(nativeColName).updateOne(
        { _id: oid },
        { $set: updateData },
      )
    } else {
      await db.collection(nativeColName).insertOne(restoredData as any)
    }

    await trashCol.updateOne(
      { _id: new ObjectId(trashId) },
      { $set: { restoredAt: new Date(), restoredBy } },
    )

    return { success: true, collectionName: trashDoc.collectionName }
  }

  // Second try: source-collection items with isDeleted=true.
  // Use the model mapping to search ALL collections that support isDeleted,
  // not just blogposts. Also try both ObjectId and string _id lookups.
  // If section is provided, only search that collection for performance.
  const db = await getDb()

  const isDeletedUpdate = {
    $set: {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      autoDeleteAt: null,
    },
  }

  // Determine which collections to search
  const entriesToSearch = section && SECTION_TO_COLLECTION[section]
    ? [[section, SECTION_TO_COLLECTION[section]] as [string, string]]
    : Object.entries(SECTION_TO_COLLECTION)

  for (const [sec, colName] of entriesToSearch) {
    try {
      // Try ObjectId first
      if (ObjectId.isValid(trashId)) {
        const oid = new ObjectId(trashId)
        const result = await db.collection(colName).findOneAndUpdate(
          { _id: oid, isDeleted: true },
          isDeletedUpdate,
          { returnDocument: 'after' },
        )
        if (result?.value) {
          return { success: true, collectionName: sec }
        }

        // Fallback: string _id (some documents have string _ids)
        const resultStr = await db.collection(colName).findOneAndUpdate(
          { _id: trashId as unknown as ObjectId, isDeleted: true },
          isDeletedUpdate,
          { returnDocument: 'after' },
        )
        if (resultStr?.value) {
          return { success: true, collectionName: sec }
        }
      }
    } catch {
      // Collection may not have isDeleted field — skip silently
    }
  }

  throw new Error('Trash item not found')
}

/* ─── Permanent Delete ────────────────────────────────── */

/**
 * Permanently delete a trash item (irreversible!).
 * Supports both trash_items entries and source-collection items (isDeleted=true).
 */
export async function permanentDelete(trashId: string, deletedBy?: TrashActor, section?: string): Promise<void> {
  const trashCol = await getTrashCollection()

  // First try: trash_items collection — hard-delete the document completely
  const trashDoc = await trashCol.findOne({ _id: new ObjectId(trashId) })
  if (trashDoc) {
    // Write an audit record before deleting so stats/history remain accurate
    const db = await getDb()
    await db.collection('trash_permanent_deletions').insertOne({
      itemTitle: trashDoc.title,
      section: trashDoc.collectionName,
      sectionLabel: trashDoc.sectionLabel,
      originalId: trashDoc.originalId,
      deletedBy: deletedBy || trashDoc.deletedBy,
      deletedAt: trashDoc.deletedAt,
      permanentlyDeletedAt: new Date(),
    })
    await trashCol.deleteOne({ _id: new ObjectId(trashId) })
    return
  }

  // Second try: source-collection items with isDeleted=true.
  // Use the model mapping to search ALL collections, not just blogposts.
  // If section is provided, only search that collection for performance.
  const db = await getDb()

  const entriesToSearch = section && SECTION_TO_COLLECTION[section]
    ? [[section, SECTION_TO_COLLECTION[section]] as [string, string]]
    : Object.entries(SECTION_TO_COLLECTION)

  for (const [sec, colName] of entriesToSearch) {
    try {
      // Try ObjectId first
      if (ObjectId.isValid(trashId)) {
        const oid = new ObjectId(trashId)
        let result = await db.collection(colName).findOneAndDelete({ _id: oid, isDeleted: true })
        if (result?.value) {
          await db.collection('trash_permanent_deletions').insertOne({
            itemTitle: (result.value as any)?.title || String(oid),
            section: sec,
            sectionLabel: getSectionLabel(sec),
            originalId: String(oid),
            deletedBy: deletedBy || (result.value as any)?.deletedBy || { username: '—', role: 'admin' },
            deletedAt: (result.value as any)?.deletedAt || new Date(),
            permanentlyDeletedAt: new Date(),
          })
          return
        }

        // Fallback: string _id
        result = await db.collection(colName).findOneAndDelete({ _id: trashId as unknown as ObjectId, isDeleted: true })
        if (result?.value) {
          await db.collection('trash_permanent_deletions').insertOne({
            itemTitle: (result.value as any)?.title || trashId,
            section: sec,
            sectionLabel: getSectionLabel(sec),
            originalId: trashId,
            deletedBy: deletedBy || (result.value as any)?.deletedBy || { username: '—', role: 'admin' },
            deletedAt: (result.value as any)?.deletedAt || new Date(),
            permanentlyDeletedAt: new Date(),
          })
          return
        }
      }
    } catch {
      // Collection may not have isDeleted field — skip silently
    }
  }

  throw new Error('Trash item not found')
}

/* ─── List Trash Items ────────────────────────────────── */

export interface TrashListResult {
  items: (TrashItem & { _id: string })[]
  total: number
  pages: number
  page: number
}

/**
 * Fetch deleted blog posts (isDeleted=true) from the blogposts collection
 * and return them in the same format as trash_items.
 */
async function getDeletedItemsFromSourceCollections(section?: string): Promise<TrashItem[]> {
  const db = await getDb()
  const results: TrashItem[] = []

  // Check each source collection that supports isDeleted soft-delete
  const collectionsToCheck: { name: string; sectionLabel: string; titleField: string }[] = []

  if (!section || section === 'all' || section === 'blogposts') {
    collectionsToCheck.push({ name: 'blogposts', sectionLabel: 'Blog Posts', titleField: 'title' })
  }

  for (const colInfo of collectionsToCheck) {
    try {
      const col = db.collection(colInfo.name)
      const docs = await col.find({ isDeleted: true }).sort({ deletedAt: -1 }).limit(50).toArray()
      for (const doc of docs) {
        results.push({
          _id: doc._id as any,
          collectionName: colInfo.name,
          sectionLabel: colInfo.sectionLabel,
          originalId: String(doc._id),
          title: (doc as any)[colInfo.titleField] || String(doc._id),
          data: doc as any,
          deletedBy: (doc as any).deletedBy || { username: '—', role: 'admin' },
          deletedAt: (doc as any).deletedAt || new Date(),
          restoredAt: null,
          restoredBy: null,
          permanentlyDeletedAt: null,
        })
      }
    } catch (err) {
      console.warn(`Failed to fetch deleted items from ${colInfo.name}:`, err)
    }
  }

  return results
}

/**
 * List trash items with pagination and optional section filter.
 * Combines items from the trash_items collection AND source collections (isDeleted=true).
 * Fetches all items up to a reasonable cap, merges, sorts, then paginates.
 */
export async function listTrashItems(
  page = 1,
  limit = 20,
  section?: string,
  search?: string,
): Promise<TrashListResult> {
  const trashCol = await getTrashCollection()

  const filter: Record<string, unknown> = {
    permanentlyDeletedAt: null,
    restoredAt: null,
  }
  if (section && section !== 'all') filter.collectionName = section
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { sectionLabel: { $regex: search, $options: 'i' } },
    ]
  }

  // True total from trash_items (uncapped, accurate)
  const trashTotal = await trashCol.countDocuments(filter)

  // Fetch source-collection items (isDeleted=true)
  const sourceItems = await getDeletedItemsFromSourceCollections(section)

  // Count how many source items are NOT already in trash_items (deduplicate)
  const sourceIds = sourceItems.map((s) => s.originalId)
  let dedupedSourceTotal = sourceItems.length
  if (sourceIds.length > 0) {
    const existingInTrash = await trashCol.countDocuments({
      ...filter,
      collectionName: 'blogposts',
      originalId: { $in: sourceIds },
    })
    dedupedSourceTotal = sourceItems.length - existingInTrash
  }

  const total = trashTotal + dedupedSourceTotal
  const pages = Math.ceil(total / limit)

  // Fetch ALL items from both sources (cap to 200 for performance),
  // merge, sort, then paginate the merged list
  const MAX_ITEMS = 200

  const trashItems = await trashCol
    .find(filter)
    .sort({ deletedAt: -1 })
    .limit(MAX_ITEMS)
    .toArray()

  // Merge and deduplicate by originalId + collectionName
  const seen = new Set<string>()
  const merged: TrashItem[] = []

  for (const item of trashItems) {
    const key = `${item.collectionName}:${item.originalId}`
    seen.add(key)
    merged.push(item)
  }

  for (const item of sourceItems) {
    const key = `${item.collectionName}:${item.originalId}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(item)
    }
  }

  // Sort by deletedAt descending
  merged.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime())

  const start = (page - 1) * limit
  const pageItems = merged.slice(start, start + limit)

  return {
    items: pageItems.map((i) => ({ ...i, _id: String(i._id!) })) as any,
    total,
    pages,
    page,
  }
}

/* ─── Count ────────────────────────────────────────────── */

/**
 * Get the total count of items currently in the trash (not permanently deleted, not restored).
 * Includes items from source collections that use isDeleted=true soft-delete.
 */
export async function getTrashCount(): Promise<number> {
  const trashCol = await getTrashCollection()
  const trashCount = await trashCol.countDocuments({ permanentlyDeletedAt: null, restoredAt: null })

  // Add counts from source collections using isDeleted=true
  const db = await getDb()
  let sourceCount = 0
  try {
    sourceCount += await db.collection('blogposts').countDocuments({ isDeleted: true })
  } catch { /* ignore */ }

  return trashCount + sourceCount
}

/**
 * Get the count of items that have ever been restored from trash.
 */
export async function getTotalRestored(): Promise<number> {
  const trashCol = await getTrashCollection()
  return trashCol.countDocuments({ restoredAt: { $ne: null } })
}

/**
 * Get the count of items that have ever been permanently deleted.
 */
export async function getTotalPermanentlyDeleted(): Promise<number> {
  const db = await getDb()
  // Count from the permanent-deletions audit collection
  try {
    return await db.collection('trash_permanent_deletions').countDocuments()
  } catch {
    return 0
  }
}

/**
 * Get per-section counts of trash items.
 * Includes items from source collections that use isDeleted=true soft-delete.
 */
export async function getTrashCountsBySection(): Promise<Record<string, number>> {
  const trashCol = await getTrashCollection()
  const pipeline = [
    { $match: { permanentlyDeletedAt: null, restoredAt: null } },
    { $group: { _id: '$collectionName', count: { $sum: 1 } } },
  ]
  const results = await trashCol.aggregate(pipeline).toArray()
  const counts: Record<string, number> = {}
  for (const r of results) {
    counts[r._id] = r.count
  }

  // Add counts from source collections using isDeleted=true
  const db = await getDb()
  try {
    const blogDeletedCount = await db.collection('blogposts').countDocuments({ isDeleted: true })
    if (blogDeletedCount > 0) {
      counts['blogposts'] = (counts['blogposts'] || 0) + blogDeletedCount
    }
  } catch { /* ignore */ }

  return counts
}

/* ─── Trash Settings ──────────────────────────────────── */

/** Retention period configuration stored in `trash_settings` collection. */
export interface TrashSettings {
  _id?: ObjectId
  /** Global default retention in days. */
  globalRetentionDays: number
  /** Per-section overrides — key is collectionName, value is retention days. */
  perSectionRetentionDays: Record<string, number>
  /** When the settings were last updated. */
  updatedAt: Date
  /** Who last updated them. */
  updatedBy?: TrashActor
}

const DEFAULT_RETENTION_DAYS = 30

async function getTrashSettingsCollection() {
  const db = await getDb()
  return db.collection<TrashSettings>('trash_settings')
}

/**
 * Get the current trash retention settings. Creates a default doc if none exists.
 */
export async function getTrashSettings(): Promise<TrashSettings> {
  const col = await getTrashSettingsCollection()
  let settings = await col.findOne({})
  if (!settings) {
    settings = {
      _id: new ObjectId(),
      globalRetentionDays: DEFAULT_RETENTION_DAYS,
      perSectionRetentionDays: {},
      updatedAt: new Date(),
    }
    await col.insertOne(settings)
  }
  return settings
}

/**
 * Update trash retention settings. Only super admin should call this.
 */
export async function updateTrashSettings(
  updates: Partial<Pick<TrashSettings, 'globalRetentionDays' | 'perSectionRetentionDays'>>,
  updatedBy: TrashActor,
): Promise<TrashSettings> {
  const col = await getTrashSettingsCollection()
  const existing = await getTrashSettings()

  const merged: TrashSettings = {
    ...existing,
    globalRetentionDays: updates.globalRetentionDays ?? existing.globalRetentionDays,
    perSectionRetentionDays: updates.perSectionRetentionDays ?? existing.perSectionRetentionDays,
    updatedAt: new Date(),
    updatedBy,
  }

  await col.updateOne({}, { $set: merged }, { upsert: true })
  return merged
}

/**
 * Get the effective retention days for a specific section.
 * Falls back to global retention if no per-section override is set.
 */
export async function getEffectiveRetentionDays(collectionName: string): Promise<number> {
  const settings = await getTrashSettings()
  return settings.perSectionRetentionDays[collectionName] ?? settings.globalRetentionDays
}

/**
 * Calculate remaining days before an item is auto-deleted.
 * Returns null if the item has been restored or already permanently deleted.
 */
export function getRemainingDays(item: TrashItem, retentionDays: number): number | null {
  if (item.permanentlyDeletedAt) return null
  const elapsed = Date.now() - new Date(item.deletedAt).getTime()
  const remaining = retentionDays - elapsed / (24 * 60 * 60 * 1000)
  return Math.max(0, Math.round(remaining))
}

/* ─── Bulk Operations ──────────────────────────────────── */

/**
 * Restore multiple trash items at once.
 */
export async function bulkRestoreFromTrash(
  trashIds: string[],
  restoredBy: TrashActor,
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  for (const id of trashIds) {
    try {
      await restoreFromTrash(id, restoredBy)
      success++
    } catch {
      failed++
    }
  }
  return { success, failed }
}

/**
 * Permanently delete multiple trash items at once.
 */
export async function bulkPermanentDelete(trashIds: string[], deletedBy?: TrashActor): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  for (const id of trashIds) {
    try {
      await permanentDelete(id, deletedBy)
      success++
    } catch {
      failed++
    }
  }
  return { success, failed }
}

/**
 * Permanently delete ALL trashed items (empty entire trash).
 */
export async function emptyAllTrash(deletedBy?: TrashActor): Promise<number> {
  const trashCol = await getTrashCollection()
  const db = await getDb()

  // Fetch all remaining trash items before deleting
  const items = await trashCol.find({ permanentlyDeletedAt: null, restoredAt: null }).toArray()

  // Write audit records for each item, then delete
  const now = new Date()
  const auditCol = db.collection('trash_permanent_deletions')
  for (const item of items) {
    await auditCol.insertOne({
      itemTitle: item.title,
      section: item.collectionName,
      sectionLabel: item.sectionLabel,
      originalId: item.originalId,
      deletedBy: deletedBy || item.deletedBy,
      deletedAt: item.deletedAt,
      permanentlyDeletedAt: now,
    })
  }

  // Hard-delete all remaining trash items
  const result = await trashCol.deleteMany({ permanentlyDeletedAt: null, restoredAt: null })
  return result.deletedCount
}

/* ─── Audit Log ────────────────────────────────────────── */

export interface AuditLogEntry {
  _id: string
  action: 'deleted' | 'restored' | 'permanently_deleted'
  itemTitle: string
  section: string
  sectionLabel: string
  performedBy: string
  performedAt: string
}

/**
 * Get audit log entries — deleted, restored, and permanently deleted items.
 */
export async function getAuditLog(
  page = 1,
  limit = 50,
  section?: string,
): Promise<{ entries: AuditLogEntry[]; total: number }> {
  const trashCol = await getTrashCollection()
  const db = await getDb()

  const entries: AuditLogEntry[] = []

  // Build filter
  const filter: Record<string, unknown> = {}
  const permFilter: Record<string, unknown> = {}
  if (section && section !== 'all') {
    filter.collectionName = section
    permFilter.section = section
  }

  // Count from both collections with section filter applied
  const trashItemCount = await trashCol.countDocuments(filter)
  let permItemCount = 0
  try {
    permItemCount = await db.collection('trash_permanent_deletions').countDocuments(permFilter)
  } catch { /* ignore */ }
  const total = trashItemCount + permItemCount

  // Fetch entries from trash_items
  const items = await trashCol
    .find(filter)
    .sort({ deletedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  for (const item of items) {
    // Deleted action
    entries.push({
      _id: item._id!.toString(),
      action: 'deleted',
      itemTitle: item.title,
      section: item.collectionName,
      sectionLabel: item.sectionLabel,
      performedBy: item.deletedBy?.username || '—',
      performedAt: item.deletedAt?.toISOString?.() ?? String(item.deletedAt),
    })

    // Restored action (if applicable)
    if (item.restoredAt && item.restoredBy) {
      entries.push({
        _id: item._id!.toString() + '_restored',
        action: 'restored',
        itemTitle: item.title,
        section: item.collectionName,
        sectionLabel: item.sectionLabel,
        performedBy: item.restoredBy.username,
        performedAt: item.restoredAt?.toISOString?.() ?? String(item.restoredAt),
      })
    }
  }

  // Also fetch permanently deleted items from the audit collection
  try {
    const permItems = await db.collection('trash_permanent_deletions')
      .find(permFilter)
      .sort({ permanentlyDeletedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    for (const item of permItems) {
      entries.push({
        _id: item._id!.toString(),
        action: 'permanently_deleted',
        itemTitle: item.itemTitle || '—',
        section: item.section || '—',
        sectionLabel: item.sectionLabel || '—',
        performedBy: item.deletedBy?.username || '—',
        performedAt: item.permanentlyDeletedAt?.toISOString?.() ?? String(item.permanentlyDeletedAt),
      })
    }
  } catch { /* ignore */ }

  // Sort by performedAt descending and paginate the merged result
  entries.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
  const start = (page - 1) * limit
  const pageEntries = entries.slice(start, start + limit)

  return { entries: pageEntries, total }
}

/* ─── Auto-Cleanup ────────────────────────────────────── */

/**
 * Permanently delete items that have been in the trash for longer than
 * the configured retention period. Uses global retention + per-section overrides.
 *
 * Returns the number of items cleaned up.
 */
export async function autoCleanupTrash(days?: number): Promise<number> {
  const trashCol = await getTrashCollection()
  const settings = await getTrashSettings()
  const globalCutoff = new Date(Date.now() - (days ?? settings.globalRetentionDays) * 24 * 60 * 60 * 1000)

  // Clean up items using global retention
  // We process in two passes:
  // 1. Items for sections WITHOUT per-section override → use global cutoff
  // 2. Items for sections WITH per-section override → use section-specific cutoff

  let totalCleaned = 0

  // Step 1: Clean items whose section has NO per-section override
  const noOverrideSections = Object.keys(settings.perSectionRetentionDays).length === 0
    ? []
    :    Object.keys(MAP_SECTION_LABELS).filter(
        (s) => !(s in settings.perSectionRetentionDays),
      )

  const autoActor: TrashActor = { username: 'system-auto-cleanup', role: 'admin' }
  const now = new Date()
  const db = await getDb()
  const auditCol = db.collection('trash_permanent_deletions')

  // Helper: find expired items, write audit records, then hard-delete
  async function cleanExpiredItems(filter: Record<string, unknown>): Promise<number> {
    const expired = await trashCol.find(filter).toArray()
    if (expired.length === 0) return 0
    for (const item of expired) {
      await auditCol.insertOne({
        itemTitle: item.title,
        section: item.collectionName,
        sectionLabel: item.sectionLabel,
        originalId: item.originalId,
        deletedBy: autoActor,
        deletedAt: item.deletedAt,
        permanentlyDeletedAt: now,
      })
    }
    const result = await trashCol.deleteMany(filter)
    return result.deletedCount
  }

  // If no per-section overrides exist, clean everything with global cutoff
  if (Object.keys(settings.perSectionRetentionDays).length === 0) {
    totalCleaned += await cleanExpiredItems({
      deletedAt: { $lte: globalCutoff },
      permanentlyDeletedAt: null,
      restoredAt: null,
    })
  } else {
    // Clean sections without overrides using global cutoff
    if (noOverrideSections.length > 0) {
      totalCleaned += await cleanExpiredItems({
        collectionName: { $in: noOverrideSections },
        deletedAt: { $lte: globalCutoff },
        permanentlyDeletedAt: null,
        restoredAt: null,
      })
    }

    // Clean sections with per-section overrides using section-specific cutoff
    for (const [sectionName, sectionDays] of Object.entries(settings.perSectionRetentionDays)) {
      const cutoff = new Date(Date.now() - sectionDays * 24 * 60 * 60 * 1000)
      totalCleaned += await cleanExpiredItems({
        collectionName: sectionName,
        deletedAt: { $lte: cutoff },
        permanentlyDeletedAt: null,
        restoredAt: null,
      })
    }
  }

  return totalCleaned
}
