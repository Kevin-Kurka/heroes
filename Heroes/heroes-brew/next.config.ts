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
        // Behold-hosted Instagram renditions used on /social
        protocol: "https",
        hostname: "behold.pictures",
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
      { source: "/menus", destination: "/menu", permanent: true },
      { source: "/breakfast-menu", destination: "/menu", permanent: true },
      { source: "/drink-menu", destination: "/menu", permanent: true },
      { source: "/hours-location", destination: "/location", permanent: true },
      { source: "/whats-happening", destination: "/events", permanent: true },
      { source: "/our-story", destination: "/", permanent: true },
      { source: "/heroes-of-the-month", destination: "/", permanent: true },
      { source: "/look-inside", destination: "/social", permanent: true },
      { source: "/home-page", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
