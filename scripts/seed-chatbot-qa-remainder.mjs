/**
 * Final few entries to push the total over 1000.
 * Run LAST after all other seed scripts.
 * Usage: node scripts/seed-chatbot-qa-remainder.mjs
 */

const FAQ_ENTRIES = [
  // More web-development
  { question: 'What is a wireframe in web design?', answer: 'A wireframe is a visual guide that represents the skeletal framework of a website page. It shows the layout, content placement, and functionality without design elements like colors and fonts.', category: 'web-development' },
  { question: 'What is a mockup vs wireframe?', answer: 'A wireframe is a low-fidelity structural layout (like a blueprint). A mockup is a high-fidelity design that includes colors, typography, images, and styling (like a rendered preview).', category: 'web-development' },
  { question: 'What is a prototype in web development?', answer: 'A prototype is an interactive model of a website that allows users to click through pages and test functionality. It helps validate the user experience before development begins.', category: 'web-development' },
  { question: 'What is user flow?', answer: 'User flow is the path a visitor takes through your website to complete a task — like making a purchase or filling a form. We design intuitive flows that minimize friction and maximize conversions.', category: 'web-development' },
  { question: 'What is information architecture?', answer: 'Information Architecture (IA) organizes and structures content on your website so users can find information easily. It includes navigation design, categorization, and labeling systems.', category: 'web-development' },
  { question: 'What is responsive vs adaptive design?', answer: 'Responsive design uses flexible layouts that fluidly adapt to any screen size. Adaptive design uses fixed layouts for specific screen sizes. Responsive is more common and SEO-friendly.', category: 'web-development' },
  { question: 'What is mobile-first design?', answer: 'Mobile-first design starts with designing for the smallest screen first, then progressively enhances for larger screens. It ensures optimal mobile experience since most traffic comes from phones.', category: 'web-development' },
  { question: 'What is a style guide in web development?', answer: 'A style guide documents design standards — colors, typography, spacing, button styles, form elements, and component patterns. It ensures visual consistency across the website.', category: 'web-development' },
  { question: 'What is version control?', answer: 'Version control tracks changes to code over time, allowing developers to collaborate, revert to previous versions, and maintain a history of all changes. Git is the most popular system.', category: 'web-development' },

  // More general
  { question: 'How do I know if my website needs a redesign?', answer: 'Signs include: outdated design, high bounce rate, poor mobile experience, slow loading, low conversions, difficulty updating content, declining traffic, or your competitors have better sites.', category: 'general' },
  { question: 'What is the lifespan of a website?', answer: 'A well-built website typically lasts 2-5 years before needing a redesign. Technology, design trends, and business needs evolve, making regular updates or redesigns necessary.', category: 'general' },
  { question: 'How often should I update my website content?', answer: 'We recommend updating your website content at least monthly. Blog posts should be published weekly for best SEO results. Outdated content hurts credibility and search rankings.', category: 'general' },
  { question: 'Can I update my website myself?', answer: 'Yes, if your site is built on a CMS like WordPress, we provide training so you can make basic updates. For complex changes, we offer maintenance services.', category: 'general' },
  { question: 'Do you provide website analytics reports?', answer: 'Yes, we provide comprehensive analytics reports covering traffic, user behavior, conversion rates, popular content, traffic sources, and actionable recommendations.', category: 'general' },

  // More about
  { question: 'How has DigiSharks evolved over the years?', answer: 'From a small New Delhi startup in 2017, we\'ve grown to a 25+ member team serving 4000+ clients across India. We\'ve expanded from basic digital marketing to AI-powered PR, political campaigns, and enterprise solutions.', category: 'about' },
  { question: 'What are your future plans?', answer: 'We\'re expanding into AI-powered marketing, video PR, influencer-led campaigns, and expanding our presence in international markets. Our goal is to become India\'s #1 digital PR partner.', category: 'about' },
  { question: 'How do you ensure client success?', answer: 'We ensure success through thorough discovery, data-driven strategies, dedicated account management, transparent reporting, continuous optimization, and a genuine commitment to our clients\' growth.', category: 'about' },
  { question: 'What is your client onboarding process?', answer: 'Our onboarding includes a kickoff meeting, in-depth discovery session, strategy development, proposal presentation, team assignment, setup and integration, and a smooth transition to ongoing execution.', category: 'about' },
  { question: 'Can you handle large enterprise clients?', answer: 'Yes, we have experience working with large enterprises across multiple industries. Our team, processes, and technology infrastructure scale to meet enterprise-level requirements.', category: 'about' },

  // More social-media
  { question: 'What is a social media content pillar?', answer: 'Content pillars are the main topics/themes your brand consistently posts about. Example pillars for an agency: Industry Insights, Client Success Stories, Behind-the-Scenes, Tips & How-Tos, and Company Culture.', category: 'social-media' },
  { question: 'How do you create a content calendar?', answer: 'We create content calendars by planning posts around content pillars, seasonal events, product launches, industry trends, and business goals. Each post includes platform, content type, caption, visuals, and publish date.', category: 'social-media' },
  { question: 'What is user-generated content?', answer: 'User-generated content (UGC) is any content created by your customers — reviews, photos, videos, testimonials, social media posts. UGC is authentic, trusted, and highly effective for marketing.', category: 'social-media' },
  { question: 'How do you encourage UGC?', answer: 'Encourage UGC through branded hashtags, contests and giveaways, customer spotlight features, review requests, and creating shareable experiences customers want to post about.', category: 'social-media' },
  { question: 'What is a social media takeover?', answer: 'A social media takeover is when an influencer, employee, or customer temporarily manages your brand\'s social media account. It brings fresh content and exposes your brand to new audiences.', category: 'social-media' },
  { question: 'What is an Instagram Reel?', answer: 'Instagram Reels are short, engaging vertical videos (up to 90 seconds) that can include music, effects, and text overlays. Reels have the highest organic reach on Instagram currently.', category: 'social-media' },
  { question: 'What are Instagram Stories?', answer: 'Instagram Stories are temporary posts that disappear after 24 hours. They appear at the top of the feed and can include photos, videos, polls, questions, and interactive stickers.', category: 'social-media' },
  { question: 'What are LinkedIn Stories?', answer: 'LinkedIn Stories were short, temporary video updates that LinkedIn has since discontinued. LinkedIn now focuses on other content formats like newsletters, live events, and document posts.', category: 'social-media' },
  { question: 'What is Facebook Live?', answer: 'Facebook Live allows you to broadcast live video to your followers in real-time. It generates high engagement through notifications, comments, and reactions during the broadcast.', category: 'social-media' },
  { question: 'What is LinkedIn Live?', answer: 'LinkedIn Live is a live video streaming feature for LinkedIn. It\'s available for creators and organizations to broadcast real-time content to their network.', category: 'social-media' },
  { question: 'What is Twitter Spaces?', answer: 'Twitter Spaces are live audio conversations on Twitter where users can host or join discussions. They\'re similar to Clubhouse and are good for real-time engagement.', category: 'social-media' },

  // More seo-ppc
  { question: 'What is Google Local Services Ads?', answer: 'Local Services Ads appear at the very top of Google search results for local service providers (plumbers, lawyers, cleaners). They charge per lead rather than per click.', category: 'seo-ppc' },
  { question: 'What is Google Screened?', answer: 'Google Screened is a verification program for Local Services Ads where Google performs background checks on service providers, adding trust and credibility.', category: 'seo-ppc' },
  { question: 'What is Google Guaranteed?', answer: 'Google Guaranteed is a badge for Local Services Ads where Google backs the work with a money-back guarantee, giving customers confidence to hire.', category: 'seo-ppc' },
  { question: 'What is a negative keyword?', answer: 'Negative keywords prevent your ads from showing for irrelevant searches. For example, adding "free" as a negative keyword prevents your ad from showing to people seeking free services.', category: 'seo-ppc' },
  { question: 'What is ad rank?', answer: 'Ad Rank determines your ad position in Google search results. It\'s calculated based on your bid amount, Quality Score, ad relevance, expected CTR, and ad extensions impact.', category: 'seo-ppc' },
  { question: 'What is Quality Score?', answer: 'Quality Score is Google\'s rating of your keywords and ads quality (1-10). Higher scores lead to better ad positions at lower costs. It considers CTR, ad relevance, and landing page experience.', category: 'seo-ppc' },
  { question: 'How do you improve Quality Score?', answer: 'Improve Quality Score by organizing keywords into tightly themed ad groups, writing relevant ad copy, optimizing landing pages, and achieving high click-through rates.', category: 'seo-ppc' },
  { question: 'What is a responsive search ad?', answer: 'Responsive Search Ads (RSAs) automatically test different combinations of headlines and descriptions to find the best performing ad. Google creates up to 50,000 possible ad combinations.', category: 'seo-ppc' },

  // More digital-pr
  { question: 'What is a press release format?', answer: 'Standard format includes: FOR IMMEDIATE RELEASE (or embargo date), headline, dateline (city, date), lead paragraph (who, what, when, where, why), body, quote, boilerplate, media contact info, and ### marks the end.', category: 'digital-pr' },
  { question: 'What is a press release template?', answer: 'A press release template provides a reusable structure with placeholders for your content. We provide branded templates that journalists can quickly recognize and use.', category: 'digital-pr' },
  { question: 'How do I distribute a press release on a budget?', answer: 'For budget-conscious PR, we recommend targeted direct pitching to relevant journalists, using free distribution platforms, and leveraging social media to amplify your news.', category: 'digital-pr' },
  { question: 'What is a media advisory?', answer: 'A media advisory (or media alert) is a brief invitation sent to journalists about an upcoming event. It\'s shorter than a press release and focuses on logistics — date, time, location, and interview opportunities.', category: 'digital-pr' },
  { question: 'What is a press kit?', answer: 'A press kit (media kit) contains everything a journalist needs to cover your brand: company background, fact sheet, executive bios, high-res images, logos, recent press releases, and media contact information.', category: 'digital-pr' },
]

