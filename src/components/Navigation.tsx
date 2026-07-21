"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";

export type NavKey =
  | "home"
  | "about"
  | "services"
  | "press-release"
  | "digital-marketing"
  | "social-media"
  | "web-development"
  | "brand-promotion"
  | "registrations"
  | "contact"
  | "digital-products"
  | "career"
  | "none";

interface NavigationProps {
  active?: NavKey;
  showContactCta?: boolean;
}

interface MenuItem {
  _id: string;
  label: string;
  href: string;
  order: number;
  icon?: string;
}

// Default nav items as fallback
const DEFAULT_NAV_ITEMS: MenuItem[] = [
  { _id: "nav-home", label: "Home", href: "/", order: 0 },
  { _id: "nav-about", label: "About Us", href: "/about-us", order: 1 },
  { _id: "nav-services", label: "Services", href: "/services-top-pr-digital-marketing/", order: 2 },
  { _id: "nav-portfolio", label: "Portfolio", href: "/portfolio", order: 3 },
  { _id: "nav-blog", label: "Blog", href: "/blog", order: 4 },
  { _id: "nav-contact", label: "Contact", href: "/contact-us", order: 5 },
  { _id: "nav-digital-products", label: "Digital Products", href: "/digital-products/", order: 6 },
];

const DEFAULT_SERVICES_SUB: MenuItem[] = [
  { _id: "sub-pr", label: "Press Release", href: "/press-release/", order: 0 },
  { _id: "sub-dm", label: "Digital Marketing", href: "/digital-marketing-agency/", order: 1 },
  { _id: "sub-sm", label: "Social Media", href: "/social-media/", order: 2 },
  { _id: "sub-wd", label: "Web Development", href: "/web-development/", order: 3 },
  { _id: "sub-bp", label: "Brand Promotion", href: "/brand-promotion/", order: 4 },
];

import { KNOWN_PLATFORMS, getSvgPath } from '@/lib/social-icons'

interface SocialLink {
  platform: string
  label: string
  url: string
  iconSvg: string
  iconEmoji: string
}

