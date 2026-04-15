"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Al llegar a `/` con `#ancla`, hace scroll suave al elemento (p. ej. desde otra página).
 */
export function HomeScrollHash() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const raw = window.location.hash?.slice(1);
    if (!raw) return;
    const id = decodeURIComponent(raw);
    const run = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    requestAnimationFrame(run);
  }, [pathname]);

  return null;
}
