export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import type React from "react";
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'

// ── Hardcoded default content (used when no CMS data exists) ──────────
const DEFAULT_CONTENT = {
  heroEyebrow: '✦ Web Development Company in India',
  heroHeading: 'Build a Powerful <span class="orange-text">Digital Presence</span> for Your Business',
  heroDescription: 'We design and develop modern, responsive, conversion-focused websites that look great, load fast, and turn visitors into customers. From business sites to complex e-commerce platforms — we build for performance.',
  heroPrimaryCta: { text: 'Get Started Today →', href: '/contact-us/' },
  heroSecondaryCta: { text: 'Explore Services', href: '#services' },
  webDevLabel: 'Professional Web Development',
  webDevHeading: 'Built Right. <span class="orange-text">From Day One.</span>',
  webDevDescription: 'Every site we build is engineered around the qualities that actually move the needle.',
  webDevBenefits: [
    { icon: '⚡', title: 'Fast Loading', desc: 'Optimized for speed so your visitors stay engaged and Google rewards you with higher rankings.' },
    { icon: '📱', title: 'Mobile Responsive', desc: 'Pixel-perfect experiences across every device, screen size, and platform.' },
    { icon: '🔍', title: 'SEO Friendly', desc: 'Clean code, semantic markup, and best practices built in from the start.' },
    { icon: '🔒', title: 'Secure', desc: 'Hardened against common threats with regular updates and security monitoring.' },
    { icon: '😊', title: 'User-Friendly', desc: 'Intuitive navigation and clear calls-to-action that guide visitors to convert.' },
    { icon: '🎯', title: 'Conversion Focused', desc: 'Every element is designed to move visitors closer to becoming customers.' },
  ],
  servicesLabel: 'Our Web Development Services',
  servicesHeading: 'Solutions for <span class="orange-text">Every Stage of Growth</span>',
  servicesDescription: "From your first business site to a full e-commerce platform, we have the team and technology to build it right.",
  whyLabel: 'Why Choose Digisharks?',
  whyHeading: 'Web Development That <span class="orange-text">Drives Business</span>',
  whyChooseBenefits: [
    { icon: '👨‍💻', title: 'Experienced Team', desc: 'Developers, designers, and strategists with years of experience building sites that work.' },
    { icon: '🔍', title: 'SEO-Friendly Development', desc: 'Every site is built with technical SEO best practices baked in from day one.' },
    { icon: '📱', title: 'Mobile Responsive', desc: 'Every site is mobile-first, ensuring perfect experiences on phones, tablets, and desktops.' },
    { icon: '🔒', title: 'Secure Development', desc: 'Best-in-class security practices to keep your site and your customers safe.' },
    { icon: '🤝', title: 'Ongoing Support', desc: 'Maintenance, updates, and support plans to keep your site running smoothly for years.' },
    { icon: '⏱️', title: 'On-Time Delivery', desc: 'Clear timelines, milestone-based delivery, and zero surprises along the way.' },
  ],
  benefitsLabel: 'Why It Matters',
  benefitsHeading: 'Benefits of <span class="orange-text">Professional Web Development</span>',
  benefitsCards: [
    { icon: '🌐', title: '24/7 Online Presence', desc: 'Your website works for you around the clock, even when you sleep.' },
    { icon: '🎯', title: 'Lead Generation', desc: 'Capture qualified leads through forms, chatbots, and conversion-optimized flows.' },
    { icon: '💎', title: 'Brand Credibility', desc: 'A professional website builds instant trust with new visitors and customers.' },
    { icon: '📈', title: 'Higher Search Rankings', desc: 'SEO-optimized sites rank better and attract more organic traffic.' },
    { icon: '⚙️', title: 'Scalable Foundation', desc: 'Built to grow with you as your business expands and evolves.' },
    { icon: '📊', title: 'Data & Insights', desc: 'Track every visitor, click, and conversion to keep improving.' },
  ],
  industriesLabel: 'Industries We Serve',
  industriesHeading: 'Web Development Across <span class="orange-text">Industries — 2026</span>',
  industriesDescription: 'The global web development market is valued at over <strong style="color:var(--orange)">$87 billion in 2026</strong>, growing at a CAGR of 8.87%. We build powerful, fast, and secure web platforms for every major industry driving that growth.',
  industriesFooter: "From hospitals to banks, retail giants to government portals — every sector depends on powerful, fast, and secure web platforms to operate and compete. <strong style='color:var(--orange)'>Let's build yours.</strong>",
  ctaHeading: 'Ready to Build <span class="orange-text">Something Great?</span>',
  ctaDescription: "Tell us about your project and we'll get back within 24 hours with a clear plan, transparent pricing, and a timeline you can count on.",
  ctaPrimaryCta: { text: 'Request Free Consultation →', href: '/contact-us/' },
  ctaSecondaryCta: { text: 'View Pricing', href: '/services-top-pr-digital-marketing/' },
}

