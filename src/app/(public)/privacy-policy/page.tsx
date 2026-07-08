import Footer from "../../../components/Footer";
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'

const DEFAULT_CONTENT = {
  pageTitle: 'Privacy Policy',
  pageSubtitle: 'Last updated: 7 July 2026',
  intro: 'This Privacy Policy describes how Digisharks Communications ("we", "our", or "us") collects, uses, and shares your personal information when you visit our website or use our services.',
  sections: [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, such as when you fill out a contact form, sign up for our services, apply for a job, or communicate with us. This may include your name, email address, phone number, company name, and any other information you choose to provide.\n\nWe also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages visited. We use cookies and similar tracking technologies to collect this data.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to:\n• Provide, maintain, and improve our services\n• Respond to your inquiries and send you relevant information\n• Send marketing communications (with your consent)\n• Analyze website usage and improve user experience\n• Comply with legal obligations and protect our rights'
    },
    {
      title: '3. Sharing of Information',
      content: 'We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and business, provided they agree to keep your information confidential. We may also disclose information if required by law or to protect our rights.'
    },
    {
      title: '4. Data Security',
      content: 'We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      title: '5. Your Rights',
      content: 'Depending on your location, you may have the right to:\n• Access the personal information we hold about you\n• Request correction of inaccurate information\n• Request deletion of your information\n• Object to or restrict processing of your information\n• Data portability\n• Withdraw consent at any time\n\nTo exercise any of these rights, please contact us at marketing@digisharkscommunications.com.'
    },
    {
      title: '6. Cookies',
      content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors come from. You can control cookies through your browser settings. Disabling cookies may affect certain features of our website.'
    },
    {
      title: '7. Third-Party Links',
      content: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. We encourage you to review the privacy policies of any third-party sites you visit.'
    },
    {
      title: '8. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our website after changes constitutes acceptance of the updated policy.'
    },
    {
      title: '9. Contact Us',
      content: 'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:\n\nEmail: marketing@digisharkscommunications.com\nPhone: +91 96273 32332\nAddress: B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301'
    },
  ],
}

export const dynamic = 'force-dynamic'

export default async function PrivacyPolicy() {
  const cmsContent = await getPageContent('privacy-policy')
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
      <QuickEditButton slug="privacy-policy" />
    </>
  )
}
