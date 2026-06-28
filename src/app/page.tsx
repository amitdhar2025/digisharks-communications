export const dynamic = "force-dynamic";
import MediaCarousel from "@/components/MediaCarousel";
import PortfolioSection from "@/components/PortfolioSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import SeoAuditWidget from "@/components/SeoAuditWidget";
import "./home.css";
import "./multi-color.css";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  return (
    <>
      <div className="content">

        {/* ===== HERO SECTION ===== */}
        <section className="hero-section">
          <div className="hero-inner">
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="section-label-orange fade-up">
                  <span className="label-dot"></span>
                  AI-Powered Digital Growth
                </div>
                <h1 className="fade-up stagger-1">
                  <span className="orange-text">AI-Driven</span>
                  <br />for Your Digital Brand
                </h1>
                <p className="fade-up stagger-2">
                  Digisharks Communications is a next-gen digital PR, marketing, and AI-powered web development agency. We fuse data, design, and AI to help brands achieve measurable growth, top-tier media presence, and 10x ROI across 50+ publications.
                </p>
                <div className="hero-ctas fade-up stagger-3">
                  <a href="#" className="btn-primary">Get Free Consultation →</a>
                  <a href="#" className="btn-secondary">Our Services</a>
                </div>
              </div>
              <div className="seo-audit-promo-section">
                <SeoAuditWidget />
              </div>
            </div>
            <div className="stats-row fade-up stagger-4">
              <div className="stat-item">
                <span className="stat-num" data-target="500" data-suffix="+">500+</span>
                <span className="stat-label">Projects Delivered</span>
              </div>
              <div className="stat-item">
                <span className="stat-num" data-target="10" data-suffix="+">10+</span>
                <span className="stat-label">Years of Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-num" data-target="50" data-suffix="+">50+</span>
                <span className="stat-label">Media Partners</span>
              </div>
              <div className="stat-item">
                <span className="stat-num" data-target="98" data-suffix="%">98%</span>
                <span className="stat-label">Client Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FULL-WIDTH VIDEO ===== */}
        <div style={{position:"relative",left:"50%",right:"50%",marginLeft:"-50vw",marginRight:"-50vw",width:"100vw",lineHeight:0,overflow:"hidden"}}>
          <video autoPlay muted loop playsInline disablePictureInPicture style={{width:"100vw",display:"block",pointerEvents:"none"}}>
            <source src="/Video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* ===== BRAND LOGOS ===== */}
        <section className="brand-logos-section">
          <div className="brand-logos-inner">
            <h2 className="brand-cards-heading fade-up">Check Out <span className="orange-text-num">Our Work</span></h2>
            <div className="brand-carousel">
              <div className="brand-carousel-track-overflow">
                <div className="brand-carousel-track">
                  {[1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8].map((n, i) => (
                    <div className="brand-carousel-item" key={n + "-" + i}>
                      <img
                        src={"/one card (" + n + ").webp"}
                        alt={"Project " + n}
                        width="160"
                        height="94"
                        className="brand-carousel-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AI GROWTH METRICS ===== */}
        <section className="metrics-section-orange">
          <div className="container">
            <div className="metrics-header fade-up">
              <div className="section-label-orange centered-label">
                <span className="label-dot"></span>
                AI-Powered Insights
              </div>
              <h2 style={{textAlign:"center",marginBottom:"0.75rem"}}>Real-Time <span className="orange-text">AI Growth Metrics</span></h2>
              <p style={{textAlign:"center",maxWidth:"700px",margin:"0 auto",fontSize:"1.05rem",lineHeight:1.75,color:"var(--color-body)"}}>We track everything—visibility, engagement, conversions, AI-driven insights—and show you the numbers that matter in real time.</p>
            </div>
            <div className="metrics-grid-home">
              <div className="metric-card-orange fade-up stagger-1">
                <div className="metric-icon-orange">🤖</div>
                <div className="metric-big-num" data-target="10" data-suffix="x">10x</div>
                <div className="metric-name">AI-Optimised ROI</div>
                <p className="metric-desc">Our AI engine optimises campaigns in real time to deliver ten times the return on your marketing spend.</p>
              </div>
              <div className="metric-card-orange fade-up stagger-2">
                <div className="metric-icon-orange">📰</div>
                <div className="metric-big-num" data-target="500" data-suffix="+">500+</div>
                <div className="metric-name">Brand Stories Published</div>
                <p className="metric-desc">Media features across top-tier publications including Forbes, Inc42, YourStory, and 50+ outlets.</p>
              </div>
              <div className="metric-card-orange fade-up stagger-3">
                <div className="metric-icon-orange">🚀</div>
                <div className="metric-big-num" data-target="320" data-suffix="%">320%</div>
                <div className="metric-name">Average Traffic Growth</div>
                <p className="metric-desc">Websites we manage see a 320% average traffic uplift within the first 6 months of partnership.</p>
              </div>
              <div className="metric-card-orange fade-up stagger-4">
                <div className="metric-icon-orange">💎</div>
                <div className="metric-big-num" data-target="98" data-suffix="%">98%</div>
                <div className="metric-name">Client Retention Rate</div>
                <p className="metric-desc">Our clients stick with us because we consistently deliver measurable, compounding growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AWARDS ===== */}
        <section className="awards-section-light">
          <div className="container">
            <div className="metrics-header fade-up">
              <div className="section-label-orange centered-label">
                <span className="label-dot"></span>
                Awards and Recognition
              </div>
              <h2 style={{textAlign:"center",marginBottom:"0.75rem"}}>Awards That Recognise <span className="orange-text">Digital Excellence</span></h2>
              <p style={{textAlign:"center",maxWidth:"700px",margin:"0 auto",fontSize:"1.05rem",lineHeight:1.75,color:"var(--color-body)"}}>Our work has been recognised by the worlds most respected platforms — a testament to the results we deliver for our clients.</p>
            </div>
            <div className="awards-grid-home">
              <div className="award-card-light fade-up stagger-1">
                <div className="award-img-wrap">
                  <Image
                    src="/google partner.webp"
                    alt="Google Partner"
                    width={160}
                    height={80}
                    className="award-partner-img"
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  />
                </div>
                <h3 className="award-card-name">Google Partner</h3>
                <span className="award-card-subtitle">Premier 2026</span>
              </div>
              <div className="award-card-light fade-up stagger-2">
                <div className="award-img-wrap">
                  <Image
                    src="/meta partner.webp"
                    alt="Meta Business Partner"
                    width={160}
                    height={80}
                    className="award-partner-img"
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  />
                </div>
                <h3 className="award-card-name">Meta Business Partner</h3>
                <span className="award-card-subtitle">Certified 2025</span>
              </div>
              <div className="award-card-light fade-up stagger-3">
                <div className="award-img-wrap">
                  <Image
                    src="/clutch award.webp"
                    alt="Clutch Award"
                    width={160}
                    height={80}
                    className="award-partner-img"
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  />
                </div>
                <h3 className="award-card-name">Clutch Award</h3>
                <span className="award-card-subtitle">Top PPC Company 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SERVICES ===== */}
        <section className="services-section">
          <div className="container">
            <div className="services-layout">
              <div className="services-left">
                <div className="section-label-orange fade-up">
                  <span className="label-dot"></span>
                  Our Services
                </div>
                <h2 className="fade-up stagger-1">What We Do <span className="orange-text">Best</span></h2>
                <p className="services-subtitle fade-up stagger-2">From AI-powered digital PR to full-stack marketing, we deliver end-to-end brand growth solutions that combine creativity, technology, and data-driven insights.</p>
                <div className="services-items-grid fade-up stagger-3">
                  {[
                    {icon:"🤖",title:"AI-Driven Digital PR",desc:"Strategic media coverage across 50+ top publications in India."},
                    {icon:"📺",title:"Media Management",desc:"Brand visibility campaigns with high-impact media collaborations."},
                    {icon:"📈",title:"AI Digital Marketing",desc:"Full-stack campaigns from SEO to PPC with measurable ROI."},
                    {icon:"🎯",title:"Smart Lead Generation",desc:"High-intent pipelines powered by AI performance marketing."},
                    {icon:"✍️",title:"AI Content Strategy",desc:"SEO-optimized blogs, scripts, and brand narratives that convert."},
                    {icon:"🏆",title:"Political Campaign Mgmt",desc:"Strategic voter outreach with measurable on-ground impact."}
                  ].map((s,i)=>(
                    <div className="service-item" key={i}>
                      <div className="service-item-icon">{s.icon}</div>
                      <div className="service-item-text">
                        <h4>{s.title}</h4>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="services-right fade-up stagger-2">
                <div className="services-dashboard-card">
                  <div className="dash-top-bar">
                    <span className="dash-dot red"></span>
                    <span className="dash-dot yellow"></span>
                    <span className="dash-dot green"></span>
                  </div>
                  <div className="dash-content">
                    <div className="dash-header-bar">
                      <span className="dash-badge">AI Dashboard</span>
                      <span className="dash-live">● Live</span>
                    </div>
                    <div className="dash-metrics-row">
                      <div className="dash-metric-cell"><span className="dash-metric-value">2.4M</span><span className="dash-metric-label">Impressions</span></div>
                      <div className="dash-metric-cell"><span className="dash-metric-value">156K</span><span className="dash-metric-label">Clicks</span></div>
                      <div className="dash-metric-cell"><span className="dash-metric-value">8.2%</span><span className="dash-metric-label">Conv. Rate</span></div>
                    </div>
                    <div className="dash-chart-bars">
                      <span style={{height:"45%"}}></span><span style={{height:"65%"}}></span><span style={{height:"50%"}}></span><span style={{height:"80%"}}></span><span style={{height:"60%"}}></span><span style={{height:"90%"}}></span><span style={{height:"75%"}}></span>
                    </div>
                    <div className="dash-footer">AI + PR + Digital Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ===== WHY CHOOSE US ===== */}
        <section className="why-choose-section">
          <div className="container">
            <div className="why-choose-layout">
              <div className="why-choose-left fade-up">
                <div className="section-label-orange">
                  <span className="label-dot"></span>
                  Why Choose Us
                </div>
                <h2>We Deliver <span className="orange-text">Measurable Results</span></h2>
                <p className="why-choose-sub">10+ years of experience, 500+ successful campaigns, and a team dedicated to your brand growth.</p>
                <ul className="why-choose-list">
                  {["100% Transparency in Reporting and Pricing","AI-Powered Campaign Optimization","Dedicated Account Manager for Every Client","50+ Media House Partnerships Across India","Proven 10x ROI Track Record","Free AI Strategy Audit to Get You Started"].map((item,i)=>(
                    <li key={i}><span className="check-icon-orange">✓</span><span>{item}</span></li>
                  ))}
                </ul>
                <a href="#" className="btn-primary">Work With Us →</a>
              </div>
              <div className="why-choose-right fade-up stagger-1">
                <div className="why-icons-grid">
                  {[{icon:"🤖",label:"AI Strategy"},{icon:"📰",label:"Digital PR"},{icon:"📈",label:"SEO and PPC"},{icon:"📱",label:"Social Media"},{icon:"💻",label:"Web Dev"},{icon:"🏆",label:"Branding"}].map((item,i)=>(
                    <div className="why-icon-card" key={i}>
                      <span className="why-icon">{item.icon}</span>
                      <span className="why-icon-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="testimonials-section">
          <div className="container">
            <div className="section-label-orange centered-label fade-up">
              <span className="label-dot"></span>
              Client Testimonials
            </div>
            <h2 className="fade-up stagger-1" style={{textAlign:"center"}}>What Our <span className="orange-text">Clients Say</span></h2>
            <p className="testi-sub fade-up stagger-2">Real reviews from real clients. We measure our success by the growth and satisfaction of the brands we partner with.</p>
            <div className="testi-grid desktop-only fade-up stagger-3">
              {[
                {quote:"They have excellent media coverage capabilities and provide great exposure for brands. Truly one of the best in the business. Our visibility grew 4x in just 3 months.",initials:"YM",name:"Yassmin Mistry",role:"Founder, Verified Client",bg:"#FF5B2E"},
                {quote:"It was great working with Digisharks Communications. They provided valuable opportunities and helped enhance my knowledge. Highly recommended PR and Digital Marketing agency.",initials:"UK",name:"Uday Kumar",role:"CEO, Verified Client",bg:"#0F1628"},
                {quote:"Digisharks Communications is one of the best PR and digital marketing agencies in Delhi NCR. Their team is highly professional, experienced, and supportive throughout.",initials:"PP",name:"Preeti Packer",role:"Director, Verified Client",bg:"#6366F1"}
              ].map((t,i)=>(
                <div className="testi-card-light" key={i}>
                  <div className="testi-stars">★★★★★</div>
                  <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="testi-author">
                    <div className="testi-avatar" style={{background:t.bg}}>{t.initials}</div>
                    <div className="testi-author-info">
                      <div className="testi-author-name">{t.name}</div>
                      <div className="testi-author-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mobile-only"><TestimonialSlider /></div>
          </div>
        </section>

        {/* ===== MEDIA CAROUSEL + PORTFOLIO ===== */}
        <MediaCarousel />
        <PortfolioSection />

        {/* ===== FINAL CTA ===== */}
        <section className="cta-dark-section">
          <div className="container">
            <div className="cta-dark-box fade-up">
              <div className="cta-dark-badge">🚀 Let us Build Something Great</div>
              <h2>Start Your <span className="orange-text">AI Growth</span> Journey Today</h2>
              <p className="cta-dark-text">Your customers are online right now. Let us help you reach them with the right message, on the right platform, at the right moment. Do not let competitors take what is yours.</p>
              <div className="cta-dark-tags">
                {["Free Growth Audit","AI-Powered Insights","Dedicated Manager","Transparent Reporting"].map((tag,i)=>(
                  <span className="cta-dark-tag" key={i}><span className="cta-tag-icon">✓</span> {tag}</span>
                ))}
              </div>
              <a href="#" className="btn-primary btn-large">Get Free Consultation →</a>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="footer-dark">
          <div className="footer-top">
            <div>
              <Link href="/" className="footer-logo" aria-label="DigiSharks Home">
  <Image
    src="/darks.webp"
    alt="DigiSharks Logo"
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
                <li><a href="/services-top-pr-digital-marketing/">Services</a></li>
                <li><a href="/press-release/">Press Release</a></li>
                <li><a href="/digital-marketing-agency/">Digital Marketing</a></li>
                <li><a href="/contact-us">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="/press-release/">Digital PR</a></li>
                <li><a href="/digital-marketing-agency/">SEO and PPC</a></li>
                <li><a href="/social-media/">Social Media</a></li>
                <li><a href="/web-development/">Web Development</a></li>
                <li><a href="/brand-promotion/">Brand Promotion</a></li>
                <li><a href="/services-top-pr-digital-marketing/">Political Campaigns</a></li>
              </ul>
            </div>
            <div className="footer-col footer-contact">
              <h4>Contact Info</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, whiteSpace: 'normal' }}>
                  <span style={{ color: '#ff6b00', fontSize: 16, lineHeight: '20px', flexShrink: 0 }}>📍</span>
                  <span>B-2, C-87, C Block, Sector 63<br />Noida, Uttar Pradesh 201301</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#ff6b00', fontSize: 16, lineHeight: '20px', flexShrink: 0 }}>📞</span>
                  <a href="tel:+919627332332" style={{ color: 'inherit', textDecoration: 'none' }}>+91 96273 32332</a>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#ff6b00', fontSize: 16, lineHeight: '20px', flexShrink: 0 }}>✉️</span>
                  <a href="mailto:marketing@digisharkscommunications.com" style={{ color: 'inherit', textDecoration: 'none' }}>marketing@digisharkscommunications.com</a>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#ff6b00', fontSize: 16, lineHeight: '20px', flexShrink: 0 }}>🕒</span>
                  <span>Mon–Sat: 10:00 AM – 7:00 PM IST</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Digisharks Communications. All Rights Reserved. Made with 💙 in India.</p>
            <ul className="footer-bottom-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms and Conditions</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>
        </footer>

      </div>
    </>
  );
}
