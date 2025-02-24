import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "pbs.twimg.com",
      },
    ],
  },
};

export default nextConfig;
