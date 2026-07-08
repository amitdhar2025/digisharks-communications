/**
 * Seed GAP-FILLER Q&A entries.
 * Covers comparisons, process, problem-focused, industry-specific, and more.
 * Usage: node scripts/seed-chatbot-gap-filler.mjs
 */

const GAP_ENTRIES = [

  // ── ok/okay replies + 2-char acronym fix + missing who are you ─
  { question: 'ok', answer: 'Great! Is there anything else I can help you with? Feel free to ask me about our services, pricing, or anything about DigiSharks.', category: 'general' },
  { question: 'okay', answer: 'Awesome! Let me know if you have any other questions. I am here to help with anything about DigiSharks services, pricing, or company info.', category: 'general' },
  { question: 'alright', answer: 'Got it! If you need anything else, just ask. I can help with services, pricing, contact info, and more.', category: 'general' },
  { question: 'sure', answer: 'Happy to help! What would you like to know more about? I can tell you about our services, pricing, or anything else.', category: 'general' },
  { question: 'got it', answer: 'Perfect! Feel free to reach out anytime if you have more questions. Have a great day!', category: 'general' },
  { question: 'k', answer: 'Got it! Is there anything else I can help you with? Just let me know!', category: 'general' },
  { question: 'kk', answer: 'Cool! If you have more questions later, I will be right here. Ask me about SEO, PR, websites, or anything!', category: 'general' },

  { question: 'what is PR', answer: 'PR stands for Public Relations. At DigiSharks, Digital PR combines media relations with online marketing. We help you get featured in top publications, build brand credibility, and improve search visibility through strategic media placements across 500+ journalist contacts.', category: 'digital-pr' },
  { question: 'what is public relations', answer: 'Public Relations (PR) is the practice of managing how information about a brand is communicated to the public and media. Our Digital PR services include press release distribution, media outreach, crisis communication, and brand reputation management.', category: 'digital-pr' },
  { question: 'what does PR mean', answer: 'PR means Public Relations. It involves building positive relationships between your brand and the public through media coverage, press releases, and strategic communication.', category: 'digital-pr' },
  { question: 'define PR', answer: 'PR (Public Relations) is the strategic communication process that builds mutually beneficial relationships between organizations and their publics.', category: 'digital-pr' },
  { question: 'what is PR in marketing', answer: 'PR in marketing uses media relations and communication strategies to build brand awareness and credibility. Unlike advertising, PR earns attention through newsworthy stories.', category: 'digital-pr' },
  { question: 'who are you', answer: 'I am the DigiSharks Communications chatbot assistant! DigiSharks is a top AI-powered Digital PR and Marketing agency founded in 2017 by Vansh Mehra. We help businesses grow through digital PR, SEO, social media, web development, and more. How can I help you today?', category: 'about' },
  { question: 'who are you guys', answer: 'We are DigiSharks Communications - an AI-powered Digital PR and Marketing agency since 2017. 4000+ clients, 500+ campaigns, 98% retention rate. Our team of 25+ specialists is based in Noida, India.', category: 'about' },
  { question: 'tell me about yourself', answer: 'DigiSharks Communications is a premier digital PR and marketing agency established in 2017. We help businesses achieve measurable growth through Digital PR, SEO, Social Media, Web Development, and Brand Promotion.', category: 'about' },
  { question: 'introduce yourself', answer: 'Hello! I am the DigiSharks chatbot. DigiSharks Communications is an award-winning Digital PR and Marketing agency founded by Vansh Mehra in 2017. What can I help you with?', category: 'about' },

  // ── COMPARISONS ────────────────────────────────────────────────
  { question: 'SEO vs PPC', answer: "SEO is organic (free) traffic over time. PPC is paid traffic with immediate results. We recommend both for maximum impact.", category: 'seo-ppc' },
  { question: 'difference between SEO and PPC', answer: 'SEO earns organic traffic through optimized content. PPC drives traffic through paid ads with instant results. Both together = best results.', category: 'seo-ppc' },
  { question: 'WordPress vs Shopify', answer: 'WordPress (WooCommerce) offers more flexibility. Shopify is easier to set up but has less customization. We build on both.', category: 'web-development' },
  { question: 'Instagram vs Facebook marketing', answer: 'Instagram is better for visual brands and younger audiences. Facebook excels for broader demographics and detailed ad targeting. We manage both!', category: 'social-media' },
  { question: 'organic vs paid marketing', answer: 'Organic builds sustainable traffic over time at no direct cost. Paid delivers immediate targeted traffic but costs per click. Integrated strategies work best.', category: 'digital-marketing' },
  { question: 'onpage vs offpage SEO', answer: 'On-page SEO optimizes elements ON your website. Off-page SEO focuses on external signals like backlinks. Both are essential for rankings.', category: 'seo-ppc' },
  { question: 'B2B vs B2C marketing', answer: 'B2B targets businesses with longer sales cycles. B2C targets individuals with faster purchase decisions. We tailor strategies for both.', category: 'digital-marketing' },
  { question: 'Facebook Ads vs Google Ads', answer: 'Facebook Ads target users based on demographics and interests. Google Ads target users based on search intent. Both are powerful channels.', category: 'seo-ppc' },
  { question: 'content marketing vs SEO', answer: 'Content marketing creates valuable content. SEO optimizes that content to rank in search engines. Together they drive high-quality results.', category: 'digital-marketing' },

  // ── PROCESS / TIMELINE ──────────────────────────────────────────
  { question: 'How long does SEO take', answer: 'Initial improvements appear in 3-6 months. Significant results take 6-12 months depending on competition and keyword difficulty.', category: 'seo-ppc' },
  { question: 'How long to build a website', answer: 'A standard business website takes 2-4 weeks. E-commerce sites take 4-8 weeks. Custom applications vary.', category: 'web-development' },
  { question: 'How long for PR results', answer: 'Media placements appear within 1-2 weeks of a press release. Building brand authority takes 3-6 months.', category: 'digital-pr' },
  { question: 'How long for social media results', answer: 'You see engagement growth within the first month. Significant growth takes 2-3 months of consistent effort.', category: 'social-media' },
  { question: 'what is the process for SEO', answer: '1) Audit and keyword research, 2) On-page optimization, 3) Technical SEO fixes, 4) Link building, 5) Monthly reporting.', category: 'seo-ppc' },
  { question: 'what is the process for website', answer: '1) Discovery, 2) Design (2 concepts), 3) Development, 4) Testing, 5) Launch, 6) Post-launch support.', category: 'web-development' },
  { question: 'what do I need to provide for a website', answer: 'Brand logo, colors, page content, images, and required features. We can also create content for you.', category: 'web-development' },
  { question: 'what information do you need to start', answer: 'Your business goals, target audience, budget, and any existing marketing materials. Free consultation to start!', category: 'general' },

  // ── PROBLEM-FOCUSED ─────────────────────────────────────────────
  { question: 'My website is slow', answer: 'We can audit speed, optimize images, enable caching, and improve hosting. Contact us for a performance audit!', category: 'web-development' },
  { question: 'My website is not getting traffic', answer: 'Our SEO services can improve rankings and drive organic visitors. We also offer PPC for immediate traffic.', category: 'seo-ppc' },
  { question: 'I am not getting leads', answer: 'We audit your funnel, optimize campaigns, and implement proven lead generation strategies. Let us help!', category: 'digital-marketing' },
  { question: 'My Google rankings dropped', answer: 'We audit your site to identify the cause and implement recovery strategies. Contact us for a consultation.', category: 'seo-ppc' },
  { question: 'My social media is not growing', answer: 'We revitalize social media with consistent content strategy, engaging visuals, and targeted ads.', category: 'social-media' },
  { question: 'I have negative reviews online', answer: 'Our ORM services monitor reviews, address feedback, and build positive content to improve reputation.', category: 'reputation-management' },
  { question: 'My ads are not converting', answer: 'We audit targeting, creative, and landing pages to optimize for better conversion rates and ROI.', category: 'seo-ppc' },
  { question: 'My competitor is ranking above me', answer: 'We analyze competitor strategies and develop a plan to outperform them. Let us capture more market share!', category: 'seo-ppc' },
  { question: 'Nobody knows my brand', answer: 'Our multi-channel approach combines PR, social media, content, and ads to build brand awareness.', category: 'brand-promotion' },
  { question: 'I need to rebrand my company', answer: 'We offer complete rebranding services from logo and identity to website redesign and marketing collateral.', category: 'brand-promotion' },

  // ── INDUSTRY-SPECIFIC ──────────────────────────────────────────
  { question: 'Do you work with ecommerce businesses', answer: 'Yes! E-commerce SEO, Google Shopping Ads, social ads, email marketing, and WooCommerce/Shopify development.', category: 'digital-marketing' },
  { question: 'Do you work with healthcare', answer: 'Yes, we serve hospitals, clinics, doctors, pharma, and health-tech with compliant marketing strategies.', category: 'general' },
  { question: 'Do you work with real estate', answer: 'Yes! Digital marketing, social media, websites, and PR for real estate developers and agents.', category: 'general' },
  { question: 'Do you work with education', answer: 'Yes, we help educational institutions, ed-tech startups, and coaching centers attract students.', category: 'general' },
  { question: 'Do you work with startups', answer: 'Yes! We love startups. Flexible packages and growth strategies for early-stage companies.', category: 'general' },
  { question: 'Do you work with restaurants', answer: 'Yes! Local SEO, social media, Google Business Profile for restaurants, cafes, and food brands.', category: 'general' },
  { question: 'Do you work with fashion brands', answer: 'Yes! Stunning social media campaigns, influencer partnerships, and PR for fashion and beauty brands.', category: 'general' },
  { question: 'Do you work with technology companies', answer: 'Yes! B2B marketing for SaaS, IT services, app developers, and tech companies.', category: 'general' },
  { question: 'Do you work with government organizations', answer: 'Yes, we have experience with government bodies and political organizations. Our founder has served as BJP IT Convenor for Shamli District.', category: 'political' },

  // ── LOCATION-SPECIFIC ─────────────────────────────────────────
  { question: 'Do you work in Delhi', answer: 'Yes, we serve Delhi NCR. Our Noida office is easily accessible from all parts of Delhi.', category: 'general' },
  { question: 'Do you work in Mumbai', answer: 'Yes, we have clients in Mumbai. Our digital services work across all locations.', category: 'general' },
  { question: 'Do you work in Bangalore', answer: 'Yes, we serve Bangalore clients remotely with regular video calls and reporting.', category: 'general' },
  { question: 'Do you work in Hyderabad', answer: 'Yes, we serve Hyderabad clients with the same quality through our remote delivery model.', category: 'general' },
  { question: 'Do you work in Chennai', answer: 'Yes, we work with Chennai clients with excellent remote communication and support.', category: 'general' },
  { question: 'Do you work in Pune', answer: 'Yes, we serve Pune clients seamlessly regardless of location.', category: 'general' },

  // ── PAYMENT / FINANCIAL ────────────────────────────────────────
  { question: 'Do you offer EMI', answer: 'Flexible payment plans available for most services. Contact us to discuss installment options.', category: 'pricing' },
  { question: 'Can I pay in installments', answer: 'Yes, installment plans available for many services. Contact us to discuss a schedule.', category: 'pricing' },
  { question: 'Do you provide GST invoice', answer: 'Yes, GST-compliant invoices provided for all services.', category: 'general' },
  { question: 'Do you charge GST', answer: 'Yes, GST is applicable on all services as per government regulations.', category: 'general' },
  { question: 'What is your cancellation policy', answer: 'We offer flexible engagement models without lock-in contracts. Digital products are non-refundable.', category: 'general' },
  { question: 'Can I cancel anytime', answer: 'We have flexible engagement models without long-term contracts. Contact your account manager for terms.', category: 'general' },

  // ── TECHNICAL ──────────────────────────────────────────────────
  { question: 'What technology do you use for websites', answer: 'Next.js, React, Node.js, MongoDB for custom sites. WordPress for CMS-based sites.', category: 'technology' },
  { question: 'Do you build React websites', answer: 'Yes, we build React and Next.js websites for high-performance web applications.', category: 'web-development' },
  { question: 'Do you use Next.js', answer: 'Yes, Next.js is our preferred framework for custom web development projects.', category: 'technology' },
  { question: 'Where do you host websites', answer: 'We recommend Vercel, Netlify, and cloud providers. We help configure the best hosting environment.', category: 'web-development' },
  { question: 'Do you offer website maintenance', answer: 'Yes! Ongoing maintenance including updates, backups, security, and performance optimization.', category: 'web-development' },
  { question: 'Can you redesign my existing website', answer: 'Yes! We transform existing sites with modern UI/UX, better performance, and improved SEO.', category: 'web-development' },

  // ── GUARANTEE / TRUST ──────────────────────────────────────────
  { question: 'Do you guarantee SEO results', answer: 'We guarantee our commitment and expertise. While rankings depend on many factors, we have a proven track record.', category: 'seo-ppc' },
  { question: 'Do you guarantee media coverage', answer: 'Our press release package assures 80+ website coverage. Broader PR campaigns maximize coverage but individual publications vary.', category: 'digital-pr' },
  { question: 'How do I know you are legitimate', answer: 'Founded 2017, 4000+ clients, award-winning, Google Partner and Meta Partner. See our About Us page!', category: 'about' },
  { question: 'Are you registered company', answer: 'Yes, registered in Noida, Uttar Pradesh. We provide GST invoices for all services.', category: 'about' },

  // ── FREE SEO AUDIT ─────────────────────────────────────────────
  { question: 'What is your free SEO audit tool', answer: 'Free SEO audit analyzes PageSpeed, SSL, meta tags, structured data, HTML validation, and more. No credit card!', category: 'seo-audit' },
  { question: 'How does the free SEO audit work', answer: 'Enter your name, email, phone, and website URL. We send a comprehensive report to your email. 100% free!', category: 'seo-audit' },
  { question: 'Is the SEO audit really free', answer: 'Yes, 100% free! No credit card needed. Complete report sent to your email.', category: 'seo-audit' },

  // ── CHATBOT ITSELF ─────────────────────────────────────────────
  { question: 'Are you a bot', answer: 'Yes, I am an AI chatbot for DigiSharks. I can answer questions about services, pricing, and company info.', category: 'general' },
  { question: 'Is this AI', answer: 'Yes! You are chatting with an AI-powered assistant. I can help or connect you with our human team.', category: 'general' },
  { question: 'Can I talk to a human', answer: 'Call +91 96273 32332 or email marketing@digisharkscommunications.com to speak with our team.', category: 'general' },

  // ── THE INDIAN ALERT ──────────────────────────────────────────
  { question: 'What is The Indian Alert', answer: 'The Indian Alert (theindianalert.com) is a news platform founded by Vansh Mehra covering Politics, Entertainment, Sports, and Current Affairs.', category: 'about' },
  { question: 'Who runs The Indian Alert', answer: 'Founded and managed by Vansh Mehra, Founder and MD of DigiSharks Communications.', category: 'about' },

  // ── SOCIAL MEDIA SPECIFIC ─────────────────────────────────────
  { question: 'Facebook ads cost', answer: 'Average CPC in India ranges from Rs 5-30. We optimize campaigns for the lowest cost per result.', category: 'social-media' },
  { question: 'Instagram Reels', answer: 'Yes, we create Reels as part of social media strategy. They are the best way to reach new audiences on Instagram.', category: 'social-media' },
  { question: 'how many posts per week', answer: '3-5 posts per week for Instagram, 3-4 for Facebook, 2-3 for LinkedIn recommended.', category: 'social-media' },
  { question: 'LinkedIn lead generation', answer: 'Yes, we generate B2B leads through LinkedIn profile optimization, content strategy, and targeted ads.', category: 'social-media' },
  { question: 'YouTube channel management', answer: 'Yes, we manage YouTube channels including content strategy, video production, and audience growth.', category: 'social-media' },

  // ── CONTENT-SPECIFIC ──────────────────────────────────────────
  { question: 'blog writing services', answer: 'We write SEO-optimized blog posts that attract readers, establish authority, and improve rankings.', category: 'content-creation' },
  { question: 'website copywriting', answer: 'Persuasive, SEO-friendly website copy that converts. Homepage, about, services, and product descriptions.', category: 'content-creation' },
  { question: 'SEO content writing', answer: 'Researched, optimized content that ranks on Google while engaging your audience.', category: 'content-creation' },

  // ── AWARDS ─────────────────────────────────────────────────────
  { question: 'Is DigiSharks award winning', answer: 'Yes! Top 10 CEOs, Top 10 Dynamic Entrepreneurs, Top 10 PR Leaders, Clutch Top PPC Company, Google Partner, Meta Partner.', category: 'about' },
  { question: 'Are you Google Partner', answer: 'Yes, certified Google Partner with expertise in Google Ads and digital marketing.', category: 'about' },
  { question: 'Are you Meta Business Partner', answer: 'Yes, certified Meta Business Partner for Facebook and Instagram advertising expertise.', category: 'about' },

  // ── DATA / PRIVACY ────────────────────────────────────────────
  { question: 'How do you protect my data', answer: 'Strict confidentiality, industry-standard security, SSL encryption. Never shared without consent.', category: 'general' },
  { question: 'Do you share client data', answer: 'Never. Your information is used solely for delivering our services with strict confidentiality.', category: 'general' },

  // ── TIMING ─────────────────────────────────────────────────────
  { question: 'Are you open on Saturdays', answer: 'Yes, open Saturdays 10 AM to 7 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'Are you open on Sunday', answer: 'No, closed on Sundays. Hours: Monday to Saturday, 10 AM to 7 PM IST.', category: 'general' },
  { question: 'Weekend support', answer: 'Open Saturdays 10 AM to 7 PM. Closed Sundays. Email us for next business day response.', category: 'general' },

  // ── FOLLOW-UP / CONVERSATION ──────────────────────────────────
  { question: 'Can you explain more', answer: 'I would be happy to provide more details! Which service are you interested in: SEO, PR, Web Development, Social Media, or Branding?', category: 'general' },
  { question: 'Give me more details', answer: 'Sure! Our main services are Digital PR, SEO and PPC, Social Media Marketing, Web Development, and Brand Promotion.', category: 'general' },
  { question: 'What else do you do', answer: 'We also offer Graphic Design, Content Creation, ORM, Email Marketing, SMS Marketing, Video Production, and Event Management.', category: 'services' },
  { question: 'What digital products do you sell', answer: 'The PAN India Updated Database with verified contacts across 40+ industries and 145+ categories. Priced at just Rs 299 with lifetime access.', category: 'products' },
  { question: 'How to buy the database', answer: 'Visit our Digital Products page, click Buy Now, complete secure payment via Razorpay, and get instant download access.', category: 'products' },
  { question: 'What is included in the database', answer: 'Verified active contacts including entrepreneurs, business owners, CEOs, and professionals across 40+ industries. Available in CSV and Excel formats.', category: 'products' },
  { question: 'Is the database good for email marketing', answer: 'Yes! Perfect for email marketing, SMS campaigns, lead generation, cold outreach, and B2B sales.', category: 'products' },

  // ── POLITICAL / ELECTION CAMPAIGN (gap-filler phrasings) ───────────
  { question: 'election campaign', answer: 'We offer comprehensive election campaign services including strategy, booth management, voter outreach, digital communication, and IT cell operations. Managed 500+ booths. Contact us at +91 96273 32332.', category: 'political' },
  { question: 'election campaign management', answer: 'We provide end-to-end election campaign management — from strategy development and voter outreach to booth management and IT operations. Our team has managed 500+ booths across multiple state and national elections.', category: 'political' },
  { question: 'election campaign management services', answer: 'Our election campaign management services include booth-level management, voter outreach, digital communication, IT cell operations, campaign strategy, and real-time ground reporting. Contact +91 96273 32332 for a consultation.', category: 'political' },
  { question: 'election campaign strategy', answer: 'We develop comprehensive election campaign strategies encompassing voter targeting, message development, communication channels, resource allocation, ground operations, digital presence, and timeline planning.', category: 'political' },
  { question: 'election campaign support', answer: 'We provide full election campaign support including strategy, booth management, voter outreach, digital communication, social media management, and ground operations. Let us help you win!', category: 'political' },
  { question: 'election campaign digital marketing', answer: 'Our digital election campaign services include social media management, targeted ads, WhatsApp broadcasts, online reputation management, and digital voter engagement. We help candidates connect with voters online.', category: 'political' },
  { question: 'election marketing', answer: 'Election marketing combines digital ads, social media, SMS campaigns, content creation, and ground-level communication to reach and persuade voters effectively. We specialize in election marketing strategies.', category: 'political' },
  { question: 'election management', answer: 'We offer complete election management services including campaign planning, booth management, voter outreach, digital communication, and IT cell operations. Our team has experience across state and national elections.', category: 'political' },
  { question: 'help with election', answer: 'We can definitely help with your election campaign! Our services include campaign strategy, booth management, voter outreach, digital communication, and IT operations. Call +91 96273 32332 to discuss your needs.', category: 'political' },
  { question: 'I need help with my election campaign', answer: 'We would be happy to help with your election campaign! Our team offers comprehensive services — from strategy to booth management, voter outreach, and digital communication. Contact +91 96273 32332 for a consultation.', category: 'political' },
  { question: 'I need campaign support', answer: 'We offer full campaign support including strategy, booth management, voter outreach, digital communication, and IT cell operations. Our experienced team has managed 500+ booths. Call +91 96273 32332!', category: 'political' },
  { question: 'I want to run for election', answer: 'Great! We help candidates run successful election campaigns with comprehensive services — campaign strategy, booth management, voter outreach, digital communication, and more. Call +91 96273 32332 to get started.', category: 'political' },
  { question: 'I am contesting elections', answer: 'Congratulations! We provide end-to-end campaign management for candidates contesting elections. Our team has managed 500+ booths with proven success. Contact +91 96273 32332 for a consultation.', category: 'political' },
  { question: 'political campaign services', answer: 'Our political campaign services include campaign strategy, booth-level execution, voter outreach, digital communication, IT cell operations, social media management, and real-time reporting. Managed 500+ booths across India.', category: 'political' },
  { question: 'political campaign help', answer: 'We can help with all aspects of your political campaign! From strategy development to on-ground booth management and digital outreach. Call +91 96273 32332 — we have the experience you need.', category: 'political' },
  { question: 'political campaign strategy', answer: 'A political campaign strategy covers voter targeting, message development, channel selection, resource allocation, ground operations, digital presence, and timeline planning. We craft winning strategies.', category: 'political' },
  { question: 'political campaign digital', answer: 'Digital political campaign services include social media management, targeted advertising, WhatsApp broadcasts, website/landing pages, online reputation management, and content creation tailored for voter outreach.', category: 'political' },
  { question: 'political marketing', answer: 'Political marketing involves strategic communication to reach and persuade voters through digital ads, social media, content, events, and ground-level engagement. We have extensive political marketing experience.', category: 'political' },
  { question: 'political advertising', answer: 'We manage political advertising on Facebook, Instagram, YouTube, and Google following all platform-specific political ad guidelines and disclosure requirements.', category: 'political' },
  { question: 'election campaign management help', answer: 'Our election campaign management covers the full lifecycle — strategy development, booth execution, voter outreach, digital presence, IT operations, and performance tracking. Managed 500+ booths across India.', category: 'political' },
  { question: 'election campaign strategy help', answer: 'We develop winning election campaign strategies including voter targeting, message development, channel selection, budget allocation, timeline planning, and success metrics. Let us create your roadmap to victory.', category: 'political' },
  { question: 'campaign booth management', answer: 'Booth management is critical for election success. We handle volunteer coordination, voter identification, turnout tracking, and last-mile engagement at each booth. Managed 500+ booths with 95% turnout boost.', category: 'political' },
  { question: 'voter management', answer: 'Voter management includes database management, voter identification, turnout tracking, and targeted communication. We help optimize every vote through data-driven strategies.', category: 'political' },
  { question: 'voter outreach', answer: 'Voter outreach connects with voters through door-to-door campaigns, phone calls, digital communication, community events, and targeted messages. We design comprehensive outreach programs.', category: 'political' },
  { question: 'election IT cell', answer: 'We set up and manage IT cells for election campaigns handling digital strategy, social media management, data analytics, voter database management, and real-time reporting and monitoring.', category: 'political' },
  { question: 'how to win election', answer: 'Winning requires a strong strategy, effective booth management, voter outreach, digital presence, and ground execution. We help candidates build all these elements. Contact +91 96273 32332 for a strategy session.', category: 'political' },
  { question: 'candidate campaign', answer: 'We help candidates run successful campaigns with end-to-end services — strategy, booth management, voter outreach, digital communication, and IT operations. Managed 500+ booths across India.', category: 'political' },
  { question: 'local election campaign', answer: 'Yes, we offer political campaign services for all levels — local municipal elections, state assembly elections, and national general elections. Strategies are customized to your constituency.', category: 'political' },
  { question: 'election campaign cost', answer: 'Election campaign costs vary based on scope, duration, constituency size, and services required. Contact +91 96273 32332 for a customized quote based on your specific needs.', category: 'political' },
  { question: 'political campaign pricing', answer: 'Political campaign pricing depends on scale, services, and duration. Contact us at +91 96273 32332 for a personalized consultation and quote.', category: 'political' },
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
    console.error('MONGODB_URI environment variable is not set.')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

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
    const errors = []
    const totalEntries = GAP_ENTRIES.length

    const cats = [...new Set(GAP_ENTRIES.map(e => e.category))]
    console.log('Categories: ' + cats.join(', '))
    console.log('Total gap-filler entries: ' + totalEntries)
    console.log('')

    for (const entry of GAP_ENTRIES) {
      try {
        const existing = await ChatbotQA.findOne({
          question: { $regex: '^' + escapeRegex(entry.question) + '$', $options: 'i' },
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
      } catch (err) {
        errors.push('Error inserting "' + entry.question + '": ' + err.message)
      }
    }

    const totalCount = await ChatbotQA.countDocuments({})

    console.log('')
    console.log('Gap-filler seeding complete!')
    console.log('This batch: ' + inserted + ' inserted, ' + skipped + ' skipped' + (errors.length ? ', ' + errors.length + ' errors' : ''))
    console.log('TOTAL in database: ' + totalCount)
    console.log('Categories: ' + cats.length)

    if (errors.length > 0) {
      console.error('Errors:')
      errors.forEach(e => console.error('  ' + e))
    }

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (err) {
    console.error('Error seeding gap-filler queries:', err)
    process.exit(1)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

seedQA()
