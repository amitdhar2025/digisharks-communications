"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientScripts() {
  const pathname = usePathname();

  // Add js-ready class for CSS transition gating + navbar scroll background toggle
  useEffect(() => {
    document.documentElement.classList.add("js-ready");
    const nav = document.getElementById("navbar");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // NOTE: Hamburger toggle removed from here.
  // It is now handled entirely by React state inside Navigation.tsx.

  // Fade-up on scroll (intersection observer) — with staggered children
  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("visible");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Reveal the parent
            reveal(e.target);
            // Also reveal any stagger children inside
            const children = e.target.querySelectorAll<HTMLElement>("[data-stagger]");
            children.forEach((child, i) => {
              const delay = parseInt(child.dataset.stagger || "0") * 80;
              setTimeout(() => child.classList.add("visible"), delay);
            });
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(".fade-up:not(.visible)")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            reveal(el);
          } else {
            io.observe(el);
          }
        });
    };

    observeAll();

    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

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

  // Progress bar fill animation on scroll
  useEffect(() => {
    const fillBars = () => {
      const bars = document.querySelectorAll<HTMLElement>(".progress-fill[data-width]");
      const progObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const bar = e.target as HTMLElement;
            const targetWidth = bar.dataset.width || "0%";
            if (bar.dataset.animated === "true") return;
            bar.dataset.animated = "true";
            // Start from 0 and animate to target
            bar.style.width = "0%";
            requestAnimationFrame(() => {
              bar.style.transition = "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
              bar.style.width = targetWidth;
            });
            progObs.unobserve(bar);
          });
        },
        { threshold: 0.2 }
      );
      bars.forEach((bar) => progObs.observe(bar));
      return progObs;
    };

    const obs = fillBars();
    const mo = new MutationObserver(() => {
      obs.disconnect();
      const newObs = fillBars();
      // Store for cleanup
      (window as unknown as { __progObs?: IntersectionObserver }).__progObs = newObs;
    });
    mo.observe(document.body, { childList: true, subtree: true });
    (window as unknown as { __progObs?: IntersectionObserver }).__progObs = obs;

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // Count-up animation
  useEffect(() => {
    const countEls = document.querySelectorAll<HTMLElement>("[data-target]");

    const runToFinalValue = (el: HTMLElement) => {
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || "";
      if (!Number.isFinite(target)) return;
      if (el.dataset.animated === "true") return;
      el.textContent = String(Math.round(target)) + suffix;
      el.dataset.animated = "true";
    };

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
          const suffix = el.dataset.suffix || "";
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