const services = [
  {
    emoji: '🌐',
    label: 'Business Website Development',
    color: '#FF5B2E',
    desc: 'A professional online presence that showcases your services and converts visitors into leads.',
    features: ['Responsive Design', 'Lead Forms', 'Contact Integration', 'Service Showcase', 'Blog Management', 'SEO Optimization'],
  },
  {
    emoji: '🛒',
    label: 'E-Commerce Website Development',
    color: '#6366F1',
    desc: 'Sell online with a powerful e-commerce platform that handles products, payments, and customers at scale.',
    features: ['Product Management', 'Payment Gateway', 'Shopping Cart', 'Order Tracking', 'Customer Accounts', 'Inventory Management'],
  },
  {
    emoji: '🔷',
    label: 'WordPress Development',
    color: '#16A34A',
    desc: 'Custom WordPress sites that are easy to manage, fast, secure, and built for growth.',
    features: ['Custom Theme', 'Plugin Integration', 'Speed Optimization', 'Security Hardening', 'Migration', 'Maintenance'],
  },
  {
    emoji: '🎯',
    label: 'Landing Page Development',
    color: '#F59E0B',
    desc: 'High-converting landing pages designed to support specific campaigns and offers.',
    features: ['Higher Conversions', 'Better UX', 'Lead Capture', 'Campaign Support', 'Mobile-Friendly', 'A/B Testing Ready'],
  },
  {
    emoji: '🔄',
    label: 'Website Redesign Services',
    color: '#0EA5E9',
    desc: 'Transform your existing site into a modern, conversion-focused experience.',
    features: ['Modern UI/UX', 'Better Performance', 'Mobile Optimization', 'SEO Enhancements', 'Navigation', 'Speed'],
  },
  {
    emoji: '⚙️',
    label: 'Custom Web Application Development',
    color: '#8B5CF6',
    desc: 'Powerful custom web applications that solve complex business problems and scale with your growth.',
    features: ['CRM Systems', 'Customer Portals', 'Dashboards', 'Booking Systems', 'Membership Platforms', 'Enterprise Applications'],
  },
]

