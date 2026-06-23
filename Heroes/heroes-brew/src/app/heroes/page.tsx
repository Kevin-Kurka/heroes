import type { Metadata } from 'next';
import {
  SITE_URL,
  getGenericFaqJsonLd,
  getWebPageJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/structured-data';
import { HERO_FAQS } from '@/lib/heroes';
import HeroesPageView from '@/components/HeroesPageView';

const PAGE_URL = `${SITE_URL}/heroes`;
const TITLE = 'Hero of the Month — Honoring Carlsbad’s Everyday Heroes';
const DESCRIPTION =
  'American Heroes & Brew honors a Hero of the Month in Carlsbad Village — an individual community member or a whole vocation (like nurses or first responders). Read this month’s hero and nominate someone.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/heroes' },
  openGraph: {
    title: `${TITLE} | American Heroes & Brew`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
  },
};

// Content changes ~monthly; hourly revalidate is plenty.
export const revalidate = 3600;

export default function HeroesPage() {
  const jsonLd = [
    getWebPageJsonLd({ url: PAGE_URL, name: TITLE, description: DESCRIPTION }),
    getGenericFaqJsonLd(HERO_FAQS, PAGE_URL),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Hero of the Month', path: '/heroes' },
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
      <HeroesPageView />
    </>
  );
}
