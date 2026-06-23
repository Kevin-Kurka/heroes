import type { Metadata } from 'next';
import {
  SITE_URL,
  getGenericFaqJsonLd,
  getWebPageJsonLd,
  getBreadcrumbJsonLd,
} from '@/lib/structured-data';
import { FANTASY } from '@/lib/fantasy';
import { getLeagueAvailability } from '@/lib/fantasy-leagues';
import FantasyPageView from '@/components/FantasyPageView';

const PAGE_URL = `${SITE_URL}/fantasy-football`;
const TITLE = 'Fantasy Football League in Carlsbad — Draft at Heroes, Win $100';
const DESCRIPTION =
  'Join American Heroes & Brew’s Fantasy Football League in Carlsbad Village. Free to join, $100 gift card to each league winner, host your draft at the bar with free munchies and your draft live on the big screen. Sign up now.';

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

// Short revalidate so league "spots left" stays fresh as leagues fill.
export const revalidate = 120;

export default async function FantasyFootballPage() {
  const leagues = await getLeagueAvailability();
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
      <FantasyPageView leagues={leagues} />
    </>
  );
}