const industries = [
  {
    emoji: '🛒',
    name: 'E-Commerce & Retail',
    color: '#FF5B2E',
    headline: "Powering the World's Digital Storefronts",
    deliverables: [
      'Fast-loading product pages with AI-powered search and recommendations',
      'Secure payment gateways with multi-currency and crypto support',
      'Progressive Web Apps (PWAs) that boost mobile conversion rates up to 4×',
      'Real-time inventory management and order tracking dashboards',
    ],
    tech: 'Next.js, Shopify Hydrogen, React, Node.js, Stripe API, Tailwind CSS',
    stat: 'Well-designed PWAs can lift mobile conversion rates fourfold in retail — making web performance a direct revenue lever.',
  },
  {
    emoji: '🏥',
    name: 'Healthcare & Telemedicine',
    color: '#6366F1',
    headline: 'Building Secure, Compliant Digital Health Platforms',
    deliverables: [
      'HIPAA-compliant patient portals for appointments, records, and prescriptions',
      'Telemedicine platforms with video consultation and real-time monitoring',
      'AI-assisted diagnostics dashboards for clinicians',
      'Accessibility-first design for elderly and differently-abled users',
    ],
    tech: 'ASP.NET Core, Java Spring Boot, React, AWS HealthLake, PostgreSQL',
    stat: 'Healthcare web services are growing at 14.05% annually — driven by the global shift to digital-first patient care.',
  },
  {
    emoji: '🏦',
    name: 'Finance & Banking (FinTech)',
    color: '#16A34A',
    headline: 'Secure, Real-Time Platforms for the Modern Financial World',
    deliverables: [
      'Online banking dashboards with real-time transaction data',
      'KYC onboarding flows with biometric verification',
      'Trading and investment platforms with live market data',
      'Fraud detection interfaces powered by machine learning',
    ],
    tech: 'Java Spring Boot, React, TypeScript, GraphQL, Kafka, PostgreSQL',
    stat: 'Finance and insurance firms invest heavily in secure online platforms — building customer portals, mobile banking, and data management solutions.',
  },
  {
    emoji: '📚',
    name: 'Education & EdTech',
    color: '#F59E0B',
    headline: 'Delivering Learning Experiences for the Digital Generation',
    deliverables: [
      'Learning Management Systems (LMS) with video, quizzes, and progress tracking',
      'AI-powered personalized learning paths and adaptive assessments',
      'Live virtual classrooms with real-time collaboration tools',
      'Certification and credential verification systems',
    ],
    tech: 'React, Next.js, Node.js, WebRTC, MongoDB, AWS',
    stat: 'Educational institutions were among the first to pivot to virtual learning — and web-based learning infrastructure is now a permanent fixture of modern education.',
  },
  {
    emoji: '🏨',
    name: 'Travel, Hospitality & Tourism',
    color: '#0EA5E9',
    headline: 'Creating Seamless Booking Experiences Across Every Device',
    deliverables: [
      'Real-time booking engines with dynamic pricing and availability',
      'Virtual tours and AR/VR room previews using WebXR',
      'Multi-language, multi-currency travel portals',
      'API integrations with GDS systems (Amadeus, Sabre)',
    ],
    tech: 'React, Vue.js, Node.js, Python, Redis, Elasticsearch',
    stat: 'VR devices and WebAR APIs are transforming travel websites, letting users take virtual tours of destinations before booking.',
  },
  {
    emoji: '🏗️',
    name: 'Real Estate & Property Tech',
    color: '#8B5CF6',
    headline: 'Smart Platforms for Buying, Selling, and Managing Property',
    deliverables: [
      'Property listing portals with map-based search and AI filters',
      '3D virtual tours and AR overlays for property visualization',
      'Mortgage calculators and digital application forms',
      'Tenant management and rent payment systems',
    ],
    tech: 'React, Three.js, Node.js, Google Maps API, PostgreSQL, AWS',
    stat: null,
  },
  {
    emoji: '🎬',
    name: 'Media, Entertainment & Streaming',
    color: '#EC4899',
    headline: 'High-Performance Platforms for Content at Global Scale',
    deliverables: [
      'Video streaming platforms with adaptive bitrate and low latency',
      'Headless CMS for omnichannel publishing',
      'Personalization engines powered by AI recommendation models',
      'Subscription billing and paywall systems',
    ],
    tech: 'Next.js, React, Node.js, WebRTC, FFmpeg, CDN (Cloudflare), Redis',
    stat: 'Generative AI is set to benefit media through scalable content personalization and automated workflows.',
  },
  {
    emoji: '🏭',
    name: 'Manufacturing & Industrial (Industry 4.0)',
    color: '#0F1628',
    headline: 'Web Platforms Connecting the Factory Floor to the Cloud',
    deliverables: [
      'IoT dashboards monitoring equipment health in real time',
      'Supply chain visibility portals with predictive analytics',
      'Digital twin interfaces for factory simulation',
      'Vendor and procurement management portals',
    ],
    tech: 'React, Node.js, Python (FastAPI), MQTT, PostgreSQL, Azure IoT',
    stat: null,
  },
  {
    emoji: '🏛️',
    name: 'Government & Public Sector',
    color: '#FF5B2E',
    headline: 'Digital Services That Serve Every Citizen',
    deliverables: [
      'Citizen service portals (tax filing, license renewal, permits)',
      'Open data dashboards and transparency portals',
      'Emergency response and public health information sites',
      'Accessibility-compliant (WCAG 2.2) design as a legal requirement',
    ],
    tech: 'ASP.NET Core, Java, React, PostgreSQL, OAuth 2.0',
    stat: null,
  },
  {
    emoji: '🚗',
    name: 'Automotive & Mobility',
    color: '#6366F1',
    headline: 'From Showroom to Software: The Connected Car Experience',
    deliverables: [
      'Vehicle configuration and online ordering platforms',
      'Dealer management portals and inventory systems',
      'Connected vehicle dashboards and OTA update interfaces',
      'EV charging network finders and booking systems',
    ],
    tech: 'React, TypeScript, Node.js, GraphQL, MongoDB',
    stat: null,
  },
  {
    emoji: '🌾',
    name: 'Agriculture & AgriTech',
    color: '#16A34A',
    headline: 'Smart Farming Starts with Smart Web Platforms',
    deliverables: [
      'Farm management dashboards with soil and weather data integration',
      'Commodity trading and auction marketplaces',
      'Supply chain traceability portals from farm to shelf',
      'Drone data visualization and crop analytics platforms',
    ],
    tech: 'React, Python, Node.js, PostgreSQL, IoT platforms',
    stat: null,
  },
  {
    emoji: '⚖️',
    name: 'Legal & LegalTech',
    color: '#F59E0B',
    headline: 'Modernizing Legal Services for the Digital Age',
    deliverables: [
      'Client intake portals with document upload and e-signature',
      'AI-powered legal research and case management tools',
      'Contract lifecycle management (CLM) platforms',
      'Secure client communication and billing dashboards',
    ],
    tech: 'React, TypeScript, Node.js, Python, PostgreSQL, AWS',
    stat: null,
  },
]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'
const siteUrl = `${SITE_URL}/web-development/`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + '/'),
  title: "Web Development Company in India | Digisharks Communications",
  description:
    "Build a powerful digital presence for your business with modern, responsive, conversion-focused website development. Business websites, e-commerce, WordPress, and more.",
  alternates: { canonical: siteUrl },
};

