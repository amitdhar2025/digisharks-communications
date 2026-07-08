"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const IconLocation = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
  </svg>
)
const IconPhone = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z"/>
  </svg>
)
const IconMail = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
)
const IconClock = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm.5 5h-1.5v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
)

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'nowrap',
  whiteSpace: 'nowrap',
}

interface FooterSettings {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialYoutube: string;
  siteName: string;
  footerTagline: string;
  copyrightText: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  refundPolicyUrl: string;
  footerLogo: string;
  footerLogoAlt: string;
}

const DEFAULT_SETTINGS: FooterSettings = {
  phone: '+91 96273 32332',
  email: 'marketing@digisharkscommunications.com',
  address: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
  businessHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  socialFacebook: 'https://www.facebook.com/digisharks',
  socialTwitter: 'https://twitter.com/digisharks',
  socialInstagram: 'https://www.instagram.com/digisharks',
  socialLinkedin: 'https://www.linkedin.com/company/digisharks',
  socialYoutube: 'https://www.youtube.com/@digisharks',
  siteName: 'Digisharks Communications',
  footerTagline: 'Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.',
  copyrightText: '© {year} Digisharks Communications. All Rights Reserved. Made with 💙 in India.',
  privacyPolicyUrl: '#',
  termsUrl: '#',
  refundPolicyUrl: '#',
  footerLogo: '',
  footerLogoAlt: 'DigiSharks Logo',
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/public/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings)
      })
      .catch(() => {})
  }, [])

  const s = settings
  const year = new Date().getFullYear()
  const copyright = s.copyrightText.replace('{year}', String(year))

  return (
    <footer className="footer-dark">
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-logo" aria-label="DigiSharks Home">
            <Image
              src={s.footerLogo || "/darks.webp"}
              alt={s.footerLogoAlt || "DigiSharks Logo"}
              width={256}
              height={171}
              style={{
                width: "140px",
                height: "auto",
                maxHeight: "50px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Link>
          <p className="footer-tagline">{s.footerTagline}</p>
          <div className="social-icons">
            <a href={s.socialFacebook} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">📘</a>
            <a href={s.socialInstagram} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">📸</a>
            <a href={s.socialLinkedin} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">💼</a>
            <a href={s.socialTwitter} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">🐦</a>
            <a href={s.socialYoutube} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">▶️</a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about-us">About Us</Link></li>
            <li><Link href="/services-top-pr-digital-marketing/">Services</Link></li>
            <li><Link href="/press-release/">Press Release</Link></li>
            <li><Link href="/digital-marketing-agency/">Digital Marketing</Link></li>
            <li><Link href="/contact-us">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li><Link href="/press-release/">Digital PR</Link></li>
            <li><Link href="/digital-marketing-agency/">SEO and PPC</Link></li>
            <li><Link href="/social-media/">Social Media</Link></li>
            <li><Link href="/web-development/">Web Development</Link></li>
            <li><Link href="/brand-promotion/">Brand Promotion</Link></li>
            <li><Link href="/services-top-pr-digital-marketing/">Political Campaigns</Link></li>
          </ul>
        </div>
        <div className="footer-col footer-contact">
          <h4>Contact Info</h4>
          <ul className="footer-contact-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ ...rowStyle, alignItems: 'flex-start', marginBottom: 12, whiteSpace: 'normal' }}>
              <span style={{ color: '#ff6b00', marginTop: 2 }}>{IconLocation}</span>
              <span dangerouslySetInnerHTML={{ __html: s.address }} />
            </li>
            <li style={{ ...rowStyle, marginBottom: 12 }}>
              <span style={{ color: '#ff6b00' }}>{IconPhone}</span>
              <a href={"tel:" + s.phone.replace(/\s/g, '')} style={{ color: 'inherit', textDecoration: 'none' }}>{s.phone}</a>
            </li>
            <li style={{ ...rowStyle, marginBottom: 12 }}>
              <span style={{ color: '#ff6b00' }}>{IconMail}</span>
              <a href={"mailto:" + s.email} style={{ color: 'inherit', textDecoration: 'none' }}>{s.email}</a>
            </li>
            <li style={{ ...rowStyle }}>
              <span style={{ color: '#ff6b00' }}>{IconClock}</span>
              <span>{s.businessHours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{copyright}</p>
        <ul className="footer-bottom-links">
          <li><a href={s.privacyPolicyUrl}>Privacy Policy</a></li>
          <li><a href={s.termsUrl}>Terms and Conditions</a></li>
          <li><a href={s.refundPolicyUrl}>Refund Policy</a></li>
        </ul>
      </div>
    </footer>
  );
}
