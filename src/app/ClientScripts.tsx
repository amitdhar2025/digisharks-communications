"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientScripts() {
  const pathname = usePathname();

  
  // Navbar scroll background toggle
  useEffect(() => {
    const nav = document.getElementById("navbar");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hamburger toggle + close on link tap / resize / ESC
  useEffect(() => {
    const ham = document.getElementById("hamburger");
    const mob = document.getElementById("mobileMenu");
    const nav = document.getElementById("navbar");
    if (!ham || !mob) return;

    const setMenuState = (open: boolean) => {
      ham.classList.toggle("open", open);
      mob.classList.toggle("open", open);
      nav?.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };

    const onHamburgerClick = () => {
      const isOpen = !ham.classList.contains("open");
      setMenuState(isOpen);
    };

    ham.addEventListener("click", onHamburgerClick);

    // Close the mobile menu when a link inside it is clicked.
    // Keep it open when interacting with the Services submenu on mobile.
    const links = mob.querySelectorAll("a");
    const onLinkClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const clickedServicesItem = !!target?.closest?.('[data-keep-mobile-menu-open="services"]');
      if (clickedServicesItem) return;
      setMenuState(false);
    };
    links.forEach((a) => a.addEventListener("click", onLinkClick));

    // Close on resize to desktop
    const onResize = () => {
      if (window.innerWidth > 900) setMenuState(false);
    };
    window.addEventListener("resize", onResize);

    // Close on ESC
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuState(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      ham.removeEventListener("click", onHamburgerClick);
      links.forEach((a) => a.removeEventListener("click", onLinkClick));
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Fade-up on scroll (intersection observer)
  // Re-keyed on pathname + catches late-mounting content via MutationObserver.
  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("visible");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(".fade-up:not(.visible)")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          // Already on screen -> reveal immediately (don't wait for IO's
          // async first callback, which can leave above-the-fold content hidden).
          if (r.top < window.innerHeight && r.bottom > 0) {
            reveal(el);
          } else {
            io.observe(el);
          }
        });
    };

    observeAll();

    // Catch content that mounts AFTER this effect runs
    // (App Router streaming / Suspense / async client render).
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net: nothing stays invisible forever.
    const safety = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".fade-up:not(.visible)")
        .forEach(reveal);
    }, 1000);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  // Count-up animation
  // Re-keyed on pathname so counters on client-navigated pages also animate.
  useEffect(() => {
    const countEls = document.querySelectorAll<HTMLElement>("[data-target]");

    const runToFinalValue = (el: HTMLElement) => {
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || "+";
      if (!Number.isFinite(target)) return;
      if (el.dataset.animated === "true") return;

      el.textContent = String(Math.round(target)) + suffix;
      el.dataset.animated = "true";
    };

    // Initialize on the client as soon as layout is painted.
    // Only finalize counters still stuck at the placeholder (0 or empty).
    const initNow = () => {
      countEls.forEach((el) => {
        const txt = (el.textContent || "").trim();
        if (txt === "0" || txt === "") {
          runToFinalValue(el);
        }
      });
    };

    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(initNow);
      (window as unknown as { __countRaf2?: number }).__countRaf2 = raf2;
    });

    const fallbackTimer = window.setTimeout(() => {
      countEls.forEach(runToFinalValue);
    }, 800);

    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;

          const el = e.target as HTMLElement;
          const target = Number(el.dataset.target);
          const suffix = el.dataset.suffix || "+";
          if (!Number.isFinite(target)) return;

          if (el.dataset.animated === "true") return;
          el.dataset.animated = "true";

          let start: number | null = null;
          const dur = 1800;

          const step = (timestamp: number) => {
            if (start === null) start = timestamp;
            const prog = Math.min((timestamp - start) / dur, 1);
            const ease = 1 - Math.pow(1 - prog, 3);
            el.textContent = String(Math.round(ease * target)) + suffix;
            if (prog < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
          countObs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    countEls.forEach((el) => countObs.observe(el));

    return () => {
      window.cancelAnimationFrame(raf1);
      const raf2 = (window as unknown as { __countRaf2?: number }).__countRaf2;
      if (typeof raf2 === "number") window.cancelAnimationFrame(raf2);
      window.clearTimeout(fallbackTimer);
      countObs.disconnect();
    };
  }, [pathname]);

  return null;
}