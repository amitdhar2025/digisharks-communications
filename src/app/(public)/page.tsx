
export const dynamic = "force-dynamic";
import MediaCarousel from "@/components/MediaCarousel";
import PortfolioSection from "@/components/PortfolioSection";
import "./home.css";

export default async function Home() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>
      <div className="mesh-grid"></div>
      <div className="content">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="hero-eyebrow fade-up">
                  <span className="eyebrow-dot"></span>
                  AI-Powered Digital Marketing & Web Development Agency
                </div>
                <h1 className="fade-up stagger-1">
                  <span className="ai-gradient-text">AI-Driven Growth</span>
                  <br />for Your Digital Brand
                </h1>
                <p className="fade-up stagger-2">
                  Digisharks Communications is a next-gen digital PR, marketing, and AI-powered web development agency. We fuse data, design, and AI to help brands achieve measurable growth, top-tier media presence, and 10x ROI across 50+ publications.
                </p>
                <div className="hero-ctas fade-up stagger-3">
                  <a href="#" className="btn-primary">Start Now →</a>
                  <a href="#" className="btn-outline">Free AI Audit</a>
                </div>
                <div className="stats-row fade-up stagger-4">
                  <div className="stat-item"><span className="stat-num">500+</span><span className="stat-label">Happy Clients</span></div>
                  <div className="stat-item"><span className="stat-num">10+</span><span className="stat-label">Years of Excellence</span></div>
                  <div className="stat-item"><span className="stat-num">50+</span><span className="stat-label">Media Houses</span></div>
                  <div className="stat-item"><span className="stat-num">100%</span><span className="stat-label">AI-Backed Results</span></div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-visual-card">
                  <div className="hero-visual-topline" />
                  <div className="hero-visual-title"><span className="gradient-text">AI + PR + Digital</span> Engine</div>
                  <div className="hero-visual-sub">Predictive analytics, AI content, and omnichannel campaigns—built for ambitious brands that move fast and scale smart.</div>
                  <div className="hero-visual-badges">
                    <div className="hero-badge">🤖 AI Powered</div>
                    <div className="hero-badge">📰 Media Coverage</div>
                    <div className="hero-badge">⭐ Reputation</div>
                    <div className="hero-badge">🎯 Lead Gen</div>
                    <div className="hero-badge">📈 ROI Tracking</div>
                  </div>
                  <div className="hero-visual-progress">
                    <div className="progress-row"><span>🎯 Brand Visibility</span><span className="progress-num">92%</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: "92%" }} /></div>
                    <div className="progress-row" style={{ marginTop: ".9rem" }}><span>🤖 AI Performance Score</span><span className="progress-num">96%</span></div>
                    <div className="progress-bar"><div className="progress-fill progress-fill-2" style={{ width: "96%" }} /></div>
                  </div>
                </div>
                <div className="hero-visual-glow hero-glow-1" />
                <div className="hero-visual-glow hero-glow-2" />
              </div>
            </div>
          </div>
        </section>

        <div style={{ position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw", width: "100vw", lineHeight: 0, overflow: "hidden" }}>
          <video autoPlay muted loop playsInline disablePictureInPicture style={{ width: "100vw", display: "block", pointerEvents: "none" }}>
            <source src="/Video.mp4" type="video/mp4" />
          </video>
        </div>

        <MediaCarousel />

        <section className="ai-metrics">
          <div className="ai-metrics-inner">
            <div className="ai-metrics-header">
              <div className="ai-badge fade-up"><span className="ai-badge-dot"></span>Live Performance Dashboard</div>
              <h2 className="fade-up stagger-1" style={{ textAlign: "center", marginBottom: "1rem" }}>Real-Time <span className="ai-gradient-text">AI Growth Metrics</span></h2>
              <p className="fade-up stagger-2 text-muted" style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.75 }}>We track everything—visibility, engagement, conversions, AI-driven insights—and show you the numbers that matter in real time.</p>
            </div>
            <div className="metrics-grid">
              <div className="metric-card-ai fade-up stagger-1">
                <div className="metric-icon-wrap cyan">🤖</div>
                <div className="metric-big-num">10x</div>
                <div className="metric-name">AI-Optimised ROI</div>
                <p className="metric-desc">Our AI engine optimises campaigns in real time to deliver ten times the return on your marketing spend.</p>
                <div className="metric-spark">
                  <span style={{ height: "40%", animationDelay: "0s" }}></span>
                  <span style={{ height: "65%", animationDelay: ".1s" }}></span>
                  <span style={{ height: "50%", animationDelay: ".2s" }}></span>
                  <span style={{ height: "80%", animationDelay: ".3s" }}></span>
                  <span style={{ height: "70%", animationDelay: ".4s" }}></span>
                  <span style={{ height: "90%", animationDelay: ".5s" }}></span>
                  <span style={{ height: "75%", animationDelay: ".6s" }}></span>
                </div>
              </div>
              <div className="metric-card-ai fade-up stagger-2">
                <div className="metric-icon-wrap violet">📰</div>
                <div className="metric-big-num violet">500+</div>
                <div className="metric-name">Brand Stories Published</div>
                <p className="metric-desc">Media features across top-tier publications including Forbes, Inc42, YourStory, and 50+ outlets.</p>
                <div className="metric-spark violet">
                  <span style={{ height: "30%", animationDelay: "0s" }}></span>
                  <span style={{ height: "50%", animationDelay: ".1s" }}></span>
                  <span style={{ height: "60%", animationDelay: ".2s" }}></span>
                  <span style={{ height: "80%", animationDelay: ".3s" }}></span>
                  <span style={{ height: "70%", animationDelay: ".4s" }}></span>
                  <span style={{ height: "95%", animationDelay: ".5s" }}></span>
                  <span style={{ height: "85%", animationDelay: ".6s" }}></span>
                </div>
              </div>
              <div className="metric-card-ai fade-up stagger-3">
                <div className="metric-icon-wrap pink">🚀</div>
                <div className="metric-big-num pink">320%</div>
                <div className="metric-name">Average Traffic Growth</div>
                <p className="metric-desc">Websites we manage see a 320% average traffic uplift within the first 6 months.</p>
                <div className="metric-spark pink">
                  <span style={{ height: "40%", animationDelay: "0s" }}></span>
                  <span style={{ height: "55%", animationDelay: ".1s" }}></span>
                  <span style={{ height: "70%", animationDelay: ".2s" }}></span>
                  <span style={{ height: "85%", animationDelay: ".3s" }}></span>
                  <span style={{ height: "75%", animationDelay: ".4s" }}></span>
                  <span style={{ height: "90%", animationDelay: ".5s" }}></span>
                  <span style={{ height: "100%", animationDelay: ".6s" }}></span>
                </div>
              </div>
              <div className="metric-card-ai fade-up stagger-4">
                <div className="metric-icon-wrap emerald">💎</div>
                <div className="metric-big-num emerald">98%</div>
                <div className="metric-name">Client Retention Rate</div>
                <p className="metric-desc">Our clients stick with us because we consistently deliver measurable, compounding growth.</p>
                <div className="metric-spark emerald">
                  <span style={{ height: "60%", animationDelay: "0s" }}></span>
                  <span style={{ height: "75%", animationDelay: ".1s" }}></span>
                  <span style={{ height: "70%", animationDelay: ".2s" }}></span>
                  <span style={{ height: "85%", animationDelay: ".3s" }}></span>
                  <span style={{ height: "90%", animationDelay: ".4s" }}></span>
                  <span style={{ height: "95%", animationDelay: ".5s" }}></span>
                  <span style={{ height: "100%", animationDelay: ".6s" }}></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="awards-section">
          <div className="awards-inner">
            <div className="awards-eyebrow fade-up">🏆 Awards & Recognition</div>
            <h2 className="awards-title fade-up stagger-1">Awards That Recognise Digital Excellence</h2>
            <p className="awards-subtitle fade-up stagger-2">Our work has been recognised by the world's most respected platforms — a testament to the results we deliver for our clients.</p>
            <div className="awards-grid">
              <div className="award-card google fade-up stagger-1">
                <div className="award-badge">
                  <svg width="40" height="40" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                </div>
                <div className="award-name">Google Partner</div>
                <span className="award-year">PREMIER 2026</span>
              </div>
              <div className="award-card meta fade-up stagger-2">
                <div className="award-badge">
                  <svg width="40" height="40" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#1877F2"/><path fill="#fff" d="M28 14h-3c-2.8 0-5 2.2-5 5v3h-3v4h3v10h4V26h3l1-4h-4v-2.5c0-.6.4-1 1-1h2.5l.5-4.5z"/></svg>
                </div>
                <div className="award-name">Meta Business Partner</div>
                <span className="award-year" style={{ background: "rgba(24,119,242,.12)", borderColor: "rgba(24,119,242,.3)", color: "#1877f2" }}>CERTIFIED 2025</span>
              </div>
              <div className="award-card clutch fade-up stagger-3">
                <div className="award-shield">
                  <div className="shield-top">TOP PPC</div>
                  <div className="shield-mid">COMPANY</div>
                  <div className="shield-bot">Clutch • 2026</div>
                </div>
                <div className="award-name">Ecommerce</div>
                <span className="award-year">2026</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="section-label fade-up">Our Services</div>
            <h2 className="fade-up stagger-1">What We Do <span className="gradient-text">Best</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ maxWidth: "780px", marginTop: "1rem", fontSize: "1.05rem", lineHeight: 1.75 }}>From AI-powered digital PR to full-stack marketing, we deliver end-to-end brand growth solutions that combine creativity, technology, and data-driven insights to maximize your ROI.</p>
            <div className="services-grid">
              <div className="service-card fade-up stagger-1">
                <div className="service-icon">🤖</div>
                <h3>AI-Driven Digital PR</h3>
                <p>Build a powerful digital presence through strategic media house partnerships. We enhance your brand authority, distribute press releases with AI precision, and manage your online reputation across 50+ top publications in India.</p>
                <a href="#" className="card-link">Learn more →</a>
              </div>
              <div className="service-card fade-up stagger-2">
                <div className="service-icon">📺</div>
                <h3>Media Management</h3>
                <p>Collaborate with leading media houses across India for extensive brand coverage. We craft engaging content, segment audiences, and run high-impact brand visibility campaigns that convert.</p>
                <a href="#" className="card-link">Learn more →</a>
              </div>
              <div className="service-card fade-up stagger-3">
                <div className="service-icon">📈</div>
                <h3>AI-Powered Digital Marketing</h3>
                <p>From SEO to PPC and social media optimization — we run full-stack digital campaigns with measurable ROI, targeting your exact audience across every digital channel that matters.</p>
                <a href="#" className="card-link">Learn more →</a>
              </div>
              <div className="service-card fade-up stagger-1">
                <div className="service-icon">🎯</div>
                <h3>Smart Lead Generation</h3>
                <p>High-intent lead pipelines powered by AI performance marketing, content funnels, and retargeting strategies. We help you fill your sales pipeline with qualified prospects ready to buy.</p>
