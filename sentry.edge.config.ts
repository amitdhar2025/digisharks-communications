// This file configures the initialization of Sentry on the edge runtime.
// The DSN is read from environment variables when available.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || "";

if (dsn) {
  Sentry.init({
    dsn,

    // Performance monitoring — sample rate for edge transactions
    tracesSampleRate: 0.25,
  });
}
