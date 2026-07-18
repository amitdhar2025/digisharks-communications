export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getPageContent } from '@/lib/cms-page-content'
import { DEFAULT_CONTENT } from '@/lib/portfolio-content'
import PortfolioPageClient from './PortfolioPageClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.digisharkscommunications.com'
const siteUrl = `${SITE_URL}/portfolio/`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL + '/'),
  title: "Top PR Agency in India | Digisharks Communications Portfolio",
  description:
    "Explore the portfolio of Digisharks Communications — India's top PR and digital marketing agency. See our award-winning projects, campaigns, and client success stories.",
  alternates: { canonical: siteUrl },
};

export default async function PortfolioWrapper() {
  // Fetch CMS content — if available, it overrides DEFAULT_CONTENT
  const cmsContent = await getPageContent('portfolio')
  const content = { ...DEFAULT_CONTENT, ...(cmsContent || {}) }
  return <PortfolioPageClient content={content} />
}
