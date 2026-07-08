"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

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

// Social icon SVG paths (design assets — kept hardcoded)
const SOCIAL_ICONS: Record<string, string> = {
  facebook: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'X / Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
}

const SOCIAL_KEYS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] as const
type SocialPlatform = (typeof SOCIAL_KEYS)[number]

const DEFAULT_SOCIAL_URLS: Record<SocialPlatform, string> = {
  facebook: 'https://www.facebook.com/digisharks',
  twitter: 'https://twitter.com/digisharks',
  instagram: 'https://www.instagram.com/digisharks',
  linkedin: 'https://www.linkedin.com/company/digisharks',
  youtube: 'https://www.youtube.com/@digisharks',
}

export default function Navigation({ active = "none" }: NavigationProps) {
  const [navItems, setNavItems] = useState<MenuItem[]>([]);
  const [servicesSub, setServicesSub] = useState<MenuItem[]>([]);
  const [socialUrls, setSocialUrls] = useState<Record<SocialPlatform, string>>(DEFAULT_SOCIAL_URLS);
  const [headerLogo, setHeaderLogo] = useState('');
  const [headerLogoAlt, setHeaderLogoAlt] = useState('DigiSharks Logo');
  const [socialOpen, setSocialOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname() || "/";

  // ── Fetch nav items & social links from CMS ───────────────────────────
  useEffect(() => {
    async function loadMenus() {
      try {
        const [navRes, subRes, settingsRes] = await Promise.all([
          fetch("/api/public/menus?type=main-nav"),
          fetch("/api/public/menus?type=services-sub"),
          fetch("/api/public/settings"),
        ]);
        const navData = await navRes.json();
        const subData = await subRes.json();
        const settingsData = await settingsRes.json();

        if (settingsData.settings) {
          setSocialUrls({
            facebook: settingsData.settings.socialFacebook || DEFAULT_SOCIAL_URLS.facebook,
            twitter: settingsData.settings.socialTwitter || DEFAULT_SOCIAL_URLS.twitter,
            instagram: settingsData.settings.socialInstagram || DEFAULT_SOCIAL_URLS.instagram,
            linkedin: settingsData.settings.socialLinkedin || DEFAULT_SOCIAL_URLS.linkedin,
            youtube: settingsData.settings.socialYoutube || DEFAULT_SOCIAL_URLS.youtube,
          });
          if (settingsData.settings.headerLogo) setHeaderLogo(settingsData.settings.headerLogo);
          if (settingsData.settings.headerLogoAlt) setHeaderLogoAlt(settingsData.settings.headerLogoAlt);
        }

        if (navData.items && navData.items.length > 0) {
          setNavItems(navData.items);
        } else {
          setNavItems(DEFAULT_NAV_ITEMS);
        }

        if (subData.items && subData.items.length > 0) {
          setServicesSub(subData.items);
        } else {
          setServicesSub(DEFAULT_SERVICES_SUB);
        }
      } catch {
        setNavItems(DEFAULT_NAV_ITEMS);
        setServicesSub(DEFAULT_SERVICES_SUB);
      }
    }
    loadMenus();
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
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
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
            src={headerLogo || "/darks.webp"}
            alt={headerLogoAlt}
            width={256}
            height={171}
            priority
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
          {SOCIAL_KEYS.map((key) => (
            <a
              key={key}
              href={socialUrls[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={SOCIAL_LABELS[key]}
              title={SOCIAL_LABELS[key]}
              className="nav-social-icon"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={SOCIAL_ICONS[key]} />
              </svg>
            </a>
          ))}
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
            {SOCIAL_KEYS.map((key) => (
              <a
                key={key}
                href={socialUrls[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LABELS[key]}
                className="mobile-social-icon"
                onClick={() => setSocialOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={SOCIAL_ICONS[key]} />
                </svg>
                <span>{SOCIAL_LABELS[key]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
