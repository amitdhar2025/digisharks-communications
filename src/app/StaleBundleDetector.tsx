"use client";

import { useEffect } from "react";

/**
 * StaleBundleDetector
 *
 * Detects when the client-side JavaScript bundle is stale (cached old version)
 * by comparing the build time embedded in the JS bundle (via NEXT_PUBLIC_BUILD_TIME)
 * with the build time set by the inline script in the server-rendered HTML
 * (window.__BUILD_TIME).
 *
 * If they don't match, the page is force-reloaded to fetch the fresh bundle.
 * This prevents hydration errors caused by old cached JS bundles referencing
 * different asset paths than the server's fresh HTML.
 *
 * The inline script in layout.tsx sets window.__BUILD_TIME from the same
 * BUILD_TIME constant used at build time, so:
 *   - Fresh HTML + fresh JS  → values match → no reload
 *   - Fresh HTML + stale JS  → values differ → reload
 */
// ── Extend Window to include the build-time stamp set by the inline script ──
declare global {
  interface Window {
    __BUILD_TIME?: string;
  }
}

export default function StaleBundleDetector() {
  useEffect(() => {
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;

    // Only reload when both values are available and differ
    if (buildTime && window.__BUILD_TIME) {
      if (window.__BUILD_TIME !== buildTime) {
        console.warn(
          "[StaleBundleDetector] Build version mismatch detected:",
          { html: window.__BUILD_TIME, bundle: buildTime }
        );
        // Force a hard reload from the server, bypassing cache
        window.location.reload();
      }
    }
  }, []);

  return null;
}
