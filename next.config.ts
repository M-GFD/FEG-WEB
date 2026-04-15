import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Hasta 15 fotos × 5 MB en “Enviar fotos” (Server Actions default = 1 MB). */
  experimental: {
    serverActions: {
      bodySizeLimit: "80mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zodragndwywpzztmdypm.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
    ],
  },
};

export default nextConfig;