export default async function WebDevelopmentPage() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('web-development')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">{content.heroEyebrow}</div>
            <h1 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.heroHeading }} />
            <p className="fade-up stagger-2">
              {content.heroDescription}
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href={content.heroPrimaryCta.href || '#'} className="btn-primary">{content.heroPrimaryCta.text}</a>
              <a href={content.heroSecondaryCta.href || '#'} className="btn-outline">{content.heroSecondaryCta.text}</a>
            </div>
          </div>
        </section>

        {/* PROFESSIONAL COMPANY */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.webDevLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.webDevHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.webDevDescription}
            </p>
            <div className="benefits-grid">
              {(content.webDevBenefits || []).map((benefit, i) => (
                <div className={`benefit-card fade-up stagger-${(i % 3) + 1}`} key={i}>
                  <div className="b-icon">{benefit.icon}</div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES — Enhanced 3-column card grid */}
        <section id="services" className="section-bg-soft">
          <div className="container">
            <div className="section-label fade-up">{content.servicesLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.servicesHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              {content.servicesDescription}
            </p>

            <div className="service-grid-enhanced">
              {services.map((svc) => (
                <article key={svc.label} className="service-card-enhanced fade-up" style={{"--card-accent": svc.color} as React.CSSProperties}>
                  <div className="sce-icon-wrap">{svc.emoji}</div>
                  <h3>{svc.label}</h3>
                  <p className="sce-desc">{svc.desc}</p>
                  <ul className="sce-features">
                    {svc.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <a href="/contact-us/" className="sce-cta">
                    Get Started →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">{content.whyLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.whyHeading }} />
            <div className="benefits-grid">
              {(content.whyChooseBenefits || []).map((benefit, i) => (
                <div className={`benefit-card fade-up stagger-${(i % 3) + 1}`} key={i}>
                  <div className="b-icon">{benefit.icon}</div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="section-bg-white">
          <div className="container">
            <div className="section-label fade-up">{content.benefitsLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.benefitsHeading }} />
            <div className="benefits-grid">
              {(content.benefitsCards || []).map((benefit, i) => (
                <div className={`benefit-card fade-up stagger-${(i % 3) + 1}`} key={i}>
                  <div className="b-icon">{benefit.icon}</div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRIES — Web Development Across Industries 2026 */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">{content.industriesLabel}</div>
            <h2 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.industriesHeading }} />
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "760px", marginTop: "0.75rem" }}
               dangerouslySetInnerHTML={{ __html: content.industriesDescription }}>
            </p>

            <div className="industry-detail-grid">
              {industries.map((ind) => (
                <article key={ind.name} className="industry-detail-card fade-up" style={{"--card-accent": ind.color} as React.CSSProperties}>
                  <div className="id-icon-wrap">{ind.emoji}</div>
                  <h3>{ind.name}</h3>
                  <div className="id-headline">{ind.headline}</div>
                  <ul className="id-dlv-list">
                    {ind.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <div className="id-tech"><strong>Technologies:</strong> {ind.tech}</div>
                  {ind.stat && <div className="id-stat">{ind.stat}</div>}
                </article>
              ))}
            </div>

            <p className="fade-up" style={{ textAlign:"center", color:"var(--muted)", fontSize:"0.9rem", marginTop:"2.5rem", maxWidth:"800px", marginLeft:"auto", marginRight:"auto", lineHeight:1.7 }}
               dangerouslySetInnerHTML={{ __html: content.industriesFooter }}>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="final-cta section-bg-white">
          <div className="cta-box fade-up container">
            <h2 dangerouslySetInnerHTML={{ __html: content.ctaHeading }} />
            <p>{content.ctaDescription}</p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href={content.ctaPrimaryCta.href || '#'} className="btn-primary">{content.ctaPrimaryCta.text}</a>
              <a href={content.ctaSecondaryCta.href || '#'} className="btn-outline">{content.ctaSecondaryCta.text}</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      <QuickEditButton slug="web-development" />
    </>
  );
}
