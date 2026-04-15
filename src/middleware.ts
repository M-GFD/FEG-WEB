import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";
import {
  canAccessGestionPath,
  gestionHomeForRole,
  mapLegacyDashboardPath,
} from "@/lib/gestion-access";

export default auth((req) => {
  const { pathname } = req.nextUrl;

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
