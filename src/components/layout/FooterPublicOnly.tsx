"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

/** Oculta el footer en el panel interno (`/gestion`) y en la pantalla temporal de desarrollo. */
export function FooterPublicOnly() {
  const pathname = usePathname();
  if (pathname?.startsWith("/gestion") || pathname?.startsWith("/sitio-en-desarrollo")) {
    return null;
  }
  return <Footer />;
}
