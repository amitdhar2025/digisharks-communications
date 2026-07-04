import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { connectMongoose } from '@/lib/mongoose'
import BlogPost from '@/lib/models/BlogPost'
import CareerApplication from '@/lib/models/CareerApplication'
import CareerJob from '@/lib/models/CareerJob'
import Category from '@/lib/models/Category'
import Tag from '@/lib/models/Tag'
import RssFeed from '@/lib/models/RssFeed'
import ChatbotQA from '@/lib/models/ChatbotQA'
import SeoAudit from '@/lib/models/SeoAudit'
import SitemapSettings from '@/lib/models/SitemapSettings'
import RobotsSettings from '@/lib/models/RobotsSettings'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // ── Native MongoDB collections ──
    const queries = await db.collection('queries').countDocuments()

    const totalOrders = await db.collection('orders').countDocuments()

    const revenuePipeline = await db
      .collection('orders')
      .aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
      .toArray()
    const totalRevenue = revenuePipeline[0]?.total ?? 0

    const attacksToday = await db
      .collection('security_attacks')
      .countDocuments({ createdAt: { $gte: todayStart } })

    const totalBlockedEver = await db
      .collection('security_attacks')
      .countDocuments()

    const subAdmins = await db.collection('sub_admins').countDocuments()

    const totalLoginLogs = await db.collection('login_logs').countDocuments()

    const failedLoginsToday = await db
      .collection('login_logs')
      .countDocuments({ loginTime: { $gte: todayStart }, blockedIp: true })

    // ── Mongoose models ──
    await connectMongoose()

    const totalBlogPublished = await BlogPost.countDocuments({
      status: { $in: ['published', 'active', 'featured'] },
    })

    const totalBlogDraft = await BlogPost.countDocuments({ status: 'draft' })

    const totalCategories = await Category.countDocuments()

    const totalTags = await Tag.countDocuments()

    const totalRssFeeds = await RssFeed.countDocuments()

    const totalActiveJobs = await CareerJob.countDocuments({
      isActive: true,
      status: 'active',
    })

    const totalApplications = await CareerApplication.countDocuments()

    const totalChatbotQna = await ChatbotQA.countDocuments()

    const totalSeoAudits = await SeoAudit.countDocuments()

    // Sitemap URLs from settings
    const sitemapDoc = await SitemapSettings.findOne().lean()
    const totalSitemapUrls = sitemapDoc?.totalUrls ?? 0

    // Robots rules count from settings
    const robotsDoc = await RobotsSettings.findOne().lean()
    const totalRobotsRules = robotsDoc?.rules?.length ?? 0

    // Banned IPs from security settings
    const securitySettings = await db.collection('security_settings').findOne()
    const totalBannedIPs = securitySettings?.bannedIps?.length ?? 0
    const totalBlockedDomains = securitySettings?.blockedEmailDomains?.length ?? 0

    // Chatbot conversations — no dedicated collection, count is 0
    const totalChatbotConversations = 0

    return NextResponse.json({
      queries,
      orders: totalOrders,
      revenue: totalRevenue,
      blogPublished: totalBlogPublished,
      blogDraft: totalBlogDraft,
      categories: totalCategories,
      tags: totalTags,
      rssFeeds: totalRssFeeds,
      activeJobs: totalActiveJobs,
      applications: totalApplications,
      chatbotQna: totalChatbotQna,
      chatbotConversations: totalChatbotConversations,
      seoAudits: totalSeoAudits,
      sitemapUrls: totalSitemapUrls,
      robotsRules: totalRobotsRules,
      attacksToday,
      totalBlockedEver,
      bannedIPs: totalBannedIPs,
      blockedDomains: totalBlockedDomains,
      subAdmins,
      loginLogs: totalLoginLogs,
      failedLoginsToday,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load stats'
    console.error('GET dashboard stats error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
