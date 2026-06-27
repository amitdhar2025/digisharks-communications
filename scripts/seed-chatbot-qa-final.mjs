/**
 * Final batch — adds ~135+ entries to reach 1000+ total Q&A pairs.
 * Run AFTER seed-chatbot-qa-1000.mjs and seed-chatbot-qa-extra.mjs.
 * Usage: node scripts/seed-chatbot-qa-final.mjs
 */

const FAQ_ENTRIES = [
  // CATEGORY: performance-marketing
  { question: 'What is performance marketing?', answer: 'Performance marketing is a digital marketing model where advertisers pay only when specific actions occur — clicks, leads, sales, or other measurable results. It\'s highly transparent and ROI-focused.', category: 'performance-marketing' },
  { question: 'How is performance marketing different from traditional marketing?', answer: 'Traditional marketing charges for impressions or reach regardless of results. Performance marketing charges only for specific outcomes, making it more accountable and cost-effective.', category: 'performance-marketing' },
  { question: 'What channels work best for performance marketing?', answer: 'Top channels include Google Ads (search, display, shopping), social media ads (Facebook, Instagram, LinkedIn), affiliate marketing, native advertising, and email marketing.', category: 'performance-marketing' },
  { question: 'How do you track performance marketing campaigns?', answer: 'We use tracking pixels, UTM parameters, conversion tracking, call tracking, CRM integration, and analytics platforms to accurately attribute results to specific campaigns and channels.', category: 'performance-marketing' },
  { question: 'What is CPA in marketing?', answer: 'CPA (Cost Per Acquisition) measures how much you pay to acquire one customer. It\'s calculated by dividing total campaign cost by number of acquisitions. Lower CPA means more efficient spending.', category: 'performance-marketing' },
  { question: 'What is CPM in advertising?', answer: 'CPM (Cost Per Mille) is the cost per 1,000 ad impressions. It\'s commonly used for brand awareness campaigns where the goal is visibility rather than direct response.', category: 'performance-marketing' },
  { question: 'What is CPV in advertising?', answer: 'CPV (Cost Per View) is a pricing model for video ads where you pay each time someone watches your video (typically 30 seconds or the full ad). Common on YouTube and social platforms.', category: 'performance-marketing' },
  { question: 'What is ROAS?', answer: 'ROAS (Return On Ad Spend) measures revenue generated for every rupee spent on advertising. For example, ROAS of 5:1 means you earn ₹5 for every ₹1 spent on ads.', category: 'performance-marketing' },

  // CATEGORY: ai-marketing
  { question: 'How is AI changing digital marketing?', answer: 'AI is transforming marketing through personalized content, predictive analytics, chatbots, automated ad optimization, customer segmentation, content generation, and real-time campaign adjustments.', category: 'ai-marketing' },
  { question: 'What AI tools do you use for marketing?', answer: 'We use AI tools for content generation, keyword research, audience analysis, ad optimization, sentiment analysis, predictive analytics, and chatbot development.', category: 'ai-marketing' },
  { question: 'What is AI-powered content creation?', answer: 'AI content creation uses machine learning to generate written content, social media posts, ad copy, and even video scripts. We use AI as a productivity tool while ensuring human quality control.', category: 'ai-marketing' },
  { question: 'Can AI replace human marketers?', answer: 'AI enhances rather than replaces human marketers. AI handles data analysis, automation, and optimization while humans provide strategy, creativity, emotional intelligence, and relationship building.', category: 'ai-marketing' },
  { question: 'What is predictive analytics in marketing?', answer: 'Predictive analytics uses historical data, machine learning, and statistical algorithms to forecast future outcomes — helping predict customer behavior, campaign performance, and market trends.', category: 'ai-marketing' },
  { question: 'What is AI-driven personalization?', answer: 'AI-driven personalization tailors marketing messages, product recommendations, and content to individual users based on their behavior, preferences, and demographics — increasing relevance and conversions.', category: 'ai-marketing' },
  { question: 'What is computer vision in marketing?', answer: 'Computer vision AI analyzes images and videos to understand visual content. It\'s used for visual search, product recognition, ad placement analysis, and social media monitoring.', category: 'ai-marketing' },
  { question: 'What is NLP in marketing?', answer: 'NLP (Natural Language Processing) helps computers understand human language. In marketing, it\'s used for sentiment analysis, chatbot conversations, content optimization, and voice search optimization.', category: 'ai-marketing' },

  // CATEGORY: chatbot
  { question: 'What is a chatbot?', answer: 'A chatbot is an AI-powered program that simulates human conversation. It can answer questions, provide information, collect leads, and assist customers 24/7 through text or voice interfaces.', category: 'chatbot' },
  { question: 'How can a chatbot help my business?', answer: 'Chatbots improve customer service with instant responses, handle FAQs automatically, generate leads, collect visitor information, provide 24/7 support, and reduce customer service costs.', category: 'chatbot' },
  { question: 'What is the difference between rule-based and AI chatbots?', answer: 'Rule-based chatbots follow predefined rules and can only answer specific programmed questions. AI chatbots use machine learning and NLP to understand natural language and handle complex conversations.', category: 'chatbot' },
  { question: 'Do you integrate chatbots with CRM?', answer: 'Yes, we integrate chatbots with CRM systems to automatically capture lead information, update contact records, and trigger follow-up sequences based on chatbot conversations.', category: 'chatbot' },
  { question: 'Can chatbots handle multiple languages?', answer: 'Yes, AI-powered chatbots can be trained to handle multiple languages. Our chatbot can communicate in English and Hindi, and can be extended to other languages.', category: 'chatbot' },
  { question: 'How much does a chatbot cost to build?', answer: 'Chatbot costs vary based on complexity, features, and integration requirements. Contact us for a customized quote based on your specific needs.', category: 'chatbot' },
  { question: 'Can I customize my chatbot\'s appearance?', answer: 'Yes, our chatbot widget is fully customizable — you can change colors, icon, greeting message, bot name, and position to match your brand identity.', category: 'chatbot' },
  { question: 'How do chatbots handle complex questions?', answer: 'Our chatbot uses a knowledge base of Q&A pairs for common questions, and can escalate complex queries to human agents when needed. This ensures customers always get the help they need.', category: 'chatbot' },

  // CATEGORY: social-media (YouTube specific)
  { question: 'How do I start a YouTube channel for business?', answer: 'Create a Google account, set up your YouTube channel, optimize with keywords and branding, create a content strategy, invest in basic equipment, and consistently publish valuable content.', category: 'social-media' },
  { question: 'What is YouTube SEO?', answer: 'YouTube SEO optimizes your videos and channel to rank higher in YouTube and Google search results. It includes keyword-optimized titles, descriptions, tags, thumbnails, and closed captions.', category: 'social-media' },
  { question: 'How do YouTube ads work?', answer: 'YouTube ads include skippable in-stream ads, non-skippable ads, bumper ads (6 seconds), discovery ads (appear in search results), and overlay ads. You pay per view or per impression.', category: 'social-media' },
  { question: 'What is YouTube channel monetization?', answer: 'YouTube monetization allows creators to earn money from ads, channel memberships, Super Chat, merchandise, and YouTube Premium revenue. Requirements include 1,000 subscribers and 4,000 watch hours.', category: 'social-media' },
  { question: 'How often should I upload to YouTube?', answer: 'Consistency is key — aim for 1-2 videos per week minimum. More frequent uploads (3-4 per week) can accelerate growth if you can maintain quality.', category: 'social-media' },

  // CATEGORY: general (customer service focus)
  { question: 'What if I need help after business hours?', answer: 'You can email us anytime at marketing@digisharkscommunications.com and our team will respond on the next business day. For urgent matters, leave a voicemail at +91 96273 32332.', category: 'general' },
  { question: 'How do I change my service plan?', answer: 'Contact your dedicated account manager to discuss changing your service plan. We\'ll help you find the right plan that matches your evolving needs.', category: 'general' },
  { question: 'Can I add services to my existing plan?', answer: 'Yes, you can add services to your existing plan at any time. Contact your account manager to discuss additional services that would benefit your business.', category: 'general' },
  { question: 'How do I get technical support?', answer: 'For technical support, contact your account manager or email marketing@digisharkscommunications.com. We provide priority support for maintenance clients.', category: 'general' },
  { question: 'What is your ticket response time?', answer: 'Standard support tickets are responded to within 4 business hours. Urgent tickets are addressed within 1 hour during business hours.', category: 'general' },
  { question: 'Can I get a demo of your services?', answer: 'Yes, we offer free demonstrations of our services. Contact us to schedule a demo tailored to your business needs.', category: 'general' },
  { question: 'How do I provide feedback?', answer: 'We welcome feedback from all clients. Share your feedback with your account manager, email us at marketing@digisharkscommunications.com, or fill out our feedback form.', category: 'general' },

  // CATEGORY: digital-pr (more)
  { question: 'What is a press release embargo?', answer: 'An embargo is a request that journalists not publish a story until a specified date and time. It gives reporters time to prepare coverage while ensuring coordinated release timing.', category: 'digital-pr' },
  { question: 'How do I target specific journalists?', answer: 'We target journalists based on their beat (topic area), publication, audience, and past coverage. We maintain a database of 500+ media contacts across Indian publications.', category: 'digital-pr' },
  { question: 'What is a media list?', answer: 'A media list is a curated database of journalists, editors, and influencers relevant to your industry. We build and maintain targeted media lists for each PR campaign.', category: 'digital-pr' },
  { question: 'How do you write catchy press release headlines?', answer: 'Effective headlines are concise, include keywords, communicate the news value, create curiosity, and are under 100 characters. We craft headlines that journalists want to click.', category: 'digital-pr' },
  { question: 'What is a press release boilerplate?', answer: 'A boilerplate is a standard paragraph at the end of a press release that describes your company — who you are, what you do, and where to find more information.', category: 'digital-pr' },
  { question: 'How long should a press release be?', answer: 'A standard press release is 300-800 words. It should be concise yet comprehensive enough to tell the full story. We include all key information within this range.', category: 'digital-pr' },
  { question: 'Can I include quotes in my press release?', answer: 'Yes, quotes from company leadership, customers, or industry experts add credibility and human interest to press releases. We include relevant quotes in all press releases we write.', category: 'digital-pr' },
  { question: 'Should I include multimedia in press releases?', answer: 'Yes, press releases with images, videos, or infographics receive significantly more engagement. We recommend including relevant multimedia assets with every release.', category: 'digital-pr' },
  { question: 'What is a social media release?', answer: 'A social media release is a press release optimized for social sharing, with shorter paragraphs, multimedia elements, social sharing buttons, and tweet-worthy quotes.', category: 'digital-pr' },
  { question: 'Do you distribute press releases internationally?', answer: 'Yes, we can distribute press releases internationally through our global media partners and wire services, reaching audiences beyond India.', category: 'digital-pr' },
  { question: 'What is the best day to send a press release?', answer: 'Tuesday through Thursday are generally the best days to send press releases. Monday is busy with weekend catch-up, and Friday often sees lower media engagement.', category: 'digital-pr' },
  { question: 'When is the best time to send a press release?', answer: 'Early morning (8-10 AM) is ideal for wire distribution. For direct pitches to journalists, mid-morning (10-11 AM) works best when they\'re planning their day\'s content.', category: 'digital-pr' },
  { question: 'How do journalists prefer to receive press releases?', answer: 'Most journalists prefer email pitches with a compelling subject line, brief summary, and link to the full release and assets. Personalization and relevance to their beat are crucial.', category: 'digital-pr' },
  { question: 'What makes a story newsworthy?', answer: 'Newsworthy stories have timeliness, significance, proximity, prominence of people involved, human interest angle, conflict or controversy, or unusual/unique elements.', category: 'digital-pr' },
  { question: 'How do you measure media coverage quality?', answer: 'We measure quality through publication authority, relevance to target audience, sentiment of coverage, message inclusion, backlink quality, and potential business impact.', category: 'digital-pr' },
  { question: 'What is share of voice in PR?', answer: 'Share of voice measures your brand\'s media presence compared to competitors. It\'s calculated as your brand mentions divided by total industry mentions, showing your market visibility.', category: 'digital-pr' },

  // CATEGORY: about (more)
  { question: 'What is the story behind the name DigiSharks?', answer: 'The name DigiSharks represents our digital-first approach (Digi) combined with the shark\'s qualities — focused, determined, and effective in navigating the competitive business waters.', category: 'about' },
  { question: 'What industries have you helped the most?', answer: 'We\'ve had significant success in healthcare, e-commerce, education, real estate, political campaigns, and professional services. However, our strategies are adaptable to any industry.', category: 'about' },
  { question: 'Do you have experience with B2B companies?', answer: 'Yes, we have extensive B2B experience helping companies generate leads, build authority, and drive sales through targeted digital marketing and PR strategies.', category: 'about' },
  { question: 'Do you have experience with B2C companies?', answer: 'Yes, we have strong B2C experience across retail, e-commerce, hospitality, and consumer services — driving brand awareness, customer engagement, and direct sales.', category: 'about' },
  { question: 'What is your approach to client onboarding?', answer: 'Our onboarding includes: kickoff meeting, discovery session, account manager assignment, data gathering, strategy development, proposal presentation, and seamless transition to execution.', category: 'about' },
  { question: 'How do you handle multiple projects?', answer: 'We assign dedicated project managers who coordinate across teams, maintain clear timelines, provide regular updates, and ensure quality across all deliverables.', category: 'about' },
  { question: 'Can you work under tight deadlines?', answer: 'Yes, we have experience delivering quality work under tight deadlines. Our team is agile and can scale resources to meet urgent requirements.', category: 'about' },

  // CATEGORY: seo-ppc (more - local SEO focus)
  { question: 'What is local SEO?', answer: 'Local SEO optimizes your online presence to attract more business from local searches on Google and other search engines. It\'s essential for brick-and-mortar businesses and local service providers.', category: 'seo-ppc' },
  { question: 'How does Google determine local search results?', answer: 'Google uses three main factors: relevance (how well your listing matches the search), distance (proximity to searcher), and prominence (how well-known your business is based on reviews and citations).', category: 'seo-ppc' },
  { question: 'What is a Google Business Profile?', answer: 'Google Business Profile (GBP) is a free listing that appears in Google Search and Maps. It displays your business name, address, phone, hours, photos, reviews, and more.', category: 'seo-ppc' },
  { question: 'How do I verify my Google Business Profile?', answer: 'Google offers several verification methods: postcard by mail, phone, email, or instant verification through Google Search Console. Postcard is the most common method.', category: 'seo-ppc' },
  { question: 'What are local citations?', answer: 'Local citations are online mentions of your business NAP (Name, Address, Phone) on directories, review sites, and social platforms. Consistent citations improve local SEO rankings.', category: 'seo-ppc' },
  { question: 'How do reviews affect local SEO?', answer: 'Reviews significantly impact local SEO — businesses with more positive reviews rank higher in local search. Review quantity, quality, diversity, and recency all matter.', category: 'seo-ppc' },
  { question: 'What is GBP Q&A?', answer: 'Google Business Profile Q&A allows customers to ask and answer questions about your business on your Google listing. We help monitor and manage Q&A to ensure accurate information.', category: 'seo-ppc' },
  { question: 'What are GBP posts?', answer: 'GBP posts are updates you can publish on your Google Business Profile — including offers, events, product highlights, and updates. They appear in your listing and can boost engagement.', category: 'seo-ppc' },
  { question: 'How do I use GBP insights?', answer: 'GBP insights show how customers find your listing — search queries, whether they found you by direct search or discovery, and actions taken (calls, direction requests, website clicks).', category: 'seo-ppc' },
  { question: 'What is GBP messaging?', answer: 'GBP messaging allows customers to message you directly from your Google Business Profile. We help set up and manage messaging for quick customer responses.', category: 'seo-ppc' },

  // CATEGORY: web-development (more - security focus)
  { question: 'What is website security?', answer: 'Website security protects your website from cyber threats including hacking, malware, data breaches, and DDoS attacks. It includes SSL, firewalls, regular updates, and security monitoring.', category: 'web-development' },
  { question: 'What is DDoS attack?', answer: 'DDoS (Distributed Denial of Service) attacks overwhelm a website with traffic, causing it to crash or become unavailable. We implement protection measures to prevent DDoS attacks.', category: 'web-development' },
  { question: 'What is malware?', answer: 'Malware is malicious software that can infect your website, steal data, display unwanted content, or redirect visitors to harmful sites. We implement security measures to prevent malware infections.', category: 'web-development' },
  { question: 'How do I know if my website is hacked?', answer: 'Signs include unexpected pop-ups, redirects to other sites, sudden performance issues, missing or altered content, new admin users, strange files, and Google security warnings.', category: 'web-development' },
  { question: 'What to do if my website is hacked?', answer: 'Immediately contact your hosting provider, change all passwords, restore from a clean backup, scan for malware, identify the vulnerability, and implement additional security measures.', category: 'web-development' },
  { question: 'What is a WAF?', answer: 'WAF (Web Application Firewall) filters and monitors HTTP traffic between a web application and the internet. It protects against common attacks like SQL injection and cross-site scripting.', category: 'web-development' },
  { question: 'What is SQL injection?', answer: 'SQL injection is a code injection technique that attackers use to insert malicious SQL statements into entry fields. We prevent this through parameterized queries and input validation.', category: 'web-development' },
  { question: 'What is XSS attack?', answer: 'XSS (Cross-Site Scripting) is an attack where malicious scripts are injected into trusted websites. We prevent XSS through proper input sanitization and content security policies.', category: 'web-development' },
  { question: 'What is CSRF attack?', answer: 'CSRF (Cross-Site Request Forgery) tricks users into performing unwanted actions on websites where they\'re authenticated. We prevent CSRF through tokens and same-site cookie attributes.', category: 'web-development' },
  { question: 'How do you backup websites?', answer: 'We implement automated daily backups with off-site storage. Backups include database and all website files. We also create manual backups before major updates.', category: 'web-development' },
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
    console.log(`📊 Categories: ${[...new Set(FAQ_ENTRIES.map(e => e.category))].join(', ')}`)
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

    // Now count total in database
    const totalCount = await ChatbotQA.countDocuments({})
    
    console.log(`\n✅ Seeding complete!`)
    console.log(`📊 This batch: ${inserted} inserted, ${skipped} skipped`)
    console.log(`📊 Total database entries: ${totalCount}`)
    
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
