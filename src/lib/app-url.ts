function normalizeBaseUrl(raw: string): string {
  const v = raw.trim().replace(/\/+$/, "");
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

export function getBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const normalized = explicit ? normalizeBaseUrl(explicit) : "";
  return normalized || "http://localhost:3000";
}

