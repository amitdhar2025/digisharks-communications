import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import CareerJob from '@/lib/models/CareerJob'

export const dynamic = 'force-dynamic'

// GET /api/career/jobs - List active jobs for public
export async function GET(req: NextRequest) {
  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const query: any = { status: 'active', isActive: true }
    if (category && category !== 'all') query.category = category

    const jobs = await CareerJob.find(query)
      .select('title slug category department numberOfPositions salaryPackage experienceRequired workProfile jobDescription location')
      .sort({ createdAt: -1 })
      .lean()

    const serialized = jobs.map((j) => ({
      ...j,
      _id: String(j._id),
      createdAt: j.createdAt?.toISOString?.() ?? String(j.createdAt),
    }))

    // Get distinct categories for filter
    const categories = await CareerJob.distinct('category', { status: 'active', isActive: true })

    return NextResponse.json({ jobs: serialized, categories })
  } catch (err) {
    console.error('GET /api/career/jobs error', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
