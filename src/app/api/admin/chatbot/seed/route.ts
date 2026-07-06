import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'

// ── Core essential Q&A entries ─────────────────────────────────────────
const ESSENTIAL_ENTRIES = [
  // --- General ---
  { question: 'What are your business hours?', answer: 'We are open Monday to Saturday, 10:00 AM – 7:00 PM IST. We remain closed on Sundays and public holidays.', category: 'general' },
  { question: 'How can I contact DigiSharks?', answer: 'You can call us at +91 96273 32332 or email us at marketing@digisharkscommunications.com. You can also fill out the contact form on our website and we will get back to you promptly.', category: 'contact' },
  { question: 'What is your phone number?', answer: 'You can reach us at +91 96273 32332. We are available during business hours: Monday to Saturday, 10:00 AM – 7:00 PM IST.', category: 'contact' },
  { question: 'What is your email address?', answer: 'You can email us at marketing@digisharkscommunications.com. We typically respond within 24 hours during business days.', category: 'contact' },
  { question: 'Where are you located?', answer: 'Our office is located at B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India.', category: 'contact' },
  { question: 'When was DigiSharks established?', answer: 'DigiSharks Communications was established in 2017 in New Delhi, India. We are a top AI-powered Digital PR and Digital Marketing Agency.', category: 'about' },
  { question: 'Who is the founder of DigiSharks?', answer: 'DigiSharks Communications was founded by Vansh Mehra in 2017. He is the Founder & Managing Director.', category: 'about' },
  { question: 'Which industries do you serve?', answer: 'We serve startups, SMEs, MSMEs, e-commerce businesses, political campaigns, educational institutions, healthcare, real estate, and many more industries across India.', category: 'general' },
  { question: 'Do you work with international clients?', answer: 'Yes, we work with clients both in India and internationally. Our team has experience serving clients across various geographies and industries.', category: 'general' },
  { question: 'How do I get a quote?', answer: 'You can request a quote by calling us at +91 96273 32332, emailing marketing@digisharkscommunications.com, or filling out the contact form on our website. We will get back to you within 24 hours.', category: 'general' },

  // --- Services ---
  { question: 'What services do you offer?', answer: 'We offer a comprehensive range of services including: Digital PR & Media Coverage, Press Release Distribution, SEO & PPC, AI SEO/AEO/GEO, Social Media Marketing, Web Development, Brand Promotion, Political Campaign Management, Corporate Events, and Online Reputation Management. Visit our Services page for full details.', category: 'services' },
  { question: 'What is Digital PR?', answer: 'Digital PR blends the credibility of traditional public relations with the measurability of online marketing. It involves strategic content placement across high-authority publications to generate brand awareness, stronger search visibility, and lasting reputation.', category: 'digital-pr' },
  { question: 'Do you offer press release distribution?', answer: 'Yes, we specialize in Press Release distribution across top media publications in India and internationally. We have tie-ups with leading media houses like Times of India, Hindustan Times, Forbes India, Yahoo News, Dailyhunt, DD News, Mid-Day, News18, and LiveMint.', category: 'digital-pr' },
  { question: 'Do you offer SEO services?', answer: 'Yes, we offer comprehensive SEO services including keyword research, on-page optimization, technical SEO, link building, content optimization, and performance monitoring. We also offer AI SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization).', category: 'seo-ppc' },
  { question: 'Do you handle social media marketing?', answer: 'Yes, we offer Social Media Marketing and management services for Instagram, Facebook, LinkedIn, Twitter (X), YouTube, and Pinterest. Our services include strategy development, content creation, campaign management, audience engagement, and performance analysis.', category: 'social-media' },
  { question: 'Do you build websites?', answer: 'Yes, we offer full-stack Web Development services including business websites, e-commerce stores, landing pages, WordPress development, and custom web applications. Our sites are fast, mobile-responsive, SEO-friendly, secure, and conversion-focused.', category: 'web-development' },
  { question: 'Do you offer political campaign management?', answer: 'Yes, we have extensive experience managing political campaigns, including booth-level management, voter outreach, digital communication, and IT cell operations. We have supported multiple state and national election campaigns with measurable on-ground impact.', category: 'political' },
  { question: 'Do you offer reputation management services?', answer: 'Yes, we offer Online Reputation Management (ORM) services to build, monitor, and protect your brand\'s online reputation. We track mentions across the web, address negative feedback, and amplify positive stories.', category: 'reputation-management' },

  // --- Pricing ---
  { question: 'What is the cost of SEO services?', answer: 'Our SEO package for 5 keywords is priced at INR Rs 2,40,000. This includes comprehensive on-page and off-page optimization, link building, and ongoing monitoring. Contact us for custom pricing based on your specific requirements.', category: 'pricing' },
  { question: 'How much do your services cost?', answer: 'Our pricing varies by service: Press Release — Rs 8,500, Web Design — Rs 10,500, SEO (5 keywords) — Rs 2,40,000, Events Management — Rs 50,000/day, Brand Promotion — Rs 50,000, Social Media Marketing — Rs 20,000/month. Contact us for a customized quote.', category: 'pricing' },
  { question: 'What is the cost of press release services?', answer: 'Our press release package costs Rs 8,500 (one-time fee for Indian clients). Includes 2 press releases with proof reading, up to 800 words, distribution to 500+ reporters, and coverage from 80+ websites.', category: 'pricing' },
  { question: 'What is the cost of website design?', answer: 'Our website design package costs Rs 10,500 per website. Includes 10 pages with WordPress CMS, mobile responsive layout, image slider, gallery, contact form, newsletter subscription, Google Map, SEO optimization, and social media integration.', category: 'pricing' },
  { question: 'What is the cost of social media marketing?', answer: 'Our social media marketing plan starts at Rs 20,000 per month. This includes Facebook and Instagram management, content creation, ad campaigns, and weekly reporting.', category: 'pricing' },
  { question: 'What is the cost of brand promotion?', answer: 'Our brand promotion services start at Rs 50,000. The final cost depends on the scope of work and specific requirements.', category: 'pricing' },
  { question: 'What is the cost of event management?', answer: 'Our event management services start at Rs 50,000 per day. This covers celebrity events, corporate events, live concerts, fashion shows, and more.', category: 'pricing' },

  // --- Products ---
  { question: 'What is the PAN India Database?', answer: 'The PAN India Updated Database is a comprehensive collection of verified active contacts including entrepreneurs, business owners, CEOs, government officials, and professionals across 40+ industries. It is available in CSV, Excel, and PDF formats. Price: ₹299 only.', category: 'products' },
  { question: 'Do you sell digital products?', answer: 'Yes, we offer digital products like the PAN India Updated Database 2020-2025, which includes verified business and consumer contacts across 40+ industries. Visit our Digital Products page for more details.', category: 'products' },

  // --- Career ---
  { question: 'Are you hiring?', answer: 'We occasionally have openings for talented professionals. Visit our Contact page or email your resume to marketing@digisharkscommunications.com. Important: DigiSharks does not offer jobs via WhatsApp or Telegram. Beware of fraudulent job offers using our name.', category: 'career' },
  { question: 'Do you offer internships?', answer: 'We offer internship opportunities for students and recent graduates in digital marketing, PR, content creation, and web development. Email your resume to marketing@digisharkscommunications.com.', category: 'career' },

  // --- AI / AEO / GEO ---
  { question: 'What is AEO?', answer: 'AEO stands for Answer Engine Optimization. It\'s the practice of optimizing content to appear in featured snippets, voice search results, and direct answers on search engines like Google. AEO focuses on providing clear, concise answers to user questions.', category: 'ai-seo-aeo-geo' },
  { question: 'What is GEO?', answer: 'GEO stands for Generative Engine Optimization. It\'s the practice of optimizing content for AI-powered search engines and chatbots like ChatGPT, Google Gemini, and Perplexity. GEO ensures your brand appears in AI-generated answers and recommendations.', category: 'ai-seo-aeo-geo' },
  { question: 'What is AI SEO?', answer: 'AI SEO uses artificial intelligence and machine learning to optimize websites for search engines. This includes AI-powered content creation, predictive analytics, automated optimization, and intelligent keyword targeting.', category: 'ai-seo-aeo-geo' },

  // --- SEO Audit ---
  { question: 'Do you offer SEO audits?', answer: 'Yes, we offer comprehensive SEO audits that analyze your website\'s technical health, on-page optimization, content quality, backlink profile, and competitive positioning. Contact us to schedule an audit.', category: 'seo-audit' },

  // --- More FAQ ---
  { question: 'Do you require long-term contracts?', answer: 'No, we do not require long-term contracts. We offer flexible engagement models designed around your needs. Many clients choose to work with us on a month-to-month basis.', category: 'general' },
  { question: 'Do you offer free consultation?', answer: 'Yes, we offer a free 30-minute strategy call to understand your business goals and recommend a custom growth roadmap. Book through our website or call +91 96273 32332.', category: 'general' },
  { question: 'Do you offer 360-degree marketing?', answer: 'Our 360-degree approach means we cover every aspect of your brand\'s digital presence — from SEO and social media to PR and web development. This integrated strategy ensures consistent messaging across all channels for maximum impact.', category: 'services' },
  { question: 'What is your client retention rate?', answer: 'We maintain a 98% client retention rate, reflecting our commitment to delivering consistent results and building long-term relationships with our clients.', category: 'general' },
  { question: 'What media partners do you work with?', answer: 'Our media partners include Forbes India, Yahoo News, Dailyhunt, DD News, Times of India, Mid-Day, News18, Hindustan Times, LiveMint, and many more leading publications across India.', category: 'digital-pr' },
  { question: 'How many websites will cover my press release?', answer: 'Our press release package includes coverage from 80+ websites assured. We distribute your press release to 500+ industry-specific Indian reporters for maximum visibility.', category: 'digital-pr' },
  { question: 'What is the difference between SEO and PPC?', answer: 'SEO focuses on earning organic (free) traffic through optimized content and technical improvements, while PPC drives traffic through paid advertisements. SEO is a long-term investment, while PPC delivers immediate results. We recommend using both for maximum impact.', category: 'seo-ppc' },
  { question: 'What is included in your SEO package?', answer: 'Our SEO package includes extensive keyword research, site link building, natural listings on Google and Bing, article submission to news and PR sites, local directories and industry authority listings, blogs and social media network optimization, and online and social media reputation monitoring.', category: 'seo-ppc' },
  { question: 'What is included in your press release package?', answer: 'Our press release package includes: 2 Press Releases with proof reading, up to 800 words per PR, distribution to 500+ industry-specific Indian reporters, coverage from 80+ websites assured, and distribution across leading media houses. Price: Rs 8,500.', category: 'digital-pr' },
  { question: 'What awards has DigiSharks won?', answer: 'DigiSharks has been featured in Top 10 CEOs 2021-2022, Top 10 Dynamic Entrepreneurs 2021-2022, Top 10 PR Leaders in India 2024, Top 50 Entrepreneurs 2022, and Top 10 Influential Businesses of the Year 2022.', category: 'portfolio' },
  { question: 'Do you offer graphic design?', answer: 'Yes, we offer comprehensive graphic design services including logo design, social media creatives, brand identity, marketing materials, infographics, banner design, flyers, brochures, newsletter design, and more.', category: 'graphic-design' },
  { question: 'Do you offer content creation?', answer: 'Yes, we offer comprehensive content creation services including website content, blog articles, social media content, marketing copy, video scripts, and brand storytelling.', category: 'content-creation' },
  { question: 'What is your website design process?', answer: 'Our process: 1) Discovery and requirements gathering, 2) Design concepts (2 concepts with unlimited revisions), 3) Development and content integration, 4) Testing and quality assurance, 5) Launch and deployment, 6) Post-launch support.', category: 'web-development' },
  { question: 'Are your websites mobile responsive?', answer: 'Yes, all our websites are mobile-first with pixel-perfect experiences across every device, screen size, and platform — phones, tablets, and desktops.', category: 'web-development' },
  { question: 'Do you offer website maintenance?', answer: 'Yes, we offer ongoing maintenance and support plans to keep your site running smoothly, securely, and up-to-date. This includes updates, backups, security monitoring, and performance optimization.', category: 'web-development' },
  { question: 'What is your social media marketing process?', answer: 'Our SMM process includes: 1) Strategy development based on your business goals, 2) Content creation with scroll-stopping visuals and copy, 3) Campaign management with continuous optimization, 4) Audience engagement and community management, 5) Performance analysis with detailed reporting.', category: 'social-media' },
  { question: 'Do you run social media ads?', answer: 'Yes, we run paid social media campaigns across Meta (Facebook & Instagram), LinkedIn, YouTube, and Twitter (X). Our ad services include targeting, creative development, budget optimization, and performance tracking.', category: 'social-media' },
  { question: 'Do you offer influencer marketing?', answer: 'Yes, we offer influencer marketing services to help you reach new audiences through authentic promotion by trusted voices in your industry.', category: 'social-media' },
]

export async function POST(req: NextRequest) {
  // ── Auth check ──
  const admin = getAdminFromRequest(req)
  if (!admin || !isSuperAdmin(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectMongoose()

    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (const entry of ESSENTIAL_ENTRIES) {
      try {
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
            isActive: true,
            hitCount: 0,
          })
          inserted++
        }
      } catch (err) {
        errors.push(`Error inserting "${entry.question}": ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const totalCount = await ChatbotQA.countDocuments({ isActive: true })

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      totalActiveEntries: totalCount,
    })
  } catch (err) {
    return NextResponse.json({
      error: `Seed failed: ${err instanceof Error ? err.message : String(err)}`,
    }, { status: 500 })
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
