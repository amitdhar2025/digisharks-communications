/**
 * Brand Promotion Page — Content & Data
 *
 * Centralised content defaults used by the brand-promotion page.
 * Extracted for maintainability; the page imports from here and
 * optionally overrides via CMS.
 */

// ── Shared type definitions ──────────────────────────────────────────

export interface IconTitleDesc {
  icon: string
  title: string
  desc: string
}

export interface CtaAction {
  text: string
  href: string
}

export interface BrandPromotionContent {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroPrimaryCta: CtaAction
  heroSecondaryCta: CtaAction
  approachLabel: string
  approachHeading: string
  approachSubtitle: string
  approachCards: IconTitleDesc[]
  servicesLabel: string
  servicesHeading: string
  servicesSubtitle: string
  benefitsHeading: string
  benefits: IconTitleDesc[]
  processHeading: string
  processSubtitle: string
  processSteps: IconTitleDesc[]
  ctaHeading: string
  ctaDescription: string
  ctaPrimaryCta: CtaAction
}

// ── Hardcoded default content (used when no CMS data exists) ──────────
export const DEFAULT_CONTENT: BrandPromotionContent = {
  heroEyebrow: '✦ Build a Brand Customers Trust',
  heroHeading: 'Strategic <span class="orange-text">Brand Promotion</span> That Stands Out',
  heroDescription: 'In today\'s competitive market, brand recognition is everything. We help you cut through the noise with brand promotion strategies that combine creativity, market research, digital marketing, and public relations.',
  heroPrimaryCta: { text: 'Promote Your Brand Today →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Our Process', href: '#process' },
  approachLabel: 'Brand Promotion Experts',
  approachHeading: 'A <span class="orange-text">360-Degree Approach</span>',
  approachSubtitle: 'Great brands are built at the intersection of creativity, data, and storytelling. We bring all three together for every client engagement.',
  approachCards: [
    { icon: '🎨', title: 'Creativity', desc: 'Award-winning creative work that captures attention and stays in memory.' },
    { icon: '📊', title: 'Market Research', desc: 'Deep audience, competitor, and category research that informs every move.' },
    { icon: '💻', title: 'Digital Marketing', desc: 'Performance media, content, and SEO to amplify your brand across every channel.' },
    { icon: '📰', title: 'Public Relations', desc: 'Strategic media outreach that earns third-party validation and trust.' },
  ],
  servicesLabel: 'Our Brand Promotion Services',
  servicesHeading: 'Solutions for <span class="orange-text">Every Brand Goal</span>',
  servicesSubtitle: 'Whether you\'re launching a new brand or reinvigorating an established one, our services scale to fit.',
  benefitsHeading: 'Why <span class="orange-text">Brand Promotion</span> Matters',
  benefits: [
    { icon: '🌟', title: 'Increase Brand Awareness', desc: 'Get your brand in front of more of the right people, more often.' },
    { icon: '❤️', title: 'Build Customer Trust', desc: 'Consistent, authentic promotion earns long-term customer loyalty.' },
    { icon: '📈', title: 'Improve Market Position', desc: 'Stand out from competitors and own your category narrative.' },
    { icon: '📥', title: 'Generate More Leads', desc: 'Strong brands convert more visitors into qualified leads and sales.' },
    { icon: '🔁', title: 'Strengthen Customer Loyalty', desc: 'Promoted brands earn repeat business and word-of-mouth referrals.' },
    { icon: '⚡', title: 'Boost Brand Recognition', desc: 'Stand out in crowded markets with a distinctive, memorable brand identity.' },
  ],
  processHeading: 'Our <span class="orange-text">Brand Promotion Process</span>',
  processSubtitle: 'A proven five-step framework for building, executing, and optimizing brand promotion campaigns that deliver.',
  processSteps: [
    { icon: '1', title: 'Brand Analysis', desc: 'Deep research into your brand, audience, competitors, and market positioning.' },
    { icon: '2', title: 'Strategy Development', desc: 'Custom strategy built around your goals, audience, and budget.' },
    { icon: '3', title: 'Campaign Execution', desc: 'Creative production, media buying, and campaign launch across channels.' },
    { icon: '4', title: 'Performance Monitoring', desc: 'Real-time tracking of every metric that matters to your goals.' },
    { icon: '5', title: 'Optimization', desc: 'Continuous testing and refinement to maximize return on investment.' },
    { icon: '6', title: 'Reporting & Insights', desc: 'Detailed reports with actionable insights to guide your next campaign decisions.' },
  ],
  ctaHeading: 'Get Your <span class="orange-text">Free Brand Promotion</span> Consultation',
  ctaDescription: 'Book a complimentary consultation with our brand promotion experts. We\'ll analyze your brand, identify growth opportunities, and recommend a custom strategy — at zero cost.',
  ctaPrimaryCta: { text: 'Get Free Brand Promotion Consultation →', href: '/contact-us/' },
}
