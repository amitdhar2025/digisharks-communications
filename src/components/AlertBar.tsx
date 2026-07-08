"use client";

import React, { useState, useEffect } from "react";

interface MenuItem {
  _id: string;
  label: string;
  href: string;
  order: number;
  icon?: string;
}

interface TickerItem {
  _id: string;
  icon: string;
  label: string;
  order: number;
}

interface SiteSettings {
  phone: string;
}

const DEFAULT_TICKERS: TickerItem[] = [
  {
    _id: "ticker-1",
    icon: "🚨",
    label: "Beware of fraudulent calls, fake invoices, and impersonation scams. Always verify through our official website, email, and phone number before making any payments.",
    order: 0,
  },
  {
    _id: "ticker-2",
    icon: "⚠️",
    label: "DigiSharks does NOT offer any jobs or internships via WhatsApp or Telegram. All such messages are fraudulent — please ignore and report them immediately.",
    order: 1,
  },
  {
    _id: "ticker-3",
    icon: "🏆",
    label: "Awarded 'Top Digital PR Agency — North India 2024' by Clutch. 500+ clients served, 50+ media house partnerships, and 10+ years of trusted digital growth expertise.",
    order: 2,
  },
]

const DEFAULT_LINKS: MenuItem[] = [
  { _id: "1", label: "About Us", href: "/about-us", order: 0 },
  { _id: "2", label: "TIA", href: "https://theindianalert.com", order: 1 },
  { _id: "3", label: "Career", href: "/career", order: 2 },
  { _id: "4", label: "News", href: "/news", order: 3 },
]

export default function AlertBar() {
  const [quickLinks, setQuickLinks] = useState<MenuItem[]>([]);
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ phone: '+91 96273 32332' });

  useEffect(() => {
    Promise.all([
      fetch("/api/public/menus?type=alert-bar").then((r) => r.json()),
      fetch("/api/public/menus?type=alert-ticker").then((r) => r.json()),
      fetch("/api/public/settings").then((r) => r.json()),
    ])
      .then(([linksData, tickersData, settingsData]) => {
        setQuickLinks(
          linksData.items && linksData.items.length > 0 ? linksData.items : DEFAULT_LINKS
        )
        setTickers(
          tickersData.items && tickersData.items.length > 0 ? tickersData.items : DEFAULT_TICKERS
        )
        if (settingsData.settings) {
          setSiteSettings(settingsData.settings)
        }
      })
      .catch(() => {
        setQuickLinks(DEFAULT_LINKS)
        setTickers(DEFAULT_TICKERS)
      })
  }, [])

  // Build a single repeating string for seamless ticker
  const buildTickerItem = (i: number) => (
    <span className="ticker-item" key={i}>
      {tickers.map((t, idx) => (
        <React.Fragment key={t._id || idx}>
          <span className="ticker-icon" aria-hidden="true">{t.icon}</span>
          <span className="ticker-text">{t.label}</span>
          <span className="ticker-sep" aria-hidden="true">✦</span>
        </React.Fragment>
      ))}
    </span>
  );

  return (
    <div className="alert-bar" role="status" aria-label="Security and achievements updates">
      <div className="alert-tag">
        <span className="alert-tag-dot" aria-hidden="true">⚡</span>
        <span>ALERT</span>
      </div>

      <div className="alert-tickers">
        <div className="ticker-viewport">
          <div className="ticker-track">
            {buildTickerItem(0)}
            {buildTickerItem(1)}
          </div>
        </div>
      </div>

      <div className="alert-right" aria-label="Quick links">
        <div className="alert-nav-links" aria-label="Navigation links">
          {quickLinks.map((link, i) => (
            <React.Fragment key={link._id}>
              {i > 0 && <span className="alert-pipe" aria-hidden="true">|</span>}
              <a
                className="alert-nav-link"
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </div>

        <a href={"tel:" + siteSettings.phone.replace(/\s/g, '')} className="alert-phone" aria-label="Phone">
          <span className="alert-phone-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <span className="alert-phone-link">{siteSettings.phone}</span>
        </a>
      </div>
    </div>
  );
}
