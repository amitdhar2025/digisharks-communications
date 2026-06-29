import { ObjectId } from 'mongodb'
import clientPromise from './mongodb'

export interface QueryComment {
  _id?: ObjectId
  text: string
  author: string
  createdAt: Date
}

export interface ContactQuery {
  _id?: ObjectId
  fullName: string
  email: string
  phone?: string
  service: string
  message: string
  status: 'pending' | 'completed' | 'follow-up'
  comments: QueryComment[]
  createdAt: Date
  updatedAt: Date
}

export interface AdminUser {
  _id?: ObjectId
  username: string
  passwordHash: string
  createdAt: Date
}

export interface SubAdminPermissions {
  blog: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  store: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  career: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  chatbot: { view: boolean; manage: boolean; settings: boolean }
  seoAudit: { view: boolean; delete: boolean }
  rss: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  queries: { view: boolean; edit: boolean; delete: boolean; export: boolean }
}

export interface SubAdmin {
  _id?: ObjectId
  username: string
  passwordHash: string
  isActive: boolean
  createdBy: string
  permissions: SubAdminPermissions
  /**
   * List of contact-query "service" values (e.g. "SEO", "Web Development",
   * "Social Media") this sub-admin is allowed to see. Empty array = no access.
   * Only honoured when permissions.queries.view is true.
   */
  queryCategories: string[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

/**
 * Login log entry — tracks every admin/sub-admin sign-in with geolocation.
 */
export interface LoginLog {
  _id?: ObjectId
  username: string
  role: 'admin' | 'sub-admin'
  ip: string
  country: string
  region: string     // state / province
  city: string
  isp: string
  userAgent: string
  loginTime: Date
  logoutTime?: Date
  blockedIp: boolean
  blockedUser: boolean
  blockedAt?: Date
  blockedBy?: string
  createdAt: Date
}

export async function getDb() {
  const client = await clientPromise
  return client.db('digisharks')
}

export async function getQueriesCollection() {
  const db = await getDb()
  return db.collection<ContactQuery>('queries')
}

export async function getAdminsCollection() {
  const db = await getDb()
  return db.collection<AdminUser>('admins')
}

export async function getSubAdminsCollection() {
  const db = await getDb()
  return db.collection<SubAdmin>('sub_admins')
}

export async function getLoginLogsCollection() {
  const db = await getDb()
  return db.collection<LoginLog>('login_logs')
}
