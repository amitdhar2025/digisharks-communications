'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import './portfolio.css'

const teamMembers = [
  {
    name: 'Uday Kumar',
    role: 'Digital Marketing Executive',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/2023/04/uday-1-638x767.png'
  },
  {
    name: 'Vansh Mehra',
    role: 'Digital Marketing Head',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/2023/04/VANSH-MEHRA-FB--638x767.png'
  },
  {
    name: 'Team Member',
    role: 'PR & Communications',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/2023/05/elections-6-638x767.png'
  }
]

const portfolioItems = [
  {
    title: 'Top 30 Women Entrepreneurs of the Year 2023',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/elementor/thumbs/TOP-30-WOMEN-ENTREPRENEUR-OF-THE-YEAR-2023_-qntmy1s99tpokvvjplqn7er4hb3sy61g7f3wwaeau4.jpg',
    category: 'Awards'
  },
  {
    title: 'Top 10 CEOs 2021–2022',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-03-14-at-11.58.06-qntmy1s99tpokvvjplqn7er4hb3sy61g7f3wwaeau4.jpeg',
    category: 'Awards'
  },
  {
    title: 'Top 10 Dynamic Entrepreneurs 2021–2022',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-03-10-at-17.47.03-1-qntmy1s99tpokvvjplqn7er4hb3sy61g7f3wwaeau4.jpeg',
    category: 'Awards'
  },
  {
    title: 'Top 50 Entrepreneurs 2022',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-03-10-at-17.47.03-qntmy1s99tpokvvjplqn7er4hb3sy61g7f3wwaeau4.jpeg',
    category: 'Awards'
  },
  {
    title: 'Top 10 Influential Businesses of the Year 2022',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-03-10-at-17.47.04-1-qntmy1s99tpokvvjplqn7er4hb3sy61g7f3wwaeau4.jpeg',
    category: 'Awards'
  },
  {
    title: 'The Indian Alert',
    image: 'https://www.digisharkscommunications.com/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2023-03-10-at-17.47.04-qntmy0uf2zoe99wwv3c0mwznvx8fqgxpvagff0fp0c.jpeg',
    category: 'Publication'
  }
]

const clients = ['Patanjali', 'Fitlivs', 'PTC Punjab Network', 'Shivanshi Tarot', 'Ascleplus', 'Digisharks']
const clientColors = ['#4F46E5', '#7C3AED', '#6366F1', '#FB7185', '#F97316']

