import Footer from "../../../components/Footer";
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'

const DEFAULT_CONTENT = {
  pageTitle: 'Terms and Conditions',
  pageSubtitle: 'Last updated: 7 July 2026',
  intro: 'These Terms and Conditions ("Terms") govern your use of the Digisharks Communications website and services. By accessing or using our website and services, you agree to be bound by these Terms.',
  sections: [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you should not use our website or services.'
    },
    {
      title: '2. Services Description',
      content: 'Digisharks Communications provides digital PR, marketing, web development, and related services. The specific scope, deliverables, timelines, and fees for each engagement will be outlined in a separate agreement or proposal between the parties.'
    },
    {
      title: '3. Intellectual Property',
      content: 'All content, materials, logos, trademarks, and intellectual property displayed on our website are owned by or licensed to Digisharks Communications unless otherwise stated. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.\n\nUpon full payment for services, we grant you a license to use the deliverables produced for you under the terms specified in your service agreement.'
    },
    {
      title: '4. User Obligations',
      content: 'You agree to:\n• Provide accurate and complete information when using our services\n• Use our website and services in compliance with all applicable laws\n• Not engage in any activity that could harm, disable, or impair our systems\n• Not attempt to gain unauthorized access to any part of our website\n• Maintain the confidentiality of any account credentials provided to you'
    },
    {
      title: '5. Payment Terms',
      content: 'Fees for services are as outlined in your service agreement or proposal. Payments are due according to the schedule specified in your agreement. Late payments may result in suspension of services or additional charges. All fees are non-refundable unless otherwise stated in your agreement.'
    },
    {
      title: '6. Limitation of Liability',
      content: 'To the maximum extent permitted by law, Digisharks Communications shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our website or services. Our total liability for any claim shall not exceed the amount paid by you for the specific service giving rise to the claim.'
    },
    {
      title: '7. Indemnification',
      content: 'You agree to indemnify and hold Digisharks Communications harmless from any claims, damages, losses, liabilities, and expenses arising out of your use of our services, your violation of these Terms, or your infringement of any third-party rights.'
    },
    {
      title: '8. Termination',
      content: 'We reserve the right to suspend or terminate your access to our services at any time if you violate these Terms or for any other reason, with or without notice. Upon termination, your right to use our services will immediately cease.'
    },
    {
      title: '9. Governing Law',
      content: 'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh.'
    },
    {
      title: '10. Changes to Terms',
      content: 'We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our website or services after any changes constitutes acceptance of the updated Terms. We encourage you to review these Terms periodically.'
    },
    {
      title: '11. Contact Us',
      content: 'If you have any questions about these Terms, please contact us:\n\nEmail: marketing@digisharkscommunications.com\nPhone: +91 96273 32332\nAddress: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301'
    },
  ],
}

export const dynamic = 'force-dynamic'

export default async function TermsConditions() {
  const cmsContent = await getPageContent('terms-and-conditions')
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
      <QuickEditButton slug="terms-and-conditions" />
    </>
  )
}
