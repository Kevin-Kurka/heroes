import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'American Heroes & Brew | Carlsbad Sports Bar & Restaurant',
  description:
    'Carlsbad\'s neighborhood sports bar. Great food, local craft brews, and every game on the big screens. 300 Carlsbad Village Drive.',
  keywords: ['sports bar', 'Carlsbad', 'restaurant', 'craft beer', 'American Heroes'],
  openGraph: {
    title: 'American Heroes & Brew',
    description: 'Carlsbad\'s neighborhood sports bar & restaurant.',
    type: 'website',
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
        <TopNav />
        <main className="md:pt-16 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        <BottomNav />
        {process.env.NEXT_PUBLIC_ELFSIGHT_APP_ID && (
          <Script
            src="https://static.elfsight.com/platform/platform.js"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