export default function Navigation({ active = "none" }: NavigationProps) {
  const [navItems, setNavItems] = useState<MenuItem[]>([]);
  const [servicesSub, setServicesSub] = useState<MenuItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [headerLogo, setHeaderLogo] = useState('');
  const [headerLogoAlt, setHeaderLogoAlt] = useState('DigiSharks Logo');
  const [socialOpen, setSocialOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "/";

  const { items: cartItems, itemCount, subtotal, remove } = useCart();

  function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // ── Fetch nav items & social links from CMS (combined init endpoint) ───
  useEffect(() => {
    fetch("/api/public/init")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          // Use dynamic socialLinks if available, otherwise fall back to legacy fields
          // Use headerSocialLinks if available, otherwise fall back to top-level socialLinks
          const headerLinks = data.settings.headerSocialLinks;
          if (headerLinks && headerLinks.length > 0) {
            setSocialLinks(headerLinks);
          } else if (data.settings.socialLinks && data.settings.socialLinks.length > 0) {
            setSocialLinks(data.settings.socialLinks);
          } else {
            // Build from legacy individual fields
            const legacy: SocialLink[] = [];
            const legacyFields: [string, string][] = [
              ['facebook', data.settings.socialFacebook],
              ['twitter', data.settings.socialTwitter],
              ['instagram', data.settings.socialInstagram],
              ['linkedin', data.settings.socialLinkedin],
              ['youtube', data.settings.socialYoutube],
            ];
            for (const [platform, url] of legacyFields) {
              if (url) {
                const known = KNOWN_PLATFORMS.find((p) => p.platform === platform);
                legacy.push({
                  platform,
                  label: known?.label || platform,
                  url,
                  iconSvg: known?.iconSvg || '',
                  iconEmoji: known?.iconEmoji || '🔗',
                });
              }
            }
            setSocialLinks(legacy.length > 0 ? legacy : []);
          }
          if (data.settings.headerLogo) setHeaderLogo(data.settings.headerLogo);
          if (data.settings.headerLogoAlt) setHeaderLogoAlt(data.settings.headerLogoAlt);
        }

        if (data.mainNav && data.mainNav.length > 0) {
          setNavItems(data.mainNav);
        } else {
          setNavItems(DEFAULT_NAV_ITEMS);
        }

        if (data.servicesSub && data.servicesSub.length > 0) {
          setServicesSub(data.servicesSub);
        } else {
          setServicesSub(DEFAULT_SERVICES_SUB);
        }
      })
      .catch(() => {
        setNavItems(DEFAULT_NAV_ITEMS);
        setServicesSub(DEFAULT_SERVICES_SUB);
      })
  }, []);

  // Derive active state automatically from the current URL
  const matchedKey: NavKey = (() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/about-us")) return "about";
    if (pathname.startsWith("/services-top-pr-digital-marketing")) return "services";
    if (pathname.startsWith("/contact-us")) return "contact";
    if (pathname.startsWith("/digital-products")) return "digital-products";
    if (pathname.startsWith("/career")) return "career";
    for (const l of servicesSub) {
      if (pathname.startsWith(l.href)) {
        // Map href to NavKey
        if (l.href.includes("press-release")) return "press-release";
        if (l.href.includes("digital-marketing")) return "digital-marketing";
        if (l.href.includes("social-media")) return "social-media";
        if (l.href.includes("web-development")) return "web-development";
        if (l.href.includes("brand-promotion")) return "brand-promotion";
      }
    }
    return "none";
  })();

  const effective: NavKey = active && active !== "none" ? active : matchedKey;

  const isServicesActive =
    effective === "services" ||
    effective === "press-release" ||
    effective === "digital-marketing" ||
    effective === "social-media" ||
    effective === "web-development" ||
    effective === "brand-promotion";

  // Find the services item to know if it exists in nav
  const servicesItem = navItems.find(
    (item) =>
      item.href.includes("services") || item.label.toLowerCase() === "services"
  );

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setSocialOpen(false);
    setCartOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close social panel when window is resized back to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) {
        setSocialOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav id="navbar">
        <Link href="/" className="nav-logo" aria-label="DigiSharks Home">
          <Image
            src={headerLogo || "/darks.avif"}
            alt={headerLogoAlt}
            width={256}
            height={171}
            priority
            unoptimized
            style={{
              width: "170px",
              height: "auto",
              maxHeight: "60px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Link>

        <ul className="nav-links">
          {navItems.map((item) => {
            // Check if this nav item should have the Services dropdown
            const isServicesItem =
              servicesItem && (item._id === servicesItem._id ||
                item.label.toLowerCase() === "services");

            if (isServicesItem) {
              return (
                <li
                  key={item._id}
                  ref={dropdownRef}
                  className={"has-dropdown" + (showDropdown ? " dropdown-open" : "")}
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <Link
                    href={item.href}
                    className={isServicesActive ? "active" : ""}
                  >
                    {item.label}
                    <span className="nav-caret" aria-hidden="true">▾</span>
                  </Link>
                  <div className="nav-dropdown" role="menu">
                    {servicesSub.map((l) => (
                      <Link
                        key={l._id}
                        href={l.href}
                        className={(() => {
                          // Match active state
                          const subKey = l.href.includes("press-release") ? "press-release" :
                            l.href.includes("digital-marketing") ? "digital-marketing" :
                            l.href.includes("social-media") ? "social-media" :
                            l.href.includes("web-development") ? "web-development" :
                            l.href.includes("brand-promotion") ? "brand-promotion" : "";
                          return effective === subKey ? "active" : "";
                        })()}
                        role="menuitem"
                        onClick={() => setShowDropdown(false)}
                      >
                        {l.icon && <span className="nav-dropdown-icon">{l.icon}</span>}
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </li>
              );
            }

            return (
              <li key={item._id}>
                <Link
                  href={item.href}
                  className={(() => {
                    // Match URL-based active state
                    if (item.href === "/" && effective === "home") return "active";
                    if (item.href.startsWith("/about-us") && effective === "about") return "active";
                    if (item.href.startsWith("/contact-us") && effective === "contact") return "active";
                    if (item.href.startsWith("/digital-products") && effective === "digital-products") return "active";
                    return "";
                  })()}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="nav-social-icons" aria-label="Social media links">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
              className="nav-social-icon"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={link.iconSvg || getSvgPath(link.platform)} />
              </svg>
            </a>
          ))}
        </div>

        {/* ── Cart icon with badge ── */}
        <div className="nav-cart-wrap" ref={cartRef}>
          <button
            type="button"
            className="nav-cart-btn"
            aria-label={`Shopping cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            onClick={() => setCartOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && <span className="nav-cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
          </button>

          {/* ── Mini-cart dropdown ── */}
          {cartOpen && (
            <div className="nav-minicart">
              <div className="nav-minicart-header">
                <span className="nav-minicart-title">Shopping Cart</span>
                <span className="nav-minicart-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="nav-minicart-empty">
                  <span className="nav-minicart-empty-icon">🛒</span>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <ul className="nav-minicart-items">
                    {cartItems.map((ci) => (
                      <li key={ci.slug} className="nav-minicart-item">
                        {ci.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ci.image} alt="" className="nav-minicart-item-img" />
                        )}
                        <div className="nav-minicart-item-info">
                          <div className="nav-minicart-item-title">{ci.title}</div>
                          <div className="nav-minicart-item-meta">
                            <span>{ci.qty} × {formatINR(ci.price)}</span>
                            <button
                              type="button"
                              className="nav-minicart-item-remove"
                              onClick={() => remove(ci.slug)}
                              aria-label={`Remove ${ci.title} from cart`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="nav-minicart-subtotal">
                    <span>Subtotal</span>
                    <span className="nav-minicart-subtotal-amount">{formatINR(subtotal)}</span>
                  </div>

                  <div className="nav-minicart-actions">
                    <Link href="/shopping-cart" className="nav-minicart-btn" onClick={() => setCartOpen(false)}>
                      View Cart
                    </Link>
                    <Link href="/checkout" className="nav-minicart-btn nav-minicart-btn-primary" onClick={() => setCartOpen(false)}>
                      Checkout
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className={"hamburger" + (mobileOpen ? " open" : "")}
          id="hamburger"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobileMenu"
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <div
        className={"mobile-menu" + (mobileOpen ? " open" : "")}
        id="mobileMenu"
      >
        {navItems.map((item) => {
          const isServicesItem =
            servicesItem && (item._id === servicesItem._id ||
              item.label.toLowerCase() === "services");

          if (isServicesItem) {
            return (
              <div key={item._id} className="mobile-services-wrapper">
                <div className="mobile-services-parent">
                  <Link
                    href={item.href}
                    className="mobile-services-link"
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="mobile-services-arrow"
                    aria-label={servicesOpen ? "Close Services submenu" : "Open Services submenu"}
                    aria-expanded={servicesOpen}
                    onClick={() => setServicesOpen((v) => !v)}
                  >
                    <span
                      className={"mobile-services-arrow-icon" + (servicesOpen ? " open" : "")}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>
                </div>
                <div
                  className={"mobile-sub" + (servicesOpen ? " open" : "")}
                  aria-label="Services submenu"
                >
                  {servicesSub.map((l) => (
                    <Link
                      key={l._id}
                      href={l.href}
                      className={(() => {
                            const subKey = l.href.includes("press-release") ? "press-release" :
                              l.href.includes("digital-marketing") ? "digital-marketing" :
                              l.href.includes("social-media") ? "social-media" :
                              l.href.includes("web-development") ? "web-development" :
                              l.href.includes("brand-promotion") ? "brand-promotion" : "";
                            return effective === subKey ? "active" : "";
                          })()}
                      onClick={() => {
                        setServicesOpen(false);
                        setMobileOpen(false);
                      }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item._id}
              href={item.href}
              className={(() => {
                if (item.href === "/" && effective === "home") return "active";
                if (item.href.startsWith("/about-us") && effective === "about") return "active";
                if (item.href.startsWith("/contact-us") && effective === "contact") return "active";
                if (item.href.startsWith("/digital-products") && effective === "digital-products") return "active";
                if (item.href.startsWith("/career") && effective === "career") return "active";
                return "";
              })()}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="mobile-social" aria-label="Social media links">
          <button
            type="button"
            className="mobile-social-toggle"
            id="mobileSocialToggle"
            aria-expanded={socialOpen}
            aria-controls="mobileSocialPanel"
            onClick={() => setSocialOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Follow Us</span>
            <span className="mobile-social-caret" aria-hidden="true">▾</span>
          </button>
          <div className={"mobile-social-panel" + (socialOpen ? " open" : "")} id="mobileSocialPanel">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="mobile-social-icon"
                onClick={() => setSocialOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={link.iconSvg || getSvgPath(link.platform)} />
                </svg>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
