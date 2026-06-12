import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";
import {
  canAccessGestionPath,
  gestionHomeForRole,
  mapLegacyDashboardPath,
} from "@/lib/gestion-access";

function isPreviewGateEnabled() {
  const v = process.env.PREVIEW_GATE_ENABLED;
  return v === "true" || v === "1";
}

/** Archivos estáticos y datos RSC: no bloquear para que cargue el sitio tras pasar el gate. */
function isPreviewGateBypassPath(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/sitio-en-desarrollo")) return true;
  if (/\.(svg|png|jpe?g|gif|webp|ico|webmanifest|pdf)$/i.test(pathname)) return true;
  if (pathname === "/sw.js") return true;
  return false;
}

const AUTH_RATE_WINDOW_MS = 60_000;
const AUTH_RATE_MAX = 20;

function getAuthRateStore(): Map<string, number[]> {
  const g = globalThis as unknown as { __fegAuthRate?: Map<string, number[]> };
  if (!g.__fegAuthRate) g.__fegAuthRate = new Map();
  return g.__fegAuthRate;
}

/** Limita POST a /api/auth/* (login, callbacks) para mitigar fuerza bruta. */
function allowAuthPost(req: NextRequest): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const store = getAuthRateStore();
  const hits = (store.get(ip) ?? []).filter((t) => now - t < AUTH_RATE_WINDOW_MS);
  if (hits.length >= AUTH_RATE_MAX) {
    console.warn("[rate-limit] /api/auth POST", ip.slice(0, 24));
    return false;
  }
  hits.push(now);
  store.set(ip, hits);
  return true;
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) {
    if (req.method === "POST" && !allowAuthPost(req)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Esperá un minuto e intentá de nuevo." },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

  if (isPreviewGateEnabled()) {
    const hasPreview = req.cookies.get("feg_preview_ok")?.value === "1";
    if (!hasPreview && !isPreviewGateBypassPath(pathname)) {
      const gate = new URL("/sitio-en-desarrollo", req.url);
      gate.searchParams.set("redirect", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(gate);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!req.auth?.user) {
      const signIn = new URL("/auth/signin", req.url);
      signIn.searchParams.set("callbackUrl", mapLegacyDashboardPath(pathname));
      return NextResponse.redirect(signIn);
    }
    return NextResponse.redirect(new URL(mapLegacyDashboardPath(pathname), req.url));
  }

  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/gestion")) {
    if (!req.auth?.user) {
      const signIn = new URL("/auth/signin", req.url);
      signIn.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signIn);
    }

    const role = (req.auth.user as { role?: Role }).role ?? "PUBLIC";

    if (role === "PUBLIC") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname === "/gestion" || pathname === "/gestion/") {
      return NextResponse.redirect(new URL(gestionHomeForRole(role), req.url));
    }

    if (!canAccessGestionPath(role, pathname)) {
      return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/auth/:path*",
  ],
};
