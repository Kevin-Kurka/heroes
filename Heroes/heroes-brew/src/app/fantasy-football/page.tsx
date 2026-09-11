import type { Metadata } from 'next';
import {
  SITE_URL,
  getGenericFaqJsonLd,
  getWebPageJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/structured-data';
import { FANTASY } from '@/lib/fantasy';
import FantasyPageView from '@/components/FantasyPageView';

const PAGE_URL = `${SITE_URL}/fantasy-football`;
const TITLE = 'Fantasy Football League in Carlsbad — Drafts Completed, Season Underway';
const DESCRIPTION =
  'American Heroes & Brew hosted 2026 Fantasy Football drafts in Carlsbad Village. Drafts are completed and the season is underway — watch every NFL game on 16 TVs. League champs still win a $100 gift card.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/fantasy-football' },
  openGraph: {
    title: `${TITLE} | American Heroes & Brew`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
  },
};

// Archive page — no live league counts. Daily rebuild is enough (World Cup pattern).
export const revalidate = 86400;

export default function FantasyFootballPage() {
  const jsonLd = [
    getWebPageJsonLd({ url: PAGE_URL, name: TITLE, description: DESCRIPTION }),
    getGenericFaqJsonLd(FANTASY.faqs, PAGE_URL),
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Scoreboard', path: '/events' },
      { name: 'Fantasy Football League', path: '/fantasy-football' },
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
      <FantasyPageView />
    </>
  );
}
