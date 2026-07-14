'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

/* ── Types ────────────────────────────────────────────── */

interface SummaryStats {
  totalRevenue: number
  totalOrders: number
  totalItemsSold: number
  avgOrderValue: number
}

interface RevenuePeriod {
  label: string
  revenue: number
  orders: number
  itemsSold: number
}

interface BestSeller {
  slug: string
  title: string
  totalQty: number
  totalRevenue: number
  orderCount: number
}

interface StatusCount {
  status: string
  count: number
}

interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

interface ReportsData {
  summary: SummaryStats
  revenueByPeriod: RevenuePeriod[]
  bestSellers: BestSeller[]
  statusBreakdown: StatusCount[]
  dailyRevenue: DailyRevenue[]
}

/* ── Helpers ──────────────────────────────────────────── */

function fmtINR(n: number) {
  if (n >= 1_00_00_000) return '₹' + (n / 1_00_00_000).toFixed(1) + ' Cr'
  if (n >= 1_00_000) return '₹' + (n / 1_00_000).toFixed(1) + ' L'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

const STATUS_LABELS: Record<string, string> = {
  pending: '📋 Pending',
  processing: '⚙ Processing',
  shipped: '🚚 Shipped',
  delivered: '✅ Delivered',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
}

/* ── CSV Download Helpers ─────────────────────────────── */

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportFullReport(data: ReportsData, periodLabel: string) {
  // Sheet 1: Summary
  downloadCSV(
    `reports_summary_${periodLabel}.csv`,
    ['Metric', 'Value'],
    [
      ['Total Revenue', `₹${data.summary.totalRevenue}`],
      ['Total Orders', String(data.summary.totalOrders)],
      ['Total Items Sold', String(data.summary.totalItemsSold)],
      ['Avg Order Value', `₹${data.summary.avgOrderValue}`],
    ],
  )
}

function exportRevenueCSV(data: ReportsData, periodLabel: string) {
  downloadCSV(
    `revenue_by_period_${periodLabel}.csv`,
    ['Period', 'Revenue', 'Orders', 'Items Sold'],
    data.revenueByPeriod.map((r) => [r.label, String(r.revenue), String(r.orders), String(r.itemsSold)]),
  )
}

function exportDailyRevenueCSV(data: ReportsData) {
  downloadCSV(
    'daily_revenue.csv',
    ['Date', 'Revenue', 'Orders'],
    data.dailyRevenue.map((r) => [r.date, String(r.revenue), String(r.orders)]),
  )
}

function exportBestSellersCSV(data: ReportsData) {
  downloadCSV(
    'best_sellers.csv',
    ['Product', 'Qty Sold', 'Revenue', 'Orders'],
    data.bestSellers.map((r) => [r.title, String(r.totalQty), String(r.totalRevenue), String(r.orderCount)]),
  )
}

function exportStatusBreakdownCSV(data: ReportsData) {
  downloadCSV(
    'order_status_breakdown.csv',
    ['Status', 'Count'],
    data.statusBreakdown.map((r) => [STATUS_LABELS[r.status] || r.status, String(r.count)]),
  )
}

/* ── Custom Tooltip ───────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name}: {entry.name === 'Revenue' ? fmtINR(entry.value) : entry.value}
        </div>
      ))}
    </div>
  )
}

/* ── Component ────────────────────────────────────────── */

export default function ReportsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReportsData | null>(null)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reports/stats?period=${period}&months=12`, {
        credentials: 'include',
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to load reports')
      setData(d)
    } catch (e: any) {
      setError(e?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [period, router])

  useEffect(() => {
    load()
  }, [load])

  // Prepare data for the daily revenue chart
  const dailyChartData = data?.dailyRevenue.map((r) => ({
    date: r.date.slice(5), // Show MM-DD
    Revenue: r.revenue,
    Orders: r.orders,
  })) || []

  // Prepare data for the period revenue chart
  const periodChartData = data?.revenueByPeriod.map((r) => ({
    period: r.label,
    Revenue: r.revenue,
    Orders: r.orders,
  })) || []

  // Prepare status breakdown data
  const totalStatus = data?.statusBreakdown.reduce((a, b) => a + b.count, 0) || 0
  const statusChartData = data?.statusBreakdown.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    count: s.count,
    fill: STATUS_COLORS[s.status] || '#64748b',
  })) || []

  return (
    <div className="admin-layout">
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <AdminSidebar isOpen={sidebarOpen} onNavClick={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* ── PAGE HEADER ── */}
        <div className="admin-topbar">
          <div>
            <h1>📈 Sales Reports</h1>
            <div className="sub">
              Revenue breakdown, best-selling products, and order analytics
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['daily', 'weekly', 'monthly', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`btn ${period === p ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPeriod(p)}
                style={{ textTransform: 'capitalize' }}
              >
                {p === 'all' ? 'All Time' : p}
              </button>
            ))}
            {data && (
              <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const label = period === 'all' ? 'alltime' : period
                    exportFullReport(data, label)
                    setTimeout(() => exportRevenueCSV(data, label), 200)
                    setTimeout(() => exportDailyRevenueCSV(data), 400)
                    setTimeout(() => exportBestSellersCSV(data), 600)
                    setTimeout(() => exportStatusBreakdownCSV(data), 800)
                  }}
                >
                  ⬇ Download All CSVs
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="empty">
            <div className="icon">⏳</div>
            <p>Loading reports…</p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* ── SUMMARY CARDS ── */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card total" style={{ borderTop: '3px solid #0ea5e9' }}>
                <div className="label">Total Revenue</div>
                <div className="value" style={{ color: '#7dd3fc' }}>{fmtINR(data.summary.totalRevenue)}</div>
              </div>
              <div className="stat-card total" style={{ borderTop: '3px solid #22c55e' }}>
                <div className="label">Total Orders</div>
                <div className="value" style={{ color: '#4ade80' }}>{data.summary.totalOrders}</div>
              </div>
              <div className="stat-card total" style={{ borderTop: '3px solid #a78bfa' }}>
                <div className="label">Items Sold</div>
                <div className="value" style={{ color: '#a78bfa' }}>{data.summary.totalItemsSold}</div>
              </div>
              <div className="stat-card total" style={{ borderTop: '3px solid #f59e0b' }}>
                <div className="label">Avg Order Value</div>
                <div className="value" style={{ color: '#fbbf24' }}>{fmtINR(data.summary.avgOrderValue)}</div>
              </div>
            </div>

            {/* ── REVENUE CHART (Period) ── */}
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>
                Revenue by {period === 'all' ? 'Month' : period.charAt(0).toUpperCase() + period.slice(1)}
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>
                Last 12 months of paid orders
              </p>

              {periodChartData.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13 }}>No revenue data for this period.</p>
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="period"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        tickFormatter={(val) => val >= 100000 ? '₹' + (val / 100000).toFixed(1) + 'L' : fmtINR(val)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                      />
                      <Bar
                        dataKey="Revenue"
                        fill="url(#revenueGradient)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* ── DAILY REVENUE CHART ── */}
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                padding: '20px',
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>
                Daily Revenue (Last 60 Days)
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>
                Revenue per day from paid orders
              </p>

              {dailyChartData.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13 }}>No daily revenue data yet.</p>
              ) : (
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 9 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        interval={Math.max(1, Math.floor(dailyChartData.length / 15))}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        tickFormatter={(val) => val >= 100000 ? '₹' + (val / 100000).toFixed(1) + 'L' : fmtINR(val)}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar
                        dataKey="Revenue"
                        fill="#22c55e"
                        radius={[2, 2, 0, 0]}
                        maxBarSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* ── TWO-COLUMN GRID: Best Sellers + Status Breakdown ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* BEST-SELLING PRODUCTS */}
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px' }}>
                  🏆 Best-Selling Products
                </h2>
                {data.bestSellers.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No sales data yet.</p>
                ) : (
                  <div className="table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
                    <table className="queries" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th style={{ textAlign: 'right' }}>Qty Sold</th>
                          <th style={{ textAlign: 'right' }}>Revenue</th>
                          <th style={{ textAlign: 'right' }}>Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.bestSellers.map((p, i) => (
                          <tr key={p.slug}>
                            <td style={{ color: '#64748b', fontWeight: 600 }}>{i + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 12 }}>
                                {p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#4ade80' }}>
                              {p.totalQty}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#7dd3fc' }}>
                              {fmtINR(p.totalRevenue)}
                            </td>
                            <td style={{ textAlign: 'right', color: '#94a3b8' }}>
                              {p.orderCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* STATUS BREAKDOWN */}
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                  padding: '20px',
                }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px' }}>
                  📊 Orders by Status
                </h2>
                {data.statusBreakdown.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No orders yet.</p>
                ) : (
                  <>
                    {/* Horizontal bar chart for status breakdown */}
                    <div style={{ width: '100%', height: 200, marginBottom: 16 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statusChartData}
                          layout="vertical"
                          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis
                            type="number"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={{ stroke: '#334155' }}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={100}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null
                              const d = payload[0].payload
                              const pct = totalStatus > 0 ? ((d.count / totalStatus) * 100).toFixed(1) : '0'
                              return (
                                <div style={{
                                  background: '#0f172a',
                                  border: '1px solid #334155',
                                  borderRadius: 10,
                                  padding: '8px 12px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                  fontSize: 12,
                                }}>
                                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{d.name}</div>
                                  <div style={{ color: d.fill }}>{d.count} orders ({pct}%)</div>
                                </div>
                              )
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detailed breakdown list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {data.statusBreakdown.map((s) => {
                        const pct = totalStatus > 0 ? (s.count / totalStatus) * 100 : 0
                        return (
                          <div key={s.status}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13,
                                marginBottom: 4,
                              }}
                            >
                              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                                {STATUS_LABELS[s.status] || s.status}
                              </span>
                              <span style={{ color: '#94a3b8' }}>
                                {s.count} ({Math.round(pct)}%)
                              </span>
                            </div>
                            <div
                              style={{
                                height: 8,
                                background: '#1e293b',
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: STATUS_COLORS[s.status] || '#64748b',
                                  borderRadius: 999,
                                  transition: 'width 0.4s ease',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
