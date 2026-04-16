"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

/** Oculta el footer en el panel interno (`/gestion`); en el resto del sitio se muestra. */
export function FooterPublicOnly() {
  const pathname = usePathname();
  if (pathname?.startsWith("/gestion")) {
    return null;
  }
  return <Footer />;
}
