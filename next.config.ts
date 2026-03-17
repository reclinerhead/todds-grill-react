import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.79"],
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
      {
        protocol: "https",
        hostname: "vksgvnzkyurpntazsklu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
