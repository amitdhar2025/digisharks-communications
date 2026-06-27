import React from "react";

export default function AlertBar() {
  const tickers = [
    {
      icon: "🚨",
      text: "Beware of fraudulent calls, fake invoices, and impersonation scams. Always verify through our official website, email, and phone number before making any payments.",
    },
    {
      icon: "⚠️",
      text: "DigiSharks does NOT offer any jobs or internships via WhatsApp or Telegram. All such messages are fraudulent — please ignore and report them immediately.",
    },
    {
      icon: "🏆",
      text: "Awarded 'Top Digital PR Agency — North India 2024' by Clutch. 500+ clients served, 50+ media house partnerships, and 10+ years of trusted digital growth expertise.",
    },
  ];

  // Build a single repeating string for seamless ticker
  const buildTickerItem = (i: number) => (
    <span className="ticker-item" key={i}>
      {tickers.map((t, idx) => (
        <React.Fragment key={idx}>
          <span className="ticker-icon" aria-hidden="true">{t.icon}</span>
          <span className="ticker-text">{t.text}</span>
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
          <a className="alert-nav-link" href="/about-us">About Us</a>
          <span className="alert-pipe" aria-hidden="true">|</span>
          <a className="alert-nav-link" href="https://theindianalert.com" target="_blank" rel="noopener noreferrer">TIA</a>
          <span className="alert-pipe" aria-hidden="true">|</span>
          <a className="alert-nav-link" href="/career">Career</a>
          <span className="alert-pipe" aria-hidden="true">|</span>
          <a className="alert-nav-link" href="/news">News</a>
        </div>

        <a href="tel:+919627332332" className="alert-phone" aria-label="Phone">
          <span className="alert-phone-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <span className="alert-phone-link">+91 96273 32332</span>
        </a>
      </div>
    </div>
  );
}