async function seedQA() {
  let mongoose
  try {
    mongoose = (await import('mongoose')).default
  } catch {
    const path = await import('path')
    const module = await import(path.resolve('node_modules/mongoose'))
    mongoose = module.default
  }

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set.')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const qaSchema = new mongoose.Schema({
      question: { type: String, required: true, trim: true },
      answer: { type: String, required: true, trim: true },
      category: { type: String, default: '', trim: true },
      isActive: { type: Boolean, default: true },
      hitCount: { type: Number, default: 0 },
    }, { timestamps: true })

    const ChatbotQA = mongoose.models.ChatbotQA || mongoose.model('ChatbotQA', qaSchema)

    let inserted = 0
    let skipped = 0
    const totalEntries = FAQ_ENTRIES.length

    console.log(`\n📊 Total entries to process: ${totalEntries}`)
    console.log('')

    for (const entry of FAQ_ENTRIES) {
      const existing = await ChatbotQA.findOne({
        question: { $regex: `^${escapeRegex(entry.question)}$`, $options: 'i' },
      })

      if (existing) {
        skipped++
      } else {
        await ChatbotQA.create({
          question: entry.question,
          answer: entry.answer,
          category: entry.category,
        })
        inserted++
      }
    }

    const totalCount = await ChatbotQA.countDocuments({})
    
    console.log(`✅ Seeding complete!`)
    console.log(`📊 This batch: ${inserted} inserted, ${skipped} skipped`)
    console.log(`📊 FINAL TOTAL in database: ${totalCount}`)
    
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (err) {
    console.error('❌ Error seeding Q&A:', err)
    process.exit(1)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

seedQA()
