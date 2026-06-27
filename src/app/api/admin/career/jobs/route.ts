import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import CareerJob from '@/lib/models/CareerJob'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'

// GET /api/admin/career/jobs - List all jobs
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const query: any = {}
    if (status && status !== 'all') query.status = status
    if (category && category !== 'all') query.category = category
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const [jobs, total] = await Promise.all([
      CareerJob.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CareerJob.countDocuments(query),
    ])

    const { default: CareerApplication } = await import('@/lib/models/CareerApplication')
    const applicationCounts = await CareerApplication.aggregate([
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ])
    const countMap = new Map(applicationCounts.map((a: any) => [String(a._id), a.count]))

    const serialized = jobs.map((j) => ({
      ...j,
      _id: String(j._id),
      applicationCount: countMap.get(String(j._id)) || 0,
      createdAt: j.createdAt?.toISOString?.() ?? String(j.createdAt),
      updatedAt: j.updatedAt?.toISOString?.() ?? String(j.updatedAt),
    }))

    return NextResponse.json({ jobs: serialized, total, pages: Math.ceil(total / limit), page })
  } catch (err) {
    console.error('GET /api/admin/career/jobs error', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// POST /api/admin/career/jobs - Create a new job
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const body = await req.json()

    if (!body.title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    let slug = body.slug
      ? slugify(body.slug, { lower: true, strict: true })
      : slugify(body.title, { lower: true, strict: true })

    // Ensure unique slug
    const existing = await CareerJob.findOne({ slug })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const job = new CareerJob({
      title: body.title,
      slug,
      category: body.category || 'full-time',
      department: body.department || '',
      numberOfPositions: parseInt(body.numberOfPositions, 10) || 1,
      salaryPackage: body.salaryPackage || 'Negotiable',
      experienceRequired: body.experienceRequired || 'Fresher',
      workProfile: body.workProfile || '',
      jobDescription: body.jobDescription || '',
      location: body.location || '',
      status: body.status || 'active',
      isActive: body.isActive !== undefined ? body.isActive : true,
    })

    await job.save()

    return NextResponse.json({
      job: {
        ...job.toObject(),
        _id: String(job._id),
        applicationCount: 0,
        createdAt: job.createdAt?.toISOString?.() ?? String(job.createdAt),
        updatedAt: job.updatedAt?.toISOString?.() ?? String(job.updatedAt),
      },
    }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/admin/career/jobs error', err)
    return NextResponse.json({ error: err.message || 'Failed to create job' }, { status: 500 })
  }
}
