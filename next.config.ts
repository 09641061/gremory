import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/team",
        destination: "/organizations",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
