import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  // /social is hidden for now. A temporary (not permanent) redirect avoids
  // hard browser caching so the page is easy to re-enable later.
  async redirects() {
    return [{ source: "/social", destination: "/", permanent: false }];
  },
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
    ],
  },
};

export default nextConfig;
