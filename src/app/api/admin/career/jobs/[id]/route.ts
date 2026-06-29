import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies, isSuperAdmin, getSubAdminPermissions } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { connectMongoose } from '@/lib/mongoose'
import CareerJob from '@/lib/models/CareerJob'
import mongoose from 'mongoose'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'

// GET /api/admin/career/jobs/[id] - Get single job
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check view permission for sub-admins
  if (!isSuperAdmin(admin) && admin.subAdminId) {
    const subPerms = await getSubAdminPermissions(admin.subAdminId)
    const denied = await requirePermission(admin, 'career', 'view', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const job = await CareerJob.findById(id).lean()
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      job: {
        ...job,
        _id: String(job._id),
        createdAt: job.createdAt?.toISOString?.() ?? String(job.createdAt),
        updatedAt: job.updatedAt?.toISOString?.() ?? String(job.updatedAt),
      },
    })
  } catch (err) {
    console.error('GET /api/admin/career/jobs/[id] error', err)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

// PUT /api/admin/career/jobs/[id] - Update a job
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check edit permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'career', 'edit', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const body = await req.json()
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) {
      updateData.slug = slugify(body.slug, { lower: true, strict: true })
    }
    if (body.category !== undefined) updateData.category = body.category
    if (body.department !== undefined) updateData.department = body.department
    if (body.numberOfPositions !== undefined) updateData.numberOfPositions = parseInt(body.numberOfPositions, 10) || 1
    if (body.salaryPackage !== undefined) updateData.salaryPackage = body.salaryPackage
    if (body.experienceRequired !== undefined) updateData.experienceRequired = body.experienceRequired
    if (body.workProfile !== undefined) updateData.workProfile = body.workProfile
    if (body.jobDescription !== undefined) updateData.jobDescription = body.jobDescription
    if (body.location !== undefined) updateData.location = body.location
    if (body.status !== undefined) updateData.status = body.status
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const job = await CareerJob.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      job: {
        ...job,
        _id: String(job._id),
        createdAt: job.createdAt?.toISOString?.() ?? String(job.createdAt),
        updatedAt: job.updatedAt?.toISOString?.() ?? String(job.updatedAt),
      },
    })
  } catch (err: any) {
    console.error('PUT /api/admin/career/jobs/[id] error', err)
    return NextResponse.json({ error: err.message || 'Failed to update job' }, { status: 500 })
  }
}

// DELETE /api/admin/career/jobs/[id] - Delete a job
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check delete permission for sub-admins
  if (!isSuperAdmin(admin)) {
    const subPerms = admin.subAdminId ? await getSubAdminPermissions(admin.subAdminId) : null
    const denied = await requirePermission(admin, 'career', 'delete', subPerms)
    if (denied) return denied
  }

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    const job = await CareerJob.findByIdAndDelete(id).lean()
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Also delete all applications for this job
    const { default: CareerApplication } = await import('@/lib/models/CareerApplication')
    await CareerApplication.deleteMany({ jobId: id })

    return NextResponse.json({ success: true, deletedApplications: true })
  } catch (err) {
    console.error('DELETE /api/admin/career/jobs/[id] error', err)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
