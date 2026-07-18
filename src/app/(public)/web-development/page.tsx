export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import type React from "react";
import Footer from "../../../components/Footer";
import { getPageContent } from '@/lib/cms-page-content'
import QuickEditButton from '@/components/QuickEditButton'
import {
  DEFAULT_CONTENT,
  services,
  industries,
} from '@/lib/web-development-content'


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
