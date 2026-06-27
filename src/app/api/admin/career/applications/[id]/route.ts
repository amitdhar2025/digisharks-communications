import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { connectMongoose } from '@/lib/mongoose'
import CareerApplication from '@/lib/models/CareerApplication'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/career/applications/[id] - Delete an application
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectMongoose()
    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 })
    }

    const application = await CareerApplication.findById(id).lean()
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await CareerApplication.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: `Application of "${application.applicantName}" deleted successfully.`,
    })
  } catch (err: any) {
    console.error('DELETE /api/admin/career/applications/[id] error', err)
    return NextResponse.json({ error: err.message || 'Failed to delete application' }, { status: 500 })
  }
}
