import Image from "next/image";
import Link from "next/link";
import ContactForm from './ContactForm'
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'
import { DEFAULT_CONTENT } from '@/lib/contact-content'

export const dynamic = 'force-dynamic'

export default async function ContactUs() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('contact-us')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="content">
        <section className="hero compact">
          <div className="hero-inner">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="hero-eyebrow fade-up">{content.heroEyebrow}</div>
                <h1 className="fade-up stagger-1" dangerouslySetInnerHTML={{ __html: content.heroHeading }} />
                <p className="fade-up stagger-2">{content.heroDescription}</p>
                <div className="hero-ctas fade-up stagger-3">
                  <a href={content.heroPrimaryCta.href || '#contact-form'} className="btn-primary">
                    {content.heroPrimaryCta.text}
                  </a>
                  <a href={content.heroSecondaryCta.href || 'tel:+919627332332'} className="btn-outline">
                    {content.heroSecondaryCta.text}
                  </a>
                </div>
              </div>

              <div className="hero-visual" aria-hidden="true">
                <div className="hero-visual-card">
                  <div className="hero-visual-topline" />
                  <div className="hero-visual-title">
                    <span className="orange-text">Response Time</span>
                  </div>
                  <div className="hero-visual-sub">
                    We typically respond within 2 business hours during working
                    days. For urgent enquiries, call us directly.
                  </div>
                  <div className="hero-visual-badges">
                    <div className="hero-badge">⚡ 2hr Response</div>
                    <div className="hero-badge">🤝 Free Consultation</div>
                    <div className="hero-badge">📊 Custom Strategy</div>
                    <div className="hero-badge">💯 No Obligation</div>
                  </div>
                </div>
                <div className="hero-visual-glow hero-glow-1" />
                <div className="hero-visual-glow hero-glow-2" />
              </div>
            </div>
          </div>
        </section>

        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Reach Out</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: "center" }} dangerouslySetInnerHTML={{ __html: content.contactHeading }} />

            <div className="contact-grid" style={{ marginTop: "3rem" }}>
              <div className="contact-info-card fade-up">
                <h3>📍 Contact Information</h3>
                <div className="contact-info-item">
                  <div className="contact-info-icon">🏢</div>
                  <div>
                    <div className="contact-info-label">Office Address</div>
                    <div className="contact-info-value">{content.contactAddress}</div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">📞</div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value">
                      <a href={"tel:" + content.contactPhone.replace(/\s/g, '')}>{content.contactPhone}</a>
                    </div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">✉️</div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value">
                      <a href={"mailto:" + content.contactEmail}>{content.contactEmail}</a>
                    </div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">🕒</div>
                  <div>
                    <div className="contact-info-label">Business Hours</div>
                    <div className="contact-info-value">{content.contactHours}</div>
                  </div>
                </div>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        <section className="final-cta section-bg-white">
          <div className="cta-box fade-up container">
            <div className="cta-eyebrow">{content.ctaEyebrow}</div>
            <h2 dangerouslySetInnerHTML={{ __html: content.ctaHeading }} />
            <p>{content.ctaDescription}</p>
            <div className="cta-actions">
              <a href="tel:+919627332332" className="btn-primary">📞 Call Us Now</a>
              <a href="mailto:marketing@digisharkscommunications.com" className="btn-outline">✉️ Email Us</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      <QuickEditButton slug="contact-us" />
    </>
  );
}
