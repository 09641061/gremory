import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: ["192.168.0.10", "localhost"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
