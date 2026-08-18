import type { Metadata } from 'next';
import { getRestaurantInfo } from '@/lib/menu';
import { LANDING_PAGES } from '@/lib/landing-pages';
import {
  SITE_URL,
  getGenericFaqJsonLd,
  getWebPageJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/structured-data';
import LandingPageView from '@/components/LandingPageView';

const PAGE = LANDING_PAGES['world-cup'];
const PAGE_URL = `${SITE_URL}/${PAGE.slug}`;

export const metadata: Metadata = {
  title: PAGE.metaTitle,
  description: PAGE.metaDescription,
  alternates: { canonical: `/${PAGE.slug}` },
  openGraph: {
    title: `${PAGE.metaTitle} | American Heroes & Brew`,
    description: PAGE.metaDescription,
    url: PAGE_URL,
    type: 'website',
  },
};

// Archive page — the 2026 tournament has ended; hourly rebuild is unnecessary.
export const revalidate = 86400;

export default function WorldCupPage() {
  const restaurant = getRestaurantInfo();
  const jsonLd = [
    getWebPageJsonLd({ url: PAGE_URL, name: PAGE.metaTitle, description: PAGE.metaDescription }),
    getGenericFaqJsonLd(PAGE.faqs, PAGE_URL),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: PAGE.breadcrumbLabel, path: `/${PAGE.slug}` },
    ]),
  ];
  return (
    <>
      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
      <LandingPageView page={PAGE} restaurant={restaurant} />
    </>
  );
}
