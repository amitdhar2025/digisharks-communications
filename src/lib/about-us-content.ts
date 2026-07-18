/**
 * About Us Page — Content & Data
 *
 * Centralised content defaults used by the about-us page. Extracted for
 * maintainability; the page imports from here and optionally overrides
 * via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface StatItem {
  number: string
  suffix: string
  label: string
}

export interface IconTitleDesc {
  icon: string
  title: string
  desc: string
}

export interface TimelineItem {
  year: string
  heading: string
  description: string
}

export interface AchievementCard {
  icon: string
  title: string
  desc: string
  description: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface CtaAction {
  text: string
  href: string
}

export interface AboutUsContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  heroStats: StatItem[]
  heroBadges: string[]
  aboutCompanyLabel: string
  aboutCompanyHeading: string
  aboutCompanyDescription: string
  aboutCompanyAchievements: IconTitleDesc[]
  visionHeading: string
  visionDescription: string
  missionHeading: string
  missionDescription: string
  whatWeOfferHeading: string
  whatWeOfferItems: string[]
  valuesLabel: string
  valuesHeading: string
  valuesDescription: string
  values: IconTitleDesc[]
  leaderImage: string
  leaderName: string
  leaderRole: string
  leaderBio: string
  leaderCredentials: string[]
  politicalExperience: string
  mediaVentures: string
  socialImpact: string
  timelineLabel: string
  timelineHeading: string
  timelineDescription: string
  timelineItems: TimelineItem[]
  boothHeading: string
  boothDescription: string
  boothFeatures: string[]
  boothStats: StatItem[]
  achievementsLabel: string
  achievementsHeading: string
  achievementsDescription: string
  achievements: AchievementCard[]
  faqLabel: string
  faqHeading: string
  faqDescription: string
  faqItems: FaqItem[]
  ctaEyebrow: string
  ctaHeading: string
  ctaDescription: string
  ctaFeatures: string[]
  ctaPrimaryCta: CtaAction
  ctaSecondaryCta: CtaAction
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: AboutUsContent = {
  heroEyebrow: '✦ About Digisharks',
  heroHeading: 'Build lasting brand value with digital PR & growth.',
  heroDescription: 'Digisharks Communications is a pioneer digital marketing agency established in 2017 in New Delhi—enhancing customer experiences through innovative digital marketing and Digital PR strategies that help businesses grow, engage their audiences, and achieve measurable outcomes.',
  heroPrimaryCta: { text: 'Start Your Growth Journey →', href: '#' },
  heroSecondaryCta: { text: 'Free Consultation', href: '#' },
  heroStats: [
    { number: '4000', suffix: '', label: 'Satisfied Customers' },
    { number: '120', suffix: '', label: 'Completed Projects' },
    { number: '50', suffix: '', label: 'Live Projects' },
    { number: '100', suffix: '%', label: 'Results Focus' },
  ],
  heroBadges: ['🌟 Transparency', '⭐ Quality Service', '📈 Measurable Results', '💡 Innovation'],
  aboutCompanyLabel: 'About The Company',
  aboutCompanyHeading: 'Digisharks Communications Since 2017',
  aboutCompanyDescription: 'Digisharks Communications is a pioneer and creative digital marketing agency established in 2017 in New Delhi. Through innovative digital solutions and customer-focused strategies, the company has built a strong client base across multiple industries. Digisharks Communications believes in transparency, quality service, creativity, and measurable results that drive real business outcomes.',
  aboutCompanyAchievements: [
    { icon: '🏆', title: '10+', desc: 'Years of Excellence' },
    { icon: '😊', title: '4000+', desc: 'Happy Customers' },
    { icon: '📊', title: '120+', desc: 'Projects Delivered' },
    { icon: '🚀', title: '50+', desc: 'Active Campaigns' },
  ],
  visionHeading: 'Vision',
  visionDescription: 'To enhance customer experiences through innovative digital marketing and Digital PR strategies that help businesses grow, engage their audiences, and build lasting brand value across every digital touchpoint.',
  missionHeading: 'Mission',
  missionDescription: 'To become the most trusted digital partner for our clients by delivering excellence through innovative marketing solutions, strategic communication, and measurable business outcomes that exceed expectations.',
  whatWeOfferHeading: 'What We Offer',
  whatWeOfferItems: ['Digital PR & Media Coverage', 'Social Media Marketing', 'SEO & PPC Advertising', 'Website Design & Development', 'Political Campaign Management', 'Online Reputation Management'],
  valuesLabel: 'Our Core Values',
  valuesHeading: 'What Drives Us Forward',
  valuesDescription: 'Our values aren\'t just words on a wall — they shape every strategy, every campaign, and every relationship we build with our clients.',
  values: [
    { icon: '🔍', title: 'Transparency', desc: 'Complete honesty in our communication, pricing, and reporting. You always know where your money is going and what results it\'s generating.' },
    { icon: '⭐', title: 'Quality Service', desc: 'Premium deliverables across every project. From strategy to execution, we hold ourselves to the highest standards of craftsmanship and care.' },
    { icon: '💡', title: 'Creativity', desc: 'Fresh ideas that stand out. Our creative team crafts campaigns that capture attention, drive engagement, and leave lasting impressions.' },
    { icon: '📊', title: 'Measurable Results', desc: 'Data-driven decisions and transparent reporting. We focus on KPIs that matter to your business — leads, sales, and revenue growth.' },
    { icon: '🤝', title: 'Client-First Approach', desc: 'Your goals are our goals. We become an extension of your team, fully invested in your success with dedicated account management.' },
    { icon: '🚀', title: 'Innovation', desc: 'Always learning, always improving. We adopt new tools, trends, and technologies to keep our clients ahead of the competition.' },
  ],
  leaderImage: '/Vansh.webp',
  leaderName: 'Vansh Mehra',
  leaderRole: '🏆 Founder & Managing Director',
  leaderBio: 'Vansh Mehra is a young and dynamic entrepreneur with extensive experience in digital marketing and political campaign management. As the founder of Digisharks Communications, he has led the organization to become a recognized name in digital marketing, public relations, and political campaign management across India. His vision combines innovation, data-driven strategy, and a relentless focus on client success.',
  leaderCredentials: ['📰 BJP IT Convenor', '🎓 Uttarakhand Elections 2017', '🏆 Top 10 CEOs', '🚀 Top 10 Entrepreneurs'],
  politicalExperience: '<ul class="feature-list"><li>BJP IT Convenor, Shamli District</li><li>Authorized Digital Partner for BJP Election Campaigns in Uttarakhand (2017)</li><li>Management of multiple political communication and voter outreach campaigns</li></ul>',
  mediaVentures: 'Vansh Mehra is also the founder of <b>The Indian Alert</b>, an online news platform delivering news and updates related to: Politics, Entertainment, Sports, Fashion, and Current Affairs.',
  socialImpact: 'Apart from business leadership, Vansh Mehra actively participates in social welfare initiatives and is the Co-Founder of Vivaan Welfare Foundation, contributing to various community welfare programs across India.',
  timelineLabel: 'Our Journey',
  timelineHeading: '10+ Years of Building & Growing',
  timelineDescription: 'From a small New Delhi studio to a trusted national PR & digital marketing partner — the milestones that shaped us.',
  timelineItems: [
    { year: '2017', heading: '🚀 The Foundation', description: 'Digisharks Communications was founded in New Delhi with a vision to bring data-driven digital PR and marketing to Indian brands.' },
    { year: '2018', heading: '📰 First 50 Clients', description: 'Crossed 50 happy clients within our first year. Expanded our media network to 20+ top publications across India.' },
    { year: '2019', heading: '🏆 Industry Recognition', description: 'Started building the team, formalized processes, and won our first major industry recognition for digital PR innovation.' },
    { year: '2020', heading: '💻 Digital Transformation Wave', description: 'Pivoted strongly into full-stack digital marketing — SEO, PPC, SMO — helping brands survive and grow through the pandemic.' },
    { year: '2021', heading: '🌟 Top 10 CEOs Award', description: 'Founder Vansh Mehra recognized among the Top 10 CEOs 2021–2022 for outstanding leadership in the digital marketing space.' },
    { year: '2022', heading: '🚀 Dynamic Entrepreneur Feature', description: 'Featured in the Top 10 Dynamic Entrepreneurs list, validating our innovation-first approach to PR and digital growth.' },
    { year: '2023', heading: '📈 500+ Campaigns Milestone', description: 'Reached the milestone of executing 500+ successful digital PR and marketing campaigns across multiple industries and geographies.' },
    { year: '2024', heading: '💼 Top 10 PR Leaders in India', description: 'Featured in Top 10 PR Leaders in India for transforming the PR landscape through data-driven digital PR campaigns and measurable ROI.' },
    { year: '2026', heading: '🎯 The Next Chapter', description: 'Expanding services into AI-powered marketing, video PR, and influencer-led campaigns. The journey to becoming India\'s #1 PR partner continues.' },
  ],
  boothHeading: 'Booth Management Services',
  boothDescription: 'Digisharks Communications provides specialized booth-level election management services for political campaigns. Our booth management strategy combines grassroots voter engagement, data-driven targeting, and on-ground execution that delivers measurable impact where it matters most — at the booth.',
  boothFeatures: [
    'Strategic voter outreach planning',
    'Innovative campaign execution',
    'Grassroots-level engagement',
    'Booth-level volunteer management',
    'Voter database management',
    'Targeted communication campaigns',
    'Vote-base expansion strategies',
    'Real-time ground reporting',
  ],
  boothStats: [
    { number: '500+', suffix: '', label: 'Booths Managed' },
    { number: '95%', suffix: '', label: 'Voter Turnout Boost' },
    { number: '50+', suffix: '', label: 'Campaigns Won' },
    { number: '1M+', suffix: '', label: 'Voters Reached' },
  ],
  achievementsLabel: 'By The Numbers',
  achievementsHeading: 'Our Achievements in Numbers',
  achievementsDescription: 'Real numbers that reflect the trust our clients place in us and the consistent results we deliver across every campaign.',
  achievements: [
    { icon: '😊', title: '4000+', desc: 'Satisfied Customers', description: 'High-quality brand promotion that builds long-term confidence and trust.' },
    { icon: '📊', title: '120+', desc: 'Completed Projects', description: 'From strategy to execution — delivering measurable growth across multiple industries.' },
    { icon: '🚀', title: '50+', desc: 'Live Projects', description: 'Ongoing campaigns that keep your brand visible and relevant in a fast-changing market.' },
    { icon: '💎', title: '98%', desc: 'Client Satisfaction', description: 'Consistent results that earn trust and lasting partnerships with every client.' },
  ],
  faqLabel: 'Frequently Asked Questions',
  faqHeading: 'About Working With Us',
  faqDescription: 'Quick answers to the most common questions about partnering with Digisharks Communications.',
  faqItems: [
    { question: 'When was Digisharks Communications founded?', answer: 'Digisharks Communications was founded in 2017 in New Delhi. Since then, we have grown to serve 4000+ customers across India with 500+ successful digital PR and marketing campaigns.' },
    { question: 'Who is the founder of Digisharks Communications?', answer: 'Vansh Mehra is the Founder & Managing Director of Digisharks Communications. He has been recognized among India\'s Top 10 CEOs and Top 10 Dynamic Entrepreneurs for his work in digital marketing and political campaign management.' },
    { question: 'What industries do you serve?', answer: 'We work across 12+ industries including E-Commerce, Healthcare, Finance, Real Estate, Education, F&B, Fashion, Beauty, Technology, Automotive, Entertainment, and Manufacturing. Our strategies are tailored to each industry\'s unique dynamics and audience behavior.' },
    { question: 'Do you offer political campaign management?', answer: 'Yes, we have extensive experience managing political campaigns, including booth-level management, voter outreach, digital communication, and IT cell operations. We\'ve supported multiple state and national election campaigns with measurable on-ground impact.' },
    { question: 'How can I get in touch with your team?', answer: 'You can reach us via phone at +91 96273 32332, email at marketing@digisharkscommunications.com, or visit our office at B-2, C-87, C Block, Sector 63, Noida, UP 201301. We also offer free consultation calls — just book through our website.' },
  ],
  ctaEyebrow: "💼 Let's Start a Conversation",
  ctaHeading: 'Ready to Grow With Us?',
  ctaDescription: 'Whether you\'re a startup looking to launch, a growing brand aiming to scale, or an established company seeking fresh digital momentum — we have the expertise, team, and proven strategies to make it happen.',
  ctaFeatures: [
    'Free 30-min Strategy Call',
    'Custom Growth Roadmap',
    'No Long-term Contracts',
    'Dedicated Account Manager',
    'Transparent Monthly Reports',
  ],
  ctaPrimaryCta: { text: 'Get Started Today →', href: '#' },
  ctaSecondaryCta: { text: '📞 +91 96273 32332', href: '#' },
}
