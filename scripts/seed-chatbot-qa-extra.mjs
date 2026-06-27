/**
 * Additional SEED entries to reach 1000+ total chatbot Q&A pairs.
 * Run AFTER seed-chatbot-qa-1000.mjs.
 * Usage: node scripts/seed-chatbot-qa-extra.mjs
 */

const FAQ_ENTRIES = [
  // CATEGORY: photography
  { question: 'Do you offer product photography?', answer: 'Yes, we offer professional product photography services for e-commerce businesses and online stores. Our product shots help showcase your products in the best light to drive sales.', category: 'photography' },
  { question: 'What types of photography do you offer?', answer: 'We offer product photography, corporate event photography, brand shoots, headshot photography, and still-life photography for commercial use.', category: 'photography' },
  { question: 'Do you offer real estate photography?', answer: 'Yes, we offer real estate photography including property walkthroughs, architectural shots, and virtual tours for real estate listings and marketing materials.', category: 'photography' },
  { question: 'Can you do photo editing and retouching?', answer: 'Yes, we offer professional photo editing and retouching services including color correction, background removal, skin retouching, and image optimization for web and print.', category: 'photography' },
  { question: 'What equipment do you use?', answer: 'We use professional-grade cameras, lighting equipment, and accessories to ensure high-quality results in all our photography and videography projects.', category: 'photography' },
  { question: 'Do you offer 360-degree product photography?', answer: 'Yes, we offer 360-degree product photography allowing customers to view products from all angles — ideal for e-commerce websites and online catalogs.', category: 'photography' },
  { question: 'How much does product photography cost?', answer: 'Product photography costs vary based on complexity, quantity, and usage rights. Contact us for a customized quote based on your specific requirements.', category: 'photography' },

  // CATEGORY: animation
  { question: 'Do you create animations for websites?', answer: 'Yes, we create custom animations for websites including loading animations, hover effects, scroll-triggered animations, and micro-interactions that enhance user experience.', category: 'animation' },
  { question: 'What animation styles do you offer?', answer: 'We offer 2D animation, motion graphics, whiteboard animation, explainer videos, character animation, typography animation, and logo animation.', category: 'animation' },
  { question: 'Can you create GIFs for social media?', answer: 'Yes, we create custom animated GIFs and short animations optimized for social media platforms to increase engagement and brand visibility.', category: 'animation' },

  // CATEGORY: advertising
  { question: 'What types of advertising do you offer?', answer: 'We offer digital advertising including Google Ads, social media ads, display advertising, video advertising, native advertising, and programmatic advertising across multiple platforms.', category: 'advertising' },
  { question: 'What is display advertising?', answer: 'Display advertising uses visual banner ads placed on websites, apps, and social media to reach target audiences. We create and manage display campaigns with precise targeting and performance tracking.', category: 'advertising' },
  { question: 'What is native advertising?', answer: 'Native advertising matches the look and feel of the platform where it appears, making ads less intrusive and more engaging. We create native ad campaigns that blend naturally with editorial content.', category: 'advertising' },
  { question: 'What is programmatic advertising?', answer: 'Programmatic advertising uses automated technology to buy and place ads in real-time based on audience data. It enables precise targeting, efficient spending, and scale through AI-powered optimization.', category: 'advertising' },
  { question: 'Do you offer classified advertising?', answer: 'Yes, we can help with classified advertising in print and digital publications for job listings, property ads, business opportunities, and other classified categories.', category: 'advertising' },
  { question: 'How do you measure ad effectiveness?', answer: 'We measure ad effectiveness through impressions, clicks, click-through rates (CTR), conversions, cost-per-click (CPC), cost-per-acquisition (CPA), return on ad spend (ROAS), and attribution modeling.', category: 'advertising' },

  // CATEGORY: sms-marketing
  { question: 'Do you offer SMS marketing?', answer: 'Yes, we offer SMS marketing services including bulk SMS campaigns, transactional SMS, personalized messaging, and SMS automation for customer engagement and promotions.', category: 'sms-marketing' },
  { question: 'Is SMS marketing effective?', answer: 'Yes, SMS marketing has 98% open rates and delivers messages within seconds. It\'s highly effective for time-sensitive offers, reminders, alerts, and direct customer communication.', category: 'sms-marketing' },
  { question: 'Do you offer WhatsApp marketing?', answer: 'Yes, we offer WhatsApp Business marketing including broadcast lists, automated responses, catalog sharing, and WhatsApp advertising to reach customers on India\'s most popular messaging platform.', category: 'sms-marketing' },

  // CATEGORY: influencer
  { question: 'How do you find the right influencers for my brand?', answer: 'We identify influencers based on relevance to your industry, audience demographics, engagement rates, authenticity, content quality, and alignment with your brand values.', category: 'influencer' },
  { question: 'What is micro-influencer marketing?', answer: 'Micro-influencers have smaller but highly engaged followings (typically 10K-100K). They often have higher engagement rates and more authentic connections with their audience compared to larger influencers.', category: 'influencer' },
  { question: 'How do you measure influencer campaign success?', answer: 'We measure influencer campaigns through engagement rates, reach, impressions, website traffic, coupon code usage, affiliate sales, brand sentiment, and overall return on investment.', category: 'influencer' },
  { question: 'Do you work with nano-influencers?', answer: 'Yes, we work with nano-influencers (1K-10K followers) who often have the highest engagement rates and strongest community trust. They\'re especially effective for local and niche campaigns.', category: 'influencer' },
  { question: 'What is the typical cost of influencer marketing?', answer: 'Influencer costs vary widely based on follower count, engagement rate, platform, content requirements, and usage rights. We help negotiate fair rates and manage the entire partnership.', category: 'influencer' },

  // CATEGORY: email-marketing
  { question: 'What is email marketing?', answer: 'Email marketing involves sending commercial messages to a group of people via email. It\'s used for newsletters, promotions, lead nurturing, customer retention, and transactional communications.', category: 'email-marketing' },
  { question: 'How do you build an email list?', answer: 'We build email lists through lead magnets (free downloads, discounts), website forms, pop-ups, landing pages, social media campaigns, webinars, events, and partnerships — always with proper opt-in consent.', category: 'email-marketing' },
  { question: 'What is email deliverability?', answer: 'Email deliverability is the ability to successfully deliver emails to recipients\' inboxes (not spam folders). We optimize sender reputation, authentication (SPF, DKIM, DMARC), content quality, and list hygiene for high deliverability.', category: 'email-marketing' },
  { question: 'What is an email drip campaign?', answer: 'A drip campaign is a series of automated emails sent based on specific triggers or schedules. Examples include welcome sequences, abandoned cart reminders, re-engagement campaigns, and post-purchase follow-ups.', category: 'email-marketing' },
  { question: 'What is A/B testing in email marketing?', answer: 'A/B testing in email marketing involves sending two versions of an email with one variable changed (subject line, CTA, image, etc.) to see which performs better, then using the winning version for the rest of your list.', category: 'email-marketing' },
  { question: 'What are the best practices for email marketing?', answer: 'Best practices include: personalization, mobile-responsive design, clear CTAs, compelling subject lines, proper segmentation, consistent sending schedule, valuable content, CAN-SPAM compliance, and regular list cleaning.', category: 'email-marketing' },
  { question: 'What is CAN-SPAM compliance?', answer: 'CAN-SPAM is a US law that sets rules for commercial email. Requirements include: accurate header information, clear subject lines, identifying messages as ads, including your physical address, and providing clear opt-out mechanisms.', category: 'email-marketing' },
  { question: 'What email marketing platforms do you recommend?', answer: 'We recommend and work with platforms like Mailchimp, SendGrid, Brevo (Sendinblue), and others based on your business size, needs, and budget.', category: 'email-marketing' },
  { question: 'How often should I send marketing emails?', answer: 'Frequency depends on your audience and content. We recommend 1-4 emails per month for most businesses. The key is consistency and value — every email should provide something useful to the recipient.', category: 'email-marketing' },

  // CATEGORY: seo-ppc (more)
  { question: 'What is SEO copywriting?', answer: 'SEO copywriting is writing content that is optimized for search engines while remaining valuable and readable for humans. It balances keyword usage with natural, engaging writing.', category: 'seo-ppc' },
  { question: 'What is a meta description?', answer: 'A meta description is a brief HTML attribute that summarizes a webpage\'s content. It appears below the title in search results and influences click-through rates. Good meta descriptions are compelling, 150-160 characters, and include target keywords.', category: 'seo-ppc' },
  { question: 'What is a title tag?', answer: 'A title tag is an HTML element that specifies the title of a webpage. It appears as the clickable headline in search results and is important for SEO, usability, and social sharing.', category: 'seo-ppc' },
  { question: 'What is an H1 tag?', answer: 'An H1 tag is the main heading of a webpage. It should clearly describe the page\'s topic and include the primary keyword. Each page should have one unique H1 tag.', category: 'seo-ppc' },
  { question: 'What is image alt text?', answer: 'Alt text (alternative text) describes images for search engines and visually impaired users. It improves SEO by helping search engines understand image content and is required for accessibility compliance.', category: 'seo-ppc' },
  { question: 'What is a canonical tag?', answer: 'A canonical tag (rel=canonical) tells search engines which version of a page is the master copy when duplicate content exists. It prevents SEO issues caused by having multiple URLs with similar content.', category: 'seo-ppc' },
  { question: 'What is 404 error in SEO?', answer: 'A 404 error means a page couldn\'t be found on the server. Too many 404s can harm user experience and SEO. We monitor and fix broken links, set up redirects, and create custom 404 pages.', category: 'seo-ppc' },
  { question: 'What is page authority?', answer: 'Page Authority is a score (1-100) developed by Moz that predicts how well a specific page will rank in search results. It\'s based on link data and other factors.', category: 'seo-ppc' },
  { question: 'What is a nofollow link?', answer: 'A nofollow link has a rel="nofollow" attribute that tells search engines not to pass authority or ranking credit to the linked page. It\'s commonly used for sponsored content, comments, and user-generated content.', category: 'seo-ppc' },
  { question: 'What is a dofollow link?', answer: 'A dofollow link passes authority and ranking credit from one site to another. These are the most valuable links for SEO because they directly contribute to higher search rankings.', category: 'seo-ppc' },
  { question: 'What is anchor text?', answer: 'Anchor text is the clickable text in a hyperlink. It should be descriptive and relevant to the linked page. Different types include exact match, partial match, branded, and generic anchor text.', category: 'seo-ppc' },
  { question: 'What is keyword density?', answer: 'Keyword density is the percentage of times a keyword appears in content compared to total word count. While there\'s no ideal percentage, content should naturally include keywords without keyword stuffing.', category: 'seo-ppc' },
  { question: 'What is Google Penguin?', answer: 'Google Penguin is an algorithm update that targets websites with spammy or manipulative link building practices. Sites hit by Penguin need to clean up their backlink profile and disavow toxic links.', category: 'seo-ppc' },
  { question: 'What is Google Panda?', answer: 'Google Panda is an algorithm update that penalizes low-quality, thin, or duplicate content. It rewards sites with high-quality, original, and valuable content. Recovery requires content improvement.', category: 'seo-ppc' },
  { question: 'What is Google Hummingbird?', answer: 'Google Hummingbird is an algorithm update that improved Google\'s ability to understand natural language queries and search intent rather than focusing on individual keywords.', category: 'seo-ppc' },
  { question: 'What is Google RankBrain?', answer: 'RankBrain is Google\'s AI system that helps process search results. It uses machine learning to understand the relationship between pages and queries, improving search relevance for new and complex searches.', category: 'seo-ppc' },
  { question: 'What is structured data?', answer: 'Structured data is a standardized format (Schema.org) for providing information about a page and classifying its content. It helps search engines understand context and can generate rich snippets in results.', category: 'seo-ppc' },
  { question: 'What is a rich snippet?', answer: 'Rich snippets are enhanced search results that include additional information like star ratings, prices, images, recipes, or event dates. They increase visibility and click-through rates.', category: 'seo-ppc' },
  { question: 'What is Google Tag Manager?', answer: 'Google Tag Manager (GTM) is a free tool that lets you manage tracking codes and marketing tags on your website without modifying the underlying code. It simplifies tag deployment and management.', category: 'seo-ppc' },
  { question: 'What is bounce rate?', answer: 'Bounce rate is the percentage of visitors who leave your website after viewing only one page. A high bounce rate may indicate poor user experience, irrelevant content, or slow loading times.', category: 'seo-ppc' },
  { question: 'What is dwell time?', answer: 'Dwell time is how long a visitor stays on a page after clicking from search results before returning to SERPs. Longer dwell times signal valuable content and can positively influence rankings.', category: 'seo-ppc' },
  { question: 'What is click-through rate?', answer: 'Click-through rate (CTR) is the percentage of users who click on a specific link out of total users who view it. Higher CTRs in search results can improve rankings.', category: 'seo-ppc' },
  { question: 'What is organic traffic?', answer: 'Organic traffic refers to visitors who arrive at your website through unpaid search engine results. It\'s the most valuable traffic source because it\'s free and indicates strong SEO performance.', category: 'seo-ppc' },

  // CATEGORY: social-media (more)
  { question: 'What is a social media strategy?', answer: 'A social media strategy outlines your goals, target audience, content approach, platform selection, posting schedule, and measurement metrics. It guides all social media activities toward business objectives.', category: 'social-media' },
  { question: 'What is a social media audit?', answer: 'A social media audit reviews your current social presence, content performance, audience demographics, competitor activity, platform effectiveness, and opportunities for improvement.', category: 'social-media' },
  { question: 'What is organic reach on social media?', answer: 'Organic reach is the number of people who see your content without paid promotion. It\'s declining on most platforms but can be improved through engaging content, optimal posting times, and community interaction.', category: 'social-media' },
  { question: 'What is viral content?', answer: 'Viral content spreads rapidly through social sharing, often exponentially. While we can create shareable content, virality cannot be guaranteed — it depends on audience resonance, timing, and platform algorithms.', category: 'social-media' },
  { question: 'What is the best time to post on Instagram?', answer: 'The best posting times vary by audience. Generally, mornings (7-9 AM), lunchtime (12-1 PM), and evenings (6-9 PM) on weekdays work well. We analyze your specific audience data for optimal times.', category: 'social-media' },
  { question: 'What is the best time to post on Facebook?', answer: 'Facebook engagement is typically highest on weekdays from 9 AM to 3 PM, with Wednesday at 11 AM often being the optimal time. We customize based on your audience data.', category: 'social-media' },
  { question: 'What is the best time to post on LinkedIn?', answer: 'LinkedIn performs best on Tuesday through Thursday, 8 AM to 10 AM and 12 PM to 1 PM. Weekends have lower engagement on this professional platform.', category: 'social-media' },
  { question: 'What is a social media manager?', answer: 'A social media manager handles content creation, posting, engagement, analytics, and strategy execution across your social platforms. We provide dedicated social media management as a service.', category: 'social-media' },
  { question: 'How many hours does social media management take?', answer: 'Effective social media management typically requires 10-20 hours per week per platform, including content creation, engagement, monitoring, analytics, and strategy adjustments.', category: 'social-media' },
  { question: 'What is social media ROI?', answer: 'Social media ROI measures the return generated from your social media investment. It includes direct sales, lead generation, website traffic, brand awareness, customer loyalty, and reduced customer service costs.', category: 'social-media' },
  { question: 'How do you calculate social media ROI?', answer: 'We calculate social media ROI by tracking conversions from social channels, attributing value to engagement metrics, measuring cost savings from organic reach, and comparing against your investment.', category: 'social-media' },
  { question: 'What is a social media calendar template?', answer: 'A social media calendar template organizes planned content by date, platform, content type, captions, visuals, and status. We provide and manage content calendars for all our SMM clients.', category: 'social-media' },
  { question: 'How do you create engaging Instagram Stories?', answer: 'Engaging Stories use polls, questions, quizzes, countdowns, music, location tags, and interactive stickers. We create Stories that drive interaction and maintain top-of-feed visibility.', category: 'social-media' },
  { question: 'What is Instagram Shopping?', answer: 'Instagram Shopping allows businesses to tag products in posts and Stories, creating a seamless shopping experience. Customers can tap to view product details and purchase without leaving the app.', category: 'social-media' },
  { question: 'How do I get more Instagram followers?', answer: 'Grow followers by posting consistent high-quality content, using relevant hashtags, engaging with your community, posting Reels, collaborating with others, and using Instagram SEO strategies.', category: 'social-media' },
  { question: 'What is shadowban on Instagram?', answer: 'Shadowbanning is when Instagram limits your content\'s visibility without notifying you. It\'s often caused by using banned hashtags, spammy behavior, or violating community guidelines.', category: 'social-media' },
  { question: 'How do I avoid Instagram shadowban?', answer: 'Avoid shadowbans by not using banned hashtags, posting authentic content, not using automation tools, following community guidelines, and spacing out activities like following and commenting.', category: 'social-media' },
  { question: 'What is Facebook pixel?', answer: 'Facebook pixel is a piece of code that tracks website visitors and their actions. It enables retargeting, conversion tracking, custom audiences, and lookalike audiences for Facebook and Instagram ads.', category: 'social-media' },
  { question: 'What is a lookalike audience?', answer: 'A lookalike audience is a targeting option that finds new people who are similar to your existing customers. It\'s created by analyzing your source audience\'s characteristics and finding matching profiles.', category: 'social-media' },
  { question: 'What is a custom audience on Facebook?', answer: 'A custom audience is a targeting option using your existing data — website visitors, customer email lists, app users, or video viewers. It allows retargeting and personalized advertising.', category: 'social-media' },
  { question: 'What is Facebook Business Manager?', answer: 'Facebook Business Manager is a central platform for managing Facebook pages, ad accounts, and team permissions. We use it to manage all client social media and advertising activities securely.', category: 'social-media' },
  { question: 'What is Facebook Insights?', answer: 'Facebook Insights is the analytics dashboard for Facebook pages. It provides data on page performance, audience demographics, post engagement, and content reach.', category: 'social-media' },
  { question: 'What is Instagram Insights?', answer: 'Instagram Insights provides analytics for Instagram accounts including follower demographics, content performance, Stories analytics, and engagement metrics to inform strategy.', category: 'social-media' },
  { question: 'What is LinkedIn Analytics?', answer: 'LinkedIn Analytics provides data on company page performance including follower growth, post engagement, audience demographics, and competitor benchmarking.', category: 'social-media' },
  { question: 'What is Twitter Analytics?', answer: 'Twitter Analytics provides data on tweet performance, follower growth, engagement rates, and audience insights to optimize your Twitter strategy.', category: 'social-media' },
  { question: 'What is YouTube Analytics?', answer: 'YouTube Analytics provides data on video performance including views, watch time, audience retention, traffic sources, and subscriber growth to optimize your video content strategy.', category: 'social-media' },

  // CATEGORY: web-development (more)
  { question: 'What is a domain name?', answer: 'A domain name is your website\'s address on the internet (e.g., digisharkscommunications.com). It\'s what users type in their browser to visit your site.', category: 'web-development' },
  { question: 'How do I choose a domain name?', answer: 'Choose a short, memorable, brandable domain that reflects your business. Use .com when possible, avoid hyphens and numbers, and ensure it\'s easy to spell and pronounce.', category: 'web-development' },
  { question: 'What is web hosting?', answer: 'Web hosting is a service that stores your website files and makes them accessible on the internet. Types include shared hosting, VPS hosting, dedicated hosting, and cloud hosting.', category: 'web-development' },
  { question: 'What is shared hosting?', answer: 'Shared hosting means your website shares server resources with other websites. It\'s affordable but may have performance limitations during traffic spikes. Suitable for small to medium websites.', category: 'web-development' },
  { question: 'What is VPS hosting?', answer: 'VPS (Virtual Private Server) hosting gives you dedicated resources within a shared environment. It offers better performance and control than shared hosting, suitable for growing websites.', category: 'web-development' },
  { question: 'What is dedicated hosting?', answer: 'Dedicated hosting provides an entire server for your website only. It offers maximum performance, security, and control, suitable for high-traffic websites and enterprise applications.', category: 'web-development' },
  { question: 'What is cloud hosting?', answer: 'Cloud hosting uses multiple servers working together to host your website. It offers scalability, reliability, and pay-as-you-go pricing. Resources can be scaled up or down based on demand.', category: 'web-development' },
  { question: 'What is a content management system?', answer: 'A Content Management System (CMS) allows you to manage website content without technical knowledge. WordPress is the most popular CMS, powering over 40% of all websites.', category: 'web-development' },
  { question: 'What is WordPress?', answer: 'WordPress is the world\'s most popular CMS, powering over 40% of websites. It offers thousands of themes, plugins, and customization options. We specialize in WordPress development.', category: 'web-development' },
  { question: 'What is a WordPress theme?', answer: 'A WordPress theme controls the visual appearance and layout of your website. We develop custom themes or customize existing ones to match your brand identity and requirements.', category: 'web-development' },
  { question: 'What is a WordPress plugin?', answer: 'A WordPress plugin adds specific functionality to your site — like contact forms, SEO tools, security features, e-commerce capabilities, analytics, and more. Thousands of plugins are available.', category: 'web-development' },
  { question: 'How do I update WordPress?', answer: 'WordPress can be updated through the admin dashboard. We recommend regular updates for security and performance. For maintenance clients, we handle all updates automatically.', category: 'web-development' },
  { question: 'Why is WordPress security important?', answer: 'WordPress sites are common targets for hackers. Security measures include regular updates, strong passwords, security plugins, SSL certificates, backups, and user permission management.', category: 'web-development' },
  { question: 'What is two-factor authentication?', answer: 'Two-factor authentication (2FA) adds an extra security layer requiring a second verification method (like a code sent to your phone) beyond just a password. We can implement 2FA on your website.', category: 'web-development' },
  { question: 'What is a website backup?', answer: 'A website backup is a copy of your website files and database stored safely. Regular backups ensure you can restore your site quickly if something goes wrong — like a hack or accidental data loss.', category: 'web-development' },
  { question: 'How often should I backup my website?', answer: 'We recommend daily backups for active websites with frequent updates, and weekly backups for static sites. Critical data should be backed up before any major changes or updates.', category: 'web-development' },
  { question: 'What is website maintenance?', answer: 'Website maintenance includes regular updates, security monitoring, backups, performance optimization, content updates, broken link checks, and technical support to keep your site running smoothly.', category: 'web-development' },
  { question: 'How much does website maintenance cost?', answer: 'Website maintenance costs vary based on complexity and frequency of updates. Contact us for a customized maintenance plan that fits your budget and requirements.', category: 'web-development' },
  { question: 'What is a staging site?', answer: 'A staging site is a copy of your website used for testing changes before applying them to the live site. It allows you to test updates, new features, and design changes safely.', category: 'web-development' },
  { question: 'What is a development environment?', answer: 'A development environment is where developers build and test websites before launching. It includes local, staging, and production environments to ensure smooth deployment.', category: 'web-development' },
  { question: 'What is Git version control?', answer: 'Git is a version control system that tracks changes to code over time. It allows collaboration, rollback to previous versions, and safe experimentation with new features.', category: 'web-development' },
  { question: 'What is CSS?', answer: 'CSS (Cascading Style Sheets) controls the visual presentation of a website — colors, fonts, layout, spacing, animations, and responsive design. It works alongside HTML to create beautiful web pages.', category: 'web-development' },
  { question: 'What is HTML?', answer: 'HTML (HyperText Markup Language) is the standard language for creating web pages. It provides the structure and content of a webpage using elements like headings, paragraphs, images, and links.', category: 'web-development' },
  { question: 'What is JavaScript?', answer: 'JavaScript is a programming language that adds interactivity to websites — like animations, form validation, dynamic content updates, interactive maps, and user interface enhancements.', category: 'web-development' },
  { question: 'What is React?', answer: 'React is a JavaScript library for building user interfaces. It\'s developed by Facebook and is widely used for creating fast, interactive single-page applications. We use React alongside Next.js.', category: 'web-development' },
  { question: 'What is an API?', answer: 'API (Application Programming Interface) allows different software applications to communicate. For example, a payment API allows your website to process credit card payments through a payment gateway.', category: 'web-development' },
  { question: 'What is REST API?', answer: 'REST (Representational State Transfer) API is a standardized way for web services to communicate. It uses HTTP methods (GET, POST, PUT, DELETE) to perform operations on data.', category: 'web-development' },
  { question: 'What is GraphQL?', answer: 'GraphQL is a query language for APIs that allows clients to request exactly the data they need. It\'s more flexible and efficient than REST for complex data requirements.', category: 'web-development' },
  { question: 'What is a database?', answer: 'A database stores and organizes your website\'s data — user information, content, products, orders, etc. Common databases include MySQL, MongoDB, and PostgreSQL.', category: 'web-development' },
  { question: 'What is MySQL?', answer: 'MySQL is a popular open-source relational database management system. It\'s commonly used with WordPress and many web applications for storing structured data.', category: 'web-development' },
  { question: 'What is caching?', answer: 'Caching stores frequently accessed data temporarily to speed up page load times. We implement browser caching, server caching, and CDN caching to optimize website performance.', category: 'web-development' },
  { question: 'What is a CDN?', answer: 'CDN (Content Delivery Network) distributes your website\'s static files across multiple servers worldwide. Visitors download files from the nearest server, reducing load times significantly.', category: 'web-development' },
  { question: 'What is website optimization?', answer: 'Website optimization improves loading speed, user experience, and search rankings. It includes image compression, code minification, caching, server optimization, and mobile optimization.', category: 'web-development' },
  { question: 'How do I check my website speed?', answer: 'You can check website speed using tools like Google PageSpeed Insights, GTmetrix, Pingdom, and WebPageTest. We use these tools to identify and fix performance issues.', category: 'web-development' },

  // CATEGORY: general (more)
  { question: 'Can I pay online?', answer: 'Yes, we accept online payments via Razorpay including credit cards, debit cards, net banking, UPI, and digital wallets. All payments are processed securely.', category: 'general' },
  { question: 'What is UPI and do you accept it?', answer: 'UPI (Unified Payments Interface) is a popular Indian digital payment system. Yes, we accept UPI payments via Razorpay for easy, instant transactions.', category: 'general' },
  { question: 'Do you provide GST invoices?', answer: 'Yes, we provide GST-compliant invoices for all services and products. All transactions are documented with proper tax receipts.', category: 'general' },
  { question: 'What is your company PAN number?', answer: 'We provide our company PAN and GST details on all invoices. Contact us for specific billing or vendor registration information.', category: 'general' },
  { question: 'Do you work on public holidays?', answer: 'Our office remains closed on all major public holidays. For urgent matters, you can email us and we\'ll respond on the next working day.', category: 'general' },
  { question: 'Can I reschedule a meeting?', answer: 'Yes, you can reschedule meetings by contacting your account manager or calling us at +91 96273 32332. We request 24 hours notice for rescheduling.', category: 'general' },
  { question: 'Do you offer emergency services?', answer: 'Yes, we offer emergency support for urgent website issues, PR crises, and time-sensitive marketing needs. Contact us immediately for emergency assistance.', category: 'general' },
  { question: 'What if I need services outside your listed packages?', answer: 'We offer fully customized solutions beyond our standard packages. Contact us to discuss your specific requirements, and we\'ll create a tailored proposal.', category: 'general' },
  { question: 'Can you work with my existing website platform?', answer: 'Yes, we can work with most existing website platforms including WordPress, Shopify, Wix, Squarespace, and custom-built sites. We\'ll adapt our services to your platform.', category: 'general' },
  { question: 'Do you offer migration from one platform to another?', answer: 'Yes, we offer website migration services between platforms — for example, moving from Wix to WordPress, or from custom site to Shopify.', category: 'general' },
  { question: 'How do I know if I need a new website?', answer: 'Signs you need a new website include: outdated design, slow loading, not mobile-friendly, poor conversion rates, difficulty updating content, security issues, or your competitors have better sites.', category: 'general' },
  { question: 'What is the first step in website design?', answer: 'The first step is a discovery session where we understand your business, goals, target audience, competitors, and requirements. This informs the entire design and development process.', category: 'general' },
  { question: 'Do you include stock photos in website design?', answer: 'Yes, we include professional stock photos as needed in website design. We can also arrange custom photography for a more authentic look.', category: 'general' },
  { question: 'How do I prepare content for my website?', answer: 'We provide a content template and guide to help you prepare text, images, and other materials. We can also create content for you as part of our content creation services.', category: 'general' },
  { question: 'Do you offer rush delivery on websites?', answer: 'Yes, we offer expedited delivery for rush projects. Additional rush fees may apply. Contact us to discuss your timeline requirements.', category: 'general' },
  { question: 'What happens if I don\'t have all content ready?', answer: 'We can start with available content and add more as you provide it. We can also create placeholder content and help you develop complete content.', category: 'general' },
  { question: 'Can I make changes to my website after launch?', answer: 'Yes, we provide training on how to make basic updates. For complex changes, we offer ongoing maintenance and support services.', category: 'general' },
  { question: 'Do you offer SSL certificates?', answer: 'Yes, we install and configure SSL certificates on all websites we develop. SSL is essential for security and SEO.', category: 'general' },
  { question: 'What is SEO-friendly URL structure?', answer: 'SEO-friendly URLs are short, descriptive, include target keywords, use hyphens instead of underscores, and avoid unnecessary parameters. Example: /digital-marketing-services instead of /page?id=123', category: 'general' },
  { question: 'What is a sitemap?', answer: 'A sitemap lists all important pages on your website to help search engines find and index them. We create and submit XML sitemaps for all websites we build.', category: 'general' },
  { question: 'What is website accessibility?', answer: 'website accessibility means designing and developing websites that people with disabilities can use effectively. This includes screen reader compatibility, keyboard navigation, color contrast, and proper heading structure.', category: 'general' },
  { question: 'Why is website accessibility important?', answer: 'Accessibility is important for legal compliance, reaching a wider audience, improving SEO, demonstrating social responsibility, and providing equal access to information and services.', category: 'general' },
  { question: 'Do you comply with ADA/WCAG standards?', answer: 'Yes, we build websites following WCAG (Web Content Accessibility Guidelines) standards to ensure accessibility for people with disabilities.', category: 'general' },

  // CATEGORY: startup
  { question: 'Do you have special packages for startups?', answer: 'Yes, we offer startup-friendly packages and flexible payment options designed for early-stage companies with limited budgets. Contact us to discuss startup pricing.', category: 'startup' },
  { question: 'Can you help my startup get its first customers?', answer: 'Yes, we help startups acquire first customers through targeted digital marketing, PR campaigns, social media strategies, and lead generation optimized for early-stage growth.', category: 'startup' },
  { question: 'What marketing strategies work best for startups?', answer: 'Startup-friendly strategies include content marketing, social media engagement, targeted PR for visibility, local SEO, referral programs, and cost-effective PPC campaigns with small budgets.', category: 'startup' },
  { question: 'How much should a startup spend on marketing?', answer: 'Startups typically allocate 5-15% of revenue or a fixed monthly budget based on growth goals. We help you determine the optimal budget for your stage and objectives.', category: 'startup' },
  { question: 'Can you help with startup branding?', answer: 'Yes, we offer startup branding services including brand identity creation, logo design, messaging framework, brand guidelines, and initial marketing collateral development.', category: 'startup' },
  { question: 'What is MVP marketing?', answer: 'MVP (Minimum Viable Product) marketing focuses on promoting your core product features to early adopters. We create lean marketing strategies that validate demand before scaling.', category: 'startup' },
  { question: 'Do you work with funded startups?', answer: 'Yes, we work with startups at every stage — from pre-seed and bootstrapped to Series A funded and beyond. We scale our services as your business grows.', category: 'startup' },
  { question: 'Can you help with go-to-market strategy?', answer: 'Yes, we develop comprehensive go-to-market (GTM) strategies including target audience definition, channel selection, messaging, launch timeline, and success metrics.', category: 'startup' },
  { question: 'What is product launch marketing?', answer: 'Product launch marketing is a coordinated campaign to introduce your product to the market. It includes PR, social media buzz, email marketing, influencer outreach, and launch event planning.', category: 'startup' },
  { question: 'How do you create buzz for a new product?', answer: 'We create buzz through teaser campaigns, influencer partnerships, media outreach, social media contests, email drip campaigns, and strategic partnerships leading up to launch day.', category: 'startup' },
  { question: 'Do you offer pitch deck design?', answer: 'Yes, we design professional pitch decks for investor presentations, client pitches, and partnership meetings. Our decks combine compelling visuals with clear, persuasive messaging.', category: 'startup' },
  { question: 'Can you help with investor communications?', answer: 'Yes, we help with investor communications including pitch decks, investor updates, financial presentation design, and fundraising collateral.', category: 'startup' },
  { question: 'What is a business model canvas?', answer: 'The Business Model Canvas is a strategic management template for developing new business models. It visually describes your value proposition, infrastructure, customers, and finances.', category: 'startup' },
  { question: 'Do you offer mentorship for startups?', answer: 'Yes, our founder Vansh Mehra provides mentorship to early-stage startups through our network. Contact us to learn about mentorship opportunities.', category: 'startup' },
  { question: 'Can you connect me with investors?', answer: 'While we cannot guarantee investor introductions, we can help prepare your pitch materials and make introductions within our network of business contacts and industry partners.', category: 'startup' },

  // CATEGORY: faq (more)
  { question: 'What is the difference between a logo and branding?', answer: 'A logo is a visual mark that identifies your business. Branding is the overall identity including logo, colors, typography, voice, values, and customer experience. Logo is part of branding.', category: 'faq' },
  { question: 'How often should I rebrand?', answer: 'Most businesses rebrand every 5-10 years to stay relevant. Signs you need to rebrand include outdated image, market repositioning, mergers, expansion to new audiences, or negative brand associations.', category: 'faq' },
  { question: 'What is a brand style guide?', answer: 'A brand style guide documents your brand\'s visual and verbal identity — logo usage, color palette, typography, imagery style, voice and tone, and brand personality. It ensures consistency across all communications.', category: 'faq' },
  { question: 'What is the difference between mission and vision?', answer: 'A mission statement describes what your company does today — its purpose and primary objectives. A vision statement describes what your company aspires to become in the future.', category: 'faq' },
  { question: 'How do you create a brand voice?', answer: 'Brand voice is created by defining your brand\'s personality traits, communication style, vocabulary, and tone. We develop comprehensive voice guidelines that ensure consistent brand communication.', category: 'faq' },
  { question: 'What is color psychology in branding?', answer: 'Color psychology studies how colors affect perceptions and behaviors. For example, blue conveys trust, red creates urgency, green represents growth. We choose brand colors strategically based on your industry and goals.', category: 'faq' },
  { question: 'How do you choose brand colors?', answer: 'We choose colors based on industry norms, psychological impact, competitor differentiation, cultural considerations, and accessibility requirements. We create harmonious color palettes that reflect your brand personality.', category: 'faq' },
  { question: 'What fonts should I use for my brand?', answer: 'We recommend using 2-3 fonts maximum — one for headings, one for body text, and optionally one for accents. Fonts should be legible, web-safe, and reflect your brand personality.', category: 'faq' },
  { question: 'How do I protect my brand legally?', answer: 'We recommend trademarking your brand name and logo, registering your domain name, securing social media handles, using proper copyright notices, and having clear terms of service and privacy policies.', category: 'faq' },
  { question: 'Do you offer trademark research?', answer: 'While we are not legal professionals, we can conduct preliminary trademark availability searches and recommend professional legal counsel for formal trademark registration.', category: 'faq' },
  { question: 'What is the best social media platform for B2B?', answer: 'LinkedIn is the most effective platform for B2B marketing due to its professional audience, targeting options, and content formats suited for business decision-makers.', category: 'faq' },
  { question: 'What is the best social media platform for B2C?', answer: 'Instagram and Facebook are most effective for B2C marketing due to their large user bases, visual formats, shopping features, and targeting capabilities for consumer audiences.', category: 'faq' },
  { question: 'What is the best platform for e-commerce?', answer: 'Instagram Shopping and Facebook Shops are excellent for visual product discovery. Pinterest works well for certain niches. Google Shopping is essential for search-driven e-commerce.', category: 'faq' },
  { question: 'How do I choose between Facebook and Instagram ads?', answer: 'Facebook offers broader reach and detailed targeting across age groups. Instagram is better for visually appealing products and reaching younger audiences (18-35). We often recommend both.', category: 'faq' },
  { question: 'What is the difference between Facebook and Instagram audiences?', answer: 'Facebook has a broader demographic range with slightly older users (25-55+). Instagram skews younger (18-35) with higher engagement rates and visual content preference.', category: 'faq' },
  { question: 'Should my business be on TikTok?', answer: 'TikTok is ideal for brands targeting Gen Z and young millennials. It works well for entertainment, fashion, food, beauty, and lifestyle brands that can create authentic, engaging short-form video content.', category: 'faq' },
  { question: 'Is Pinterest right for my business?', answer: 'Pinterest is excellent for brands in fashion, home decor, food, DIY, weddings, travel, and beauty. It drives significant traffic and has high purchase intent compared to other social platforms.', category: 'faq' },
  { question: 'What is YouTube marketing?', answer: 'YouTube marketing involves creating video content, optimizing for YouTube SEO, running ads, and building a subscriber base. It\'s the second largest search engine and highly effective for educational content.', category: 'faq' },
  { question: 'How long does it take to grow a YouTube channel?', answer: 'YouTube growth takes 6-12 months of consistent quality content for meaningful results. Success depends on niche, content quality, SEO, upload frequency, and audience engagement.', category: 'faq' },
  { question: 'What equipment do I need for video marketing?', answer: 'Basic equipment includes a good smartphone or camera, microphone (lavalier or shotgun), tripod, and basic lighting. We can recommend equipment based on your budget and content type.', category: 'faq' },
  { question: 'Can I repurpose my blog content for video?', answer: 'Yes, repurposing blog content into videos is an excellent strategy. Turn how-to articles into tutorials, listicles into countdown videos, and case studies into testimonials.', category: 'faq' },
  { question: 'How do I optimize videos for YouTube SEO?', answer: 'Optimize with keyword-rich titles, detailed descriptions, relevant tags, custom thumbnails, chapters/timestamps, captions, playlists, and end screens promoting other content.', category: 'faq' },
  { question: 'What is a video thumbnail and why is it important?', answer: 'A thumbnail is the preview image viewers see before clicking your video. Custom, eye-catching thumbnails dramatically increase click-through rates and are critical for YouTube success.', category: 'faq' },
  { question: 'Do you offer podcast production?', answer: 'Yes, we offer podcast production services including concept development, recording, editing, show notes, artwork, and distribution to Apple Podcasts, Spotify, and other platforms.', category: 'faq' },
  { question: 'What is a podcast and should I start one?', answer: 'A podcast is an episodic audio series. Starting a podcast can build authority, reach audiences during commutes, create content for repurposing, and build deeper connections with listeners.', category: 'faq' },
  { question: 'What equipment do I need for podcasting?', answer: 'Basic podcasting requires a good USB microphone, headphones, recording software, and a quiet space. We can recommend equipment and help with setup and production.', category: 'faq' },
  { question: 'What is webinar marketing?', answer: 'Webinar marketing involves hosting live or pre-recorded online seminars to educate your audience, demonstrate expertise, generate leads, and nurture prospects through the sales funnel.', category: 'faq' },
  { question: 'Do you host webinars for clients?', answer: 'Yes, we help plan, promote, and execute webinars including topic selection, presentation design, platform setup, email promotions, live moderation, and post-webinar follow-up.', category: 'faq' },
  { question: 'How do I promote my webinar?', answer: 'Promote webinars through email campaigns, social media posts, paid ads, partner cross-promotion, blog announcements, and landing pages with registration forms.', category: 'faq' },
  { question: 'What is the best platform for webinars?', answer: 'Popular webinar platforms include Zoom, Google Meet, GoToWebinar, Webex, and Livestorm. We recommend based on your audience size, features needed, and budget.', category: 'faq' },
  { question: 'How do you generate leads from webinars?', answer: 'Generate leads through registration forms, polls and Q&A during the webinar, post-webinar follow-up emails, special offers for attendees, and repurposing webinar content as lead magnets.', category: 'faq' },
  { question: 'What is affiliate marketing?', answer: 'Affiliate marketing is a performance-based model where you pay commissions to affiliates (partners, influencers) for driving sales or leads to your business. It\'s cost-effective because you pay only for results.', category: 'faq' },
  { question: 'Do you set up affiliate programs?', answer: 'Yes, we can help set up and manage affiliate programs including commission structures, tracking systems, affiliate recruitment, and program optimization.', category: 'faq' },
  { question: 'What is a referral program vs affiliate program?', answer: 'Referral programs reward existing customers for referring new customers. Affiliate programs are broader, working with partners who promote your products across their networks for commissions.', category: 'faq' },
  { question: 'What is Google Analytics 4?', answer: 'Google Analytics 4 (GA4) is the latest version of Google Analytics using an event-based data model. It provides cross-platform tracking, AI-powered insights, and better privacy controls.', category: 'faq' },
  { question: 'What is the difference between GA4 and Universal Analytics?', answer: 'GA4 uses events instead of sessions, offers cross-platform tracking, includes AI insights, provides better privacy controls, and has a different reporting interface. Universal Analytics stopped collecting data in July 2023.', category: 'faq' },
  { question: 'How do I set up GA4?', answer: 'GA4 requires creating a GA4 property, adding a data stream (web or app), installing the tracking code or using Google Tag Manager, and configuring events and conversions. We provide full GA4 setup services.', category: 'faq' },
  { question: 'What is Google Tag Manager used for?', answer: 'Google Tag Manager (GTM) simplifies tag management by allowing you to add and update marketing tags (Google Analytics, Facebook Pixel, AdWords, etc.) without modifying website code.', category: 'faq' },
  { question: 'What is a conversion in digital marketing?', answer: 'A conversion occurs when a visitor completes a desired action — making a purchase, filling a form, signing up for a newsletter, downloading a resource, or calling your business.', category: 'faq' },
  { question: 'What is a micro-conversion?', answer: 'Micro-conversions are smaller actions that indicate progress toward a main conversion — like email signups, video views, time on page, social shares, or add-to-cart actions.', category: 'faq' },
  { question: 'What is a macro-conversion?', answer: 'Macro-conversions are primary goals like purchases, form submissions, membership signups, or trial registrations that directly impact revenue.', category: 'faq' },
  { question: 'How do you improve conversion rate?', answer: 'We improve conversion rates through A/B testing, clear CTAs, improved page speed, better user experience, compelling copy, social proof, trust signals, simplified forms, and mobile optimization.', category: 'faq' },
  { question: 'What is the average conversion rate?', answer: 'Average conversion rates vary by industry (2-5% is typical for e-commerce). B2B sites often see 2-10% for lead generation. We benchmark against your industry and continuously optimize.', category: 'faq' },
  { question: 'What is a sales funnel?', answer: 'A sales funnel visualizes the customer journey from awareness to purchase. It typically includes top-of-funnel (awareness), middle-of-funnel (consideration), and bottom-of-funnel (decision) stages.', category: 'faq' },
  { question: 'What is lead nurturing?', answer: 'Lead nurturing is the process of building relationships with potential customers at every stage of the sales funnel. It involves providing valuable content, personalized communication, and timely follow-ups.', category: 'faq' },
  { question: 'What is a qualified lead?', answer: 'A qualified lead is a potential customer who has shown genuine interest and fits your target criteria — having the budget, authority, need, and timeline (BANT) to make a purchase.', category: 'faq' },
  { question: 'What is BANT in sales?', answer: 'BANT stands for Budget (can they afford it?), Authority (are they the decision-maker?), Need (do they have a problem you solve?), and Timeline (when do they want to buy?). It\'s used to qualify leads.', category: 'faq' },
  { question: 'How do you qualify leads?', answer: 'We qualify leads through demographic fit, behavioral scoring (website visits, content downloads), engagement level, budget indicators, and direct qualification conversations.', category: 'faq' },
  { question: 'What is the difference between inbound and outbound marketing?', answer: 'Inbound marketing attracts customers through valuable content and experiences (pull strategy). Outbound marketing reaches out to prospects through ads, cold calls, and direct messages (push strategy).', category: 'faq' },
  { question: 'Which is better — inbound or outbound marketing?', answer: 'Both have their place. Inbound marketing builds long-term trust and authority with lower cost per lead. Outbound marketing delivers faster results but higher costs. We recommend an integrated approach.', category: 'faq' },
  { question: 'What is content marketing ROI?', answer: 'Content marketing ROI includes organic traffic, lead generation, brand awareness, customer education, reduced customer support costs, and improved conversion rates. It\'s a long-term investment that compounds over time.', category: 'faq' },
  { question: 'How long does content marketing take to work?', answer: 'Content marketing typically takes 6-12 months to show significant results. It requires consistent quality content creation and promotion. The long-term benefits include sustainable organic growth.', category: 'faq' },
  { question: 'What is the difference between a blog and a website?', answer: 'A website is your main online presence with pages about your business, services, and products. A blog is a section of your website with regularly updated articles. Both are essential for effective SEO.', category: 'faq' },
  { question: 'What is guest blogging?', answer: 'Guest blogging is writing and publishing articles on other websites. It helps build backlinks, reach new audiences, establish authority, and drive referral traffic to your site.', category: 'faq' },
  { question: 'Do you offer guest posting services?', answer: 'Yes, we offer guest posting services including identifying relevant blogs, writing quality content, and publishing on authoritative websites in your industry to build backlinks and authority.', category: 'faq' },
  { question: 'How many blog posts should I publish per month?', answer: 'We recommend 4-8 high-quality blog posts per month for optimal SEO results. Consistency matters more than quantity — it\'s better to publish 4 excellent posts than 8 mediocre ones.', category: 'faq' },
  { question: 'What is the ideal blog post length?', answer: 'Ideal blog post length is 1,500-2,500 words for SEO. However, content quality and relevance matter more than word count. Some topics work well as 500-word quick reads, others need 3,000+ words.', category: 'faq' },
  { question: 'How do I promote my blog posts?', answer: 'Promote blog posts through social media, email newsletters, SEO optimization, internal linking, guest posting, influencer outreach, and paid promotion for high-value content.', category: 'faq' },
  { question: 'What is a blog editorial calendar?', answer: 'An editorial calendar plans blog topics, keywords, publish dates, and authors in advance. It ensures consistent publishing, strategic topic coverage, and alignment with marketing campaigns.', category: 'faq' },
  { question: 'How do you measure blog success?', answer: 'We measure blog success through traffic, engagement (comments, shares), lead generation, keyword rankings, backlinks earned, time on page, and contribution to overall business goals.', category: 'faq' },
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

      if ((inserted + skipped) % 100 === 0) {
        const pct = Math.round(((inserted + skipped) / totalEntries) * 100)
        process.stdout.write(`  Progress: ${inserted + skipped}/${totalEntries} (${pct}%) — ${inserted} new, ${skipped} existing\r`)
      }
    }

    console.log(`\n\n✅ Seeding complete!`)
    console.log(`📊 Summary: ${inserted} inserted, ${skipped} skipped, ${totalEntries} total entries`)
    console.log(`📊 Categories seeded: ${[...new Set(FAQ_ENTRIES.map(e => e.category))].length}`)
    
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
