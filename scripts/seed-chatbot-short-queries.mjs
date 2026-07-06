/**
 * Seed CHATTY + SHORT-QUERY Q&A entries.
 *
 * Real chatbot users type short, informal, or abbreviated queries:
 *   "SEO cost"         "website price"
 *   "hey what do you do"   "PR services"
 *   "I need a website"     "want seo help"
 *   "where are you"        "your phone"
 *
 * This adds ~240 entries designed to match these real-world query patterns.
 * Run AFTER all other seed scripts have populated the core data.
 *
 * Usage: node scripts/seed-chatbot-short-queries.mjs
 */

const SHORT_ENTRIES = [

  // ====================================================================
  // SHORT 2-3 WORD QUERIES — "SEO cost", "website price", "phone no"
  // ====================================================================

  // ── Pricing Shortcuts ─────────────────────────────────────────────
  { question: 'SEO cost', answer: 'Our SEO package for 5 keywords is priced at INR Rs 2,40,000. This includes comprehensive keyword research, link building, on-page and off-page optimization, and ongoing monitoring. Contact us for custom pricing.', category: 'pricing' },
  { question: 'SEO price', answer: 'Our SEO package for 5 keywords is INR Rs 2,40,000. We also offer flexible payment options. Contact us for a customized quote based on your specific needs.', category: 'pricing' },
  { question: 'SEO charges', answer: 'Our SEO services start at INR Rs 2,40,000 for a 5-keyword package. Pricing varies based on competition and scope of work. Contact us for a detailed quote.', category: 'pricing' },
  { question: 'SEO package cost', answer: 'Our 5-keyword SEO package is INR Rs 2,40,000. Includes keyword research, link building, content optimization, technical SEO, and monthly reporting. Contact us for a consultation!', category: 'pricing' },
  { question: 'website cost', answer: 'Our website design starts at Rs 10,500 for a 10-page WordPress site with CMS, mobile responsive layout, contact form, and SEO optimization. E-commerce and custom sites are priced based on requirements.', category: 'pricing' },
  { question: 'website price', answer: 'Basic websites start at Rs 10,500. E-commerce sites, custom web applications, and complex projects vary based on features. Contact us for a personalized quote.', category: 'pricing' },
  { question: 'website charges', answer: 'Our website packages start from Rs 10,500 (10-page WordPress) and go up based on complexity. We provide detailed quotes with no hidden costs.', category: 'pricing' },
  { question: 'web development cost', answer: 'Web development costs depend on your requirements. A basic business website starts at Rs 10,500. E-commerce sites, custom applications, and complex builds are priced based on scope.', category: 'pricing' },
  { question: 'SMM cost', answer: 'Our social media marketing plan starts at Rs 20,000 per month. This includes Facebook and Instagram management, content creation, ad campaigns, and weekly reporting.', category: 'pricing' },
  { question: 'social media cost', answer: 'Social media management starts at Rs 20,000 per month. We also offer custom packages based on the number of platforms, content volume, and ad spend requirements.', category: 'pricing' },
  { question: 'PR cost', answer: 'Our press release package is Rs 8,500 (one-time). Includes 2 press releases, distribution to 500+ reporters, and assured coverage on 80+ websites.', category: 'pricing' },
  { question: 'PR price', answer: 'Press release services start at Rs 8,500 per package. For comprehensive PR campaigns, pricing depends on scope and duration. Contact us for a quote.', category: 'pricing' },
  { question: 'press release cost', answer: 'Press release package: Rs 8,500 (one-time). Includes 2 releases, proof reading, up to 800 words each, distribution to 500+ reporters, and 80+ website coverage.', category: 'pricing' },
  { question: 'press release price', answer: 'Our press release services are priced at Rs 8,500 per package. This includes everything from writing to distribution across 80+ websites.', category: 'pricing' },
  { question: 'brand promotion cost', answer: 'Brand promotion services start at Rs 50,000. The final cost depends on the scope of work, channels, and campaign duration. Contact us for a customized quote.', category: 'pricing' },
  { question: 'brand promotion price', answer: 'Brand promotion starts at Rs 50,000. Custom packages are available based on your specific brand building needs and goals.', category: 'pricing' },
  { question: 'event cost', answer: 'Event management services start at Rs 50,000 per day. Costs vary based on event type, scale, and requirements. Contact us for a detailed quote.', category: 'pricing' },
  { question: 'event management cost', answer: 'Event management starts at Rs 50,000 per day. We organize corporate events, award shows, product launches, celebrity events, and more.', category: 'pricing' },
  { question: 'database cost', answer: 'The PAN India Updated Database is priced at just ₹299 (92% off original ₹3,999). One-time payment with lifetime access and free updates.', category: 'products' },
  { question: 'database price', answer: 'PAN India Database: ₹299 only (original ₹3,999). Includes 40+ industries, 145+ categories, and verified contacts. Instant download after purchase.', category: 'products' },
  { question: 'database ₹', answer: 'The PAN India Database is just ₹299 with lifetime access and free future updates. That\'s a 92% discount from the original price of ₹3,999.', category: 'products' },

  // ── Contact Shortcuts ─────────────────────────────────────────────
  { question: 'your phone', answer: 'Call us at +91 96273 32332. We\'re available Monday to Saturday, 10:00 AM – 7:00 PM IST.', category: 'contact' },
  { question: 'phone number', answer: '+91 96273 32332 is our contact number. You can call or WhatsApp us during business hours.', category: 'contact' },
  { question: 'phone no', answer: 'Our phone number is +91 96273 32332. Available Mon–Sat, 10 AM – 7 PM IST.', category: 'contact' },
  { question: 'contact number', answer: 'You can reach us at +91 96273 32332. We\'re available Monday to Saturday, 10:00 AM – 7:00 PM IST.', category: 'contact' },
  { question: 'your email', answer: 'Email us at marketing@digisharkscommunications.com. We typically respond within 24 hours during business days.', category: 'contact' },
  { question: 'email id', answer: 'Our email address is marketing@digisharkscommunications.com. We respond within 24 hours on business days.', category: 'contact' },
  { question: 'email address', answer: 'marketing@digisharkscommunications.com is our email. Drop us a message and we\'ll get back to you promptly.', category: 'contact' },
  { question: 'your address', answer: 'We\'re located at B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301. Walk-ins welcome during business hours!', category: 'contact' },
  { question: 'office address', answer: 'DigiSharks Communications, B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India.', category: 'contact' },
  { question: 'office location', answer: 'Our office is in Sector 63, Noida, near the Noida-Greater Noida Expressway. The nearest metro is Sector 62 Metro Station.', category: 'contact' },
  { question: 'where are you', answer: 'We\'re based in Noida, Sector 63, Uttar Pradesh. Our office is at B-2, C-87, C Block, Sector 63, Noida – 201301.', category: 'contact' },
  { question: 'your location', answer: 'We\'re located at B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India. Feel free to visit us!', category: 'contact' },
  { question: 'WhatsApp number', answer: 'You can reach us on WhatsApp at +91 96273 32332. Send us a message and our team will respond during business hours.', category: 'contact' },
  { question: 'your WhatsApp', answer: 'Our WhatsApp number is +91 96273 32332. Message us anytime and we\'ll get back to you during business hours.', category: 'contact' },

  // ── General Shortcuts ─────────────────────────────────────────────
  { question: 'business hours', answer: 'We\'re open Monday to Saturday, 10:00 AM – 7:00 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'working hours', answer: 'Our working hours are Monday to Saturday, 10:00 AM to 7:00 PM IST. We\'re closed on Sundays.', category: 'general' },
  { question: 'timing', answer: 'We operate Monday to Saturday, 10:00 AM – 7:00 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'office timing', answer: 'Office hours: Mon–Sat, 10 AM – 7 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'open time', answer: 'We\'re open Monday to Saturday from 10:00 AM to 7:00 PM IST. Closed on Sundays.', category: 'general' },
  { question: 'closed days', answer: 'We\'re closed on Sundays and all major public holidays. Our regular hours are Mon–Sat, 10 AM – 7 PM IST.', category: 'general' },
  { question: 'weekend open', answer: 'We\'re open on Saturdays (10 AM – 7 PM IST). Sundays are closed.', category: 'general' },
  { question: 'your services', answer: 'We offer Digital PR & Media, Press Release Distribution, SEO & PPC, AI SEO/AEO/GEO, Social Media Marketing, Web Development, Brand Promotion, Political Campaign Management, Event Management, and more!', category: 'services' },
  { question: 'service list', answer: 'Our full service list: Digital PR, SEO, PPC, Social Media Marketing, Web Development, Brand Promotion, Political Campaigns, Event Management, Graphic Design, Content Creation, ORM, and Media Management.', category: 'services' },
  { question: 'what you do', answer: 'We\'re a top AI-powered Digital PR and Digital Marketing Agency. We help businesses grow through Digital PR, SEO, Social Media, Web Development, Brand Promotion, and Political Campaigns.', category: 'about' },
  { question: 'what do you do', answer: 'DigiSharks Communications is a premier digital marketing and PR agency. We offer end-to-end services from SEO and social media to web development and political campaign management.', category: 'about' },
  { question: 'your company', answer: 'DigiSharks Communications was founded in 2017 by Vansh Mehra. We\'re an AI-powered Digital PR and Marketing agency with 4000+ customers and 500+ successful campaigns.', category: 'about' },
  { question: 'about you', answer: 'We\'re DigiSharks Communications — a top AI-powered Digital PR and Marketing agency founded in 2017. We\'ve served 4000+ clients, completed 500+ campaigns, and have a 98% retention rate.', category: 'about' },
  { question: 'tell about yourself', answer: 'DigiSharks Communications is a premier digital PR and marketing agency established in 2017. We help businesses grow through data-driven strategies across SEO, PR, social media, web development, and more.', category: 'about' },
  { question: 'founder name', answer: 'Our founder is Vansh Mehra. He established DigiSharks Communications in 2017 and has been recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs.', category: 'about' },
  { question: 'founder', answer: 'Vansh Mehra is the Founder & Managing Director of DigiSharks Communications. He started the company in 2017.', category: 'about' },
  { question: 'who founded', answer: 'Vansh Mehra founded DigiSharks Communications in 2017. He is a recognized entrepreneur featured in Top 10 CEOs and Top 10 Dynamic Entrepreneurs lists.', category: 'about' },
  { question: 'established year', answer: 'DigiSharks Communications was established in 2017 in New Delhi, India.', category: 'about' },
  { question: 'since when', answer: 'We\'ve been in business since 2017. That\'s over 8 years of helping businesses grow through digital PR and marketing.', category: 'about' },
  { question: 'how old', answer: 'DigiSharks was founded in 2017, making us over 8 years old in the digital marketing industry.', category: 'about' },
  { question: 'team size', answer: 'We have a team of 25+ specialists including digital marketers, PR professionals, web developers, designers, and campaign strategists.', category: 'about' },
  { question: 'how many employees', answer: 'We have 25+ team members across digital marketing, PR, web development, design, and campaign management.', category: 'about' },
  { question: 'client count', answer: 'We\'ve served 4000+ satisfied customers since our founding in 2017.', category: 'about' },
  { question: 'how many clients', answer: 'We have served 4000+ clients and completed 500+ successful campaigns across multiple industries.', category: 'about' },
  { question: 'campaign count', answer: 'We\'ve executed 500+ successful digital PR and marketing campaigns across various industries.', category: 'about' },
  { question: 'projects done', answer: 'We\'ve completed 120+ projects and 500+ campaigns for 4000+ clients since 2017.', category: 'about' },
  { question: 'free consultation', answer: 'Yes! We offer a free 30-minute strategy call to understand your business goals and recommend a custom growth roadmap. Book through our website or call +91 96273 32332.', category: 'general' },
  { question: 'free quote', answer: 'Yes, we provide free quotes! Contact us at +91 96273 32332 or marketing@digisharkscommunications.com for a no-obligation consultation and quote.', category: 'general' },
  { question: 'minimum budget', answer: 'Our services start from Rs 8,500 (Press Release) to Rs 2,40,000 (SEO). We have options for every budget — contact us to discuss what works for you.', category: 'pricing' },
  { question: 'starting price', answer: 'Services start at: Press Release – Rs 8,500, Website – Rs 10,500, SMM – Rs 20,000/month, Brand Promotion – Rs 50,000, SEO – Rs 2,40,000.', category: 'pricing' },
  { question: 'payment modes', answer: 'We accept payments via Razorpay including Credit Cards, Debit Cards, NetBanking, UPI, and other digital payment methods.', category: 'pricing' },
  { question: 'how to pay', answer: 'We accept all major payment methods through Razorpay — cards, net banking, UPI, and digital wallets. We also accept bank transfers.', category: 'pricing' },
  { question: 'contract required', answer: 'No, we don\'t require long-term contracts. We offer flexible month-to-month engagement models. Some clients choose quarterly or annual plans for discounts.', category: 'general' },
  { question: 'cancellation', answer: 'We offer flexible engagement models without lock-in contracts. Cancellation terms depend on your specific service agreement. Contact your account manager for details.', category: 'general' },

  // ── Service Shortcuts ─────────────────────────────────────────────
  { question: 'SEO services', answer: 'We offer comprehensive SEO including keyword research, on-page optimization, technical SEO, link building, content optimization, and monitoring. We also offer AI SEO, AEO, and GEO.', category: 'seo-ppc' },
  { question: 'SEO package', answer: 'Our 5-keyword SEO package is Rs 2,40,000. Includes keyword research, link building, natural listings, article submission, directory listings, and reputation monitoring.', category: 'seo-ppc' },
  { question: 'SEO work', answer: 'Our SEO services cover: keyword research, on-page optimization, technical SEO, content strategy, link building, local SEO, and performance reporting. We drive organic traffic and improve rankings.', category: 'seo-ppc' },
  { question: 'SEO help', answer: 'We can help improve your search rankings through comprehensive SEO — keyword research, content optimization, technical fixes, link building, and ongoing monitoring. Let\'s discuss your goals!', category: 'seo-ppc' },
  { question: 'want SEO', answer: 'Great choice! We offer full-service SEO including optimization, link building, content strategy, and performance tracking. Our 5-keyword package is Rs 2,40,000. Contact us to get started!', category: 'seo-ppc' },
  { question: 'PPC services', answer: 'We offer Google Ads management including Search Ads, Display Ads, Shopping Ads, YouTube Ads, and Remarketing. We optimize campaigns for maximum ROI with continuous testing.', category: 'seo-ppc' },
  { question: 'Google Ads', answer: 'We manage Google Ads campaigns including Search, Display, Shopping, and Video. Our team optimizes for the best ROI with continuous testing and refinement.', category: 'seo-ppc' },
  { question: 'PR services', answer: 'Our Digital PR services include press release writing and distribution, media outreach, journalist relationship building, crisis communication, and reputation management. We distribute to 500+ media contacts.', category: 'digital-pr' },
  { question: 'PR work', answer: 'We handle end-to-end PR — from writing press releases and pitching to journalists to securing media coverage across 80+ websites. We also offer crisis communication and media training.', category: 'digital-pr' },
  { question: 'want PR', answer: 'We\'d love to help with your PR needs! Our services include press release distribution, media outreach, and reputation management. Packages start at Rs 8,500. Contact us to discuss!', category: 'digital-pr' },
  { question: 'press release', answer: 'Our press release package: Rs 8,500 for 2 releases, up to 800 words each, distributed to 500+ journalists, with assured coverage on 80+ websites including major publications.', category: 'digital-pr' },
  { question: 'media coverage', answer: 'We secure media coverage through our network of 500+ journalists and media partners including Times of India, Hindustan Times, Forbes India, Yahoo News, and more.', category: 'digital-pr' },
  { question: 'SMM services', answer: 'We offer social media marketing across Facebook, Instagram, LinkedIn, Twitter, and YouTube. Services include content creation, community management, paid ads, and performance analytics.', category: 'social-media' },
  { question: 'social media', answer: 'We manage all major social media platforms — Facebook, Instagram, LinkedIn, Twitter, and YouTube. Our services include content creation, community engagement, and paid advertising.', category: 'social-media' },
  { question: 'Instagram help', answer: 'We help grow your Instagram presence through content strategy, Reels creation, hashtag optimization, engagement tactics, and targeted ads. Let\'s build your Instagram following!', category: 'social-media' },
  { question: 'Facebook help', answer: 'We manage Facebook pages including content creation, community engagement, ad campaigns, and performance analysis. We keep your page active and engaging.', category: 'social-media' },
  { question: 'LinkedIn help', answer: 'We offer LinkedIn marketing including profile optimization, content strategy, LinkedIn Ads, lead generation, and networking to help B2B brands connect with decision-makers.', category: 'social-media' },
  { question: 'web development', answer: 'We build websites — business sites, e-commerce stores, landing pages, WordPress sites, and custom web applications. All sites are mobile-responsive, SEO-friendly, and fast-loading.', category: 'web-development' },
  { question: 'website design', answer: 'We design modern, conversion-focused websites. Our Rs 10,500 package includes 10-page WordPress site with CMS, mobile responsive design, contact form, and SEO optimization.', category: 'web-development' },
  { question: 'want website', answer: 'We\'d love to build your website! Starting at Rs 10,500 for a 10-page WordPress site. We also build e-commerce stores, landing pages, and custom web applications. Let\'s discuss!', category: 'web-development' },
  { question: 'need website', answer: 'We can help! Our web development services cover everything from simple business websites to complex e-commerce platforms. Prices start at Rs 10,500. Contact us to discuss your project.', category: 'web-development' },
  { question: 'ecommerce website', answer: 'We build e-commerce websites on WooCommerce, Shopify, and custom platforms. Features include product management, payment gateway, cart, order tracking, and inventory management.', category: 'web-development' },
  { question: 'online store', answer: 'We create online stores with product management, secure payments, shopping cart, order tracking, and inventory management. Let\'s build your e-commerce success story!', category: 'web-development' },
  { question: 'WordPress site', answer: 'Yes, we specialize in WordPress development! Custom themes, plugin integration, speed optimization, security hardening, and ongoing maintenance.', category: 'web-development' },
  { question: 'landing page', answer: 'We create high-converting landing pages optimized for lead capture, campaigns, and conversions. Each page is mobile-friendly and designed for maximum results.', category: 'web-development' },
  { question: 'brand promotion', answer: 'Our brand promotion services include digital branding, media promotion, social media brand building, influencer marketing, corporate branding, and event marketing. Starts at Rs 50,000.', category: 'brand-promotion' },
  { question: 'branding', answer: 'We offer comprehensive branding — logo design, brand identity, corporate branding, brand guidelines, and brand strategy. Build a brand that stands out!', category: 'brand-promotion' },
  { question: 'logo design', answer: 'Yes, we create professional, unique logos that reflect your brand identity. Logo design is part of our corporate branding and graphic design services.', category: 'graphic-design' },
  { question: 'graphic design', answer: 'We offer graphic design including logos, social media creatives, marketing collateral, brochures, flyers, business cards, infographics, and brand identity materials.', category: 'graphic-design' },
  { question: 'content writing', answer: 'We create SEO-optimized content — website copy, blog posts, social media content, marketing copy, press releases, and brand storytelling. Content that engages and converts!', category: 'content-creation' },
  { question: 'ORM services', answer: 'Our Online Reputation Management services monitor, protect, and improve your digital reputation. We track mentions, manage reviews, and address negative content.', category: 'reputation-management' },
  { question: 'reputation management', answer: 'We protect your brand online through ORM — monitoring mentions, managing reviews, addressing negative content, and building a positive digital presence.', category: 'reputation-management' },
  { question: 'political campaign', answer: 'We offer political campaign management including booth management, voter outreach, digital communication, and IT cell operations. Managed 500+ booths with 95% turnout boost.', category: 'political' },
  { question: 'event management', answer: 'We organize corporate events, celebrity events, award shows, product launches, road shows, fashion shows, and brand activations. Services start at Rs 50,000/day.', category: 'events' },
  { question: 'influencer', answer: 'We connect your brand with the right influencers for authentic promotion. We handle discovery, outreach, campaign management, and performance tracking.', category: 'influencer' },
  { question: 'influencer marketing', answer: 'Our influencer marketing services connect you with authentic voices in your industry. We handle everything from discovery to campaign management and measurement.', category: 'influencer' },
  { question: 'email marketing', answer: 'We offer email marketing including campaign strategy, email design, list management, automation workflows, and performance analytics. Build and nurture your email list!', category: 'email-marketing' },
  { question: 'SMS marketing', answer: 'We offer SMS marketing with 98% open rates — perfect for promotions, alerts, reminders, and direct customer communication. Reach customers instantly on their phones.', category: 'sms-marketing' },
  { question: 'video production', answer: 'We create promotional videos, explainer videos, social media videos, testimonial videos, and corporate videos. Professional quality for all your video marketing needs.', category: 'content-creation' },
  { question: 'SEO audit', answer: 'We offer comprehensive SEO audits analyzing technical health, on-page optimization, content quality, backlink profile, and competitor positioning. Contact us to schedule an audit.', category: 'seo-audit' },

  // ====================================================================
  // CHATTY / NATURAL LANGUAGE QUERIES
  // "I want...", "I need...", "Can you...", "Looking for..."
  // ====================================================================

  // ── "I want..." queries ───────────────────────────────────────────
  { question: 'I want SEO services', answer: 'We offer comprehensive SEO services — keyword research, on-page and technical optimization, link building, and monthly reporting. Our 5-keyword package is Rs 2,40,000. Contact us to get started!', category: 'seo-ppc' },
  { question: 'I want a website', answer: 'We build beautiful, functional websites! Starting at Rs 10,500 for a 10-page WordPress site. We also do e-commerce, landing pages, and custom web apps. Let\'s discuss your project!', category: 'web-development' },
  { question: 'I want PR for my business', answer: 'We can help with PR! Our services include press release writing, distribution to 500+ journalists, and media coverage on 80+ websites. Packages start at Rs 8,500. Let\'s tell your story!', category: 'digital-pr' },
  { question: 'I want social media marketing', answer: 'We manage Facebook, Instagram, LinkedIn, Twitter, and YouTube. Services include content creation, community management, and paid ads. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'I want to grow my business', answer: 'We help businesses grow through digital PR, SEO, social media, web development, and branding. Our integrated approach ensures all channels work together for maximum impact. Let\'s discuss your goals!', category: 'digital-marketing' },
  { question: 'I want more customers', answer: 'We drive customer acquisition through SEO (organic traffic), PPC (paid ads), social media marketing, and PR (brand visibility). Our data-driven strategies target the right audience for your business.', category: 'digital-marketing' },
  { question: 'I want a logo', answer: 'We design custom logos that capture your brand identity. Logo design is part of our graphic design and corporate branding services. Let\'s create a logo that stands out!', category: 'graphic-design' },
  { question: 'I want branding help', answer: 'We offer complete branding solutions — logo design, brand identity, guidelines, strategy, and marketing collateral. Build a brand that resonates with your audience.', category: 'brand-promotion' },
  { question: 'I want to rank higher on Google', answer: 'Our SEO services are designed to improve your Google rankings through keyword optimization, content strategy, technical improvements, and quality link building. Results typically seen in 3-6 months.', category: 'seo-ppc' },
  { question: 'I want to run Google Ads', answer: 'We manage Google Ads campaigns — Search, Display, Shopping, and Video. We optimize for maximum ROI with continuous testing and refinement. Let\'s create ads that convert!', category: 'seo-ppc' },
  { question: 'I want to advertise online', answer: 'We offer online advertising across Google, Facebook, Instagram, LinkedIn, and YouTube. Our targeted campaigns reach your ideal customers and deliver measurable results.', category: 'seo-ppc' },

  // ── "I need..." queries ───────────────────────────────────────────
  { question: 'I need a digital marketing agency', answer: 'You\'ve found us! DigiSharks Communications offers complete digital marketing services — SEO, PPC, social media, web development, PR, and branding. Let\'s discuss how we can help your business grow.', category: 'digital-marketing' },
  { question: 'I need help with marketing', answer: 'We can definitely help! Our services cover SEO, social media, PR, web development, branding, and more. Let\'s schedule a free consultation to understand your needs.', category: 'digital-marketing' },
  { question: 'I need a website urgently', answer: 'We offer expedited web development for urgent projects. Rush delivery available — contact us with your timeline and we\'ll make it happen!', category: 'web-development' },
  { question: 'I need SEO help urgently', answer: 'We can prioritize your SEO project. Contact us immediately at +91 96273 32332 and we\'ll discuss a timeline that works for you.', category: 'seo-ppc' },
  { question: 'I need PR help', answer: 'Our PR team is ready to help! Whether you need a press release, media coverage, or crisis communication, we have the expertise and media network to deliver.', category: 'digital-pr' },
  { question: 'I need social media help', answer: 'We manage all major social platforms — content creation, posting, engagement, and ads. Let\'s build your social media presence together!', category: 'social-media' },
  { question: 'I need content for my website', answer: 'Our content team writes SEO-optimized website copy, blog posts, product descriptions, and more. Content that ranks well and engages your audience.', category: 'content-creation' },
  { question: 'I need a marketing strategy', answer: 'We develop comprehensive marketing strategies tailored to your business — including market research, channel selection, content planning, budget allocation, and KPI setting.', category: 'digital-marketing' },
  { question: 'I need brand promotion', answer: 'Our brand promotion services start at Rs 50,000 and include digital branding, media promotion, influencer marketing, and strategic campaigns. Let\'s build your brand!', category: 'brand-promotion' },
  { question: 'I need reputation management', answer: 'We offer ORM services to monitor, protect, and improve your online reputation. We track mentions across the web and address negative content strategically.', category: 'reputation-management' },

  // ── "Can you..." queries ──────────────────────────────────────────
  { question: 'Can you help my business grow', answer: 'Absolutely! We help businesses grow through digital PR, SEO, social media, web development, and branding. Schedule a free consultation to discuss your goals!', category: 'digital-marketing' },
  { question: 'Can you make me a website', answer: 'Yes, we build professional websites! Starting at Rs 10,500 for a 10-page WordPress site. We also create e-commerce stores, landing pages, and custom web applications.', category: 'web-development' },
  { question: 'Can you help with SEO', answer: 'Definitely! Our SEO services cover everything — keyword research, on-page and technical optimization, link building, and monthly reporting. Let\'s improve your rankings!', category: 'seo-ppc' },
  { question: 'Can you write a press release', answer: 'Yes, our team writes professional, newsworthy press releases optimized for media pickup. We handle everything from writing to distribution across 80+ websites.', category: 'digital-pr' },
  { question: 'Can you run my social media', answer: 'Yes, we manage Facebook, Instagram, LinkedIn, Twitter, and YouTube — content creation, posting, community engagement, and paid advertising. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'Can you design a logo', answer: 'Absolutely! We create custom, professional logos that reflect your brand identity. Logo design is available as part of our branding and graphic design services.', category: 'graphic-design' },
  { question: 'Can you manage Google Ads', answer: 'Yes, we offer full Google Ads management — Search, Display, Shopping, and Video campaigns. We optimize for the best ROI with continuous testing.', category: 'seo-ppc' },
  { question: 'Can you help with political campaign', answer: 'Yes, we have extensive experience in political campaign management including booth management, voter outreach, and digital communication. We\'ve managed 500+ booths.', category: 'political' },
  { question: 'Can you do event management', answer: 'Yes, we organize corporate events, award shows, product launches, celebrity events, road shows, and more. Services start at Rs 50,000/day.', category: 'events' },
  { question: 'Can you help with ORM', answer: 'Yes, our ORM services monitor, protect, and improve your online reputation. We track mentions, manage reviews, and implement strategic reputation improvement.', category: 'reputation-management' },
  { question: 'Can you integrate payment gateway', answer: 'Yes, we integrate Razorpay and other payment gateways for secure online payments on websites and e-commerce stores.', category: 'technology' },

  // ── "Looking for..." / "Searching for..." queries ─────────────────
  { question: 'Looking for digital marketing agency', answer: 'You\'re in the right place! DigiSharks is a full-service digital marketing and PR agency. We offer SEO, social media, web development, PR, branding, and more. Let\'s talk!', category: 'digital-marketing' },
  { question: 'Looking for SEO services', answer: 'We offer comprehensive SEO services to improve your search rankings, drive organic traffic, and grow your business online. Our packages start from Rs 2,40,000 for 5 keywords.', category: 'seo-ppc' },
  { question: 'Looking for PR agency', answer: 'We\'re a top Digital PR agency! Our services include press release distribution, media outreach, crisis communication, and reputation management. Packages start at Rs 8,500.', category: 'digital-pr' },
  { question: 'Looking for web developer', answer: 'We build websites and web applications — from simple business sites to complex e-commerce platforms. Starting at Rs 10,500. Let\'s discuss your project!', category: 'web-development' },
  { question: 'Looking for social media manager', answer: 'We manage social media across all major platforms — content creation, posting, engagement, and advertising. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'Looking for branding services', answer: 'We offer complete branding — logo design, brand identity, strategy, and marketing materials. Let\'s build a brand that stands out!', category: 'brand-promotion' },

  // ── "Tell me..." queries ──────────────────────────────────────────
  { question: 'Tell me about your services', answer: 'We offer Digital PR, SEO & PPC, Social Media Marketing, Web Development, Brand Promotion, Political Campaigns, Event Management, and more. Which service interests you?', category: 'services' },
  { question: 'Tell me about SEO', answer: 'SEO (Search Engine Optimization) improves your website visibility on Google. We handle keyword research, on-page optimization, technical SEO, link building, and content strategy to drive organic traffic.', category: 'seo-ppc' },
  { question: 'Tell me about PR', answer: 'Digital PR combines media relations with online marketing. We help you get featured in top publications, build brand credibility, and improve search visibility through strategic media placements.', category: 'digital-pr' },
  { question: 'Tell me about your pricing', answer: 'Our pricing: Press Release – Rs 8,500, Website – Rs 10,500, SEO – Rs 2,40,000, SMM – Rs 20,000/month, Brand Promotion – Rs 50,000, Events – Rs 50,000/day. Contact us for custom quotes!', category: 'pricing' },
  { question: 'Tell me more', answer: 'DigiSharks Communications is an AI-powered Digital PR and Marketing agency founded in 2017. We\'ve served 4000+ clients with 500+ successful campaigns. What would you like to know more about?', category: 'about' },
  { question: 'Tell me about Vansh', answer: 'Vansh Mehra is our Founder & Managing Director. He founded DigiSharks in 2017 and has been recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs.', category: 'about' },
  { question: 'Tell me about your team', answer: 'We have 25+ specialists including digital marketers, PR professionals, web developers, graphic designers, content creators, and campaign strategists. Our team is led by founder Vansh Mehra.', category: 'about' },

  // ── "How to..." / "How do I..." queries ──────────────────────────
  { question: 'How to contact DigiSharks', answer: 'Call +91 96273 32332, email marketing@digisharkscommunications.com, or visit our office in Sector 63, Noida. We\'re available Mon–Sat, 10 AM – 7 PM.', category: 'contact' },
  { question: 'How to start', answer: 'Getting started is easy! 1) Call/email us for a free consultation, 2) We discuss your goals, 3) Receive a custom strategy and quote, 4) We execute and report progress.', category: 'general' },
  { question: 'How to begin', answer: 'Simply contact us at +91 96273 32332 or marketing@digisharkscommunications.com. We\'ll schedule a free consultation to understand your needs and provide a customized solution.', category: 'general' },
  { question: 'How to get a quote', answer: 'Request a quote by calling +91 96273 32332, emailing marketing@digisharkscommunications.com, or filling out our contact form. We\'ll respond within 24 hours.', category: 'general' },
  { question: 'How to work with you', answer: 'Contact us for a free consultation, we\'ll understand your goals, create a custom strategy, and begin execution. We provide transparent reporting throughout our engagement.', category: 'general' },
  { question: 'How to order database', answer: 'Purchase the PAN India Database directly from our Digital Products page for just ₹299. Instant download after secure payment via Razorpay.', category: 'products' },
  { question: 'How to pay', answer: 'We accept payments via Razorpay — Credit Cards, Debit Cards, NetBanking, UPI, and digital wallets. We also accept bank transfers.', category: 'pricing' },
  { question: 'How to visit your office', answer: 'Visit us at B-2, C-87, C Block, Sector 63, Noida. We\'re open Mon–Sat, 10 AM – 7 PM. The nearest metro is Sector 62 Metro Station.', category: 'contact' },

  // ── "Do you..." queries ──────────────────────────────────────────
  { question: 'Do you do SEO', answer: 'Yes! We offer comprehensive SEO services including keyword research, on-page and technical optimization, link building, content strategy, and monthly reporting.', category: 'seo-ppc' },
  { question: 'Do you build websites', answer: 'Yes, we build business websites, e-commerce stores, landing pages, WordPress sites, and custom web applications. All sites are mobile-responsive and SEO-friendly.', category: 'web-development' },
  { question: 'Do you do social media', answer: 'Yes, we manage Facebook, Instagram, LinkedIn, Twitter, and YouTube — content creation, posting, engagement, and paid ads. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'Do you do PR', answer: 'Yes, Digital PR is one of our core services! Press release writing, distribution to 500+ journalists, media coverage on 80+ websites, and crisis communication.', category: 'digital-pr' },
  { question: 'Do you handle political campaigns', answer: 'Yes, we specialize in political campaign management — booth management, voter outreach, digital communication, and IT cell operations. Managed 500+ booths.', category: 'political' },
  { question: 'Do you offer free consultation', answer: 'Yes! We offer a free 30-minute strategy call to understand your business goals and recommend a custom growth roadmap.', category: 'general' },
  { question: 'Do you have experience with startups', answer: 'Yes, we love working with startups! We offer startup-friendly packages, flexible payment options, and strategies designed for early-stage growth.', category: 'startup' },
  { question: 'Do you work with small businesses', answer: 'Yes, we work with businesses of all sizes — from startups and small businesses to large enterprises. We have solutions for every budget.', category: 'general' },
  { question: 'Do you work with international clients', answer: 'Yes, we serve clients in India and internationally including USA, UK, Canada, UAE, Australia, and more.', category: 'general' },
  { question: 'Do you have a mobile app', answer: 'We don\'t have a dedicated mobile app, but our website is fully responsive and works perfectly on all mobile devices.', category: 'general' },
  { question: 'Do you offer discounts', answer: 'Yes, we offer discounts for quarterly and annual commitments. Contact us to discuss the best pricing option for your needs.', category: 'pricing' },

  // ── "Is there..." / "What is..." queries ─────────────────────────
  { question: 'Is there a free consultation', answer: 'Yes, we offer a free 30-minute strategy consultation. Book through our website or call +91 96273 32332.', category: 'general' },
  { question: 'Is there parking', answer: 'Yes, our office in Sector 63, Noida has parking available for visitors.', category: 'general' },
  { question: 'What is Digital PR', answer: 'Digital PR combines traditional media relations with online marketing. It involves strategic content placement across high-authority publications to generate brand awareness, search visibility, and lasting reputation.', category: 'digital-pr' },
  { question: 'What is AEO', answer: 'AEO (Answer Engine Optimization) optimizes content to appear in featured snippets, voice search results, and direct answers. It\'s essential for modern search visibility.', category: 'ai-seo-aeo-geo' },
  { question: 'What is GEO', answer: 'GEO (Generative Engine Optimization) optimizes content for AI-powered search engines like ChatGPT and Gemini. Ensures your brand appears in AI-generated answers.', category: 'ai-seo-aeo-geo' },
  { question: 'What is ORM', answer: 'ORM (Online Reputation Management) monitors and influences your brand\'s online reputation. We track mentions, manage reviews, and implement strategies to maintain a positive digital presence.', category: 'reputation-management' },

  // ====================================================================
  // ABBREVIATIONS AND SHORTHAND
  // ====================================================================
  { question: 'SEO PPC', answer: 'We offer both SEO (organic search optimization) and PPC (paid advertising) services. Together, they provide a complete search marketing strategy for maximum visibility.', category: 'seo-ppc' },
  { question: 'SMM', answer: 'Social Media Marketing — we manage Facebook, Instagram, LinkedIn, Twitter, and YouTube. Content creation, posting, engagement, and paid ads. Starts at Rs 20,000/month.', category: 'social-media' },
  { question: 'ORM', answer: 'Online Reputation Management — we monitor, protect, and improve your brand\'s online reputation across the web. Essential for maintaining a positive digital presence.', category: 'reputation-management' },
  { question: 'PR', answer: 'Public Relations — we handle press release distribution, media outreach, crisis communication, and reputation building. Packages start at Rs 8,500.', category: 'digital-pr' },
  { question: 'SEO', answer: 'Search Engine Optimization — we improve your website\'s visibility on Google through keyword research, optimization, link building, and content strategy. Packages from Rs 2,40,000.', category: 'seo-ppc' },
  { question: 'PPC', answer: 'Pay-Per-Click advertising — we manage Google Ads, social media ads, and display campaigns. You pay only when someone clicks your ad.', category: 'seo-ppc' },
  { question: 'AEO', answer: 'Answer Engine Optimization — optimizing content for featured snippets and AI answers. A must-have for modern SEO strategies.', category: 'ai-seo-aeo-geo' },
  { question: 'GEO', answer: 'Generative Engine Optimization — optimizing for AI search engines like ChatGPT. The future of search visibility.', category: 'ai-seo-aeo-geo' },
  { question: 'CMS', answer: 'Content Management System — like WordPress, allows you to manage website content easily without technical knowledge. We build sites on popular CMS platforms.', category: 'web-development' },
  { question: 'CRM', answer: 'Customer Relationship Management — we can integrate CRM systems and help with marketing automation to manage customer interactions and data.', category: 'technology' },
  { question: 'ROI', answer: 'Return on Investment — measures the profitability of your marketing efforts. We track and optimize campaigns to maximize your ROI.', category: 'digital-marketing' },
  { question: 'KPI', answer: 'Key Performance Indicators — measurable metrics that track campaign success. We define and monitor KPIs relevant to your business goals.', category: 'digital-marketing' },
  { question: 'GBP', answer: 'Google Business Profile — a free listing that helps your business appear in Google Search and Maps. We optimize GBP for better local visibility.', category: 'seo-ppc' },
  { question: 'GTM', answer: 'Google Tag Manager — a free tool to manage tracking codes on your website without modifying code. We use GTM for efficient tag management.', category: 'technology' },
  { question: 'GA4', answer: 'Google Analytics 4 — the latest Google Analytics for tracking website and app performance. We set up GA4 with custom events and conversion tracking.', category: 'technology' },
  { question: 'UI UX', answer: 'UI (User Interface) and UX (User Experience) design focuses on creating intuitive, visually appealing digital experiences. We design websites with best UI/UX practices.', category: 'web-development' },
  { question: 'CTA', answer: 'Call-to-Action — a button or link that prompts users to take action (Buy Now, Contact Us, Sign Up). We optimize CTAs for maximum conversions.', category: 'digital-marketing' },
  { question: 'SERP', answer: 'Search Engine Results Page — the page you see after searching on Google. Higher SERP rankings mean more visibility and traffic.', category: 'seo-ppc' },

  // ====================================================================
  // TYPO AND VARIANT QUERIES — common misspellings and close variants
  // ====================================================================
  { question: 'digishark', answer: 'You mean DigiSharks Communications! We\'re a top AI-powered Digital PR and Marketing agency. How can we help you?', category: 'about' },
  { question: 'digi sharks', answer: 'DigiSharks Communications — that\'s us! We\'re a premier digital PR and marketing agency. What can we help you with?', category: 'about' },
  { question: 'digisharks communications', answer: 'Welcome to DigiSharks Communications! We\'re a top AI-powered Digital PR and Marketing agency. How can we assist you today?', category: 'about' },
  { question: 'web dev cost', answer: 'Website development costs depend on requirements. Basic business websites start at Rs 10,500. E-commerce and custom apps vary. Contact us for a quote!', category: 'pricing' },
  { question: 'web design price', answer: 'Website design starts at Rs 10,500 for a 10-page WordPress site with CMS, mobile responsive layout, and SEO optimization.', category: 'pricing' },
  { question: 'smo services', answer: 'Social Media Optimization (SMO) is included in our social media marketing services. We optimize profiles, content, and engagement strategies for better results.', category: 'social-media' },
  { question: 'sem services', answer: 'Search Engine Marketing (SEM) — we offer both SEO (organic) and PPC (paid) services for complete search visibility. Contact us for more details!', category: 'seo-ppc' },
  { question: 'pr package', answer: 'Our press release package: Rs 8,500 for 2 releases, distributed to 500+ journalists, with assured coverage on 80+ websites.', category: 'digital-pr' },
  { question: 'seo plan', answer: 'Our 5-keyword SEO plan is Rs 2,40,000. Includes keyword research, link building, content optimization, and monthly reporting. Contact us for a consultation!', category: 'seo-ppc' },
  { question: 'marketing cost', answer: 'Marketing costs vary by service: SMM – Rs 20,000/month, SEO – Rs 2,40,000, PR – Rs 8,500, Brand Promotion – Rs 50,000. Contact us for a custom quote.', category: 'pricing' },
  { question: 'digital marketing cost', answer: 'Our services range from Rs 8,500 (PR) to Rs 2,40,000 (SEO), with monthly options like SMM at Rs 20,000/month. Contact us to discuss your budget and needs.', category: 'pricing' },

  // ====================================================================
  // SINGLE WORD / VERY SHORT INTENT QUERIES
  // Users typing just one word to express their need
  // ====================================================================
  { question: 'pricing', answer: 'Our services: Press Release – Rs 8,500, Website – Rs 10,500, SEO – Rs 2,40,000, SMM – Rs 20,000/month, Brand Promotion – Rs 50,000, Events – Rs 50,000/day. Contact us for custom quotes!', category: 'pricing' },
  { question: 'price', answer: 'We offer transparent pricing: PR – Rs 8,500, Website – Rs 10,500, SEO – Rs 2,40,000, SMM – Rs 20,000/month, Brand Promotion – Rs 50,000. Which service interests you?', category: 'pricing' },
  { question: 'rates', answer: 'Our rates: Press Release – Rs 8,500, Web Design – Rs 10,500, SEO – Rs 2,40,000, SMM – Rs 20,000/month, Brand Promotion – Rs 50,000, Events – Rs 50,000/day.', category: 'pricing' },
  { question: 'cost', answer: 'Service costs: PR – Rs 8,500, Website – Rs 10,500, SEO – Rs 2,40,000, SMM – Rs 20,000/month, Brand Promotion – Rs 50,000. Contact us for a custom quote!', category: 'pricing' },
  { question: 'website', answer: 'We build business websites, e-commerce stores, landing pages, and custom web applications. Starting at Rs 10,500. All sites are mobile-responsive and SEO-friendly.', category: 'web-development' },
  { question: 'contact', answer: 'Reach us at +91 96273 32332 or marketing@digisharkscommunications.com. Our office is in Sector 63, Noida. We\'re available Mon–Sat, 10 AM – 7 PM.', category: 'contact' },
  { question: 'address', answer: 'Our office: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301, India. Walk-ins welcome during business hours!', category: 'contact' },
  { question: 'phone', answer: 'Call us at +91 96273 32332. Available Monday to Saturday, 10:00 AM – 7:00 PM IST.', category: 'contact' },
  { question: 'email', answer: 'Email us at marketing@digisharkscommunications.com. We respond within 24 hours on business days.', category: 'contact' },
  { question: 'location', answer: 'We\'re located in Sector 63, Noida, Uttar Pradesh. Office: B-2, C-87, C Block, Sector 63, Noida – 201301.', category: 'contact' },
  { question: 'hours', answer: 'Business hours: Monday to Saturday, 10:00 AM – 7:00 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'timings', answer: 'We\'re open Mon–Sat, 10 AM – 7 PM IST. Closed on Sundays and public holidays.', category: 'general' },
  { question: 'services', answer: 'We offer Digital PR, SEO & PPC, Social Media Marketing, Web Development, Brand Promotion, Political Campaigns, Event Management, Graphic Design, Content Creation, and ORM.', category: 'services' },
  { question: 'products', answer: 'Our main digital product is the PAN India Updated Database — verified contacts across 40+ industries for just ₹299. Visit our Digital Products page to purchase.', category: 'products' },
  { question: 'database', answer: 'The PAN India Updated Database covers 40+ industries and 145+ categories with verified contacts. Priced at just ₹299 with lifetime access and free updates.', category: 'products' },
  { question: 'refund', answer: 'Digital products (like databases) are non-refundable due to their nature. For services, we handle refunds on a case-by-case basis. Contact us for details.', category: 'general' },
  { question: 'career', answer: 'We occasionally have openings! Email your resume to marketing@digisharkscommunications.com. Note: We never offer jobs via WhatsApp or Telegram.', category: 'career' },
  { question: 'jobs', answer: 'For job inquiries, email your resume to marketing@digisharkscommunications.com. Beware of scams — we never ask for money during recruitment.', category: 'career' },
  { question: 'internship', answer: 'We offer internships in digital marketing, PR, content creation, and web development. Email your resume to marketing@digisharkscommunications.com.', category: 'career' },
  { question: 'hire', answer: 'We\'re always looking for talent! Email your resume to marketing@digisharkscommunications.com. We review applications and contact suitable candidates.', category: 'career' },
  { question: 'help', answer: 'How can we help you? Choose a topic: Services, Pricing, Contact, Website, SEO, PR, Social Media, or Branding. Just let me know what you need!', category: 'general' },
  { question: 'support', answer: 'For support, contact your account manager or email marketing@digisharkscommunications.com. We typically respond within 4 business hours.', category: 'general' },
  { question: 'chat', answer: 'You\'re chatting with the DigiSharks assistant! How can I help you today? Ask about our services, pricing, or anything else you\'d like to know.', category: 'general' },
  { question: 'hello', answer: 'Hello! Welcome to DigiSharks Communications. I\'m the chatbot assistant. How can I help you today? Ask me about our services, pricing, or anything else!', category: 'general' },
  { question: 'hi', answer: 'Hi there! Welcome to DigiSharks Communications. I\'m here to help! Ask me about our digital PR, SEO, web development, or any other services.', category: 'general' },
  { question: 'hey', answer: 'Hey! Welcome to DigiSharks! I can help you with information about our services, pricing, contact details, and more. What would you like to know?', category: 'general' },
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
    const totalEntries = SHORT_ENTRIES.length

    // Categorize
    const cats = [...new Set(SHORT_ENTRIES.map(e => e.category))]
    console.log(`📊 Categories: ${cats.join(', ')}`)
    console.log(`📊 Total short entries: ${totalEntries}`)
    console.log('')

    for (const entry of SHORT_ENTRIES) {
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

    console.log(`\n✅ Short-query seeding complete!`)
    console.log(`📊 This batch: ${inserted} inserted, ${skipped} skipped`)
    console.log(`📊 TOTAL in database: ${totalCount}`)
    console.log(`📊 Categories: ${cats.length}`)

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (err) {
    console.error('❌ Error seeding short queries:', err)
    process.exit(1)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

seedQA()
