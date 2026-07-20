// This file configures the initialization of Sentry on the server side.
// The DSN is read from environment variables when available.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || "";

if (dsn) {
  Sentry.init({
    dsn,

    // Performance monitoring — sample rate for server-side transactions
    tracesSampleRate: 0.25,
  });
}
