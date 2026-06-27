import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'

export const dynamic = 'force-dynamic'

// GET /api/admin/blog/publish-scheduled
// Checks for scheduled posts that are past their publish time and publishes them.
// This should be called periodically (e.g., every minute) via a cron job or setInterval.
export async function GET() {
  try {
    await connectMongoose()

    const now = new Date()
    
    // Find all scheduled posts whose scheduledAt time has passed
    const scheduledPosts = await BlogPost.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    }).lean()

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        published: 0,
        message: 'No scheduled posts to publish.',
      })
    }

    // Publish all expired scheduled posts
    const ids = scheduledPosts.map((p) => p._id)
    await BlogPost.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: 'published',
          isActive: true,
          publishedAt: now,
          scheduledAt: null,
        },
      }
    )

    return NextResponse.json({
      published: scheduledPosts.length,
      message: `${scheduledPosts.length} scheduled post(s) published.`,
      posts: scheduledPosts.map((p) => ({
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        scheduledAt: p.scheduledAt,
      })),
    })
  } catch (err) {
    console.error('GET /api/admin/blog/publish-scheduled error', err)
    return NextResponse.json({ error: 'Failed to publish scheduled posts' }, { status: 500 })
  }
}
