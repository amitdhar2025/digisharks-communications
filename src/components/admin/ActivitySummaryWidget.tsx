/**
 * ActivitySummaryWidget — Shows recent admin activity on both dashboards.
 *
 * Fetches the last 5 activity log entries and renders a compact timeline
 * with event icons, descriptions, user info, and relative timestamps.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  History,
  LogIn,
  LogOut,
  FileEdit,
  Settings,
  Trash2,
  UserPlus,
  UserMinus,
  ShoppingCart,
  Tag,
  FileText,
  Briefcase,
  Edit3,
  PenTool,
  Menu,
  Database,
  RefreshCw,
  Clock,
  ArrowRight,
  Shield,
  Ban,
  Globe2,
  RotateCcw,
  HardDrive,
} from 'lucide-react'

interface ActivityEntry {
  _id: string
  event: string
  description: string
  username: string
  dashboard: 'admin' | 'cms'
  target?: string
  createdAt: string
}

const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  login: { icon: LogIn, color: '#22c55e', label: 'Login' },
  logout: { icon: LogOut, color: '#ef4444', label: 'Logout' },
  page_edit: { icon: FileEdit, color: '#0ea5e9', label: 'Page Edit' },
  password_change: { icon: RefreshCw, color: '#f59e0b', label: 'Password' },
  username_change: { icon: Edit3, color: '#eab308', label: 'Username' },
  settings_update: { icon: Settings, color: '#6366f1', label: 'Settings' },
  menu_create: { icon: Menu, color: '#06b6d4', label: 'Menu' },
  menu_update: { icon: Menu, color: '#06b6d4', label: 'Menu' },
  menu_delete: { icon: Trash2, color: '#ef4444', label: 'Menu' },
  menu_reorder: { icon: RefreshCw, color: '#06b6d4', label: 'Menu' },
  registration_delete: { icon: Trash2, color: '#ef4444', label: 'Registration' },
  form_create: { icon: PenTool, color: '#22c55e', label: 'Form' },
  form_update: { icon: PenTool, color: '#0ea5e9', label: 'Form' },
  form_delete: { icon: Trash2, color: '#ef4444', label: 'Form' },
  subadmin_create: { icon: UserPlus, color: '#22c55e', label: 'Sub-Admin' },
  subadmin_update: { icon: UserMinus, color: '#0ea5e9', label: 'Sub-Admin' },
  subadmin_delete: { icon: Trash2, color: '#ef4444', label: 'Sub-Admin' },
  product_create: { icon: ShoppingCart, color: '#22c55e', label: 'Product' },
  product_update: { icon: ShoppingCart, color: '#0ea5e9', label: 'Product' },
  product_delete: { icon: Trash2, color: '#ef4444', label: 'Product' },
  order_status_change: { icon: RefreshCw, color: '#f59e0b', label: 'Order' },
  order_delete: { icon: Trash2, color: '#ef4444', label: 'Order' },
  coupon_create: { icon: Tag, color: '#22c55e', label: 'Coupon' },
  coupon_update: { icon: Tag, color: '#0ea5e9', label: 'Coupon' },
  coupon_delete: { icon: Trash2, color: '#ef4444', label: 'Coupon' },
  blog_create: { icon: FileText, color: '#22c55e', label: 'Blog' },
  blog_update: { icon: FileText, color: '#0ea5e9', label: 'Blog' },
  blog_delete: { icon: Trash2, color: '#ef4444', label: 'Blog' },
  job_create: { icon: Briefcase, color: '#22c55e', label: 'Job' },
  job_update: { icon: Briefcase, color: '#0ea5e9', label: 'Job' },
  job_delete: { icon: Trash2, color: '#ef4444', label: 'Job' },

  /* ── Trash Operations ── */
  trash_restore: { icon: RotateCcw, color: '#22c55e', label: 'Restore' },
  trash_permanent_delete: { icon: Trash2, color: '#dc2626', label: 'Perm Delete' },
  trash_empty: { icon: Trash2, color: '#ef4444', label: 'Empty Trash' },

  /* ── Security Actions ── */
  security_settings_update: { icon: Shield, color: '#f59e0b', label: 'Security' },
  security_ip_ban: { icon: Ban, color: '#ef4444', label: 'IP Ban' },
  security_ip_unban: { icon: Ban, color: '#22c55e', label: 'IP Unban' },
  security_country_block: { icon: Globe2, color: '#ef4444', label: 'Country Block' },
  security_country_unblock: { icon: Globe2, color: '#22c55e', label: 'Country Unblock' },
  security_domain_block: { icon: Globe2, color: '#ef4444', label: 'Domain Block' },
  security_domain_unblock: { icon: Globe2, color: '#22c55e', label: 'Domain Unblock' },

  /* ── SEO Audit Actions ── */
  seo_audit_delete: { icon: Trash2, color: '#ef4444', label: 'SEO Audit' },
  seo_audit_config_update: { icon: Settings, color: '#6366f1', label: 'SEO Config' },

  /* ── Backup Operations ── */
  backup_start: { icon: HardDrive, color: '#f59e0b', label: 'Backup Start' },
  backup_trigger: { icon: HardDrive, color: '#0ea5e9', label: 'Backup' },
  backup_trigger_failed: { icon: HardDrive, color: '#ef4444', label: 'Backup Failed' },
  backup_complete: { icon: HardDrive, color: '#22c55e', label: 'Backup Done' },
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function SkeletonLine({ width }: { width: number }) {
  return (
    <div
      className="animate-pulse"
      style={{
        height: 14,
        width: `${width}%`,
        background: '#1e293b',
        borderRadius: 4,
      }}
    />
  )
}

