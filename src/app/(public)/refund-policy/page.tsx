import Footer from "../../../components/Footer";
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'

const DEFAULT_CONTENT = {
  pageTitle: 'Refund Policy',
  pageSubtitle: 'Last updated: 7 July 2026',
  intro: 'This Refund Policy (\"Policy\") outlines the terms under which Digisharks Communications ("we", "our", or "us") provides refunds for our services and digital products. Please read this Policy carefully before making a purchase.',
  sections: [
    {
      title: '1. General Policy',
      content: 'All fees for services rendered by Digisharks Communications are non-refundable unless otherwise expressly stated in your signed service agreement or proposal. By engaging our services, you acknowledge that you have read and agree to this Policy.'
    },
    {
      title: '2. Service Cancellation & Refunds',
      content: '• If you cancel a service before work has commenced, a full refund minus any administrative fees will be issued.\n• If work has commenced but deliverables have not yet been provided, refunds are assessed on a case-by-case basis depending on the work completed to date.\n• Once deliverables have been provided or the project is substantially complete, no refund will be issued.\n• Monthly retainer services may be cancelled with 30 days written notice. Fees already paid for the current billing period are non-refundable.\n• Campaign-based services (PR campaigns, election campaigns, etc.) are non-refundable once the campaign strategy has been finalized and execution has begun.'
    },
    {
      title: '3. Digital Products (Databases, Templates, etc.)',
      content: 'Due to the nature of digital products, all sales of digital products (including but not limited to business databases, templates, reports, and downloadable content) are FINAL and non-refundable once the product has been downloaded or accessed.\n\nIf you experience technical issues accessing or downloading a digital product, please contact us within 7 days of purchase and we will work with you to resolve the issue. If we are unable to provide access to the product after reasonable efforts, a full refund will be issued.'
    },
    {
      title: '4. Refund Request Process',
      content: 'To request a refund, please contact us at marketing@digisharkscommunications.com with the following information:\n• Your full name and company name\n• Invoice or order number\n• Date of purchase\n• Detailed reason for the refund request\n\nWe will review your request and respond within 7-10 business days. Approved refunds will be processed within 14 business days and credited to the original payment method.'
    },
    {
      title: '5. Dispute Resolution',
      content: 'If you are unsatisfied with our resolution of your refund request, you may escalate the matter to our management team at the same email address. We are committed to resolving all disputes fairly and promptly.'
    },
    {
      title: '6. Contact Us',
      content: 'For any questions regarding this Refund Policy, please contact us:\n\nEmail: marketing@digisharkscommunications.com\nPhone: +91 96273 32332\nAddress: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301'
    },
  ],
}

export const dynamic = 'force-dynamic'

export default async function RefundPolicy() {
  const cmsContent = await getPageContent('refund-policy')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  const sections = content.sections || DEFAULT_CONTENT.sections

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="content">
        <section className="hero compact" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
          <div className="hero-inner" style={{ maxWidth: 800 }}>
            <div className="hero-eyebrow fade-up">Legal</div>
            <h1 className="fade-up stagger-1">{content.pageTitle}</h1>
            <p className="fade-up stagger-2" style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>{content.pageSubtitle}</p>
            <p className="fade-up stagger-3" style={{ color: '#cbd5e1', lineHeight: 1.8, marginTop: '1.5rem' }}>{content.intro}</p>
          </div>
        </section>

        <section className="pr-media" style={{ padding: '3rem 5%' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            {sections.map((section, i) => (
              <div key={i} style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>{section.title}</h2>
                <div style={{ color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '0.95rem' }}>{section.content}</div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
      <QuickEditButton slug="refund-policy" />
    </>
  )
}
