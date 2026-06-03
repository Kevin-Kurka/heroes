import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
    default: 'American Heroes & Brew | Best Sports Bar in Carlsbad & North County',
    template: '%s | American Heroes & Brew',
  },
  description:
    'The best sports bar in Carlsbad & North County San Diego. Killer burgers, wings, craft brews, and every game on the big screens. 300 Carlsbad Village Drive.',
  keywords: [
    'sports bar Carlsbad',
    'best sports bar North County',
    'Carlsbad restaurant',
    'sports bar near me',
    'watch the game Carlsbad',
    'craft beer Carlsbad',
    'burgers Carlsbad',
    'wings North County San Diego',
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
};

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
    </html>
  );
}
