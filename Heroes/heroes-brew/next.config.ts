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
};

export default nextConfig;
