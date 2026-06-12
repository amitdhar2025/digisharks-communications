export type Comment = {
  _id?: string
  text: string
  author: string
  createdAt: string
}

export type QueryItem = {
  id: string
  fullName: string
  email: string
  phone?: string
  service: string
  message: string
  status: 'pending' | 'completed' | 'follow-up'
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export type Status = 'pending' | 'completed' | 'follow-up'

export const STATUS_OPTIONS: Status[] = ['pending', 'completed', 'follow-up']

export const SERVICE_OPTIONS = [
  'Digital PR',
  'SEO Services',
  'Social Media Marketing',
  'PPC Advertising',
  'Web Development',
  'Political Campaign',
  'Other',
]

export function fmtDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusClass(s: Status) {
  if (s === 'completed') return 'status-completed'
  if (s === 'follow-up') return 'status-follow-up'
  return 'status-pending'
}

export function statusLabel(s: Status) {
  if (s === 'follow-up') return 'Follow-up'
  if (s === 'completed') return 'Completed'
  return 'Pending'
}
