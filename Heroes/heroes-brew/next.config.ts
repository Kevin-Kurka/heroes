import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    root: resolve(import.meta.dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.toasttab.com",
      },
      {
        protocol: "https",
        hostname: "americanheroesandbrew.com",
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
      },
      {
        // Behold-hosted Instagram renditions (legacy /social fallback)
        protocol: "https",
        hostname: "behold.pictures",
      },
      {
        // Live Instagram Graph API media on /social
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        // Instagram also serves some media via the Facebook CDN
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
    ],
  },
  /**
   * 301/308 redirects from the old WordPress URLs (still indexed by Google and
   * surfaced as sitelinks) to the current App Router pages. Without these the
   * legacy slugs 404, sending search visitors to a dead page. Permanent so
   * Google consolidates the old URLs into the new ones.
   */
  async redirects() {
    return [
      // Core legacy nav
      { source: "/menus", destination: "/menu", permanent: true },
      { source: "/breakfast-menu", destination: "/menu", permanent: true },
      { source: "/drink-menu", destination: "/menu", permanent: true },
      { source: "/hours-location", destination: "/location", permanent: true },
      { source: "/whats-happening", destination: "/events", permanent: true },
      { source: "/our-story", destination: "/", permanent: true },
      { source: "/look-inside", destination: "/social", permanent: true },
      { source: "/home-page", destination: "/", permanent: true },

      // Old Hero of the Month program (vocation pages + monthly events + nominate
      // /archive) → the current /heroes page. Wildcards cover every old sub-path.
      { source: "/heroes-of-the-month", destination: "/heroes", permanent: true },
      { source: "/hero-of-the-month/:path*", destination: "/heroes", permanent: true },
      { source: "/event/:path*", destination: "/heroes", permanent: true },
      { source: "/category/hero-of-the-month", destination: "/heroes", permanent: true },
      { source: "/autism-therapists", destination: "/heroes", permanent: true },
      { source: "/autism-therapists-2024", destination: "/heroes", permanent: true },
      { source: "/bank-tellers", destination: "/heroes", permanent: true },
      { source: "/brewers", destination: "/heroes", permanent: true },
      { source: "/brewers-2", destination: "/heroes", permanent: true },
      { source: "/coaches", destination: "/heroes", permanent: true },
      { source: "/coaches-2", destination: "/heroes", permanent: true },
      { source: "/delivery-drivers", destination: "/heroes", permanent: true },
      { source: "/educators", destination: "/heroes", permanent: true },
      { source: "/election-volunteers", destination: "/heroes", permanent: true },
      { source: "/engineers", destination: "/heroes", permanent: true },
      { source: "/equine-rescue-workers", destination: "/heroes", permanent: true },
      { source: "/event-workers", destination: "/heroes", permanent: true },
      { source: "/fitness-instructors", destination: "/heroes", permanent: true },
      { source: "/florists", destination: "/heroes", permanent: true },
      { source: "/florists-2", destination: "/heroes", permanent: true },
      { source: "/growers-farmer", destination: "/heroes", permanent: true },
      { source: "/healthcare-workers", destination: "/heroes", permanent: true },
      { source: "/hotel-workers", destination: "/heroes", permanent: true },
      { source: "/landscapers", destination: "/heroes", permanent: true },
      { source: "/lifeguards-beach-workers", destination: "/heroes", permanent: true },
      { source: "/lifeguards-hero-of-the-month-at-american-heroes-brew-in-carlsbad", destination: "/heroes", permanent: true },
      { source: "/members-of-the-clergy", destination: "/heroes", permanent: true },
      { source: "/musicians-songwriters", destination: "/heroes", permanent: true },
      { source: "/nominate-a-hero", destination: "/heroes", permanent: true },
      { source: "/nurses", destination: "/heroes", permanent: true },
      { source: "/pharmacists", destination: "/heroes", permanent: true },
      { source: "/physical-therapists", destination: "/heroes", permanent: true },
      { source: "/postal-workers", destination: "/heroes", permanent: true },
      { source: "/previous-winners", destination: "/heroes", permanent: true },
      { source: "/previously-honored-heroes", destination: "/heroes", permanent: true },
      { source: "/pro-athletes", destination: "/heroes", permanent: true },
      { source: "/reporters-news-crews", destination: "/heroes", permanent: true },
      { source: "/restaurant-employees", destination: "/heroes", permanent: true },
      { source: "/restaurant-industry-workers", destination: "/heroes", permanent: true },
      { source: "/restaurant-workers", destination: "/heroes", permanent: true },
      { source: "/retail-holiday-workers", destination: "/heroes", permanent: true },
      { source: "/rideshare-drivers", destination: "/heroes", permanent: true },
      { source: "/scout-leaders", destination: "/heroes", permanent: true },
      { source: "/search-rescue", destination: "/heroes", permanent: true },
      { source: "/tax-preparers-accountants", destination: "/heroes", permanent: true },
      { source: "/teachers", destination: "/heroes", permanent: true },
      { source: "/transportation-workers", destination: "/heroes", permanent: true },
      { source: "/women-small-business-owners", destination: "/heroes", permanent: true },

      // Old menu / food-item / specials pages → the menu
      { source: "/specials/:path*", destination: "/menu", permanent: true },
      { source: "/breakfast-specials/:path*", destination: "/menu", permanent: true },
      { source: "/uncategorized/:path*", destination: "/menu", permanent: true },
      { source: "/beef-stroganoff", destination: "/menu", permanent: true },
      { source: "/beef-stroganoff-fettucini", destination: "/menu", permanent: true },
      { source: "/beer-battered-fish-chips", destination: "/menu", permanent: true },
      { source: "/catering", destination: "/menu", permanent: true },
      { source: "/chili-omelette", destination: "/menu", permanent: true },
      { source: "/clam-mizithra-pasta", destination: "/menu", permanent: true },
      { source: "/cup-of-homemade-chili", destination: "/menu", permanent: true },
      { source: "/fish-chips", destination: "/menu", permanent: true },
      { source: "/gyro-plate", destination: "/menu", permanent: true },
      { source: "/jersey-ripper-dogs", destination: "/menu", permanent: true },
      { source: "/loco-moco-burger", destination: "/menu", permanent: true },
      { source: "/memphis-pulled-pork-bbq", destination: "/menu", permanent: true },
      { source: "/party-platters", destination: "/menu", permanent: true },
      { source: "/pittsburgh", destination: "/menu", permanent: true },
      { source: "/spaghetti-meatballs", destination: "/menu", permanent: true },

      // Old info / blog / WordPress cruft → closest live page
      { source: "/contact", destination: "/location", permanent: true },
      { source: "/contact-us", destination: "/location", permanent: true },
      { source: "/location/:path+", destination: "/location", permanent: true },
      { source: "/watch-sports", destination: "/watch", permanent: true },
      { source: "/calendar", destination: "/events", permanent: true },
      { source: "/category/:path*", destination: "/", permanent: true },
      { source: "/author/:path*", destination: "/", permanent: true },
      { source: "/news-item/:path*", destination: "/", permanent: true },
      { source: "/news", destination: "/", permanent: true },
      { source: "/blog-page", destination: "/", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/business-inquiry", destination: "/", permanent: true },
      { source: "/join", destination: "/", permanent: true },
      { source: "/privacy-policy", destination: "/", permanent: true },
      { source: "/privacy-policy-2", destination: "/", permanent: true },
      { source: "/sample-page", destination: "/", permanent: true },
      { source: "/1709-2", destination: "/", permanent: true },
      { source: "/1796-2", destination: "/", permanent: true },
      { source: "/1853-2", destination: "/", permanent: true },
      { source: "/1890-2", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
