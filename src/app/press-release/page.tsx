export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";

const siteUrl = "https://digisharks-communications.vercel.app/press-release/";

export const metadata: Metadata = {
  metadataBase: new URL("https://digisharks-communications.vercel.app/"),
  title: "Press Release & Digital PR Agency | Digisharks Communications",
  description:
    "One of India's most trusted PR agencies. Strategic press release distribution, media relations, and digital PR services that build brand authority and visibility.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    type: "website",
    title: "Press Release & Digital PR | Digisharks Communications",
    description:
      "Strategic press release distribution, media relations, and digital PR services for ambitious brands.",
  },
};

export default function PressReleasePage() {
  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="content">
        {/* HERO */}
        <section className="hero centered compact">
          <div className="hero-inner">
            <div className="hero-eyebrow fade-up">✦ One of India's Most Trusted PR Agencies</div>
            <h1 className="fade-up stagger-1">
              Digital PR & <span className="gradient-text">Press Release</span> Services
            </h1>
            <p className="fade-up stagger-2">
              Build a powerful digital presence through strategic media house partnerships. We craft compelling brand stories, distribute them across India's leading publications, and amplify your message to the audiences that matter most.
            </p>
            <div className="hero-ctas fade-up stagger-3">
              <a href="/contact-us/" className="btn-primary">Apply for PR →</a>
              <a href="/services-top-pr-digital-marketing/" className="btn-outline">View Pricing</a>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE DIGITAL PR */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Why Digital PR?</div>
            <h2 className="fade-up stagger-1">Earned Media That <span className="gradient-text">Builds Authority</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Digital PR blends the credibility of traditional public relations with the measurability of online marketing — generating brand awareness, stronger search visibility, and lasting reputation.
            </p>

            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🌐</div>
                <h3>Online Presence</h3>
                <p>Strategic content placement across high-authority publications to put your brand in front of millions of targeted readers every month.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🛡️</div>
                <h3>Reputation Management</h3>
                <p>Build and protect your brand narrative. We monitor mentions, address concerns, and amplify positive stories that shape public perception.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">📰</div>
                <h3>Media Relations</h3>
                <p>Direct access to journalists, media houses, bloggers, influencers, news platforms, and industry publications across India and beyond.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY DIGISHARKS */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why Digisharks Communications?</div>
            <h2 className="fade-up stagger-1">Outcomes That <span className="gradient-text">Move the Needle</span></h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📈</div>
                <h3>Increased Brand Awareness</h3>
                <p>Get featured on the publications your audience already trusts — and the ones they're about to discover.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🔍</div>
                <h3>Strong Media Visibility</h3>
                <p>Premium placements across online and offline media outlets that put your brand on the map — literally.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">💬</div>
                <h3>High Audience Engagement</h3>
                <p>Stories crafted for the right audience at the right moment — driving shares, comments, and meaningful conversations.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">📝</div>
                <h3>Quality Content Distribution</h3>
                <p>Editorial-grade content that journalists love to publish and readers love to consume.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">🌍</div>
                <h3>Greater Reach</h3>
                <p>Tap into a curated network of national, regional, and niche media outlets spanning every industry.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">⭐</div>
                <h3>Enhanced Brand Credibility</h3>
                <p>Earned media coverage lends third-party validation that paid ads simply cannot match.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEDIA PARTNERS */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Our Media Network</div>
            <h2 className="fade-up stagger-1">Featured on <span className="gradient-text">India's Top Publications</span></h2>
            <p className="fade-up stagger-2" style={{ color: "var(--muted)", maxWidth: "720px", marginTop: "0.75rem" }}>
              Your story deserves to be told on the platforms that move industries. Our media partners include some of the most respected names in journalism.
            </p>
            <div className="media-partners" style={{ marginTop: "2.5rem" }}>
              <div className="mp">Forbes India</div>
              <div className="mp">Yahoo News</div>
              <div className="mp">Dailyhunt</div>
              <div className="mp">DD News</div>
              <div className="mp">Times of India</div>
              <div className="mp">Mid-Day</div>
              <div className="mp">News18</div>
              <div className="mp">Hindustan Times</div>
              <div className="mp">LiveMint</div>
            </div>
          </div>
        </section>

        {/* FIVE REASONS */}
        <section>
          <div className="container">
            <div className="section-label fade-up">Why It Works</div>
            <h2 className="fade-up stagger-1">Five Reasons to <span className="gradient-text">Use Digital PR</span></h2>
            <div className="reasons-list">
              <div className="reason-card fade-up stagger-1">
                <span className="r-num">01</span>
                <h4>Increased Online Visibility</h4>
                <p>Get discovered by search engines and real readers on trusted platforms.</p>
              </div>
              <div className="reason-card fade-up stagger-2">
                <span className="r-num">02</span>
                <h4>Enhanced Brand Reputation</h4>
                <p>Position yourself as a thought leader in your industry.</p>
              </div>
              <div className="reason-card fade-up stagger-3">
                <span className="r-num">03</span>
                <h4>Improved SEO Performance</h4>
                <p>High-quality backlinks, media mentions, and domain authority boosts.</p>
              </div>
              <div className="reason-card fade-up stagger-4">
                <span className="r-num">04</span>
                <h4>Greater Audience Engagement</h4>
                <p>Reach readers who actually care about your story.</p>
              </div>
              <div className="reason-card fade-up stagger-5">
                <span className="r-num">05</span>
                <h4>Effective Crisis Management</h4>
                <p>Protect your brand with proactive communication strategies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS OF PRESS RELEASES */}
        <section className="pr-media">
          <div className="container">
            <div className="section-label fade-up">Why Press Releases Matter</div>
            <h2 className="fade-up stagger-1">Tangible <span className="gradient-text">Benefits of Press Releases</span></h2>
            <div className="benefits-grid">
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">👁️</div>
                <h3>Brand Visibility</h3>
                <p>Amplify brand presence across India and global media outlets.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">📰</div>
                <h3>Media Coverage</h3>
                <p>Get featured in leading newspapers, magazines, and online platforms.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🛡️</div>
                <h3>Online Reputation</h3>
                <p>Shape public perception with strategic, positive brand storytelling.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🔍</div>
                <h3>SEO Benefits</h3>
                <p>Earn powerful backlinks that boost your search rankings.</p>
              </div>
              <div className="benefit-card fade-up stagger-2">
                <div className="b-icon">📊</div>
                <h3>Lead Generation</h3>
                <p>Convert media exposure into qualified business leads.</p>
              </div>
              <div className="benefit-card fade-up stagger-3">
                <div className="b-icon">🏆</div>
                <h3>Industry Recognition</h3>
                <p>Build authority and credibility within your industry.</p>
              </div>
              <div className="benefit-card fade-up stagger-1">
                <div className="b-icon">🚨</div>
                <h3>Crisis Communication</h3>
                <p>Address issues quickly with controlled, strategic messaging.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="final-cta">
          <div className="cta-box fade-up container">
            <h2>Start <span className="gradient-text">Growing Your Brand</span> Today</h2>
            <p>
              Our demographic analysis approach is used by Digisharks Communications to help you understand the characteristics of the people who buy your products and services. By leads, you can see who buys your products and services — also you can see who your brand appeals to the most by age, location, gender, job title, income, and hundreds of other variables.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center", marginBottom: 0 }}>
              <a href="/contact-us/" className="btn-primary">Apply for PR →</a>
              <a href="/services-top-pr-digital-marketing/" className="btn-outline">View Pricing</a>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <FloatingContact />
    </>
  );
}