interface ActivitySummaryWidgetProps {
  /** Link to the full activity log page */
  debugLink: string
}

export default function ActivitySummaryWidget({
  debugLink,
}: ActivitySummaryWidgetProps) {
  const [items, setItems] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const params = new URLSearchParams({ limit: '5', period: '30d' })
        const res = await fetch(`/api/admin/activity-log?${params}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (!cancelled) setItems(data.items || [])
      } catch {
        if (!cancelled) setError('Could not load activity')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid #1e293b',
          background: '#0b1220',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} style={{ color: '#0ea5e9' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
            Recent Activity
          </span>
          {!loading && items.length > 0 && (
            <span
              style={{
                fontSize: 10,
                color: '#64748b',
                background: '#1e293b',
                padding: '1px 7px',
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {items.length}
            </span>
          )}
        </div>
        <Link
          href={`${debugLink}?tab=activity`}
          style={{
            fontSize: 11,
            color: '#7dd3fc',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
          }}
        >
          View all
          <ArrowRight size={11} />
        </Link>
      </div>

      {/* Content */}
      <div style={{ minHeight: 60 }}>
        {loading ? (
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[60, 85, 45, 70, 90].map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="animate-pulse" style={{ width: 28, height: 28, borderRadius: 8, background: '#1e293b', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <SkeletonLine width={w} />
                  <SkeletonLine width={Math.min(100, w + 15)} />
                </div>
                <SkeletonLine width={30} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '24px 18px', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '30px 18px', textAlign: 'center' }}>
            <History size={28} style={{ color: '#334155', margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: 12, color: '#64748b' }}>
              No recent activity
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              Actions will appear here as admins log in and make changes
            </div>
          </div>
        ) : (
          <div style={{ padding: '4px 0' }}>
            {items.map((item, idx) => {
              const evConfig = EVENT_CONFIG[item.event] || { icon: Activity, color: '#94a3b8', label: item.event }
              const EventIcon = evConfig.icon
              const isLast = idx === items.length - 1

              return (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 18px',
                    borderBottom: isLast ? 'none' : '1px solid rgba(30,41,59,0.5)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Event icon */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${evConfig.color}15`,
                      color: evConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <EventIcon size={13} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#e2e8f0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={item.description}
                    >
                      {item.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 500 }}>{item.username}</span>
                      {item.dashboard && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '0 5px',
                            borderRadius: 3,
                            background: item.dashboard === 'admin' ? 'rgba(234,179,8,0.12)' : 'rgba(139,92,246,0.12)',
                            color: item.dashboard === 'admin' ? '#eab308' : '#a78bfa',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.dashboard === 'admin' ? 'Admin' : 'CMS'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div
                    style={{
                      fontSize: 10,
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      marginTop: 1,
                    }}
                    title={new Date(item.createdAt).toLocaleString()}
                  >
                    <Clock size={10} />
                    {getRelativeTime(item.createdAt)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
