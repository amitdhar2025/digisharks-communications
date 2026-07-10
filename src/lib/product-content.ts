/**
 * Static product content — no server-side dependencies.
 *
 * Contains the ProductContent interface, default data, and
 * getProductContent() helper. Safe to import from client components
 * because there are zero Node.js / MongoDB imports here.
 */

export const PRODUCT_SLUG = 'pan-india-updated-database-2020-2025'

export interface ProductContent {
  whyChoose: string[]
  keyFeatures: string[]
  categoriesCovered: string[]
  dataFormat: string
  deliveryFormat: string
  useCases: string[]
  whoBenefits: string[]
  whatsIncluded: string[]
  testimonials: { name: string; stars: number; text: string }[]
  faq: { q: string; a: string }[]
  supportEmail: string
  contactPhone: string
}

export const PAN_INDIA_CONTENT: ProductContent = {
  whyChoose: [
    'Verified Information: dependable, accurate data across all categories',
    'Flexible Use: customize the database to your business goals',
    'Cost-Effective & All-Inclusive: higher ROI with an affordable, all-round solution',
  ],
  keyFeatures: [
    'Thousands of verified active contacts: Entrepreneurs & Business Owners; CEOs, CMOs, CFOs, Directors; Government Officials; Students, Job Seekers, Working Professionals',
    'Coverage of 40+ industries',
    'Nationwide reach across PAN India',
    'Highly accurate & regularly updated',
    'Available in CSV, Excel, and PDF formats',
    'Suitable for Email, SMS, WhatsApp, and Direct Marketing campaigns',
  ],
  categoriesCovered: [
    'Startups',
    'SMEs',
    'MSMEs',
    'Retailers',
    'Importers',
    'Exporters',
    'Event Planners',
    'Marketing Firms',
    'CA/CS',
    'Doctors',
    'Architects',
    'Builders',
    'Real Estate Agents',
    'Educators',
    'Pharma Companies',
    'Freelancers',
    'Consultants',
    'E-commerce Sellers',
  ],
  dataFormat: 'CSV, PDF, XLS — compatible with your CRM or email tools',
  deliveryFormat:
    'Delivered in CSV or Excel for seamless CRM/marketing integration; sent securely via email or cloud download link. Instant access after payment.',
  useCases: [
    'Email Marketing',
    'SMS/WhatsApp Campaigns',
    'Lead Generation',
    'Cold Outreach',
    'B2B Sales',
    'Freelancing',
    'Direct Business Engagements',
  ],
  whoBenefits: [
    'Startups',
    'Entrepreneurs',
    'Freelancers',
    'Sales Professionals',
    'Marketing Agencies',
    'Business Development Teams',
  ],
  whatsIncluded: [
    'Business Contacts: Name, Company, Role, Industry, Email, Phone, City',
    'Consumer Data: Name, Age, Gender, Email, Phone, City',
    'Professional Segments: CA, Doctors, Architects, Builders, etc.',
    'Student Leads: Exam Aspirants, Course Enquiries',
    'Geographic Details: Region-wise segmentation',
  ],
  testimonials: [
    {
      name: 'Amit Khurana',
      stars: 5,
      text: 'Incredible results! I received over 100 quality B2B leads in just 48 hours. Truly worth the investment.',
    },
    {
      name: 'Neha Verma',
      stars: 5,
      text: 'The data is super clean and 100% verified. It helped me triple my ROI on Instagram ad campaigns.',
    },
    {
      name: 'Sachin Mehta',
      stars: 5,
      text: 'Kudos to the team! They delivered exactly what they promised. Having 145+ categories is a huge advantage.',
    },
    {
      name: 'Kavita Iyer',
      stars: 5,
      text: 'Perfect tool for nationwide outreach. Got access to both student and business data, neatly organized and easy to use.',
    },
  ],
  faq: [
    {
      q: 'When will I receive my product?',
      a: 'Instant download right after payment; a copy is also emailed to you.',
    },
    {
      q: 'What if I need help or have questions?',
      a: 'Our support team is available via email.',
    },
    {
      q: 'How long do I have access?',
      a: 'Lifetime access, including free future updates.',
    },
    {
      q: 'Any hidden charges or subscriptions?',
      a: 'No. Pay once, get full access — no recurring fees.',
    },
  ],
  supportEmail: 'marketing@digisharkscommunications.com',
  contactPhone: '+91 96273 32332',
}

export function getProductContent(slug: string): ProductContent | null {
  if (slug === PRODUCT_SLUG) return PAN_INDIA_CONTENT
  return null
}
