// This file configures the initialization of Sentry on the client side.
// The DSN is read from environment variables when available.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";

if (dsn) {
  Sentry.init({
    dsn,

    // Performance monitoring — sample rate for traces (0 = none, 1 = all)
    // 0.25 means 25% of transactions are captured. Adjust based on traffic.
    tracesSampleRate: 0.25,

    // Capture Core Web Vitals automatically (LCP, FID, CLS, INP, TTFB)
    integrations: [Sentry.browserTracingIntegration()],

    // Replays — optional session replay for debugging user interactions
    replaysSessionSampleRate: 0.01,  // 1% of all sessions
    replaysOnErrorSampleRate: 1.0,   // 100% of sessions with errors

    // Enable Spotlight for local development (optional)
    spotlight: process.env.NODE_ENV === "development",
  });
}
