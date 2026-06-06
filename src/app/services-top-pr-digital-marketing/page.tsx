export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";

const siteUrl = "https://digisharks-communications.vercel.app/services-top-pr-digital-marketing/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Services & Pricing | Top PR & Digital Marketing Agency | Digisharks",
  description:
    "Transparent pricing for Press Release, Web Design, Online Marketing, Events Management, Brand Promotions & Social Media Marketing. Top PR and digital marketing services from Digisharks Communications.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    type: "website",
    title: "Services & Pricing | Digisharks Communications",
    description:
      "Transparent pricing for Press Release, Web Design, Online Marketing, Events Management, Brand Promotions & Social Media Marketing from Digisharks Communications.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services & Pricing | Digisharks Communications",
    description:
      "Top Digital PR and Digital Marketing Agency with transparent pricing.",
  },
};

export default function ServicesPricingPage() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO SECTION */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">✦ Top PR Agency in India</div>
            <h1 className="fade-up stagger-1">
              Our <span className="gradient-text">Services & Pricing</span>
            </h1>
            <p className="fade-up stagger-2">
              Digisharks Communications provides top PR and digital marketing services. We firmly believe in transparency and high-quality standards through contemporary and creative Digital Press Release and digital marketing tactics. We offer a wide range of digital marketing and conventional marketing services including social media services, SEO, Website Design, Political Campaigns, Digital PR, Corporate Events, Road Shows, Award Shows, and Pricing.
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href="/contact-us/" className="btn-primary">Get Free Consultation →</a>
              <a href="#pricing" className="btn-outline">View Pricing</a>
            </div>
          </div>
        </section>

        {/* PRICING CARDS SECTION */}
        <section id="pricing" style={{ paddingTop: "2rem" }}>
          <div className="container">
            <div className="section-label fade-up">Transparent Pricing</div>
            <h2 className="fade-up stagger-1">Choose the Right <span className="gradient-text">Growth Package</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Pick a service that aligns with your brand goals. Every plan is built for measurable outcomes, transparent deliverables, and dedicated support.
            </p>

            <div className="pricing-grid">
              {/* CARD 1 — Press Release */}
              <div className="pricing-card featured fade-up stagger-1">
                <span className="pc-label">Most Popular</span>
                <h3>Press Release</h3>
                <p className="pc-desc">We have tie-up with leading media houses for exclusive coverage for highly engaging contents to target various segments and assure more visibility through our PR services.</p>
                <ul className="pc-features">
                  <li>2 Press Releases – includes Press Release Proof Reading</li>
                  <li>Up to 800 Words – 2 PRs</li>
                  <li>Reaches 500+ industry-specific Indian reporters</li>
                  <li>Coverage from 80+ websites assured</li>
                  <li>Distribution across leading media houses</li>
                </ul>
                <div className="pc-price">
                  <span className="currency">INR</span>
                  <span className="amount">Rs 8,500</span>
                </div>
                <p className="pc-note">One-time fee | For Indian Clients</p>
                <div className="pc-cta">
                  <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                </div>
              </div>

              {/* CARD 2 — Web Design */}
              <div className="pricing-card fade-up stagger-2">
                <h3>Web Design</h3>
                <p className="pc-desc">At Digisharks Communication we have dedicated teams to build customised websites with attractive design, layout, and content.</p>
                <ul className="pc-features">
                  <li>10 Pages with WordPress CMS</li>
                  <li>Mobile Responsive Layout</li>
                  <li>Image Slider, Gallery & Contact Form</li>
                  <li>Newsletter Subscription & Google Map</li>
                  <li>SEO Friendly + Social Media Integration</li>
                  <li>2 Design Concepts + Unlimited Revisions</li>
                  <li>FREE Search Engine Submission</li>
                </ul>
                <div className="pc-price">
                  <span className="currency">INR</span>
                  <span className="amount">Rs 10,500</span>
                  <span className="period">/ website</span>
                </div>
                <div className="pc-cta">
                  <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                </div>
              </div>

              {/* CARD 3 — Online Marketing */}
              <div className="pricing-card fade-up stagger-3">
                <h3>Online Marketing</h3>
                <p className="pc-desc">Our Digital marketing is built across three main pillars — focused targets, affordable budget, and high potential returns. On-page & Off-page SEO for your website.</p>
                <ul className="pc-features">
                  <li>Extensive keyword research</li>
                  <li>Site Link Building</li>
                  <li>Natural listings on Google, Bing</li>
                  <li>Article Submission to News & PR sites</li>
                  <li>Local directories & industry authority listings</li>
                  <li>Blogs & Social Media Networks</li>
                  <li>Online & Social Media reputation monitoring</li>
                </ul>
                <div className="pc-price">
                  <span className="amount" style={{ fontSize: "1.6rem" }}>SEO for 5 Keywords</span>
                </div>
                <p className="pc-note">INR Rs 2,40,000 /-</p>
                <div className="pc-cta">
                  <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                </div>
              </div>

              {/* CARD 4 — Events Management */}
              <div className="pricing-card fade-up stagger-1">
                <h3>Events Management</h3>
                <p className="pc-desc">We believe in exceeding business through the most innovative way, to accelerate your business to the next level we deal in various events.</p>
                <ul className="pc-features">
                  <li>Celebrity Event Management</li>
                  <li>Home & Industry Event Management</li>
                  <li>New Year Party & Wedding Events</li>
                  <li>Live Concerts & Movie Promotions</li>
                  <li>Fashion Show & Modeling Agency Events</li>
                  <li>Bollywood & Advertising Agency Events</li>
                </ul>
                <div className="pc-price">
                  <span className="currency">INR</span>
                  <span className="amount">Rs 50,000</span>
                  <span className="period">/ day</span>
                </div>
                <div className="pc-cta">
                  <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                </div>
              </div>

              {/* CARD 5 — Brand Promotions */}
              <div className="pricing-card fade-up stagger-2">
                <h3>Brand Promotions</h3>
                <p className="pc-desc">Over the years we had helped many companies with strategic brand promotion. Our brand promotion campaign along with digital marketing strategies had empowered many clients.</p>
                <p style={{ color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.7, position: "relative", zIndex: 1 }}>
                  Backed by skillful experts, we are proficient in rendering Brand Promotion Services. These services are enormously appreciated in the market due to their timely completion. Our professionals render our offered service employing advanced techniques. Offered services are rendered in varied forms and terms that meet on customer's demand.
                </p>
                <div className="pc-price">
                  <span className="currency">INR</span>
                  <span className="amount">Rs 50,000</span>
                </div>
                <div className="pc-cta">
                  <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                </div>
              </div>

              {/* CARD 6 — Social Media Marketing */}
              <div className="pricing-card fade-up stagger-3">
                <span className="pc-label">SMO Plan</span>
                <h3>Social Media Marketing</h3>
                <p className="pc-desc">Digisharks Communication has successfully tapped online networks through its wide-ranging strategies. We promote business on social media.</p>
                <div className="pc-plan">
                  <div className="row"><span>No. of Sites/Business</span><span>1</span></div>
                  <div className="row"><span>Platform</span><span>Facebook + Instagram</span></div>
                  <div className="row"><span>Budget (monthly)</span><span>Up to Rs 1.5 Lac</span></div>
                  <div className="row"><span>No. of Campaigns</span><span>2–4</span></div>
                  <div className="row"><span>Max. Adsets</span><span>4–10</span></div>
                  <div className="row"><span>No. of Ads</span><span>2 Per Adset</span></div>
                  <div className="row"><span>Reports</span><span>Weekly</span></div>
                  <div className="row"><span>Support</span><span>Email</span></div>
                  <div className="row"><span>Monthly Fee</span><span>Contact Us</span></div>
                  <div className="row"><span>Quarterly</span><span className="save">Save 10%</span></div>
                </div>
                <div className="pc-price">
                  <span className="currency">INR</span>
                  <span className="amount">Rs 20,000</span>
                </div>
                <div className="pc-cta">
                  <a href="/contact-us/" className="btn-primary">Buy Now →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MID-PAGE BANNER */}
        <section style={{ paddingTop: "0", paddingBottom: "0" }}>
          <div className="mid-banner fade-up">
            <h2>
              Get <span className="gradient-text">Instant Growth Results</span> for Your Business
            </h2>
          </div>
        </section>

        {/* SERVICES OVERVIEW - 7 BLOCKS */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Our Capabilities</div>
            <h2 className="fade-up stagger-1">End-to-End <span className="gradient-text">Digital Services</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              From strategic PR to performance marketing, design to development — explore the full range of services we offer to help your brand grow with measurable results.
            </p>

            {/* BLOCK 1 — Press Release */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">📰</span>Press Release</h2>
              <p>We have tie-up with leading media houses for exclusive coverage for highly engaging contents to target various segments and assure more visibility through our PR services.</p>
              <div className="sub-label">Key Benefits</div>
              <ul className="svc-list">
                <li>Timeline Graphics</li>
                <li>Increase Brand Awareness</li>
                <li>High Engagement</li>
                <li>Quality Contents</li>
                <li>Increase Reach</li>
              </ul>
              <div className="sub-label">We are partnered with leading media houses for both online/offline news contents and press releases</div>
              <div className="media-partners">
                <div className="mp">Times of India</div>
                <div className="mp">Mid Day</div>
                <div className="mp">News 18</div>
                <div className="mp">Hindustan Times</div>
                <div className="mp">Live Mint</div>
                <div className="mp">Forbes India</div>
                <div className="mp">Yahoo News</div>
                <div className="mp">Daily Hunt</div>
                <div className="mp">DD News</div>
              </div>
            </div>

            {/* BLOCK 2 — Digital Marketing */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">📈</span>Digital Marketing</h2>
              <p>Our Digital Marketing is built across three main pillars — focused targets, affordable budget, and high potential returns. We assure strategies with higher conversion rate and more traffic through versatile tools.</p>
              <div className="sub-label">Tools & Services</div>
              <ul className="svc-list">
                <li>Search Engine Optimization (SEO)</li>
                <li>Search Engine Marketing (SEM)</li>
                <li>Social Media Optimization (SMO)</li>
                <li>Pay-Per-Click (PPC)</li>
                <li>Content Marketing</li>
              </ul>
            </div>

            {/* BLOCK 3 — Social Media Marketing */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">💬</span>Social Media Marketing</h2>
              <p>Through the social media platform, we have been able to drive brands through connecting the right audience. Digisharks Communication has successfully tapped online networks through its wide-ranging strategies. We promote business among top platforms through live streaming, marketing posts, and more.</p>
              <div className="sub-label">Platforms We Cover</div>
              <ul className="svc-list">
                <li>Facebook</li>
                <li>Twitter (X)</li>
                <li>YouTube</li>
                <li>Instagram</li>
                <li>Pinterest and more</li>
              </ul>
            </div>

            {/* BLOCK 4 — Website Design and Graphics */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">🎨</span>Website Design and Graphics</h2>
              <p>Your impression of brands lies on your website. The website represents your brand and is an immediate reflection of it — very much critical to digital marketing. At Digisharks Communication we have dedicated teams to build customised websites with attractive design, layout, and content.</p>
              <ul className="svc-list">
                <li>Designing template and visual contents</li>
                <li>Content writing</li>
                <li>Custom animations and videos</li>
                <li>Creating custom interactions and functionality</li>
              </ul>
              <div className="sub-label">Graphic Design Services</div>
              <p style={{ fontStyle: "italic", color: "var(--text)", marginBottom: "1rem", fontSize: ".95rem" }}>
                Anything to everything — Graphic design is our art of making you stand out with top design and concept.
              </p>
              <ul className="svc-list">
                <li>Logo Design</li>
                <li>Banners Design</li>
                <li>Package Design</li>
                <li>Flyers, Brochure, Newsletter Design</li>
                <li>Typography, Icons, Business Cards</li>
              </ul>
            </div>

            {/* BLOCK 5 — Event Management */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">🎤</span>Event Management</h2>
              <p>We believe in exceeding business through the most innovative way, to accelerate your business to the next level, we deal in various events including:</p>
              <ul className="svc-list">
                <li>Corporate Events</li>
                <li>Seminars</li>
                <li>Conferences</li>
                <li>Tradeshows</li>
                <li>Workshops</li>
                <li>Theme Parties</li>
                <li>Virtual Events</li>
                <li>Fashion Shows</li>
                <li>Exhibitions</li>
              </ul>
            </div>

            {/* BLOCK 6 — Brand Promotion */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">🚀</span>Brand Promotion</h2>
              <p>Over the years we had helped many companies with strategic brand promotion. Our brand promotion campaigns along with digital marketing strategies had empowered many clients.</p>
              <ul className="svc-list">
                <li>Establishing a brand through online/offline advertisement techniques</li>
                <li>Sales promotion strategies</li>
                <li>Media and graphic promotions</li>
                <li>360-Degree integrated marketing approach</li>
                <li>Publicity tactics</li>
                <li>Public events</li>
                <li>Sales surveys and more</li>
              </ul>
            </div>

            {/* BLOCK 7 — Motion Picture Marketing */}
            <div className="svc-block fade-up">
              <h2><span className="sb-icon">🎬</span>Motion Picture Marketing</h2>
              <p>Digisharks Communications has thrived in motion picture marketing with its magnificent competitor-oriented and realistic marketing approach. It shaped many brands through various marketing tools including:</p>
              <ul className="svc-list">
                <li>Short films</li>
                <li>Still Shoots</li>
                <li>Animated videos</li>
                <li>Publicity stunts</li>
                <li>Advertisement campaigns</li>
                <li>Merchandising</li>
                <li>Media Interviews</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CLOSING CTA SECTION */}
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <h2>Would You Like to <span className="gradient-text">Start?</span></h2>
            <p>
              Digisharks Communications is known for its high-quality brand promotions. Representing your brand communicates with the world. Our demographic approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. By leads, you can see who buys your products and services — also you can see who your brand appeals to the most by age, location, gender, job title, income, and hundreds of other variables. With the right PR agency by your side, growth becomes measurable and consistent.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href="/contact-us/" className="btn-primary">Apply for PR →</a>
              <a href="#" className="btn-outline">Talk to an Expert</a>
            </div>
          </div>
        </section>

        {/* FEATURED CLIENTS */}
        <section style={{ paddingTop: "2rem" }}>
          <div className="container">
            <div className="section-label fade-up" style={{ justifyContent: "center", display: "flex" }}>Our Featured Clients</div>
            <h2 className="fade-up stagger-1" style={{ textAlign: "center" }}>Brands That <span className="gradient-text">Trust Us</span></h2>
            <div className="clients-row">
              <div className="client-tile fade-up stagger-1">Fitlivs</div>
              <div className="client-tile fade-up stagger-2">PTC Punjab Network</div>
              <div className="client-tile fade-up stagger-3">Ascleplus</div>
              <div className="client-tile fade-up stagger-4">Shivanshi Tarot Card Reader</div>
              <div className="client-tile fade-up stagger-5">Patanjali</div>
            </div>
            <div className="social-icons" style={{ justifyContent: "center", marginTop: "2rem" }}>
              <a href="https://www.facebook.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">f</a>
              <a href="https://www.linkedin.com/company/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">in</a>
              <a href="https://www.instagram.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">◉</a>
            </div>
          </div>
        </section>

        {/* PAYMENT WIDGET SECTION */}
        <section>
          <div className="container">
            <div className="payment-widget fade-up">
              <h2>Let&apos;s Complete Your <span className="gradient-text">Payment</span></h2>
              <p className="pw-note">Fields marked with * are required.</p>
              <form className="pw-form" action="/contact-us/" method="get">
                <div className="field">
                  <label htmlFor="pay-name">Name *</label>
                  <input type="text" id="pay-name" name="name" placeholder="Your full name" required />
                </div>
                <div className="field">
                  <label htmlFor="pay-phone">Phone *</label>
                  <input type="tel" id="pay-phone" name="phone" placeholder="+91 99999 99999" required />
                </div>
                <div className="field full">
                  <label htmlFor="pay-email">Email *</label>
                  <input type="email" id="pay-email" name="email" placeholder="you@company.com" required />
                </div>
                <div className="field full">
                  <label htmlFor="pay-amount">Amount</label>
                  <input type="text" id="pay-amount" name="amount" placeholder="INR Rs" />
                </div>
              </form>
              <div className="pw-cta">
                <a href="/contact-us/" className="btn-primary">Proceed to Payment →</a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <FloatingContact />
    </>
  );
}