<a href="#" className="card-link">Learn more →</a>
              </div>
              <div className="service-card fade-up stagger-2">
                <div className="service-icon">✍️</div>
                <h3>AI Content Strategy</h3>
                <p>Compelling storytelling that converts. Our content team crafts SEO-optimized blogs, social copy, video scripts, and brand narratives that engage audiences and build authority.</p>
                <a href="#" className="card-link">Learn more →</a>
              </div>
              <div className="service-card fade-up stagger-3">
                <div className="service-icon">🏆</div>
                <h3>Political Campaign Mgmt</h3>
                <p>Strategic communication and voter outreach for political campaigns. We have managed multiple state and national election campaigns with measurable on-ground impact.</p>
                <a href="#" className="card-link">Learn more →</a>
              </div>
            </div>
          </div>
        </section>

        <PortfolioSection />

        <section className="pr-media">
          <div className="pr-grid">
            <div className="fade-up">
              <div className="section-label">Press Release</div>
              <h2>Publish with India's Leading <span className="gradient-text">Media Houses</span></h2>
              <p className="text-muted" style={{ marginTop: "1.25rem", lineHeight: 1.75, fontSize: ".95rem" }}>We leverage demographic analysis and audience targeting to place your press releases in front of the right readers across 50+ top media publications in India. Our strategic PR approach ensures your brand story reaches maximum eyeballs with verified, premium placements.</p>
              <ul className="feature-list" style={{ marginTop: "1.5rem" }}>
                <li>Demographic & psychographic audience analysis</li>
                <li>Targeted press release distribution to 50+ publications</li>
                <li>Brand narrative crafting by senior PR experts</li>
                <li>Multi-platform media syndication & reporting</li>
                <li>Verified backlinks for SEO authority boost</li>
              </ul>
            </div>
            <div className="pr-highlight fade-up stagger-2">
              <h3>🎁 Free AI Consultation</h3>
              <p>Get complimentary consultancy for AI-powered Digital PR and Digital Marketing services. Our experts will analyse your brand, identify growth opportunities, and build a custom AI-driven strategy — at zero cost to you.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "var(--bg)", borderRadius: "10px", textAlign: "center" }}><div style={{ fontSize: "1.4rem" }}>🤖</div><div style={{ fontSize: ".8rem", fontWeight: 700, marginTop: ".4rem" }}>AI Brand Audit</div></div>
                <div style={{ padding: "1rem", background: "var(--bg)", borderRadius: "10px", textAlign: "center" }}><div style={{ fontSize: "1.4rem" }}>🗺️</div><div style={{ fontSize: ".8rem", fontWeight: 700, marginTop: ".4rem" }}>Growth Roadmap</div></div>
                <div style={{ padding: "1rem", background: "var(--bg)", borderRadius: "10px", textAlign: "center" }}><div style={{ fontSize: "1.4rem" }}>🎯</div><div style={{ fontSize: ".8rem", fontWeight: 700, marginTop: ".4rem" }}>Target Audience</div></div>
                <div style={{ padding: "1rem", background: "var(--bg)", borderRadius: "10px", textAlign: "center" }}><div style={{ fontSize: "1.4rem" }}>💡</div><div style={{ fontSize: ".8rem", fontWeight: 700, marginTop: ".4rem" }}>AI Strategy</div></div>
              </div>
              <a href="#" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Apply for AI PR →</a>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <div className="section-label fade-up">AI Digital Marketing</div>
            <h2 className="fade-up stagger-1">AI-Powered <span className="gradient-text">Digital Growth</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ maxWidth: "780px", marginTop: "1rem", fontSize: "1.05rem", lineHeight: 1.75 }}>Performance-driven AI marketing that turns clicks into customers. Every campaign we run is backed by data, optimised for conversions, and tracked end-to-end for maximum ROI.</p>
            <div className="dm-grid">
              <div className="dm-card fade-up stagger-1">
                <div className="dm-card-header"><div className="dm-card-icon icon-cyan">🤖</div><h3>AI-Powered SEO</h3></div>
                <p>Dominate search rankings with a full-spectrum AI-SEO strategy built for the Indian market and beyond. From technical audits to content-driven link building, we help you rank for the keywords that matter.</p>
                <ul className="feature-list">
                  <li>AI Keyword Research & Mapping</li>
                  <li>On-Page SEO Optimization</li>
                  <li>Off-Page Link Building</li>
                  <li>Technical SEO Audits</li>
                  <li>AI Content Strategy & Blogs</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat"><span className="dm-card-stat-num">3x</span><span className="dm-card-stat-label">Traffic Growth</span></div>
                  <div className="dm-card-stat"><span className="dm-card-stat-num">90+</span><span className="dm-card-stat-label">DA Backlinks</span></div>
                </div>
              </div>
              <div className="dm-card fade-up stagger-2">
                <div className="dm-card-header"><div className="dm-card-icon icon-violet">📱</div><h3>Social Media AI</h3></div>
                <p>Build a loyal community and amplify your brand voice across all social media platforms with AI precision. We craft scroll-stopping content and engagement strategies that grow followers into customers.</p>
                <ul className="feature-list">
                  <li>AI Content Creation & Calendar</li>
                  <li>Smart Community Management</li>
                  <li>Influencer Collaboration</li>
                  <li>AI Social Media Campaigns</li>
                  <li>Targeted Advertising</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat"><span className="dm-card-stat-num">5x</span><span className="dm-card-stat-label">Engagement</span></div>
                  <div className="dm-card-stat"><span className="dm-card-stat-num">100K+</span><span className="dm-card-stat-label">Followers Gained</span></div>
                </div>
              </div>
              <div className="dm-card fade-up stagger-3">
                <div className="dm-card-header"><div className="dm-card-icon icon-pink">⚡</div><h3>AI PPC Advertising</h3></div>
                <p>Drive immediate, measurable results with AI-optimised pay-per-click campaigns that maximise ROI. From Google Ads to Meta, we manage budgets that convert clicks into qualified leads and sales.</p>
                <ul className="feature-list">
                  <li>AI Bid Optimisation</li>
                  <li>Real-time ROI Tracking</li>
                  <li>Smart Keyword Targeting</li>
                  <li>Google & Meta AI Ads</li>
                  <li>AI Conversion Rate Optimization</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat"><span className="dm-card-stat-num">4.5x</span><span className="dm-card-stat-label">Average ROAS</span></div>
                  <div className="dm-card-stat"><span className="dm-card-stat-num">-32%</span><span className="dm-card-stat-label">Cost Per Lead</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: "var(--surface)" }}>
          <div className="container">
            <div className="section-label fade-up" style={{ justifyContent: "center", display: "flex" }}>Our AI Process</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: "center" }}>How We Deliver <span className="ai-gradient-text">AI-Powered Results</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ textAlign: "center", maxWidth: "700px", margin: "1rem auto 0", fontSize: "1.05rem", lineHeight: 1.75 }}>A battle-tested 4-step AI-enhanced process refined over 10+ years and 500+ successful campaigns across multiple industries.</p>
            <div className="process-grid">
              <div className="process-step fade-up stagger-1"><div className="process-num">01</div><div className="process-icon">🔬</div><h3>AI Discovery & Audit</h3><p>Deep-dive AI research into your brand, competitors, audience, and goals to build a strong strategic foundation.</p></div>
              <div className="process-step fade-up stagger-2"><div className="process-num">02</div><div className="process-icon">🧠</div><h3>AI Strategy & Planning</h3><p>Custom AI-enhanced PR + digital marketing roadmap with KPIs, content calendar, channel mix, and budget allocation.</p></div>
              <div className="process-step fade-up stagger-3"><div className="process-num">03</div><div className="process-icon">🚀</div><h3>AI Execute & Optimize</h3><p>Launch AI-optimised campaigns, publish content, build media relations, run ads, and continuously A/B test for peak performance.</p></div>
              <div className="process-step fade-up stagger-4"><div className="process-num">04</div><div className="process-icon">📈</div><h3>AI Measure & Scale</h3><p>Detailed monthly AI reports, transparent dashboards, and scale winning strategies for compounding growth.</p></div>
            </div>
          </div>
        </section>

        <section className="testimonials-bg">
          <div className="container">
            <div className="section-label fade-up">Client Testimonials</div>
            <h2 className="fade-up stagger-1">What Our <span className="gradient-text">Clients Say</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ maxWidth: "700px", marginTop: "1rem", fontSize: "1.05rem", lineHeight: 1.75 }}>Real reviews from real clients. We measure our success by the growth and satisfaction of the brands we partner with.</p>
            <div className="testi-grid">
              <div className="testi-card fade-up stagger-1">
                <div className="stars">★★★★★</div>
                <p className="testi-quote">"They have excellent media coverage capabilities and provide great exposure for brands. Truly one of the best in the business. Our visibility grew 4x in just 3 months."</p>
                <div className="testi-author"><div className="avatar">YM</div><div><div className="author-name">Yassmin Mistry</div><div className="author-sub">Founder, Verified Client</div></div></div>
              </div>
              <div className="testi-card fade-up stagger-2">
                <div className="stars">★★★★★</div>
                <p className="testi-quote">"It was great working with Digisharks Communications. They provided valuable opportunities and helped enhance my knowledge. Highly recommended PR and Digital Marketing agency."</p>
                <div className="testi-author"><div className="avatar" style={{ background: "linear-gradient(135deg,var(--violet),var(--pink))" }}>UK</div><div><div className="author-name">Uday Kumar</div><div className="author-sub">CEO, Verified Client</div></div></div>
              </div>
              <div className="testi-card fade-up stagger-3">
                <div className="stars">★★★★★</div>
                <p className="testi-quote">"Digisharks Communications is one of the best PR and digital marketing agencies in Delhi NCR. Their team is highly professional, experienced, and supportive throughout."</p>
                <div className="testi-author"><div className="avatar" style={{ background: "linear-gradient(135deg,var(--pink),var(--cyan))" }}>PP</div><div><div className="author-name">Preeti Packer</div><div className="author-sub">Director, Verified Client</div></div></div>
              </div>
            </div>
            <div className="review-platforms">
              <div className="review-platform fade-up stagger-1"><div className="review-platform-icon">⭐</div><div className="review-platform-name">Google</div><div className="review-platform-rating"><span className="stars">★★★★★</span> 4.9/5</div></div>
              <div className="review-platform fade-up stagger-2"><div className="review-platform-icon">💼</div><div className="review-platform-name">Clutch</div><div className="review-platform-rating"><span className="stars">★★★★★</span> 4.8/5</div></div>
              <div className="review-platform fade-up stagger-3"><div className="review-platform-icon">🌐</div><div className="review-platform-name">Trustpilot</div><div className="review-platform-rating"><span className="stars">★★★★★</span> 4.9/5</div></div>
              <div className="review-platform fade-up stagger-4"><div className="review-platform-icon">📘</div><div className="review-platform-name">Facebook</div><div className="review-platform-rating"><span className="stars">★★★★★</span> 5.0/5</div></div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="cta-box fade-up container">
            <div className="cta-eyebrow">🚀 Let's Build Something Great</div>
            <h2>Start Your <span className="ai-gradient-text">AI Growth Journey</span> Today</h2>
            <p>Your customers are online right now. Let us help you reach them with the right message, on the right platform, at the right moment. Don't let competitors take what's yours.</p>
            <div className="cta-features">
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Free AI Strategy Session</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>No Long-Term Lock-in</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Dedicated AI Account Manager</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Transparent Reporting</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>30-Day Money Back</div>
            </div>
            <div className="cta-actions">
              <a href="#" className="btn-primary">Contact Us Today →</a>
              <a href="#" className="btn-outline">📞 +91 96273 32332</a>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-top">
            <div>
              <a href="#" className="footer-logo">DigiSharks</a>
              <p className="footer-tagline">Top AI-Powered Digital PR and Digital Marketing Agency helping businesses achieve measurable growth through innovative, data-driven strategies. Established 2017, New Delhi.</p>
              <div className="social-icons">
                <a href="https://www.facebook.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">📘</a>
                <a href="https://www.instagram.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">📸</a>
                <a href="https://www.linkedin.com/company/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">💼</a>
                <a href="https://twitter.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">🐦</a>
                <a href="https://www.youtube.com/@digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">▶️</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about-us">About Us</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Portfolio</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Digital PR</a></li>
                <li><a href="#">Media Management</a></li>
                <li><a href="#">SEO Services</a></li>
                <li><a href="#">Social Media (SMO)</a></li>
                <li><a href="#">PPC Advertising</a></li>
                <li><a href="#">Political Campaigns</a></li>
              </ul>
            </div>
            <div className="footer-col footer-contact">
              <h4>Contact Info</h4>
              <ul>
                <li>📍 B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301</li>
                <li style={{ marginTop: ".5rem" }}>📞 <a href="tel:+919627332332" style={{ color: "var(--cyan)", textDecoration: "none" }}>+91 96273 32332</a></li>
                <li style={{ marginTop: ".25rem" }}>✉️ <a href="mailto:info@digisharkscommunications.com" style={{ color: "var(--cyan)", textDecoration: "none", fontSize: ".82rem" }}>info@digisharkscommunications.com</a></li>
                <li style={{ marginTop: ".5rem" }}>🕒 Mon–Sat: 10:00 AM – 7:00 PM IST</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Digisharks Communications. All Rights Reserved. Made with 💙 in India.</p>
            <ul className="footer-bottom-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
}
