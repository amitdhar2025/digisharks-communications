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
