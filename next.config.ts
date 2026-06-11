import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

/** CSP: Next/React requieren 'unsafe-inline'; Supabase y worker en connect-src. En dev se permiten ws locales para HMR. */
function buildContentSecurityPolicy(): string {
  const isProd = process.env.NODE_ENV === "production";
  const host = supabaseHostFromEnv();
  const connect: string[] = ["'self'"];
  if (host) {
    connect.push(`https://${host}`, `wss://${host}`);
  } else {
    connect.push("https://*.supabase.co", "wss://*.supabase.co");
  }
  if (!isProd) {
    connect.push("http://localhost:*", "http://127.0.0.1:*", "ws:", "wss:");
  }
  const connectSrc = connect.join(" ");
  const parts = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  if (isProd) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

function securityHeaders(): { key: string; value: string }[] {
  const isProd = process.env.NODE_ENV === "production";
  const headers: { key: string; value: string }[] = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "no-referrer" },
    {
      key: "Permissions-Policy",
      value: "geolocation=(), microphone=(), camera=()",
    },
  ];
  if (isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }
  return headers;
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
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/LOGO_FEG%201.svg",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          ...securityHeaders(),
        ],
      },
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
};

export default withNextIntl(nextConfig);
