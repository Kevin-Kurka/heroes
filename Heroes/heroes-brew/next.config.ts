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
    ],
  },
};

export default nextConfig;
