import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      { source: "/auth/verify", destination: "/verify" },
      { source: "/auth/callback", destination: "/callback" },
    ];
  },
};

export default nextConfig;
