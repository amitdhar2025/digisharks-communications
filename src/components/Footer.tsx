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

interface SocialLink {
  platform: string
  label: string
  url: string
  iconSvg: string
  iconEmoji: string
}

interface FooterSettings {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  socialLinks?: SocialLink[];
  footerSocialLinks?: SocialLink[];
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
  footerLinkColumns?: { heading: string; links: { text: string; href: string }[] }[];
}

const DEFAULT_SETTINGS: FooterSettings = {
  phone: '+91 96273 32332',
  email: 'marketing@digisharkscommunications.com',
  address: 'B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301',
  businessHours: 'Mon–Sat: 10:00 AM – 7:00 PM IST',
  socialLinks: [
    { platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/digisharks', iconSvg: '', iconEmoji: '📘' },
    { platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/digisharks', iconSvg: '', iconEmoji: '📸' },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/digisharks', iconSvg: '', iconEmoji: '💼' },
    { platform: 'twitter', label: 'X / Twitter', url: 'https://twitter.com/digisharks', iconSvg: '', iconEmoji: '🐦' },
    { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@digisharks', iconSvg: '', iconEmoji: '▶️' },
  ],
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
  footerLinkColumns: [
    { heading: 'Quick Links', links: [
      { text: 'Home', href: '/' },
      { text: 'About Us', href: '/about-us' },
      { text: 'Services', href: '/services-top-pr-digital-marketing/' },
      { text: 'Press Release', href: '/press-release/' },
      { text: 'Digital Marketing', href: '/digital-marketing-agency/' },
      { text: 'Digital Products', href: '/digital-products/' },
      { text: 'Wishlist ♡', href: '/wishlist' },
      { text: 'Contact', href: '/contact-us' },
    ]},
    { heading: 'Services', links: [
      { text: 'Digital PR', href: '/press-release/' },
      { text: 'SEO and PPC', href: '/digital-marketing-agency/' },
      { text: 'Social Media', href: '/social-media/' },
      { text: 'Web Development', href: '/web-development/' },
      { text: 'Brand Promotion', href: '/brand-promotion/' },
      { text: 'Political Campaigns', href: '/services-top-pr-digital-marketing/' },
    ]},
  ],
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
              src={s.footerLogo || "/darks.avif"}
              alt={s.footerLogoAlt || "DigiSharks Logo"}
              width={256}
              height={171}
              unoptimized
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
{(s.footerSocialLinks && s.footerSocialLinks.length > 0 ? s.footerSocialLinks : (
              s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : [
                { platform: 'facebook', label: 'Facebook', url: s.socialFacebook, iconEmoji: '📘' },
                { platform: 'instagram', label: 'Instagram', url: s.socialInstagram, iconEmoji: '📸' },
                { platform: 'linkedin', label: 'LinkedIn', url: s.socialLinkedin, iconEmoji: '💼' },
                { platform: 'twitter', label: 'X / Twitter', url: s.socialTwitter, iconEmoji: '🐦' },
                { platform: 'youtube', label: 'YouTube', url: s.socialYoutube, iconEmoji: '▶️' },
              ] as SocialLink[]
            )).filter((l) => l.url).map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label={link.label}
                title={link.label}
              >
                {link.iconEmoji || '🔗'}
              </a>
            ))}
          </div>
        </div>
        {(s.footerLinkColumns || []).map((col, ci) => (
          <div key={ci} className="footer-col">
            <h4>{col.heading}</h4>
            <ul>
              {(col.links || []).map((link, li) => (
                <li key={li}>
                  <Link href={link.href}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
