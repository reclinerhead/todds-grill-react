import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "northeastnosh.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s17661.pcdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname:
          "afd-production-eru2ractomp34-gjdjeybzcubvfrgz.z01.azurefd.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
