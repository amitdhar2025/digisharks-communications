"use client";
import React from "react";

export default function PortfolioSection() {
  return (
    <section className="portfolio-section section-mc">
      {/* Multi-color glow blobs */}
      <div className="mc-glow cyan" style={{ top: "10%", left: "5%", width: "320px", height: "320px" }} />
      <div className="mc-glow violet" style={{ top: "40%", right: "5%", width: "380px", height: "380px", animationDelay: "-6s" }} />
      <div className="mc-glow pink" style={{ bottom: "10%", left: "30%", width: "300px", height: "300px", animationDelay: "-12s" }} />
      <div className="mc-glow amber" style={{ top: "60%", right: "20%", width: "260px", height: "260px", animationDelay: "-9s" }} />

      <div className="container">
        <div className="pf-header">
          <span className="pf-eyebrow">
            <span className="dot" />
            Featured Portfolio
          </span>
          <h2>
            Work That <span className="text-mc-rainbow">Speaks Volumes</span>
          </h2>
          <p>
            A colorful showcase of brands we have scaled, campaigns we have
            engineered, and digital stories we have told across industries —
            from rising startups to established enterprises.
          </p>
        </div>

        <div className="pf-filters">
          <button className="pf-filter active">All Work</button>
          <button className="pf-filter">Digital PR</button>
          <button className="pf-filter">SEO</button>
          <button className="pf-filter">Social Media</button>
          <button className="pf-filter">Web Dev</button>
          <button className="pf-filter">Branding</button>
        </div>

        <div className="portfolio-grid-mc">
          <div className="pf-card theme-cyan fade-up stagger-1">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/digital-pr.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Digital PR</span>
              <span className="pf-year">2026</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">Forbes</span>
                <span className="pf-card-tag">Inc42</span>
                <span className="pf-card-tag">YourStory</span>
              </div>
              <h3>Patanjali National PR Campaign</h3>
              <p>
                Secured 50+ top-tier media features in 60 days, amplifying
                brand presence across India's leading business publications
                and driving a measurable 4x lift in share of voice.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">52</span>
                  <span className="pf-stat-lbl">Publications</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">4x</span>
                  <span className="pf-stat-lbl">Brand Lift</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">98%</span>
                  <span className="pf-stat-lbl">DA Quality</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-violet fade-up stagger-2">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/web-development.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Web Development</span>
              <span className="pf-year">2025</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">E-Commerce</span>
                <span className="pf-card-tag">AI Search</span>
                <span className="pf-card-tag">CRO</span>
              </div>
              <h3>Ascleplus E-Commerce Platform</h3>
              <p>
                Designed, developed and launched a high-conversion health
                products platform with AI-powered search, dynamic bundles,
                and a 320% traffic uplift in the first six months post-launch.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">320%</span>
                  <span className="pf-stat-lbl">Traffic Growth</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">3.2s</span>
                  <span className="pf-stat-lbl">Load Time</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">4.6x</span>
                  <span className="pf-stat-lbl">ROAS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-magenta fade-up stagger-3">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/social-media.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Social Media</span>
              <span className="pf-year">2026</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">Instagram</span>
                <span className="pf-card-tag">YouTube</span>
                <span className="pf-card-tag">Reels</span>
              </div>
              <h3>Shivanshi Tarot Brand Launch</h3>
              <p>
                Built a multi-platform spiritual brand from zero to 100K+
                followers using AI-driven content calendars, reels strategy,
                and influencer collaborations tailored to audience intent.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">100K+</span>
                  <span className="pf-stat-lbl">Followers</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">5x</span>
                  <span className="pf-stat-lbl">Engagement</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">12M+</span>
                  <span className="pf-stat-lbl">Reel Views</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-pink fade-up stagger-1">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/political-pr.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Political PR</span>
              <span className="pf-year">2024</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">BJP</span>
                <span className="pf-card-tag">Voter Outreach</span>
                <span className="pf-card-tag">Booth Mgmt</span>
              </div>
              <h3>Uttarakhand Election Campaign 2024</h3>
              <p>
                End-to-end digital campaign management with booth-level
                coordination, voter database analytics, and 95% turnout boost
                across managed constituencies.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">500+</span>
                  <span className="pf-stat-lbl">Booths</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">95%</span>
                  <span className="pf-stat-lbl">Turnout Boost</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">1M+</span>
                  <span className="pf-stat-lbl">Voters</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-orange fade-up stagger-2">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/seo-ppc.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">SEO & PPC</span>
              <span className="pf-year">2026</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">Google Ads</span>
                <span className="pf-card-tag">Meta Ads</span>
                <span className="pf-card-tag">AI Bidding</span>
              </div>
              <h3>Fitlivs Performance Marketing</h3>
              <p>
                AI-optimized PPC and SEO blend that dropped cost-per-lead by
                32% and scaled monthly revenue 3.8x in 90 days across fitness
                D2C segments.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">-32%</span>
                  <span className="pf-stat-lbl">CPL</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">3.8x</span>
                  <span className="pf-stat-lbl">Revenue</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">4.5x</span>
                  <span className="pf-stat-lbl">ROAS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-lime fade-up stagger-3">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/Branding.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Branding</span>
              <span className="pf-year">2025</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">EdTech</span>
                <span className="pf-card-tag">UI/UX</span>
                <span className="pf-card-tag">Logo</span>
              </div>
              <h3>EdTech Ventures Identity</h3>
              <p>
                Crafted a memorable multi-color brand identity, UI system and
                launch playbook that helped the platform acquire its first
                10,000 paying learners within a quarter.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">10K+</span>
                  <span className="pf-stat-lbl">Learners</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">12</span>
                  <span className="pf-stat-lbl">Brand Assets</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">4.8★</span>
                  <span className="pf-stat-lbl">App Rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-aurora fade-up stagger-1">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/Reputation.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Reputation</span>
              <span className="pf-year">2026</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">ORM</span>
                <span className="pf-card-tag">Crisis</span>
                <span className="pf-card-tag">Monitoring</span>
              </div>
              <h3>Enterprise ORM Recovery</h3>
              <p>
                24/7 AI-driven reputation monitoring and content suppression
                recovered a brand from negative SERP dominance to 92% positive
                coverage in under 90 days.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">92%</span>
                  <span className="pf-stat-lbl">Positive SERP</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">24/7</span>
                  <span className="pf-stat-lbl">Monitoring</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">90d</span>
                  <span className="pf-stat-lbl">Recovery</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-sunset fade-up stagger-2">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/Influencer.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">Influencer</span>
              <span className="pf-year">2026</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">Macro</span>
                <span className="pf-card-tag">Micro</span>
                <span className="pf-card-tag">Nano</span>
              </div>
              <h3>Multi-Tier Influencer Rollout</h3>
              <p>
                Activated a 120+ creator network across niches with AI-matched
                audiences, generating 28M+ impressions and a 6.4x return on
                influencer marketing spend.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">120+</span>
                  <span className="pf-stat-lbl">Creators</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">28M+</span>
                  <span className="pf-stat-lbl">Impressions</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">6.4x</span>
                  <span className="pf-stat-lbl">ROAS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card theme-ocean fade-up stagger-3">
            <div className="pf-card-header" style={{ backgroundImage: 'url("/ai-tools.avif")', backgroundPosition: 'center' }}>
              <span className="pf-tag">AI Tools</span>
              <span className="pf-year">2026</span>
            </div>
            <div className="pf-card-body">
              <div className="pf-card-tags">
                <span className="pf-card-tag">AI Content</span>
                <span className="pf-card-tag">Chatbot</span>
                <span className="pf-card-tag">Workflow</span>
              </div>
              <h3>Patanjali AI Content Engine</h3>
              <p>
                Built a custom AI content workflow that produces 200+
                on-brand articles, social posts, and videos per month while
                maintaining editorial quality and SEO authority.
              </p>
              <div className="pf-card-stats">
                <div className="pf-card-stat">
                  <span className="pf-stat-num">200+</span>
                  <span className="pf-stat-lbl">Pieces / Month</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">8x</span>
                  <span className="pf-stat-lbl">Output Speed</span>
                </div>
                <div className="pf-card-stat">
                  <span className="pf-stat-num">96%</span>
                  <span className="pf-stat-lbl">AI Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pf-cta-row">
          <a href="#" className="btn-primary">
            Explore Full Portfolio →
          </a>
          <a href="#" className="btn-outline">
            📞 Book a Strategy Call
          </a>
        </div>
      </div>
    </section>
  );
}