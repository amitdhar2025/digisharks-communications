import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import ChatbotQA from '@/lib/models/ChatbotQA'
import { getAdminFromRequest, isSuperAdmin } from '@/lib/auth'

/**
 * 240+ short, chatty, and shorthand Q&A entries for the chatbot.
 * Designed to match real-world user typing patterns in a chat interface.
 */

const SHORT_ENTRIES = [
  // ── PRICING SHORTCUTS ──────────────────────────────────────────────
  { question: 'SEO cost', answer: 'Our SEO package for 5 keywords is INR Rs 2,40,000. Includes keyword research, link building, on-page and off-page optimization, and ongoing monitoring. Contact us for custom pricing.', category: 'pricing' },
  { question: 'SEO price', answer: 'Our SEO package for 5 keywords is INR Rs 2,40,000. We also offer flexible payment options. Contact us for a customized quote.', category: 'pricing' },
  { question: 'SEO charges', answer: 'Our SEO services start at INR Rs 2,40,000 for a 5-keyword package. Pricing varies based on competition and scope. Contact us for a detailed quote.', category: 'pricing' },
  { question: 'SEO package cost', answer: 'Our 5-keyword SEO package is INR Rs 2,40,000. Includes keyword research, link building, content optimization, technical SEO, and monthly reporting.', category: 'pricing' },
  { question: 'website cost', answer: 'Our website design starts at Rs 10,500 for a 10-page WordPress site with CMS, mobile responsive layout, contact form, and SEO optimization.', category: 'pricing' },
  { question: 'website price', answer: 'Basic websites start at Rs 10,500. E-commerce and custom sites vary based on requirements. Contact us for a personalized quote.', category: 'pricing' },
  { question: 'website charges', answer: 'Our website packages start from Rs 10,500 (10-page WordPress) and go up based on complexity. We provide detailed quotes with no hidden costs.', category: 'pricing' },
  { question: 'web development cost', answer: 'Web development costs depend on your requirements. A basic business website starts at Rs 10,500. E-commerce and custom applications are priced based on scope.', category: 'pricing' },
  { question: 'SMM cost', answer: 'Our social media marketing plan starts at Rs 20,000 per month. Includes Facebook and Instagram management, content creation, ad campaigns, and weekly reporting.', category: 'pricing' },
  { question: 'social media cost', answer: 'Social media management starts at Rs 20,000 per month. Custom packages available based on number of platforms and content volume.', category: 'pricing' },
  { question: 'PR cost', answer: 'Our press release package is Rs 8,500 (one-time). Includes 2 press releases, distribution to 500+ reporters, and assured coverage on 80+ websites.', category: 'pricing' },
  { question: 'PR price', answer: 'Press release services start at Rs 8,500 per package. For comprehensive PR campaigns, pricing depends on scope and duration.', category: 'pricing' },
  { question: 'press release cost', answer: 'Press release package: Rs 8,500 (one-time). Includes 2 releases, proof reading, up to 800 words each, distribution to 500+ reporters, and 80+ website coverage.', category: 'pricing' },
  { question: 'press release price', answer: 'Our press release services are priced at Rs 8,500 per package. Includes writing and distribution across 80+ websites.', category: 'pricing' },
  { question: 'brand promotion cost', answer: 'Brand promotion services start at Rs 50,000. The final cost depends on the scope of work, channels, and campaign duration.', category: 'pricing' },
  { question: 'event cost', answer: 'Event management services start at Rs 50,000 per day. Costs vary based on event type, scale, and requirements.', category: 'pricing' },
  { question: 'event management cost', answer: 'Event management starts at Rs 50,000 per day. We organize corporate events, award shows, product launches, and more.', category: 'pricing' },
  { question: 'database cost', answer: 'The PAN India Database is priced at just ₹299 (92% off original ₹3,999). One-time payment with lifetime access and free updates.', category: 'products' },
  { question: 'database price', answer: 'PAN India Database: ₹299 only (original ₹3,999). Includes 40+ industries, 145+ categories, and verified contacts. Instant download.', category: 'products' },
  { question: 'starting price', answer: 'Services start at: Press Release — Rs 8,500, Website — Rs 10,500, SMM — Rs 20,000/month, Brand Promotion — Rs 50,000, SEO — Rs 2,40,000.', category: 'pricing' },
  { question: 'minimum budget', answer: 'Our services start from Rs 8,500 (Press Release) to Rs 2,40,000 (SEO). We have options for every budget — contact us to discuss.', category: 'pricing' },

  // ── CONTACT SHORTCUTS ──────────────────────────────────────────────
  { question: 'your phone', answer: 'Call us at +91 96273 32332. We\'re available Monday to Saturday, 10:00 AM – 7:00 PM IST.', category: 'contact' },
  { question: 'phone number', answer: '+91 96273 32332 is our contact number. You can call or WhatsApp us during business hours.', category: 'contact' },
  { question: 'phone no', answer: 'Our phone number is +91 96273 32332. Available Mon—Sat, 10 AM – 7 PM IST.', category: 'contact' },
  { question: 'contact number', answer: 'You can reach us at +91 96273 32332. Available Monday to Saturday, 10:00 AM – 7:00 PM IST.', category: 'contact' },
  { question: 'your email', answer: 'Email us at marketing@digisharkscommunications.com. We typically respond within 24 hours during business days.', category: 'contact' },
  { question: 'email id', answer: 'Our email address is marketing@digisharkscommunications.com. We respond within 24 hours on business days.', category: 'contact' },
  { question: 'email address', answer: 'marketing@digisharkscommunications.com is our email. Drop us a message and we\'ll get back to you promptly.', category: 'contact' },
  { question: 'your address', answer: 'We\'re located at B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301. Walk-ins welcome during business hours!', category: 'contact' },
  { question: 'office address', answer: 'DigiSharks Communications, B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India.', category: 'contact' },
  { question: 'office location', answer: 'Our office is in Sector 63, Noida, near the Noida-Greater Noida Expressway. Nearest metro: Sector 62 Metro Station.', category: 'contact' },
  { question: 'where are you', answer: 'We\'re based in Noida, Sector 63, Uttar Pradesh. B-2, C-87, C Block, Sector 63, Noida – 201301.', category: 'contact' },
  { question: 'your location', answer: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301. Feel free to visit us!', category: 'contact' },
  { question: 'WhatsApp number', answer: 'You can reach us on WhatsApp at +91 96273 32332. Message us and our team will respond during business hours.', category: 'contact' },
  { question: 'your WhatsApp', answer: 'Our WhatsApp number is +91 96273 32332. Message us anytime!', category: 'contact' },

  // ── GENERAL SHORTCUTS ──────────────────────────────────────────────
  { question: 'business hours', answer: 'We\'re open Monday to Saturday, 10:00 AM – 7:00 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'working hours', answer: 'Monday to Saturday, 10:00 AM to 7:00 PM IST. Closed on Sundays.', category: 'general' },
  { question: 'office timing', answer: 'Office hours: Mon—Sat, 10 AM – 7 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'open time', answer: 'We\'re open Monday to Saturday from 10:00 AM to 7:00 PM IST. Closed on Sundays.', category: 'general' },
  { question: 'weekend open', answer: 'We\'re open on Saturdays (10 AM – 7 PM IST). Sundays are closed.', category: 'general' },
  { question: 'free consultation', answer: 'Yes! We offer a free 30-minute strategy call to understand your business goals and recommend a custom growth roadmap. Call +91 96273 32332.', category: 'general' },
  { question: 'free quote', answer: 'Yes, we provide free quotes! Contact us at +91 96273 32332 for a no-obligation consultation.', category: 'general' },
  { question: 'contract required', answer: 'No, we don\'t require long-term contracts. We offer flexible month-to-month engagement models.', category: 'general' },
  { question: 'payment modes', answer: 'We accept payments via Razorpay including Credit Cards, Debit Cards, NetBanking, UPI, and digital wallets.', category: 'pricing' },
  { question: 'how to pay', answer: 'We accept all major payment methods through Razorpay — cards, net banking, UPI, and digital wallets.', category: 'pricing' },

  // ── SERVICE SHORTCUTS ──────────────────────────────────────────────
  { question: 'your services', answer: 'We offer Digital PR & Media, Press Release Distribution, SEO & PPC, AI SEO/AEO/GEO, Social Media Marketing, Web Development, Brand Promotion, Political Campaigns, Event Management, and more!', category: 'services' },
  { question: 'service list', answer: 'Digital PR, SEO, PPC, Social Media Marketing, Web Development, Brand Promotion, Political Campaigns, Event Management, Graphic Design, Content Creation, ORM, Media Management.', category: 'services' },
  { question: 'SEO services', answer: 'We offer comprehensive SEO — keyword research, on-page optimization, technical SEO, link building, content optimization, and monitoring. Also AI SEO, AEO, and GEO.', category: 'seo-ppc' },
  { question: 'SEO package', answer: 'Our 5-keyword SEO package is Rs 2,40,000. Includes keyword research, link building, natural listings, article submission, and reputation monitoring.', category: 'seo-ppc' },
  { question: 'SEO help', answer: 'We can help improve your search rankings through comprehensive SEO — keyword research, content optimization, technical fixes, link building, and ongoing monitoring.', category: 'seo-ppc' },
  { question: 'PPC services', answer: 'We offer Google Ads management — Search Ads, Display Ads, Shopping Ads, YouTube Ads, and Remarketing. Optimized for maximum ROI.', category: 'seo-ppc' },
  { question: 'Google Ads', answer: 'We manage Google Ads campaigns — Search, Display, Shopping, and Video. Continuous optimization for best ROI.', category: 'seo-ppc' },
  { question: 'PR services', answer: 'Our Digital PR services include press release writing, distribution to 500+ journalists, media coverage on 80+ websites, crisis communication, and reputation management.', category: 'digital-pr' },
  { question: 'press release', answer: 'Our press release package: Rs 8,500 for 2 releases, up to 800 words each, distributed to 500+ journalists, assured coverage on 80+ websites.', category: 'digital-pr' },
  { question: 'media coverage', answer: 'We secure media coverage through our network of 500+ journalists and partners including Times of India, Hindustan Times, Forbes India, and Yahoo News.', category: 'digital-pr' },
  { question: 'SMM services', answer: 'We offer social media marketing across Facebook, Instagram, LinkedIn, Twitter, and YouTube. Content creation, community management, paid ads, and analytics.', category: 'social-media' },
  { question: 'web development', answer: 'We build business websites, e-commerce stores, landing pages, WordPress sites, and custom web applications. All mobile-responsive and SEO-friendly.', category: 'web-development' },
  { question: 'website design', answer: 'We design modern, conversion-focused websites. Rs 10,500 package includes 10-page WordPress site with CMS and SEO optimization.', category: 'web-development' },
  { question: 'ecommerce website', answer: 'We build e-commerce sites on WooCommerce, Shopify, and custom platforms. Product management, payment gateway, cart, order tracking, inventory.', category: 'web-development' },
  { question: 'online store', answer: 'We create online stores with product management, secure payments, shopping cart, order tracking, and inventory management.', category: 'web-development' },
  { question: 'WordPress site', answer: 'Yes, we specialize in WordPress! Custom themes, plugin integration, speed optimization, security hardening, and maintenance.', category: 'web-development' },
  { question: 'landing page', answer: 'We create high-converting landing pages optimized for lead capture and campaigns. Mobile-friendly, fast-loading, conversion-focused.', category: 'web-development' },
  { question: 'brand promotion', answer: 'Our brand promotion services include digital branding, media promotion, social media brand building, influencer marketing, and corporate branding. Starts at Rs 50,000.', category: 'brand-promotion' },
  { question: 'ORM services', answer: 'Our ORM services monitor, protect, and improve your digital reputation. We track mentions, manage reviews, and address negative content.', category: 'reputation-management' },
  { question: 'political campaign', answer: 'We offer political campaign management — booth management, voter outreach, digital communication, IT cell operations. Managed 500+ booths with 95% turnout boost.', category: 'political' },
  { question: 'event management', answer: 'We organize corporate events, celebrity events, award shows, product launches, road shows, fashion shows. Starts at Rs 50,000/day.', category: 'events' },
  { question: 'influencer marketing', answer: 'We connect your brand with the right influencers for authentic promotion. Discovery, outreach, campaign management, performance tracking.', category: 'influencer' },
  { question: 'email marketing', answer: 'We offer email marketing — strategy, design, list management, automation workflows, and analytics. Build and nurture your email list!', category: 'email-marketing' },
  { question: 'SMS marketing', answer: 'We offer SMS marketing with 98% open rates — promotions, alerts, reminders, and customer communication.', category: 'sms-marketing' },
  { question: 'video production', answer: 'We create promotional videos, explainer videos, social media videos, testimonial videos, and corporate videos.', category: 'content-creation' },
  { question: 'SEO audit', answer: 'We offer comprehensive SEO audits analyzing technical health, on-page optimization, content quality, backlink profile, and competitors.', category: 'seo-audit' },
  { question: 'graphic design', answer: 'We offer graphic design — logos, social media creatives, marketing collateral, brochures, flyers, business cards, infographics, and brand identity.', category: 'graphic-design' },
  { question: 'content writing', answer: 'We create SEO-optimized content — website copy, blog posts, social media content, marketing copy, and press releases.', category: 'content-creation' },
  { question: 'logo design', answer: 'Yes, we create custom, professional logos that reflect your brand identity. Part of our branding and graphic design services.', category: 'graphic-design' },

  // ── ABOUT SHORTCUTS ────────────────────────────────────────────────
  { question: 'what you do', answer: 'We\'re a top AI-powered Digital PR and Marketing Agency. We help businesses grow through Digital PR, SEO, Social Media, Web Development, and Brand Promotion.', category: 'about' },
  { question: 'what do you do', answer: 'DigiSharks Communications is a premier digital marketing and PR agency. End-to-end services from SEO to web development to political campaigns.', category: 'about' },
  { question: 'your company', answer: 'DigiSharks Communications was founded in 2017 by Vansh Mehra. AI-powered Digital PR and Marketing agency with 4000+ customers and 500+ campaigns.', category: 'about' },
  { question: 'about you', answer: 'DigiSharks Communications — AI-powered Digital PR and Marketing agency founded in 2017. 4000+ clients, 500+ campaigns, 98% retention rate.', category: 'about' },
  { question: 'founder name', answer: 'Our founder is Vansh Mehra. He established DigiSharks in 2017 and has been recognized among India\'s Top 10 CEOs.', category: 'about' },
  { question: 'founder', answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. Founded in 2017.', category: 'about' },
  { question: 'established year', answer: 'DigiSharks Communications was established in 2017 in New Delhi, India.', category: 'about' },
  { question: 'since when', answer: 'We\'ve been in business since 2017 — over 8 years of helping businesses grow through digital PR and marketing.', category: 'about' },
  { question: 'team size', answer: 'We have 25+ specialists including digital marketers, PR professionals, web developers, designers, and strategists.', category: 'about' },
  { question: 'how many employees', answer: '25+ team members across digital marketing, PR, web development, design, and campaign management.', category: 'about' },
  { question: 'client count', answer: 'We\'ve served 4000+ satisfied customers since 2017.', category: 'about' },
  { question: 'how many clients', answer: '4000+ clients and 500+ successful campaigns across multiple industries.', category: 'about' },
  { question: 'campaign count', answer: '500+ successful digital PR and marketing campaigns across various industries.', category: 'about' },
  { question: 'projects done', answer: '120+ projects and 500+ campaigns for 4000+ clients since 2017.', category: 'about' },

  // ── CHATTY "I want..." QUERIES ─────────────────────────────────────
  { question: 'I want SEO services', answer: 'We offer comprehensive SEO — keyword research, on-page and technical optimization, link building, and monthly reporting. Our 5-keyword package is Rs 2,40,000.', category: 'seo-ppc' },
  { question: 'I want a website', answer: 'We build beautiful websites! Starting at Rs 10,500 for a 10-page WordPress site. E-commerce, landing pages, and custom apps also available.', category: 'web-development' },
  { question: 'I want PR for my business', answer: 'We can help with PR! Press release writing, distribution to 500+ journalists, coverage on 80+ websites. Packages start at Rs 8,500.', category: 'digital-pr' },
  { question: 'I want social media marketing', answer: 'We manage Facebook, Instagram, LinkedIn, Twitter, and YouTube. Content creation, community management, and paid ads. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'I want to grow my business', answer: 'We help businesses grow through digital PR, SEO, social media, web development, and branding. Integrated approach for maximum impact.', category: 'digital-marketing' },
  { question: 'I want a logo', answer: 'We design custom logos that capture your brand identity. Part of our graphic design and branding services.', category: 'graphic-design' },
  { question: 'I want branding help', answer: 'We offer complete branding — logo design, brand identity, guidelines, strategy, and marketing collateral.', category: 'brand-promotion' },
  { question: 'I want to rank higher on Google', answer: 'Our SEO services improve Google rankings through keyword optimization, content strategy, technical improvements, and link building. Results in 3-6 months.', category: 'seo-ppc' },
  { question: 'I want to run Google Ads', answer: 'We manage Google Ads — Search, Display, Shopping, and Video. Optimized for maximum ROI with continuous testing.', category: 'seo-ppc' },
  { question: 'I want more customers', answer: 'We drive customer acquisition through SEO, PPC, social media, and PR. Data-driven strategies targeting the right audience.', category: 'digital-marketing' },

  // ── CHATTY "I need..." QUERIES ─────────────────────────────────────
  { question: 'I need a digital marketing agency', answer: 'You\'ve found us! DigiSharks offers complete digital marketing — SEO, PPC, social media, web development, PR, and branding.', category: 'digital-marketing' },
  { question: 'I need help with marketing', answer: 'We can help! Our services cover SEO, social media, PR, web development, and branding. Free consultation available.', category: 'digital-marketing' },
  { question: 'I need a website urgently', answer: 'We offer expedited web development for rush projects. Contact us with your timeline!', category: 'web-development' },
  { question: 'I need SEO help urgently', answer: 'We can prioritize your SEO project. Call +91 96273 32332 to discuss your timeline.', category: 'seo-ppc' },
  { question: 'I need PR help', answer: 'Our PR team is ready! Press releases, media coverage, crisis communication — we have the expertise and network.', category: 'digital-pr' },
  { question: 'I need social media help', answer: 'We manage all major platforms — content creation, posting, engagement, and ads. Let\'s build your presence!', category: 'social-media' },
  { question: 'I need content for my website', answer: 'Our team writes SEO-optimized website copy, blog posts, product descriptions, and more.', category: 'content-creation' },
  { question: 'I need a marketing strategy', answer: 'We develop comprehensive marketing strategies — market research, channel selection, content planning, budget allocation, and KPI setting.', category: 'digital-marketing' },
  { question: 'I need brand promotion', answer: 'Brand promotion starts at Rs 50,000 — digital branding, media promotion, influencer marketing, and strategic campaigns.', category: 'brand-promotion' },
  { question: 'I need reputation management', answer: 'Our ORM services monitor, protect, and improve your online reputation across the web.', category: 'reputation-management' },

  // ── CHATTY "Can you..." QUERIES ────────────────────────────────────
  { question: 'Can you help my business grow', answer: 'Absolutely! We help businesses grow through digital PR, SEO, social media, web development, and branding. Free consultation available!', category: 'digital-marketing' },
  { question: 'Can you make me a website', answer: 'Yes! Starting at Rs 10,500 for a 10-page WordPress site. Also e-commerce, landing pages, and custom apps.', category: 'web-development' },
  { question: 'Can you help with SEO', answer: 'Definitely! Comprehensive SEO — keyword research, optimization, link building, and monthly reporting. Let\'s improve your rankings!', category: 'seo-ppc' },
  { question: 'Can you write a press release', answer: 'Yes! Professional, newsworthy press releases optimized for media pickup. Writing + distribution across 80+ websites.', category: 'digital-pr' },
  { question: 'Can you run my social media', answer: 'Yes! Facebook, Instagram, LinkedIn, Twitter, YouTube — content, engagement, and ads. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'Can you design a logo', answer: 'Absolutely! Custom, professional logos that reflect your brand identity.', category: 'graphic-design' },
  { question: 'Can you manage Google Ads', answer: 'Yes! Full Google Ads management — Search, Display, Shopping, Video. Optimized for best ROI.', category: 'seo-ppc' },
  { question: 'Can you help with political campaign', answer: 'Yes! Extensive experience in political campaigns — booth management, voter outreach, digital communication. 500+ booths managed.', category: 'political' },
  { question: 'Can you integrate payment gateway', answer: 'Yes! We integrate Razorpay and other payment gateways for secure online payments.', category: 'technology' },
  { question: 'Can you help with ORM', answer: 'Yes! Our ORM services monitor, protect, and improve your online reputation.', category: 'reputation-management' },

  // ── "Looking for..." QUERIES ───────────────────────────────────────
  { question: 'Looking for digital marketing agency', answer: 'You\'re in the right place! DigiSharks is a full-service digital marketing and PR agency. Let\'s talk!', category: 'digital-marketing' },
  { question: 'Looking for SEO services', answer: 'We offer comprehensive SEO — improve rankings, drive organic traffic. Packages from Rs 2,40,000.', category: 'seo-ppc' },
  { question: 'Looking for PR agency', answer: 'We\'re a top Digital PR agency! Press release distribution, media outreach, crisis communication. From Rs 8,500.', category: 'digital-pr' },
  { question: 'Looking for web developer', answer: 'We build websites and web applications — business sites to e-commerce platforms. Starting at Rs 10,500.', category: 'web-development' },
  { question: 'Looking for social media manager', answer: 'We manage all major platforms — content, engagement, ads. Starts at Rs 20,000/month.', category: 'social-media' },

  // ── "Tell me..." QUERIES ──────────────────────────────────────────
  { question: 'Tell me about your services', answer: 'We offer Digital PR, SEO & PPC, Social Media Marketing, Web Development, Brand Promotion, Political Campaigns, Event Management, and more!', category: 'services' },
  { question: 'Tell me about SEO', answer: 'SEO improves your Google visibility. We handle keyword research, on-page optimization, technical SEO, link building, and content strategy.', category: 'seo-ppc' },
  { question: 'Tell me about PR', answer: 'Digital PR combines media relations with online marketing. We get you featured in top publications and build brand credibility.', category: 'digital-pr' },
  { question: 'Tell me about your pricing', answer: 'Press Release — Rs 8,500, Website — Rs 10,500, SEO — Rs 2,40,000, SMM — Rs 20,000/month, Brand Promotion — Rs 50,000.', category: 'pricing' },
  { question: 'Tell me more', answer: 'DigiSharks Communications — AI-powered Digital PR and Marketing agency since 2017. 4000+ clients, 500+ campaigns. What would you like to know?', category: 'about' },
  { question: 'Tell me about Vansh', answer: 'Vansh Mehra, Founder & MD. Founded DigiSharks in 2017. Recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs.', category: 'about' },

  // ── "How to..." QUERIES ───────────────────────────────────────────
  { question: 'How to contact DigiSharks', answer: 'Call +91 96273 32332, email marketing@digisharkscommunications.com, or visit Sector 63, Noida. Mon—Sat, 10 AM – 7 PM.', category: 'contact' },
  { question: 'How to start', answer: '1) Contact us for free consultation, 2) We discuss your goals, 3) Receive custom strategy and quote, 4) We execute and report progress.', category: 'general' },
  { question: 'How to get a quote', answer: 'Call +91 96273 32332, email marketing@digisharkscommunications.com, or use our contact form. Response within 24 hours.', category: 'general' },
  { question: 'How to work with you', answer: 'Free consultation → discuss goals → custom strategy → execution → transparent reporting throughout.', category: 'general' },
  { question: 'How to pay', answer: 'Razorpay — Credit Cards, Debit Cards, NetBanking, UPI. Also bank transfers.', category: 'pricing' },
  { question: 'How to visit your office', answer: 'B-2, C-87, C Block, Sector 63, Noida. Nearest metro: Sector 62. Open Mon—Sat, 10 AM – 7 PM.', category: 'contact' },

  // ── "Do you..." QUERIES ──────────────────────────────────────────
  { question: 'Do you do SEO', answer: 'Yes! Comprehensive SEO — keyword research, on-page and technical optimization, link building, content strategy, monthly reporting.', category: 'seo-ppc' },
  { question: 'Do you build websites', answer: 'Yes! Business websites, e-commerce, landing pages, WordPress, custom apps. All mobile-responsive and SEO-friendly.', category: 'web-development' },
  { question: 'Do you do social media', answer: 'Yes! Facebook, Instagram, LinkedIn, Twitter, YouTube — content, engagement, ads. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'Do you do PR', answer: 'Yes! Digital PR is core — press release writing, distribution to 500+ journalists, coverage on 80+ websites.', category: 'digital-pr' },
  { question: 'Do you handle political campaigns', answer: 'Yes! Booth management, voter outreach, digital communication. 500+ booths managed.', category: 'political' },
  { question: 'Do you offer free consultation', answer: 'Yes! Free 30-minute strategy call to understand your goals and recommend solutions.', category: 'general' },
  { question: 'Do you work with small businesses', answer: 'Yes! We work with businesses of all sizes — startups to enterprises. Solutions for every budget.', category: 'general' },
  { question: 'Do you work with international clients', answer: 'Yes! Clients in India and internationally — USA, UK, Canada, UAE, Australia, and more.', category: 'general' },
  { question: 'Do you offer discounts', answer: 'Yes! Discounts for quarterly and annual commitments. Contact us to discuss.', category: 'pricing' },

  // ── ABBREVIATIONS ─────────────────────────────────────────────────
  { question: 'SEO PPC', answer: 'Both SEO (organic optimization) and PPC (paid advertising). Complete search marketing for maximum visibility.', category: 'seo-ppc' },
  { question: 'SMM', answer: 'Social Media Marketing — Facebook, Instagram, LinkedIn, Twitter, YouTube. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'ORM', answer: 'Online Reputation Management — monitor, protect, and improve your brand\'s digital reputation.', category: 'reputation-management' },
  { question: 'PR', answer: 'Public Relations — press release distribution, media outreach, crisis communication, reputation building. From Rs 8,500.', category: 'digital-pr' },
  { question: 'SEO', answer: 'Search Engine Optimization — improve Google visibility. Keyword research, optimization, link building. From Rs 2,40,000.', category: 'seo-ppc' },
  { question: 'PPC', answer: 'Pay-Per-Click advertising — Google Ads, social media ads. Pay only when someone clicks.', category: 'seo-ppc' },
  { question: 'AEO', answer: 'Answer Engine Optimization — optimize for featured snippets and AI answers. Essential for modern SEO.', category: 'ai-seo-aeo-geo' },
  { question: 'GEO', answer: 'Generative Engine Optimization — optimize for AI search engines like ChatGPT. Future of search visibility.', category: 'ai-seo-aeo-geo' },
  { question: 'ROI', answer: 'Return on Investment — measures marketing profitability. We track and optimize for maximum ROI.', category: 'digital-marketing' },
  { question: 'CMS', answer: 'Content Management System — like WordPress, manage website content easily without technical knowledge.', category: 'web-development' },
  { question: 'UI UX', answer: 'UI (User Interface) and UX (User Experience) design — intuitive, visually appealing digital experiences.', category: 'web-development' },
  { question: 'CTA', answer: 'Call-to-Action — buttons/links prompting users to take action. Optimized for maximum conversions.', category: 'digital-marketing' },
  { question: 'GBP', answer: 'Google Business Profile — free listing for Google Search and Maps. We optimize for local visibility.', category: 'seo-ppc' },
  { question: 'SERP', answer: 'Search Engine Results Page — higher rankings mean more visibility and traffic.', category: 'seo-ppc' },
  { question: 'GA4', answer: 'Google Analytics 4 — event-based analytics. We set up with custom events and conversion tracking.', category: 'technology' },

  // ── TYPO VARIANTS ──────────────────────────────────────────────────
  { question: 'digishark', answer: 'DigiSharks Communications — that\'s us! Top AI-powered Digital PR and Marketing agency. How can we help?', category: 'about' },
  { question: 'digi sharks', answer: 'DigiSharks Communications — premier digital PR and marketing agency. What can we help you with?', category: 'about' },
  { question: 'web dev cost', answer: 'Web development starts at Rs 10,500 (10-page WordPress). E-commerce and custom apps vary. Contact for a quote!', category: 'pricing' },
  { question: 'web design price', answer: 'Website design starts at Rs 10,500 for a 10-page WordPress site with CMS and SEO optimization.', category: 'pricing' },
  { question: 'pr package', answer: 'Press release package: Rs 8,500 for 2 releases, 500+ journalists, 80+ websites coverage.', category: 'digital-pr' },
  { question: 'seo plan', answer: '5-keyword SEO plan: Rs 2,40,000. Keyword research, link building, content optimization, monthly reporting.', category: 'seo-ppc' },
  { question: 'marketing cost', answer: 'SMM — Rs 20,000/month, SEO — Rs 2,40,000, PR — Rs 8,500, Brand Promotion — Rs 50,000.', category: 'pricing' },

  // ── SINGLE WORD INTENT ────────────────────────────────────────────
  { question: 'pricing', answer: 'PR — Rs 8,500, Website — Rs 10,500, SEO — Rs 2,40,000, SMM — Rs 20,000/month, Brand Promotion — Rs 50,000, Events — Rs 50,000/day.', category: 'pricing' },
  { question: 'price', answer: 'PR — Rs 8,500, Website — Rs 10,500, SEO — Rs 2,40,000, SMM — Rs 20,000/month, Brand Promotion — Rs 50,000.', category: 'pricing' },
  { question: 'rates', answer: 'Press Release — Rs 8,500, Web Design — Rs 10,500, SEO — Rs 2,40,000, SMM — Rs 20,000/month, Brand Promotion — Rs 50,000.', category: 'pricing' },
  { question: 'cost', answer: 'PR — Rs 8,500, Website — Rs 10,500, SEO — Rs 2,40,000, SMM — Rs 20,000/month. Contact for custom quote!', category: 'pricing' },
  { question: 'website', answer: 'We build business websites, e-commerce stores, landing pages, and custom apps. Starting at Rs 10,500. Mobile-responsive and SEO-friendly.', category: 'web-development' },
  { question: 'contact', answer: '+91 96273 32332 | marketing@digisharkscommunications.com | Sector 63, Noida. Mon—Sat, 10 AM – 7 PM.', category: 'contact' },
  { question: 'address', answer: 'B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301. Walk-ins welcome!', category: 'contact' },
  { question: 'phone', answer: 'Call +91 96273 32332. Mon—Sat, 10 AM – 7 PM IST.', category: 'contact' },
  { question: 'email', answer: 'marketing@digisharkscommunications.com. We respond within 24 hours on business days.', category: 'contact' },
  { question: 'location', answer: 'Sector 63, Noida, Uttar Pradesh. Office: B-2, C-87, C Block, Sector 63, Noida – 201301.', category: 'contact' },
  { question: 'timings', answer: 'Mon—Sat, 10 AM – 7 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'services', answer: 'Digital PR, SEO & PPC, Social Media, Web Development, Brand Promotion, Political Campaigns, Events, Graphic Design, Content, ORM.', category: 'services' },
  { question: 'database', answer: 'PAN India Database — 40+ industries, 145+ categories, verified contacts. Just ₹299 with lifetime access.', category: 'products' },
  { question: 'career', answer: 'Email resume to marketing@digisharkscommunications.com. We never offer jobs via WhatsApp or Telegram!', category: 'career' },
  { question: 'jobs', answer: 'Email resume to marketing@digisharkscommunications.com. Beware of scams — we never ask for money during recruitment.', category: 'career' },
  { question: 'internship', answer: 'Internships in digital marketing, PR, content, web development. Email resume to marketing@digisharkscommunications.com.', category: 'career' },
  { question: 'help', answer: 'How can we help? Choose: Services, Pricing, Contact, Website, SEO, PR, Social Media, or Branding. Just let me know!', category: 'general' },
  { question: 'support', answer: 'Contact your account manager or email marketing@digisharkscommunications.com. Response within 4 business hours.', category: 'general' },
  { question: 'chat', answer: 'You\'re chatting with the DigiSharks assistant! Ask about services, pricing, or anything else!', category: 'general' },
  { question: 'hello', answer: 'Hello! Welcome to DigiSharks Communications. I\'m the chatbot assistant. How can I help you today?', category: 'general' },
  { question: 'hi', answer: 'Hi! Welcome to DigiSharks Communications! Ask me about digital PR, SEO, web development, or anything else.', category: 'general' },
  { question: 'hey', answer: 'Hey! Welcome to DigiSharks! Services, pricing, contact — what would you like to know?', category: 'general' },

  // ── DIGITAL MARKETING / FAQ ────────────────────────────────────────
  { question: 'what is digital marketing', answer: 'Digital marketing uses online channels — SEO, PPC, social media, content, email — to connect with customers and grow your business online.', category: 'digital-marketing' },
  { question: 'why digital marketing', answer: 'Your customers are online. Digital marketing lets you reach targeted audiences, measure real-time results, and optimize for better ROI.', category: 'digital-marketing' },
  { question: 'what is Digital PR', answer: 'Digital PR combines media relations with online marketing. Strategic content placement across publications for brand awareness and search visibility.', category: 'digital-pr' },
  { question: 'what is AEO', answer: 'Answer Engine Optimization — optimizing content for featured snippets, voice search, and direct answers on Google.', category: 'ai-seo-aeo-geo' },
  { question: 'what is GEO', answer: 'Generative Engine Optimization — optimizing for AI search engines like ChatGPT and Gemini. The future of search!', category: 'ai-seo-aeo-geo' },
  { question: 'what is ORM', answer: 'Online Reputation Management — monitoring and influencing your brand\'s online reputation across the web.', category: 'reputation-management' },
  { question: 'what is SEO', answer: 'Search Engine Optimization improves your website to rank higher on Google, driving more organic traffic and visibility.', category: 'seo-ppc' },
  { question: 'what is PPC', answer: 'Pay-Per-Click advertising where you pay when someone clicks your ad. Fast, measurable, and targeted.', category: 'seo-ppc' },
  { question: 'what is influencer marketing', answer: 'Partnering with influencers to authentically promote your brand to their engaged audience.', category: 'influencer' },
  { question: 'what is content marketing', answer: 'Creating valuable, relevant content to attract and retain your target audience — blogs, videos, social posts, and more.', category: 'content-creation' },
  { question: 'what is lead generation', answer: 'Attracting and converting prospects into leads through marketing campaigns, content, and strategic outreach.', category: 'digital-marketing' },
  { question: 'what is conversion rate', answer: 'The percentage of visitors who complete a desired action — purchase, signup, form fill. We optimize to maximize conversions.', category: 'digital-marketing' },

  // ====================================================================
  // GAP-FILLER: comparisons, process, problem-focused, industry, etc.
  // ====================================================================

  // ── Comparisons ────────────────────────────────────────────────────
  { question: 'SEO vs PPC', answer: 'SEO is organic (free) traffic over time — takes 3-6 months for results. PPC is paid traffic with immediate results. We recommend both for maximum impact.', category: 'seo-ppc' },
  { question: 'difference between SEO and PPC', answer: 'SEO earns organic traffic through optimized content. PPC drives traffic through paid ads with instant results. Both together = best results.', category: 'seo-ppc' },
  { question: 'WordPress vs Shopify', answer: 'WordPress (WooCommerce) offers more flexibility. Shopify is easier to set up but has less customization. We build on both.', category: 'web-development' },
  { question: 'Instagram vs Facebook marketing', answer: 'Instagram is better for visual brands and younger audiences (18-34). Facebook excels for broader demographics and detailed ad targeting. We manage both!', category: 'social-media' },
  { question: 'organic vs paid marketing', answer: 'Organic builds sustainable traffic over time at no direct cost. Paid delivers immediate targeted traffic but costs per click. Integrated strategies work best.', category: 'digital-marketing' },
  { question: 'onpage vs offpage SEO', answer: 'On-page SEO optimizes elements ON your website. Off-page SEO focuses on external signals like backlinks. Both are essential for rankings.', category: 'seo-ppc' },

  // ── Process / Timeline ────────────────────────────────────────────
  { question: 'How long does SEO take', answer: 'Initial improvements appear in 3-6 months. Significant results take 6-12 months depending on competition and keyword difficulty.', category: 'seo-ppc' },
  { question: 'How long to build a website', answer: 'Standard business website takes 2-4 weeks. E-commerce sites take 4-8 weeks. Custom applications vary.', category: 'web-development' },
  { question: 'How long for PR results', answer: 'Media placements appear within 1-2 weeks of a press release. Building brand authority takes 3-6 months.', category: 'digital-pr' },
  { question: 'what is the process for SEO', answer: '1) Audit and keyword research, 2) On-page optimization, 3) Technical SEO fixes, 4) Link building, 5) Monthly reporting.', category: 'seo-ppc' },
  { question: 'what is the process for website', answer: '1) Discovery, 2) Design (2 concepts), 3) Development, 4) Testing, 5) Launch, 6) Post-launch support.', category: 'web-development' },
  { question: 'what do I need to provide for a website', answer: 'Brand logo, colors, page content, images, specific features needed. We can also create content for you.', category: 'web-development' },
  { question: 'what information do you need to start', answer: 'Your business goals, target audience, budget, and any existing marketing materials. Free consultation to start!', category: 'general' },

  // ── Problem-focused ──────────────────────────────────────────────
  { question: 'My website is slow', answer: 'We can audit speed, optimize images, enable caching, and improve hosting. Contact us for a performance audit!', category: 'web-development' },
  { question: 'My website is not getting traffic', answer: 'Our SEO services can improve rankings and drive organic visitors. We also offer PPC for immediate traffic.', category: 'seo-ppc' },
  { question: 'I am not getting leads', answer: 'We audit your funnel, optimize campaigns, and implement proven lead generation strategies. Let us help!', category: 'digital-marketing' },
  { question: 'My Google rankings dropped', answer: 'We audit your site to identify the cause and implement recovery strategies. Contact us for a consultation.', category: 'seo-ppc' },
  { question: 'My social media is not growing', answer: 'We revitalize social media with consistent content strategy, engaging visuals, and targeted ads.', category: 'social-media' },
  { question: 'I have negative reviews online', answer: 'Our ORM services monitor reviews, address feedback, and build positive content to improve reputation.', category: 'reputation-management' },
  { question: 'My ads are not converting', answer: 'We audit targeting, creative, and landing pages to optimize for better conversion rates and ROI.', category: 'seo-ppc' },
  { question: 'My competitor is ranking above me', answer: 'We analyze competitor strategies and develop a plan to outperform them. Let\'s capture more market share!', category: 'seo-ppc' },
  { question: 'Nobody knows my brand', answer: 'Our multi-channel approach combines PR, social media, content marketing, and ads to build brand awareness.', category: 'brand-promotion' },

  // ── Industry-specific ────────────────────────────────────────────
  { question: 'Do you work with ecommerce businesses', answer: 'Yes! E-commerce SEO, Google Shopping Ads, social ads, email marketing, and WooCommerce/Shopify development.', category: 'digital-marketing' },
  { question: 'Do you work with healthcare', answer: 'Yes, we serve hospitals, clinics, doctors, pharma, and health-tech with compliant marketing strategies.', category: 'general' },
  { question: 'Do you work with real estate', answer: 'Yes! Digital marketing, social media, websites, and PR for real estate developers, agents, and prop-tech.', category: 'general' },
  { question: 'Do you work with startups', answer: 'Yes! We love startups. Flexible packages, payment options, and growth-focused strategies for early-stage companies.', category: 'general' },
  { question: 'Do you work with restaurants', answer: 'Yes! Local SEO, social media, Google Business Profile, and ORM for restaurants, cafes, and food brands.', category: 'general' },
  { question: 'Do you work with fashion brands', answer: 'Yes! Stunning social media campaigns, influencer partnerships, and PR strategies for fashion and beauty.', category: 'general' },
  { question: 'Do you work with technology companies', answer: 'Yes! B2B marketing for SaaS, IT services, app developers, and tech companies targeting decision-makers.', category: 'general' },

  // ── Location-specific ────────────────────────────────────────────
  { question: 'Do you work in Delhi', answer: 'Yes, we serve Delhi NCR. Our Noida office is easily accessible from all parts of Delhi.', category: 'general' },
  { question: 'Do you work in Mumbai', answer: 'Yes, we have clients in Mumbai. Our digital services work seamlessly across all locations.', category: 'general' },
  { question: 'Do you work in Bangalore', answer: 'Yes, we serve clients in Bangalore remotely with regular video calls and reporting.', category: 'general' },
  { question: 'Do you work in Hyderabad', answer: 'Yes, clients in Hyderabad get the same quality service through our remote delivery model.', category: 'general' },
  { question: 'Do you work in Chennai', answer: 'Yes, we work with clients in Chennai with excellent remote communication and support.', category: 'general' },
  { question: 'Do you work in Pune', answer: 'Yes, we serve Pune clients seamlessly regardless of location.', category: 'general' },

  // ── Payment / Financial ──────────────────────────────────────────
  { question: 'Do you offer EMI', answer: 'Flexible payment plans available for most services. Contact us to discuss installment options.', category: 'pricing' },
  { question: 'Can I pay in installments', answer: 'Yes, installment plans available for many services. Contact us to discuss a schedule.', category: 'pricing' },
  { question: 'Do you provide GST invoice', answer: 'Yes, GST-compliant invoices provided for all services. Proper tax invoice for input tax credit.', category: 'general' },
  { question: 'Do you charge GST', answer: 'Yes, GST is applicable on all services as per government regulations.', category: 'general' },

  // ── Technical ─────────────────────────────────────────────────────
  { question: 'Do you build React websites', answer: 'Yes, we build React and Next.js websites for high-performance modern web applications.', category: 'web-development' },
  { question: 'Do you use Next.js', answer: 'Yes, Next.js is our preferred framework for custom web development projects.', category: 'technology' },
  { question: 'Where do you host websites', answer: 'We recommend Vercel, Netlify, and cloud providers. We help configure the best hosting environment.', category: 'web-development' },
  { question: 'Do you offer website maintenance', answer: 'Yes! Ongoing maintenance including updates, backups, security, and performance optimization. Contact for pricing.', category: 'web-development' },
  { question: 'Is my website mobile-friendly', answer: 'Yes! All our websites are mobile-first with pixel-perfect experiences across all devices.', category: 'web-development' },
  { question: 'Can you redesign my existing website', answer: 'Yes! We transform existing sites with modern UI/UX, better performance, and improved SEO.', category: 'web-development' },

  // ── Guarantee / Trust ────────────────────────────────────────────
  { question: 'Do you guarantee SEO results', answer: 'We guarantee our commitment and expertise. While rankings depend on many factors, we have a proven track record of delivering improvements.', category: 'seo-ppc' },
  { question: 'Do you guarantee media coverage', answer: 'Our press release package assures 80+ website coverage. Broader PR campaigns maximize coverage but individual publications vary.', category: 'digital-pr' },
  { question: 'How do I know you are legitimate', answer: 'Founded 2017, 4000+ clients, award-winning, Google Partner, Meta Partner. See our About Us page!', category: 'about' },
  { question: 'Are you registered company', answer: 'Yes, registered in Noida, Uttar Pradesh. We provide GST invoices for all services.', category: 'about' },

  // ── Free SEO Audit ──────────────────────────────────────────────
  { question: 'What is your free SEO audit tool', answer: 'Free SEO audit analyzes PageSpeed, SSL, meta tags, structured data, HTML validation, and more. No credit card!', category: 'seo-audit' },
  { question: 'How does the free SEO audit work', answer: 'Enter your name, email, phone, and website URL. We send a comprehensive report to your email. 100% free!', category: 'seo-audit' },
  { question: 'Is the SEO audit really free', answer: 'Yes, 100% free! No credit card needed. Complete report sent to your email.', category: 'seo-audit' },

  // ── Chatbot itself ───────────────────────────────────────────────
  { question: 'Are you a bot', answer: 'Yes, I\'m an AI chatbot for DigiSharks. I can answer questions about services, pricing, and company info.', category: 'general' },
  { question: 'Is this AI', answer: 'Yes! You\'re chatting with an AI-powered assistant. I can help or connect you with our human team.', category: 'general' },
  { question: 'Can I talk to a human', answer: 'Call +91 96273 32332 or email marketing@digisharkscommunications.com to speak with our team directly.', category: 'general' },
  { question: 'Connect me to a real person', answer: 'Please call +91 96273 32332 or email marketing@digisharkscommunications.com. We\'re here to help!', category: 'general' },

  // ── The Indian Alert ─────────────────────────────────────────────
  { question: 'What is The Indian Alert', answer: 'The Indian Alert (theindianalert.com) is a news platform founded by Vansh Mehra covering Politics, Entertainment, Sports, and Current Affairs.', category: 'about' },
  { question: 'Who runs The Indian Alert', answer: 'Founded and managed by Vansh Mehra, Founder & MD of DigiSharks Communications.', category: 'about' },

  // ── Social media specific ────────────────────────────────────────
  { question: 'Facebook ads cost', answer: 'Average CPC in India ranges Rs 5-30. We optimize campaigns for the lowest cost per result.', category: 'social-media' },
  { question: 'Instagram Reels', answer: 'Yes, we create Reels as part of social media strategy. They\'re the best way to reach new audiences on Instagram.', category: 'social-media' },
  { question: 'how many posts per week', answer: 'We recommend 3-5 posts/week for Instagram, 3-4 for Facebook, 2-3 for LinkedIn.', category: 'social-media' },

  // ── Content-specific ─────────────────────────────────────────────
  { question: 'blog writing services', answer: 'We write SEO-optimized blog posts that attract readers, establish authority, and improve rankings.', category: 'content-creation' },
  { question: 'website copywriting', answer: 'Persuasive, SEO-friendly website copy that converts — homepage, about, services, product descriptions.', category: 'content-creation' },
  { question: 'SEO content writing', answer: 'Researched, optimized content that ranks on Google while engaging your audience.', category: 'content-creation' },

  // ── Awards ───────────────────────────────────────────────────────
  { question: 'Is DigiSharks award winning', answer: 'Yes! Top 10 CEOs, Top 10 Dynamic Entrepreneurs, Top 10 PR Leaders, Clutch Top PPC Company, Google Partner, Meta Partner.', category: 'about' },
  { question: 'Are you Google Partner', answer: 'Yes, certified Google Partner with expertise in Google Ads and digital marketing best practices.', category: 'about' },
  { question: 'Are you Meta Business Partner', answer: 'Yes, certified Meta Business Partner for Facebook and Instagram advertising expertise.', category: 'about' },

  // ── Data / Privacy ──────────────────────────────────────────────
  { question: 'How do you protect my data', answer: 'Strict confidentiality, industry-standard security, SSL encryption. Never shared without consent.', category: 'general' },
  { question: 'Do you share client data', answer: 'Never. Your information is used solely for delivering our services with strict confidentiality.', category: 'general' },

  // ── Timing ───────────────────────────────────────────────────────
  { question: 'Are you open on Saturdays', answer: 'Yes, open Saturdays 10 AM – 7 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'Are you open on Sunday', answer: 'No, closed on Sundays. Hours: Mon—Sat, 10 AM – 7 PM IST.', category: 'general' },
  { question: 'Weekend support', answer: 'Open Saturdays 10 AM – 7 PM. Closed Sundays. Email us for next business day response.', category: 'general' },
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

    for (const entry of SHORT_ENTRIES) {
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