export default function PortfolioPage() {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const openLightbox = useCallback((url: string) => setLightboxUrl(url), [])
  const closeLightbox = useCallback(() => setLightboxUrl(null), [])

  return (
    <div className="portfolio-page">
      {/* ===== HERO BANNER ===== */}
      <section className="pf-hero">
        <div className="pf-hero-inner">
          <div className="pf-hero-content">
          <div className="hero-eyebrow fade-up" style={{ marginBottom: '1.5rem' }}>
            <span className="eyebrow-dot" />
            #1 Rated PR & Digital Marketing Agency
          </div>
          <h1 className="fade-up stagger-1">
            Top PR Agency <span style={{ color: 'var(--color-orange)' }}>in India</span>
          </h1>
          <p className="pf-hero-sub fade-up stagger-2">Get instant growth results for your business.</p>
          <p className="pf-hero-text fade-up stagger-2">
            Digisharks Communications is one of the top PR agencies in India — we provide the best quality services through creative and innovative ideas.
          </p>
            <div className="hero-ctas fade-up stagger-3">
              <Link href="/contact-us" className="btn-primary">
                Start Now →
              </Link>
              <Link href="/contact-us" className="btn-outline">
                📞 Get a Free Consultation
              </Link>
            </div>
          </div>
          <div className="pf-hero-image fade-up stagger-3">
            <video
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              style={{ width: '100%', maxWidth: '420px', borderRadius: 16, display: 'block', boxShadow: '0 20px 60px rgba(255,107,71,.2)' }}
            >
              <source src="/50-Entrepreneurs-of-The-Year-Awards-2024-2ND-EDITION.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ===== 50 ENTREPRENEURS OF THE YEAR — FLAGSHIP EVENT ===== */}
      <section className="flagship-section section-bg-white">
        <div className="container">
          <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Our Flagship Event</div>
          <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>
            50 Entrepreneurs <span className="orange-text">of the Year</span>
          </h2>
          <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '700px', margin: '0.5rem auto 2rem', fontSize: '1.05rem', lineHeight: 1.75 }}>
            A prestigious award ceremony recognizing and celebrating visionary business leaders across industries. A platform that builds credibility, authority, and lasting networks.
          </p>

          {/* Three Pillars */}
          <div className="services-grid-3">
            <div className="service-card-pf fade-up stagger-1" style={{ textAlign: 'center' }}>
              <div className="sc-icon" style={{ margin: '0 auto 1.25rem' }}>🏔️</div>
              <h3>Summit</h3>
              <p style={{ textAlign: 'center' }}>
                A global leadership summit fostering collaboration between industry pioneers, innovators, and decision-makers. Network with India's most influential business minds and explore groundbreaking opportunities.
              </p>
            </div>
            <div className="service-card-pf fade-up stagger-2" style={{ textAlign: 'center' }}>
              <div className="sc-icon" style={{ margin: '0 auto 1.25rem' }}>🏆</div>
              <h3>Awards</h3>
              <p style={{ textAlign: 'center' }}>
                Celebrating exceptional achievements across sectors — from startups to enterprises. Our awards recognize the visionaries who are shaping the future of business in India and beyond.
              </p>
            </div>
            <div className="service-card-pf fade-up stagger-3" style={{ textAlign: 'center' }}>
              <div className="sc-icon" style={{ margin: '0 auto 1.25rem' }}>📖</div>
              <h3>Magazine</h3>
              <p style={{ textAlign: 'center' }}>
                Featuring success stories, industry trends, and in-depth interviews with award-winning entrepreneurs. A digital publication that amplifies the voices of India's business leaders.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===== ABOUT US ===== */}
      <section className="about-section section-bg-warm">
        <div className="container">
          <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>About Us</div>
          <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>
            Why <span className="orange-text">Digisharks Communications</span>
          </h2>
          <div className="about-content">
            <p className="fade-up stagger-2">
              Digisharks Communications is known for high-quality brand promotions and representing your brand to the world. We help you understand who buys your products and services — by age, location, gender, job title, income, and more — so you spend your marketing on your most enthusiastic customers.
            </p>
            <a href="/contact-us" className="btn-primary fade-up stagger-3">
              Apply for PR →
            </a>
          </div>
        </div>
      </section>

      {/* ===== MEET OUR TEAM ===== */}
      <section className="team-section section-bg-white">
        <div className="container">
          <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Our Team</div>
          <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>
            Meet Our <span className="orange-text">Professionals</span>
          </h2>
          <p className="team-intro fade-up stagger-2">
            Our team is highly professional and experienced. A skilled digital marketing and PR team that drives brand visibility, engagement, and conversions through compelling storytelling, media relations, SEO, and strategic campaigns that deliver measurable results.
          </p>
          <div className="team-grid">
            {teamMembers.map((member, i) => (
              <div key={member.name} className={`team-card fade-up stagger-${i + 1}`}>
                <div className="team-card-img">
                  <img src={member.image} alt={member.name} width={300} height={360} />
                </div>
                <div className="team-card-body">
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR PORTFOLIO (MAIN HIGHLIGHT) ===== */}
      <section className="pf-featured-section section-bg-cool">
        <div className="container">
          <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Our Portfolio</div>
          <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>
            Work That <span className="orange-text">Speaks Volumes</span>
          </h2>
          <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '700px', margin: '0.5rem auto 0', fontSize: '1.05rem', lineHeight: 1.75 }}>
            A showcase of our award-winning projects and campaigns that have made an impact.
          </p>
          <div className="pf-featured-grid">
            {portfolioItems.map((item, i) => (
              <div
                key={item.title}
                className={`pf-featured-card fade-up stagger-${(i % 3) + 1}`}
                onClick={() => openLightbox(item.image)}
              >
                <div className="pf-featured-card-header">
                  <img src={item.image} alt={item.title} width={400} height={260} />
                </div>
                <div className="pf-featured-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.category}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pf-cta-row" style={{ marginTop: '2.5rem' }}>
            <Link href="/contact-us" className="btn-primary">
              Start Your Project →
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="pf-lightbox" onClick={closeLightbox}>
          <button className="pf-lightbox-close" onClick={closeLightbox} aria-label="Close">
            ✕
          </button>
          <img src={lightboxUrl} alt="Portfolio preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ===== OUR CLIENTS ===== */}
      <section className="clients-section section-bg-white">
        <div className="container">
          <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Our Clients</div>
          <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>
            Trusted by <span className="orange-text">Industry Leaders</span>
          </h2>
          <div className="clients-row-grid fade-up stagger-2">
            {clients.map((client, i) => (
              <div key={client} className="client-logo-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <span
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: clientColors[i % clientColors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  {client.charAt(0)}
                </span>
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="pf-cta-section section-bg-warm">
        <div className="cta-box-pf fade-up container">
          <div className="cta-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(255,107,71,.08)', border: '1px solid rgba(255,107,71,.25)', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '1.5rem' }}>
            🚀 Would you like to start?
          </div>
          <h2>Ready to <span className="orange-text">Transform</span> Your Brand?</h2>
          <p>
            Let&apos;s create something extraordinary together. Our team of experts is ready to help you achieve measurable growth and build a brand that stands out.
          </p>
          <div className="cta-actions-pf">
            <Link href="/contact-us" className="btn-primary">
              Contact Us Today →
            </Link>
            <a href="tel:+919627332332" className="btn-outline">
              📞 +91 96273 32332
            </a>
          </div>
        </div>
      </section>

      {/* ===== GOOGLE MAP ===== */}
      <section className="map-section" style={{ padding: '2rem 5%', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex', marginBottom: '1.5rem' }}>Find Us</div>
          <div style={{ maxWidth: 700, margin: '0 auto', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.3)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.7240696259016!2d77.381511!3d28.543721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5b0b0b0b0b0%3A0x0!2zMjjCsDMyJzM3LjQiTiA3N8KwMjInNTMuNSJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: 16 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Digisharks Communications Noida Office"
            />
          </div>
          <p className="fade-up stagger-1" style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <div className="pf-footer-wrap">
        <Footer />
      </div>

      {/* Floating WhatsApp & Phone */}
    </div>
  )
}
