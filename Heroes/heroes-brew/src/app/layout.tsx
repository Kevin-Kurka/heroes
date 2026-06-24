import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { getRestaurantJsonLd, SITE_URL } from '@/lib/structured-data';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'American Heroes & Brew | Restaurant & Sports Bar in Carlsbad Village',
    template: '%s | American Heroes & Brew',
  },
  description:
    'American Heroes & Brew is a family-friendly restaurant & sports bar in Carlsbad Village, North County San Diego — burgers, wings, the only authentic Philly cheesesteak in town, weekend breakfast, a full bar, and every game on 16 TVs. 300 Carlsbad Village Drive.',
  keywords: [
    'restaurant Carlsbad Village',
    'restaurants near me Carlsbad',
    'where to eat Carlsbad',
    'American restaurant Carlsbad',
    'family restaurant Carlsbad',
    'best burgers Carlsbad',
    'Philly cheesesteak Carlsbad',
    'sports bar Carlsbad',
    'best sports bar North County',
    'breakfast Carlsbad Village',
    'American Heroes and Brew',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'American Heroes & Brew | Best Sports Bar in Carlsbad',
    description:
      'Carlsbad & North County\'s go-to sports bar — great food, craft brews, and every game on the big screens.',
    url: SITE_URL,
    siteName: 'American Heroes & Brew',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'American Heroes & Brew | Best Sports Bar in Carlsbad',
    description: 'Carlsbad & North County\'s go-to sports bar. Every game, every day.',
  },
  // Google Search Console (HTML-tag method). Set GOOGLE_SITE_VERIFICATION in
  // Vercel to the token from Search Console; omitted entirely when unset.
  // facebook-domain-verification: Meta Business Manager domain verification for
  // americanheroesandbrew.com (Business Settings → Domains), added 2026-06-12.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: { 'facebook-domain-verification': 'fo9dqulqhnerq2vnyym5g7nhhooqm5' },
  },
  appleWebApp: { capable: true, title: 'Heroes & Brew', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};

// Google Analytics 4 for americanheroesandbrew.com. The Measurement ID is
// public (it ships in the page HTML), so it's safe to default here; override
// with NEXT_PUBLIC_GA_ID in Vercel if the GA property ever changes.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-F46WF78TNT';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          // Restaurant rich-result data; safe server-rendered JSON (no user input).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getRestaurantJsonLd()) }}
        />
        <TopNav />
        <main className="md:pt-16 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        <BottomNav />
        <Analytics />
        <SpeedInsights />
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
