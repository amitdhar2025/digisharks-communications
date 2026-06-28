import Footer from "../../../components/Footer";

export const dynamic = "force-dynamic";

export default function AboutUs() {
  return (
    <>

      <div className="content">
        {/* ============== HERO ============== */}
        <section className="hero compact">
          <div className="hero-inner">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="hero-eyebrow fade-up">✦ About Digisharks</div>
                <h1 className="fade-up stagger-1">
                  Build lasting <span className="orange-text">brand value</span> with digital PR
                  & growth.
                </h1>
                <p className="fade-up stagger-2">
                  Digisharks Communications is a pioneer digital marketing agency established in 2017 in
                  New Delhi—enhancing customer experiences through innovative digital marketing and
                  Digital PR strategies that help businesses grow, engage their audiences, and achieve
                  measurable outcomes.
                </p>

                <div className="hero-ctas fade-up stagger-3">
                  <a href="#" className="btn-primary">
                    Start Your Growth Journey →
                  </a>
                  <a href="#" className="btn-outline">
                    Free Consultation
                  </a>
                </div>

                <div className="stats-row fade-up stagger-4">
                  <div className="stat-item">
                    <span className="stat-num" data-target="4000">4000</span>
                    <span className="stat-label">Satisfied Customers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-num" data-target="120">120</span>
                    <span className="stat-label">Completed Projects</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-num" data-target="50">50</span>
                    <span className="stat-label">Live Projects</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-num">100%</span>
                    <span className="stat-label">Results Focus</span>
                  </div>
                </div>
              </div>

              <div className="hero-visual" aria-hidden="true">
                <div className="hero-visual-card">
                  <div className="hero-visual-topline" />
                  <div className="hero-visual-title">
                    <span className="orange-text">Digital PR</span> + Digital Marketing
                  </div>
                  <div className="hero-visual-sub">
                    Strategy, media outreach, online reputation, and measurable business outcomes—built
                    for brands that move.
                  </div>

                  <div className="hero-visual-badges">
                    <div className="hero-badge">🌟 Transparency</div>
                    <div className="hero-badge">⭐ Quality Service</div>
                    <div className="hero-badge">📈 Measurable Results</div>
                    <div className="hero-badge">💡 Innovation</div>
                  </div>

                  <div className="hero-visual-progress">
                    <div className="progress-row">
                      <span>👥 Customer Experience</span>
                      <span className="progress-num">92%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" data-width="92%" style={{ width: "0%" }} />
                    </div>

                    <div className="progress-row" style={{ marginTop: ".9rem" }}>
                      <span>💎 Brand Impact</span>
                      <span className="progress-num">88%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-fill-2" data-width="88%" style={{ width: "0%" }} />
                    </div>
                  </div>
                </div>

                <div className="hero-visual-glow hero-glow-1" />
                <div className="hero-visual-glow hero-glow-2" />
              </div>
            </div>
          </div>
        </section>

        {/* ============== ABOUT COMPANY ============== */}
        <section>
          <div className="container">
            <div className="section-label fade-up">About The Company</div>
            <h2 className="fade-up stagger-1">
              Digisharks Communications <span className="orange-text">Since 2017</span>
            </h2>
            <p className="fade-up stagger-2 text-muted" style={{ marginTop: "1.25rem", lineHeight: 1.9, fontSize: '1.05rem', textAlign: 'justify', textAlignLast: 'left' }}>
              Digisharks Communications is a pioneer and creative digital marketing agency established in 2017 in New Delhi.
              Through innovative digital solutions and customer-focused strategies, the company has built a strong client base
              across multiple industries. Digisharks Communications believes in transparency, quality service, creativity, and
              measurable results that drive real business outcomes.
            </p>

            <div className="achievement-grid" style={{ marginTop: "2.75rem" }}>
              <div className="ach-card fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">🏆</div>
                <span className="ach-num">10+</span>
                <span className="ach-label">Years of Excellence</span>
              </div>
              <div className="ach-card fade-up stagger-2" style={{ "--card-accent": "#3B82F6", "--card-accent-bg": "rgba(59,130,246,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">😊</div>
                <span className="ach-num">4000+</span>
                <span className="ach-label">Happy Customers</span>
              </div>
              <div className="ach-card fade-up stagger-3" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">📊</div>
                <span className="ach-num">120+</span>
                <span className="ach-label">Projects Delivered</span>
              </div>
              <div className="ach-card fade-up stagger-4" style={{ "--card-accent": "#8B5CF6", "--card-accent-bg": "rgba(139,92,246,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">🚀</div>
                <span className="ach-num">50+</span>
                <span className="ach-label">Active Campaigns</span>
              </div>
            </div>

            <div className="dm-grid" style={{ marginTop: "2.75rem" }}>
              <div className="dm-card dm-card-enhanced fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">✨</div>
                  <h3>Vision</h3>
                </div>
                <p>
                  To enhance customer experiences through innovative digital marketing and Digital PR strategies that help
                  businesses grow, engage their audiences, and build lasting brand value across every digital touchpoint.
                </p>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">10+</span>
                    <span className="dm-card-stat-label">Years of Excellence</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">4000+</span>
                    <span className="dm-card-stat-label">Happy Clients</span>
                  </div>
                </div>
              </div>

              <div className="dm-card dm-card-enhanced fade-up stagger-2" style={{ "--card-accent": "#6366F1", "--card-accent-bg": "rgba(99,102,241,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">🎯</div>
                  <h3>Mission</h3>
                </div>
                <p>
                  To become the most trusted digital partner for our clients by delivering excellence through innovative marketing
                  solutions, strategic communication, and measurable business outcomes that exceed expectations.
                </p>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">120+</span>
                    <span className="dm-card-stat-label">Projects Delivered</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">500+</span>
                    <span className="dm-card-stat-label">Campaigns Run</span>
                  </div>
                </div>
              </div>

              <div className="dm-card dm-card-enhanced fade-up stagger-3" style={{ "--card-accent": "#0EA5E9", "--card-accent-bg": "rgba(14,165,233,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">🧩</div>
                  <h3>What We Offer</h3>
                </div>
                <p style={{ marginBottom: ".85rem" }}>
                  A comprehensive range of digital and conventional marketing services designed to cover every brand need:
                </p>
                <ul className="feature-list">
                  <li>Digital PR & Media Coverage</li>
                  <li>Social Media Marketing</li>
                  <li>SEO & PPC Advertising</li>
                  <li>Website Design & Development</li>
                  <li>Political Campaign Management</li>
                  <li>Online Reputation Management</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">11+</span>
                    <span className="dm-card-stat-label">Service Verticals</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">50+</span>
                    <span className="dm-card-stat-label">Media Partners</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== OUR VALUES ============== */}
        <section style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Our Core Values</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>What <span className="orange-text">Drives Us</span> Forward</h2>
            <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem', lineHeight: 1.75, textAlignLast: 'center' }}>
              Our values aren't just words on a wall — they shape every strategy, every campaign, and every relationship we build with our clients.
            </p>
            <div className="value-grid">
              <div className="value-card fade-up stagger-1">
                <div className="value-icon">🔍</div>
                <h3>Transparency</h3>
                <p>Complete honesty in our communication, pricing, and reporting. You always know where your money is going and what results it's generating.</p>
              </div>
              <div className="value-card fade-up stagger-2">
                <div className="value-icon">⭐</div>
                <h3>Quality Service</h3>
                <p>Premium deliverables across every project. From strategy to execution, we hold ourselves to the highest standards of craftsmanship and care.</p>
              </div>
              <div className="value-card fade-up stagger-3">
                <div className="value-icon">💡</div>
                <h3>Creativity</h3>
                <p>Fresh ideas that stand out. Our creative team crafts campaigns that capture attention, drive engagement, and leave lasting impressions.</p>
              </div>
              <div className="value-card fade-up stagger-1">
                <div className="value-icon">📊</div>
                <h3>Measurable Results</h3>
                <p>Data-driven decisions and transparent reporting. We focus on KPIs that matter to your business — leads, sales, and revenue growth.</p>
              </div>
              <div className="value-card fade-up stagger-2">
                <div className="value-icon">🤝</div>
                <h3>Client-First Approach</h3>
                <p>Your goals are our goals. We become an extension of your team, fully invested in your success with dedicated account management.</p>
              </div>
              <div className="value-card fade-up stagger-3">
                <div className="value-icon">🚀</div>
                <h3>Innovation</h3>
                <p>Always learning, always improving. We adopt new tools, trends, and technologies to keep our clients ahead of the competition.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============== LEADERSHIP TEAM ============== */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Leadership Team</div>
            <h2 className="fade-up stagger-1">
              Meet the <span className="orange-text">Visionary</span> Behind the Brand
            </h2>

            <div className="leader-card fade-up" style={{ marginTop: "2.5rem" }}>
              <div className="leader-avatar-wrap">
                <img src="/Vansh.webp" alt="Vansh Mehra" />
              </div>
              <div>
                <div className="leader-name">Vansh Mehra</div>
                <div className="leader-role">🏆 Founder & Managing Director</div>
                <p className="leader-bio">
                  Vansh Mehra is a young and dynamic entrepreneur with extensive experience in digital marketing and political campaign
                  management. As the founder of Digisharks Communications, he has led the organization to become a recognized name in
                  digital marketing, public relations, and political campaign management across India. His vision combines innovation,
                  data-driven strategy, and a relentless focus on client success.
                </p>

                <div className="leader-credentials">
                  <span className="cred-tag">📰 BJP IT Convenor</span>
                  <span className="cred-tag">🎓 Uttarakhand Elections 2017</span>
                  <span className="cred-tag">🏆 Top 10 CEOs</span>
                  <span className="cred-tag">🚀 Top 10 Entrepreneurs</span>
                </div>

                <div style={{ marginTop: "1.4rem" }}>
                  <div className="section-label" style={{ marginBottom: ".75rem" }}>Political Campaign Experience</div>
                  <ul className="feature-list">
                    <li>BJP IT Convenor, Shamli District</li>
                    <li>Authorized Digital Partner for BJP Election Campaigns in Uttarakhand (2017)</li>
                    <li>Management of multiple political communication and voter outreach campaigns</li>
                  </ul>
                </div>

                <div style={{ marginTop: "1.4rem" }}>
                  <div className="section-label" style={{ marginBottom: ".75rem" }}>Media & Publishing Ventures</div>
                  <p className="text-muted" style={{ lineHeight: 1.8, fontSize: ".95rem", textAlign: 'justify', textAlignLast: 'left' }}>
                    Vansh Mehra is also the founder of <b>The Indian Alert</b>, an online news platform delivering news and updates related to:
                    Politics, Entertainment, Sports, Fashion, and Current Affairs.
                  </p>
                </div>

                <div style={{ marginTop: "1.4rem" }}>
                  <div className="section-label" style={{ marginBottom: ".75rem" }}>Social Impact & Philanthropy</div>
                  <p className="text-muted" style={{ lineHeight: 1.8, fontSize: ".95rem", textAlign: 'justify', textAlignLast: 'left' }}>
                    Apart from business leadership, Vansh Mehra actively participates in social welfare initiatives and is the Co-Founder of
                    Vivaan Welfare Foundation, contributing to various community welfare programs across India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== JOURNEY / TIMELINE ============== */}
        <section style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Our Journey</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>10+ Years of <span className="orange-text">Building & Growing</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem', lineHeight: 1.75, textAlignLast: 'center' }}>
              From a small New Delhi studio to a trusted national PR & digital marketing partner — the milestones that shaped us.
            </p>
            <div className="timeline">
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2017</span>
                <h3>🚀 The Foundation</h3>
                <p>Digisharks Communications was founded in New Delhi with a vision to bring data-driven digital PR and marketing to Indian brands.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2018</span>
                <h3>📰 First 50 Clients</h3>
                <p>Crossed 50 happy clients within our first year. Expanded our media network to 20+ top publications across India.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2019</span>
                <h3>🏆 Industry Recognition</h3>
                <p>Started building the team, formalized processes, and won our first major industry recognition for digital PR innovation.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2020</span>
                <h3>💻 Digital Transformation Wave</h3>
                <p>Pivoted strongly into full-stack digital marketing — SEO, PPC, SMO — helping brands survive and grow through the pandemic.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2021</span>
                <h3>🌟 Top 10 CEOs Award</h3>
                <p>Founder Vansh Mehra recognized among the Top 10 CEOs 2021–2022 for outstanding leadership in the digital marketing space.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2022</span>
                <h3>🚀 Dynamic Entrepreneur Feature</h3>
                <p>Featured in the Top 10 Dynamic Entrepreneurs list, validating our innovation-first approach to PR and digital growth.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2023</span>
                <h3>📈 500+ Campaigns Milestone</h3>
                <p>Reached the milestone of executing 500+ successful digital PR and marketing campaigns across multiple industries and geographies.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2024</span>
                <h3>💼 Top 10 PR Leaders in India</h3>
                <p>Featured in Top 10 PR Leaders in India for transforming the PR landscape through data-driven digital PR campaigns and measurable ROI.</p>
              </div>
              <div className="timeline-item fade-up">
                <div className="timeline-dot"></div>
                <span className="timeline-year">2026</span>
                <h3>🎯 The Next Chapter</h3>
                <p>Expanding services into AI-powered marketing, video PR, and influencer-led campaigns. The journey to becoming India's #1 PR partner continues.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============== BOOTH MANAGEMENT ============== */}
        <section className="pr-media">
          <div className="pr-grid">
            <div className="fade-up">
              <div className="section-label">Specialized Services</div>
              <h2>Booth Management <span className="orange-text">Services</span></h2>
              <p className="text-muted" style={{ marginTop: "1.25rem", lineHeight: 1.8, fontSize: '1rem', textAlign: 'justify', textAlignLast: 'left' }}>
                Digisharks Communications provides specialized booth-level election management services for political campaigns.
                Our booth management strategy combines grassroots voter engagement, data-driven targeting, and on-ground execution
                that delivers measurable impact where it matters most — at the booth.
              </p>
              <ul className="feature-list" style={{ marginTop: '1.5rem' }}>
                <li>Strategic voter outreach planning</li>
                <li>Innovative campaign execution</li>
                <li>Grassroots-level engagement</li>
                <li>Booth-level volunteer management</li>
                <li>Voter database management</li>
                <li>Targeted communication campaigns</li>
                <li>Vote-base expansion strategies</li>
                <li>Real-time ground reporting</li>
              </ul>
              <div style={{ marginTop: '2rem' }}>
                <a href="#" className="btn-primary">
                  Contact Us →
                </a>
              </div>
            </div>

            <div className="pr-highlight fade-up stagger-2">
              <h3>📊 Why Booth Management Matters</h3>
              <p>
                In Indian elections, every vote counts — and booth-level management is the difference between winning and losing.
                We help parties and candidates build robust, on-the-ground networks that mobilize voters effectively.
              </p>
              <div className="booth-stats-row">
                <div className="booth-stat-cell">
                  <div className="booth-stat-num">500+</div>
                  <div className="booth-stat-label">Booths Managed</div>
                </div>
                <div className="booth-stat-cell">
                  <div className="booth-stat-num">95%</div>
                  <div className="booth-stat-label">Voter Turnout Boost</div>
                </div>
                <div className="booth-stat-cell">
                  <div className="booth-stat-num">50+</div>
                  <div className="booth-stat-label">Campaigns Won</div>
                </div>
                <div className="booth-stat-cell">
                  <div className="booth-stat-num">1M+</div>
                  <div className="booth-stat-label">Voters Reached</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== ACHIEVEMENTS / METRICS ============== */}
        <section>
          <div className="container">
            <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>By The Numbers</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>Our Achievements in <span className="orange-text">Numbers</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem', lineHeight: 1.75, textAlignLast: 'center' }}>
              Real numbers that reflect the trust our clients place in us and the consistent results we deliver across every campaign.
            </p>
            <div className="achievement-grid" style={{ marginTop: "2.75rem" }}>
              <div className="ach-card fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">😊</div>
                <span className="ach-num">4000+</span>
                <span className="ach-label">Satisfied Customers</span>
                <p className="ach-desc">High-quality brand promotion that builds long-term confidence and trust.</p>
              </div>
              <div className="ach-card fade-up stagger-2" style={{ "--card-accent": "#3B82F6", "--card-accent-bg": "rgba(59,130,246,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">📊</div>
                <span className="ach-num">120+</span>
                <span className="ach-label">Completed Projects</span>
                <p className="ach-desc">From strategy to execution — delivering measurable growth across multiple industries.</p>
              </div>
              <div className="ach-card fade-up stagger-3" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">🚀</div>
                <span className="ach-num">50+</span>
                <span className="ach-label">Live Projects</span>
                <p className="ach-desc">Ongoing campaigns that keep your brand visible and relevant in a fast-changing market.</p>
              </div>
              <div className="ach-card fade-up stagger-4" style={{ "--card-accent": "#8B5CF6", "--card-accent-bg": "rgba(139,92,246,0.08)" } as React.CSSProperties}>
                <div className="ach-icon">💎</div>
                <span className="ach-num">98%</span>
                <span className="ach-label">Client Satisfaction</span>
                <p className="ach-desc">Consistent results that earn trust and lasting partnerships with every client.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============== DATA-DRIVEN MARKETING / GROWTH / CLIENTS ============== */}
        <section className="testimonials-bg">
          <div className="container">
            <div className="section-label fade-up">Why Choose Us</div>
            <h2 className="fade-up stagger-1">
              Three Pillars of <span className="orange-text">Our Approach</span>
            </h2>
            <div className="dm-grid" style={{ marginTop: "2.75rem" }}>
              <div className="dm-card dm-card-enhanced fade-up stagger-1" style={{ "--card-accent": "#14B8A6", "--card-accent-bg": "rgba(20,184,166,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">📊</div>
                  <h3>Data-Driven Marketing</h3>
                </div>
                <p>
                  We help businesses understand their audience through demographic analysis, customer insights, and market research.
                  This data-driven approach helps brands optimize marketing budgets and focus on audiences most likely to convert.
                </p>
                <ul className="feature-list">
                  <li>Customer age groups analysis</li>
                  <li>Geographic location targeting</li>
                  <li>Gender segment insights</li>
                  <li>Income category mapping</li>
                  <li>Professional background data</li>
                  <li>Consumer interest & behavior</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">6+</span>
                    <span className="dm-card-stat-label">Data Dimensions</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">100%</span>
                    <span className="dm-card-stat-label">Audience Match</span>
                  </div>
                </div>
              </div>

              <div className="dm-card dm-card-enhanced fade-up stagger-2" style={{ "--card-accent": "#10B981", "--card-accent-bg": "rgba(16,185,129,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">🏆</div>
                  <h3>Start Your Growth Journey</h3>
                </div>
                <p>
                  Digisharks Communications is recognized for high-quality brand promotion and strategic communication services.
                  We help businesses improve visibility, increase engagement, and achieve sustainable growth through
                  data-backed digital marketing strategies.
                </p>
                <div className="benefit-grid">
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Proven Results</h4>
                      <p>500+ successful campaigns</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Expert Team</h4>
                      <p>25+ specialists</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Custom Strategy</h4>
                      <p>Tailored to your goals</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Transparent Reporting</h4>
                      <p>Live dashboards</p>
                    </div>
                  </div>
                </div>
                <a href="#" className="btn-primary" style={{ marginTop: "1.5rem", width: '100%', justifyContent: 'center' }}>
                  Get Started →
                </a>
              </div>

              <div className="dm-card dm-card-enhanced fade-up stagger-3" style={{ "--card-accent": "#EC4899", "--card-accent-bg": "rgba(236,72,153,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">🧑‍💼</div>
                  <h3>Featured Clients</h3>
                </div>
                <p style={{ marginBottom: '1rem' }}>
                  We are proud to have partnered with leading brands across multiple industries — building long-term relationships based on trust and results.
                </p>
                <ul className="feature-list">
                  <li>🌿 Patanjali</li>
                  <li>💊 Ascleplus</li>
                  <li>🔮 Shivanshi Tarot Card Reader</li>
                  <li>📺 PTC Punjab Network</li>
                  <li>💪 Fitlivs</li>
                  <li>🎓 EdTech Ventures</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">6+</span>
                    <span className="dm-card-stat-label">Brand Partners</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">98%</span>
                    <span className="dm-card-stat-label">Retention Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== FAQ ============== */}
        <section>
          <div className="container">
            <div className="section-label fade-up" style={{ justifyContent: 'center', display: 'flex' }}>Frequently Asked Questions</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>About <span className="orange-text">Working With Us</span></h2>
            <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.05rem', lineHeight: 1.75, textAlignLast: 'center' }}>
              Quick answers to the most common questions about partnering with Digisharks Communications.
            </p>
            <div className="faq-list" style={{ maxWidth: '900px', margin: '2.5rem auto 0' }}>
              <div className="faq-item fade-up">
                <div className="faq-q"><span className="faq-q-icon">Q</span>When was Digisharks Communications founded?</div>
                <div className="faq-a">Digisharks Communications was founded in 2017 in New Delhi. Since then, we have grown to serve 4000+ customers across India with 500+ successful digital PR and marketing campaigns.</div>
              </div>
              <div className="faq-item fade-up">
                <div className="faq-q"><span className="faq-q-icon">Q</span>Who is the founder of Digisharks Communications?</div>
                <div className="faq-a">Vansh Mehra is the Founder & Managing Director of Digisharks Communications. He has been recognized among India's Top 10 CEOs and Top 10 Dynamic Entrepreneurs for his work in digital marketing and political campaign management.</div>
              </div>
              <div className="faq-item fade-up">
                <div className="faq-q"><span className="faq-q-icon">Q</span>What industries do you serve?</div>
                <div className="faq-a">We work across 12+ industries including E-Commerce, Healthcare, Finance, Real Estate, Education, F&B, Fashion, Beauty, Technology, Automotive, Entertainment, and Manufacturing. Our strategies are tailored to each industry's unique dynamics and audience behavior.</div>
              </div>
              <div className="faq-item fade-up">
                <div className="faq-q"><span className="faq-q-icon">Q</span>Do you offer political campaign management?</div>
                <div className="faq-a">Yes, we have extensive experience managing political campaigns, including booth-level management, voter outreach, digital communication, and IT cell operations. We've supported multiple state and national election campaigns with measurable on-ground impact.</div>
              </div>
              <div className="faq-item fade-up">
                <div className="faq-q"><span className="faq-q-icon">Q</span>How can I get in touch with your team?</div>
                <div className="faq-a">You can reach us via phone at +91 96273 32332, email at marketing@digisharkscommunications.com, or visit our office at B-2, C-87, C Block, Sector 63, Noida, UP 201301. We also offer free consultation calls — just book through our website.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== CONTACT INFO ============== */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Get In Touch</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: 'center' }}>
              About <span className="orange-text">Digisharks Communications</span>
            </h2>
            <p className="fade-up stagger-2 text-muted" style={{ textAlign: 'center', maxWidth: '780px', margin: '1rem auto 0', fontSize: '1.05rem', lineHeight: 1.75, textAlignLast: 'center' }}>
              Established in 2017, Digisharks Communications has emerged as a trusted partner for businesses seeking innovative digital
              marketing, media management, and public relations solutions. The company continues to help brands build stronger visibility,
              improve customer engagement, and achieve measurable growth through strategic marketing initiatives.
            </p>

            <div className="contact-grid" style={{ marginTop: '3rem' }}>
              <div className="contact-info-card fade-up">
                <h3>📍 Contact Information</h3>
                <div className="contact-info-item">
                  <div className="contact-info-icon">🏢</div>
                  <div>
                    <div className="contact-info-label">Office Address</div>
                    <div className="contact-info-value">B-2, C-87, C Block, Sector 63, Noida, Uttar Pradesh 201301</div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">📞</div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value"><a href="tel:+919627332332">+91 96273 32332</a></div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">✉️</div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value"><a href="mailto:marketing@digisharkscommunications.com">marketing@digisharkscommunications.com</a></div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">🕒</div>
                  <div>
                    <div className="contact-info-label">Business Hours</div>
                    <div className="contact-info-value">Mon–Sat: 10:00 AM – 7:00 PM IST</div>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a href="#" className="btn-primary">Contact Us →</a>
                  <a href="#" className="btn-outline">Free Consultation</a>
                </div>
              </div>

              <div className="contact-form fade-up stagger-2">
                <h3>📝 Send Us a Message</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" placeholder="you@company.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group">
                    <label>Service Interested In</label>
                    <select>
                      <option>Digital PR</option>
                      <option>SEO Services</option>
                      <option>Social Media Marketing</option>
                      <option>PPC Advertising</option>
                      <option>Political Campaign</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea placeholder="Tell us about your brand and goals..."></textarea>
                </div>
                <a href="#" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Send Message →</a>
              </div>
            </div>

            <div className="dm-grid" style={{ marginTop: "2.5rem" }}>
              <div className="dm-card dm-card-enhanced fade-up stagger-1" style={{ "--card-accent": "#FF5B2E", "--card-accent-bg": "rgba(255,91,46,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">📍</div>
                  <h3>Visit Our Office</h3>
                </div>
                <p>
                  Located in the heart of Noida's business district, our office is easily accessible from Delhi and surrounding NCR areas.
                  Walk-ins are welcome during business hours — schedule a meeting and let's discuss your growth.
                </p>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">Mon–Sat</span>
                    <span className="dm-card-stat-label">Business Days</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">10am–7pm</span>
                    <span className="dm-card-stat-label">Working Hours</span>
                  </div>
                </div>
              </div>

              <div className="dm-card dm-card-enhanced fade-up stagger-2" style={{ "--card-accent": "#6366F1", "--card-accent-bg": "rgba(99,102,241,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">✉️</div>
                  <h3>Quick Actions</h3>
                </div>
                <p>
                  Looking to get started quickly? Choose the option that works best for you — call, email, or book a free consultation.
                  Our team responds within 2 business hours to all inquiries.
                </p>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <a href="tel:+919627332332" className="cred-tag" style={{ textDecoration: 'none' }}>📞 Call Now</a>
                  <a href="mailto:marketing@digisharkscommunications.com" className="cred-tag" style={{ textDecoration: 'none' }}>✉️ Email</a>
                  <a href="#" className="cred-tag" style={{ textDecoration: 'none' }}>📅 Book Call</a>
                </div>
              </div>

              <div className="dm-card dm-card-enhanced fade-up stagger-3" style={{ "--card-accent": "#0EA5E9", "--card-accent-bg": "rgba(14,165,233,0.08)" } as React.CSSProperties}>
                <div className="dm-card-header">
                  <div className="dm-card-icon">📣</div>
                  <h3>What You Can Expect</h3>
                </div>
                <ul className="feature-list">
                  <li>100% Transparency</li>
                  <li>Premium Quality Service</li>
                  <li>Creative Campaign Ideas</li>
                  <li>Measurable Business Results</li>
                  <li>Strategic Communication</li>
                  <li>Dedicated Account Manager</li>
                </ul>
                <div className="dm-card-stats">
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">2hr</span>
                    <span className="dm-card-stat-label">Response Time</span>
                  </div>
                  <div className="dm-card-stat">
                    <span className="dm-card-stat-num">98%</span>
                    <span className="dm-card-stat-label">Client Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== FINAL CTA ============== */}
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <div className="cta-eyebrow">💼 Let's Start a Conversation</div>
            <h2>Ready to <span className="orange-text">Grow With Us</span>?</h2>
            <p>Whether you're a startup looking to launch, a growing brand aiming to scale, or an established company seeking fresh digital momentum — we have the expertise, team, and proven strategies to make it happen.</p>
            <div className="cta-features">
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Free 30-min Strategy Call</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Custom Growth Roadmap</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>No Long-term Contracts</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Dedicated Account Manager</div>
              <div className="cta-feature"><span className="cta-feature-icon">✓</span>Transparent Monthly Reports</div>
            </div>
            <div className="cta-actions">
              <a href="#" className="btn-primary">Get Started Today →</a>
              <a href="#" className="btn-outline">📞 +91 96273 32332</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

               
