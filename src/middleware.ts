import { NextResponse } from "next/server";
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
  if (/\.(svg|png|jpe?g|gif|webp|ico|webmanifest)$/i.test(pathname)) return true;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
