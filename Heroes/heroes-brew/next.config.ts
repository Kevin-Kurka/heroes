import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
