import Link from "next/link";
export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-logo">
            Digishark
          </Link>
          <p className="footer-tagline">
            Top Digital PR and Digital Marketing Agency.
          </p>
          <p className="footer-tagline" style={{ marginTop: "0.5rem" }}>
            Digisharks Communications is one of the pioneer and creative digital marketing agencies established in the year 2017 in New Delhi. Through our innovative digital solutions, in a short period we had built a strong clientele.
          </p>
          <div className="social-icons">
            <a href="https://www.facebook.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">f</a>
            <a href="https://www.instagram.com/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">◉</a>
            <a href="https://www.linkedin.com/company/digisharks" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">in</a>
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
            <li><Link href="/press-release/">Digital PR & Press Release</Link></li>
            <li><Link href="/digital-marketing-agency/">SEO & Google Ads</Link></li>
            <li><Link href="/social-media/">Social Media Marketing</Link></li>
            <li><Link href="/web-development/">Web Development</Link></li>
            <li><Link href="/brand-promotion/">Brand Promotion</Link></li>
            <li><Link href="/services-top-pr-digital-marketing/">Event Management</Link></li>
          </ul>
        </div>
        <div className="footer-col footer-contact">
          <h4>Contact Info</h4>
          <ul>
            <li>
              B-2, C-87, C Block, Sector 63
              <br />
              Noida, Uttar Pradesh 201301
            </li>
            <li style={{ marginTop: ".5rem" }}>
              <a href="tel:+919627332332" style={{ color: "var(--cyan)", textDecoration: "none" }}>
                +91 96273 32332
              </a>
            </li>
            <li style={{ marginTop: ".25rem" }}>
              <a
                href="mailto:info@digisharkscommunications.com"
                style={{ color: "var(--cyan)", textDecoration: "none", fontSize: ".82rem" }}
              >
                info@digisharkscommunications.com
              </a>
            </li>
            <li style={{ marginTop: ".5rem" }}>Mon–Sat: 10:00 AM – 7:00 PM IST</li>
          </ul>
        </div>

      </div>
      <div className="footer-bottom">
        <p>© 2025 Digisharks Communications. All rights reserved.</p>
        <ul className="footer-bottom-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms & Conditions</a></li>
          <li><a href="#">Refund Policy</a></li>
        </ul>
      </div>
    </footer>
  );
}