import type { NextConfig } from "next";

const baseRemotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
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
];

function supabaseHostFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseHostFromEnv();
const remotePatterns = [...baseRemotePatterns];
if (
  supabaseHost &&
  !remotePatterns.some((p) => "hostname" in p && p.hostname === supabaseHost)
) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHost,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Hasta 15 fotos × 5 MB en “Enviar fotos” (Server Actions default = 1 MB). */
  experimental: {
    serverActions: {
      bodySizeLimit: "80mb",
    },
  },
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
