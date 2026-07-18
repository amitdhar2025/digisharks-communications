import Footer from "../../../components/Footer";
import QuickEditButton from '@/components/QuickEditButton'
import { getPageContent } from '@/lib/cms-page-content'
import { refundContent as DEFAULT_CONTENT } from '@/lib/legal-content'

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
