import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'
import CareerJob from '@/lib/models/CareerJob'

export const dynamic = 'force-dynamic'

// GET /api/admin/career/applications - List all applications
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
    const status = searchParams.get('status')
    const jobId = searchParams.get('jobId')
    const search = searchParams.get('search')

    const query: any = {}
    if (status && status !== 'all') query.status = status
    if (jobId && jobId !== 'all') query.jobId = jobId
    if (search) {
      query.$or = [
        { applicantName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const [applications, total] = await Promise.all([
      CareerApplication.find(query)
        .populate('jobId', 'title slug category location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CareerApplication.countDocuments(query),
    ])

    const serialized = applications.map((a) => ({
      ...a,
      _id: String(a._id),
      jobId: a.jobId ? {
        _id: String((a.jobId as any)._id),
        title: (a.jobId as any).title,
        slug: (a.jobId as any).slug,
        category: (a.jobId as any).category,
        location: (a.jobId as any).location,
      } : null,
      createdAt: a.createdAt?.toISOString?.() ?? String(a.createdAt),
      updatedAt: a.updatedAt?.toISOString?.() ?? String(a.updatedAt),
      statusUpdatedAt: a.statusUpdatedAt?.toISOString?.() ?? null,
    }))

    // Get stats
    const stats = await CareerApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const statsMap: Record<string, number> = { total }
    stats.forEach((s: any) => { statsMap[s._id] = s.count })

    // Get all jobs for filter dropdown
    const jobs = await CareerJob.find({}).select('title slug category location status').sort({ createdAt: -1 }).lean()
    const jobList = jobs.map((j) => ({
      _id: String(j._id),
      title: j.title,
      slug: j.slug,
      category: j.category,
      status: j.status,
    }))

    return NextResponse.json({
      applications: serialized,
      total,
      pages: Math.ceil(total / limit),
      page,
      stats: statsMap,
      jobs: jobList,
    })
  } catch (err) {
    console.error('GET /api/admin/career/applications error', err)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
