import Image from "next/image";
import Link from "next/link";
import ContactForm from './ContactForm'
import Footer from "../../../components/Footer";

export const dynamic = 'force-dynamic'

export default function ContactUs() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="content">
        <section className="hero compact">
          <div className="hero-inner">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="hero-eyebrow fade-up">📞 Get In Touch</div>
                <h1 className="fade-up stagger-1">
                  Let's Build Your <span className="orange-text">Next Big Win</span>
                </h1>
                <p className="fade-up stagger-2">
                  Have a project in mind? Want to scale your brand with data-driven
                  digital PR and marketing? Our team is ready to craft a custom
                  strategy that delivers measurable, compounding growth.
                </p>
                <div className="hero-ctas fade-up stagger-3">
                  <a href="#contact-form" className="btn-primary">
                    Send Us a Message →
                  </a>
                  <a href="tel:+919627332332" className="btn-outline">
                    📞 +91 96273 32332
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
            <h2 className="fade-up stagger-1" style={{ textAlign: "center" }}>
              Three Ways to <span className="orange-text">Connect</span>
            </h2>

            <div className="contact-grid" style={{ marginTop: "3rem" }}>
              <div className="contact-info-card fade-up">
                <h3>📍 Contact Information</h3>
                <div className="contact-info-item">
                  <div className="contact-info-icon">🏢</div>
                  <div>
                    <div className="contact-info-label">Office Address</div>
                    <div className="contact-info-value">
                      B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301
                    </div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">📞</div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value">
                      <a href="tel:+919627332332">+91 96273 32332</a>
                    </div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">✉️</div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value">
                      <a href="mailto:marketing@digisharkscommunications.com">
                        marketing@digisharkscommunications.com
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">🕒</div>
                  <div>
                    <div className="contact-info-label">Business Hours</div>
                    <div className="contact-info-value">Mon–Sat: 10:00 AM – 7:00 PM IST</div>
                  </div>
                </div>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        <section className="final-cta section-bg-white">
          <div className="cta-box fade-up container">
            <div className="cta-eyebrow">💼 Let's Start a Conversation</div>
            <h2>Ready to <span className="orange-text">Grow With Us</span>?</h2>
            <p>
              Whether you're a startup looking to launch, a growing brand aiming
              to scale, or an established company seeking fresh digital momentum
              — we have the expertise, team, and proven strategies to make it
              happen.
            </p>
            <div className="cta-actions">
              <a href="tel:+919627332332" className="btn-primary">📞 Call Us Now</a>
              <a href="mailto:marketing@digisharkscommunications.com" className="btn-outline">✉️ Email Us</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
