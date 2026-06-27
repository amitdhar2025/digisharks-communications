/**
 * Seed 50+ natural language Q&A entries for the chatbot.
 *
 * This adds entries phrased as users actually type:
 *   "I want a website for ecommerce"
 *   "I need help with SEO"
 *   "Can you build me an app?"
 *   etc.
 *
 * Usage: node scripts/seed-chatbot-natural-phrasings.mjs
 */

import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

async function main() {
  // Read MONGODB_URI from .env.local
  const envPath = path.resolve('.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const uriLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='))
  if (!uriLine) {
    console.error('MONGODB_URI not found in .env.local')
    process.exit(1)
  }
  const MONGODB_URI = uriLine.split('=').slice(1).join('=').trim()

  await mongoose.connect(MONGODB_URI)

  // Get existing questions to avoid duplicates
  const existing = await mongoose.connection.db
    .collection('chatbotqas')
    .find({})
    .project({ question: 1 })
    .toArray()
  const existingQuestions = new Set(existing.map((e) => e.question.toLowerCase().trim()))

  // ================================================================
  // NATURAL LANGUAGE PHRASINGS — organized by category
  // Users ask questions like "I want X", "I need Y", "Can you Z"
  // ================================================================

  const entries = [
    // ── WEB DEVELOPMENT ──────────────────────────────────────────
    { question: "I want a website for my business", answer: "That's great! We design and develop custom websites tailored to your business needs. Our web development services include WordPress sites, custom web applications, landing pages, and full e-commerce stores. We focus on modern UI/UX design, speed optimization, mobile responsiveness, and SEO-friendly architecture. Get in touch with us to discuss your project requirements and we'll build something amazing together! Visit our Web Development page for more details.", category: 'web-development' },
    { question: "I want to build an ecommerce website", answer: "Absolutely! We specialize in e-commerce website development. Our e-commerce solutions include product management, payment gateway integration (Razorpay, etc.), shopping cart functionality, order tracking, customer accounts, and inventory management. We build on powerful platforms like WooCommerce and also offer custom e-commerce solutions. Let's create an online store that drives sales for your business!", category: 'web-development' },
    { question: "I need help building a website", answer: "We'd be happy to help you build your website! Our web development team handles everything from simple landing pages to complex web applications. We'll work with you to understand your brand, goals, and target audience, then design and develop a site that looks great and performs even better. Services include: WordPress development, custom theme creation, plugin integration, speed optimization, and security hardening. Reach out and let's get started!", category: 'web-development' },
    { question: "Can you build me a landing page?", answer: "Yes, we specialize in high-converting landing page development! Our landing pages are designed to support specific campaigns and offers, with a focus on higher conversions, lead capture, and mobile-friendly design. We use modern frameworks for fast loading and seamless user experience. Whether it's for a product launch, event registration, or lead generation campaign, we'll create a landing page that delivers results.", category: 'web-development' },
    { question: "I need a redesign for my existing website", answer: "We offer comprehensive website redesign services to transform your existing site into a modern, conversion-focused experience. Our redesign process covers modern UI/UX design, better performance optimization, mobile responsiveness, and SEO enhancements. We'll audit your current site, identify improvement areas, and create a fresh new design that aligns with your brand and business goals.", category: 'web-development' },

    // ── SEO & PPC ────────────────────────────────────────────────
    { question: "I want to improve my SEO ranking", answer: "We can definitely help improve your SEO rankings! Our SEO services include comprehensive keyword research, on-page optimization, technical SEO audits, content strategy development, link building, and performance tracking. We use data-driven approaches to boost your search engine visibility and drive organic traffic. Our team stays updated with the latest Google algorithm changes to ensure sustainable results. Let's discuss your SEO goals!", category: 'seo-ppc' },
    { question: "I need help with Google Ads", answer: "Our PPC team specializes in Google Ads management! We handle campaign setup, keyword research, ad copywriting, bid management, A/B testing, and performance analytics. Whether you need Search ads, Display ads, Shopping ads, or Video campaigns, we optimize every aspect for maximum ROI. We also provide detailed monthly reports so you always know how your ad spend is performing.", category: 'seo-ppc' },
    { question: "Can you do keyword research for my business?", answer: "Absolutely! Keyword research is the foundation of effective SEO and PPC campaigns. Our research process includes competitor analysis, search volume analysis, keyword difficulty assessment, long-tail keyword discovery, and topic clustering. We identify high-intent keywords that your target audience is actually searching for, helping you create content that ranks and converts.", category: 'seo-ppc' },
    { question: "I want to run PPC ads for my business", answer: "We'd love to help you run PPC ads! Our pay-per-click advertising services cover Google Ads, Bing Ads, and social media advertising. We start with thorough keyword research and competitor analysis, then create targeted ad campaigns optimized for your specific goals — whether that's brand awareness, lead generation, or direct sales. We continuously monitor and optimize your campaigns to maximize ROI.", category: 'seo-ppc' },

    // ── SOCIAL MEDIA ─────────────────────────────────────────────
    { question: "I need help with social media marketing", answer: "Our social media marketing team can help you build a strong presence across all major platforms! We offer content creation, posting schedules, community management, paid social advertising, influencer collaborations, and detailed analytics reporting. Whether you need Instagram, Facebook, LinkedIn, Twitter, or YouTube management, we create tailored strategies that engage your audience and drive real business results.", category: 'social-media' },
    { question: "I want to grow my Instagram following", answer: "We can help grow your Instagram presence organically! Our Instagram strategy includes content planning and creation, hashtag research, story and reel optimization, engagement tactics, and profile optimization. We focus on building a genuine, engaged following that converts into customers rather than just vanity metrics. Let's create an Instagram strategy that works for your brand!", category: 'social-media' },
    { question: "Can you manage my Facebook page?", answer: "Yes, we offer comprehensive Facebook page management! This includes content creation and scheduling, community engagement, ad campaign management, audience insights analysis, and performance reporting. We keep your page active with engaging content that resonates with your audience while managing comments and messages professionally.", category: 'social-media' },
    { question: "I need content ideas for social media", answer: "Our creative team specializes in developing social media content strategies! We'll brainstorm content ideas tailored to your brand voice and audience preferences — including educational posts, behind-the-scenes content, user-generated content campaigns, interactive polls and quizzes, video content, infographics, and promotional posts. We ensure a good mix of content types to keep your feed fresh and engaging.", category: 'social-media' },

    // ── DIGITAL PR ───────────────────────────────────────────────
    { question: "I want to get media coverage for my business", answer: "We can help you get valuable media coverage! Our Digital PR & Media services include press release writing and distribution, media outreach, journalist relationship building, story pitching, and coverage monitoring. We have established relationships with media outlets across business, tech, lifestyle, and regional publications. Let us help tell your brand's story to the world!", category: 'digital-pr' },
    { question: "I need help with crisis communication", answer: "Our crisis communication team is experienced in managing reputational challenges. We provide rapid response strategies, media statements, stakeholder communication plans, and ongoing monitoring to protect your brand during difficult situations. We help you navigate crises with transparency and professionalism to minimize reputational damage.", category: 'digital-pr' },
    { question: "Can you write a press release for me?", answer: "Absolutely! Our team writes professional, newsworthy press releases that get noticed by journalists and editors. We follow industry-standard formatting, craft compelling headlines, include key messaging, and optimize for media pickup. We also handle distribution to relevant media outlets and journalists to maximize your coverage opportunities.", category: 'digital-pr' },

    // ── BRAND PROMOTION ──────────────────────────────────────────
    { question: "I want to build my brand identity", answer: "We'd love to help you build a strong brand identity! Our brand promotion services include logo design, color palette development, typography selection, brand guidelines creation, corporate stationery design, and complete brand strategy development. A strong brand identity helps you stand out, build trust, and create lasting connections with your audience.", category: 'brand-promotion' },
    { question: "I need help with influencer marketing", answer: "Our influencer marketing service connects your brand with the right influencers to amplify your message. We handle influencer discovery, vetting, outreach, campaign management, content approval, and performance tracking. Whether you need nano, micro, or macro influencers, we find authentic partners who resonate with your target audience and deliver measurable results.", category: 'brand-promotion' },
    { question: "Can you help me with corporate branding?", answer: "Yes, we offer comprehensive corporate branding services! This includes brand strategy development, visual identity design, brand messaging and positioning, corporate communications materials, and brand consistency audits. We help established businesses refresh their brand and startups build their brand from the ground up.", category: 'brand-promotion' },

    // ── POLITICAL ────────────────────────────────────────────────
    { question: "I want to run a political campaign", answer: "We specialize in political campaign management! Our services include campaign strategy development, booth management, voter outreach and engagement, social media campaign management, event planning, media relations, and messaging development. We have extensive experience managing campaigns across various levels of Indian elections. Let us help you connect with voters and win!", category: 'political' },
    { question: "I need help with voter outreach", answer: "Our team can design and execute effective voter outreach programs. We use a combination of digital and ground-level strategies including door-to-door campaigns, social media targeting, SMS campaigns, phone banking, community events, and targeted advertising to connect with voters and communicate your message effectively.", category: 'political' },

    // ── AI SEO / AEO / GEO ───────────────────────────────────────
    { question: "I want to optimize for AI search engines", answer: "Great — this is exactly what our AI SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) services cover! We optimize your content to appear in AI-generated answers from tools like ChatGPT, Google Bard, Perplexity, and other AI search platforms. Our strategies include structured data implementation, conversational content creation, FAQ optimization, and entity-based SEO.", category: 'ai-seo-aeo-geo' },
    { question: "I need help with AI content optimization", answer: "Our AI content optimization services help your brand get discovered through AI-powered search and chat interfaces. We optimize for voice search readiness, featured snippets, knowledge panels, and AI training data inclusion. Our approach ensures your content is structured, authoritative, and easily digestible by both AI systems and human readers.", category: 'ai-seo-aeo-geo' },

    // ── REPUTATION MANAGEMENT ────────────────────────────────────
    { question: "I want to manage my online reputation", answer: "Our Online Reputation Management (ORM) services help monitor, protect, and improve your digital reputation. We track mentions across social media, review sites, news outlets, and forums. Our strategies include review management, content suppression for negative results, positive content promotion, and crisis management. Let us help you maintain a stellar online presence!", category: 'reputation-management' },
    { question: "I need to remove negative content about my business", answer: "Our ORM team can help address negative content through ethical, legitimate strategies. We use content suppression techniques — creating and promoting positive content that pushes down negative results in search rankings. We also help with review management on Google, Justdial, and other platforms. All our methods are white-hat and compliant with platform guidelines.", category: 'reputation-management' },

    // ── CONTENT & GRAPHICS ───────────────────────────────────────
    { question: "I need content written for my website", answer: "Our content creation team can write compelling content for every page of your website! We offer blog posts, service descriptions, about us pages, landing page copy, product descriptions, and more. Our content is SEO-optimized, engaging, and tailored to your brand voice. We research your industry and competitors to create content that resonates with your target audience.", category: 'content-creation' },
    { question: "I want graphic design for my brand", answer: "Our graphic design team creates stunning visuals for your brand! Services include logo design, social media graphics, marketing collateral (brochures, flyers, business cards), presentation design, infographics, and brand style guides. We follow design best practices and ensure all visuals align with your brand identity for a cohesive look across all channels.", category: 'graphic-design' },
    { question: "Can you design a logo for my business?", answer: "Absolutely! Logo design is one of our specialties. We create custom, original logos that capture your brand's essence and make a lasting impression. Our design process includes research, concept development, multiple design iterations, and final delivery in all required formats (PNG, SVG, EPS, etc.). We ensure your logo works across digital and print media.", category: 'graphic-design' },

    // ── DIGITAL MARKETING ────────────────────────────────────────
    { question: "I want a full digital marketing strategy", answer: "We offer comprehensive digital marketing strategies tailored to your business goals! Our integrated approach covers SEO, PPC advertising, social media marketing, content marketing, email marketing, and analytics. We start with a thorough audit of your current digital presence, competitor analysis, and audience research. Then we create a customized roadmap with measurable KPIs to drive real business growth.", category: 'digital-marketing' },
    { question: "I need help with email marketing", answer: "Our email marketing services include campaign strategy development, email design and copywriting, subscriber list management, A/B testing, automation workflows, and performance analytics. We create targeted email campaigns that nurture leads, engage customers, and drive conversions. Whether you need newsletters, promotional emails, or automated drip campaigns, we've got you covered.", category: 'email-marketing' },
    { question: "I need performance marketing for my business", answer: "Our performance marketing team focuses on data-driven campaigns that deliver measurable results. We handle paid search, display advertising, social media ads, retargeting campaigns, and affiliate marketing. Every campaign is continuously optimized based on real-time data to ensure the best possible ROI. We only succeed when your business grows!", category: 'performance-marketing' },

    // ── SMS MARKETING ────────────────────────────────────────────
    { question: "I want to do SMS marketing for my business", answer: "We offer professional SMS marketing services! Our SMS campaigns help you reach customers directly on their mobile phones with promotional offers, alerts, reminders, and updates. We handle message content creation, contact list management, campaign scheduling, and delivery analytics. SMS marketing has high open rates and is perfect for time-sensitive communications.", category: 'sms-marketing' },

    // ── ABOUT / GENERAL ──────────────────────────────────────────
    { question: "Tell me about DigiSharks Communications", answer: "DigiSharks Communications is a premier PR and digital marketing agency founded in 2017 by Vansh Mehra. We specialize in Digital PR, SEO, PPC, Social Media Marketing, Web Development, Brand Promotion, Political Campaign Management, and more. Our team is dedicated to delivering measurable results for our clients through creative strategies and data-driven execution. We've worked with diverse clients across industries including politics, e-commerce, education, healthcare, and technology.", category: 'about' },
    { question: "Who is the founder of DigiSharks", answer: "DigiSharks Communications was founded by Vansh Mehra. Under his leadership, the company has grown from a startup to a comprehensive PR and digital marketing agency serving clients across India. Vansh's vision drives our commitment to transparency, quality service, innovation, and measurable results in everything we do.", category: 'about' },
    { question: "Tell me about Vansh Mehra", answer: "Vansh Mehra is the founder of DigiSharks Communications. He started the company in 2017 and has since built it into a full-service PR and digital marketing agency. Under his leadership, DigiSharks has grown to offer services ranging from Digital PR and SEO to Political Campaign Management and Web Development. The company's values of transparency, quality service, fresh ideas, and measurable results reflect Vansh's vision for the agency.", category: 'about' },
    { question: "How can I contact DigiSharks", answer: "You can reach DigiSharks Communications through multiple channels: 📞 Phone: +91 96273 32332, ✉️ Email: marketing@digisharkscommunications.com, 📍 Address: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301. You can also visit our Contact Us page or use the chatbot here to connect with us. We're available Monday to Saturday, 10:00 AM to 7:00 PM.", category: 'contact' },
    { question: "Where is DigiSharks located", answer: "DigiSharks Communications is headquartered at B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301. We serve clients across India with our comprehensive PR and digital marketing services.", category: 'contact' },
    { question: "Do you work with startups", answer: "Yes, we love working with startups! Our startup marketing services include brand identity development, digital strategy, SEO, social media setup and management, website development, and PR. We understand the unique challenges startups face — limited budgets, need for rapid growth, and building credibility from scratch. We offer customized packages that deliver maximum impact within your budget constraints.", category: 'startup' },

    // ── PRICING ──────────────────────────────────────────────────
    { question: "How much does a website cost", answer: "The cost of a website depends on its complexity, features, and design requirements. A simple landing page starts from a few thousand rupees, while a full e-commerce website or custom web application involves a higher investment. We recommend scheduling a consultation to discuss your specific needs — we'll provide a detailed quote based on your requirements. Contact us for a personalized estimate!", category: 'pricing' },
    { question: "How much do SEO services cost", answer: "Our SEO service pricing varies based on the scope of work, competitiveness of your industry, and your specific goals. We offer customized SEO packages that include keyword research, on-page optimization, technical SEO, content creation, and monthly reporting. Contact us for a consultation and we'll create a tailored proposal with transparent pricing for your business.", category: 'pricing' },
    { question: "What is the cost of social media management", answer: "Social media management costs depend on the number of platforms, volume of content, engagement requirements, and whether paid advertising is included. We offer flexible packages for social media management that can be customized to your needs and budget. Reach out to discuss your requirements for a detailed quote!", category: 'pricing' },
    { question: "What are your service charges", answer: "Our service charges vary by the type and scope of services required. We believe in transparent pricing with no hidden costs. Each service — whether it's SEO, web development, social media marketing, PR, or branding — is priced based on the specific requirements of your project. Contact us for a free consultation and we'll provide a customized quote tailored to your needs and budget.", category: 'pricing' },

    // ── PRODUCTS ─────────────────────────────────────────────────
    { question: "I want to buy the PAN India Database", answer: "The PAN India Database is one of our popular products — a comprehensive database covering contacts across India for business development and marketing. It includes verified contact details organized by industry, region, and category. You can purchase it directly through our website or contact us for more details about pricing and delivery format. Visit our Digital Products page to learn more!", category: 'products' },

    // ── PORTFOLIO ────────────────────────────────────────────────
    { question: "Show me your portfolio or past work", answer: "We have an impressive portfolio of work across digital PR, political campaigns, brand promotions, web development, and more! You can view our complete portfolio on our website's Portfolio page. We've worked with diverse clients across industries and have received recognition including being listed among the '50 Entrepreneurs of The Year Awards 2024'. Visit our Portfolio page to see our work!", category: 'portfolio' },
    { question: "What awards has DigiSharks won", answer: "DigiSharks Communications was recognized in the '50 Entrepreneurs of The Year Awards 2024 - 2nd Edition', a testament to our growth and impact in the PR and digital marketing space. This recognition reflects our commitment to delivering exceptional results for our clients through innovative strategies and dedicated service.", category: 'portfolio' },

    // ── EVENTS ───────────────────────────────────────────────────
    { question: "Do you organize corporate events", answer: "Yes, we offer corporate event planning and management services! From award shows and product launches to corporate roadshows and team building events, our events team handles everything — venue selection, logistics, guest management, stage design, audio-visual setup, catering coordination, and post-event follow-up. Let us make your next event memorable and impactful!", category: 'events' },

    // ── FAQ ──────────────────────────────────────────────────────
    { question: "How long does it take to build a website", answer: "A simple website typically takes 2-4 weeks, while more complex e-commerce sites or custom web applications can take 6-12 weeks depending on the features and requirements. We provide a clear timeline during the proposal stage and keep you updated throughout the development process. The timeline also depends on how quickly content and approvals are provided.", category: 'faq' },
    { question: "How long does SEO take to show results", answer: "SEO is a long-term strategy. You can typically start seeing initial improvements in 3-6 months, with more significant results appearing after 6-12 months of consistent effort. The timeline depends on factors like your industry competitiveness, current website authority, content quality, and the scope of optimization needed. We provide monthly reports to track progress and adjust strategies as needed.", category: 'faq' },

    // ── MORE GENERAL PHRASINGS ──────────────────────────────────
    { question: "I need a digital marketing agency", answer: "You've come to the right place! DigiSharks Communications is a full-service PR and digital marketing agency offering everything from SEO and PPC to social media marketing, web development, brand promotion, and more. We combine creative strategies with data-driven execution to deliver measurable results for our clients. Let's discuss your goals and see how we can help your business grow!", category: 'digital-marketing' },
    { question: "Can you help me grow my business online", answer: "Absolutely! We offer a comprehensive range of digital services to help grow your business online: SEO to drive organic traffic, PPC ads for immediate visibility, social media marketing to build community, web development for a professional online presence, and PR to build credibility. Our integrated approach ensures all channels work together to maximize your growth. Contact us for a free consultation!", category: 'digital-marketing' },
    { question: "I want to advertise my business", answer: "We can help you advertise your business effectively! Our advertising services include Google Ads, social media advertising (Facebook, Instagram, LinkedIn, Twitter), display advertising, and retargeting campaigns. We create targeted ad campaigns that reach your ideal customers and optimize continuously for the best ROI. Let's create ads that get results!", category: 'advertising' },
    { question: "I need a marketing strategy for my business", answer: "We'll create a comprehensive marketing strategy tailored to your business! Our process includes market research, competitor analysis, target audience definition, channel selection, content planning, budget allocation, and KPI setting. We develop integrated strategies that combine digital and traditional marketing approaches for maximum impact. Let's build a roadmap to your business goals!", category: 'digital-marketing' },
    { question: "Can you help me with video marketing", answer: "Yes, we offer video marketing services! This includes concept development, scriptwriting, video production (live-action and animated), editing, and distribution across platforms like YouTube, Instagram Reels, and Facebook. Video content is one of the most engaging formats and we create professional videos that tell your brand's story and drive engagement.", category: 'content-creation' },
    { question: "I want to learn about digital marketing", answer: "We'd be happy to share insights about digital marketing! The key areas include: SEO (search engine optimization), PPC (pay-per-click advertising), social media marketing, content marketing, email marketing, and analytics. Each channel serves different purposes — SEO builds long-term organic traffic, PPC delivers immediate visibility, social media builds community, and content marketing establishes authority. We offer professional services in all these areas!", category: 'digital-marketing' },
  ]

  let inserted = 0
  let skipped = 0

  for (const entry of entries) {
    const key = entry.question.toLowerCase().trim()
    if (existingQuestions.has(key)) {
      skipped++
      continue
    }

    await mongoose.connection.db.collection('chatbotqas').insertOne({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      isActive: true,
      hitCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    inserted++
  }

  const total = await mongoose.connection.db.collection('chatbotqas').countDocuments({})

  console.log(`\n✅ Done! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`)
  console.log(`📊 Total Q&A entries in database: ${total}\n`)

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
