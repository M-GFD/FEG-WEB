"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const GESTION_CALLBACK = encodeURIComponent("/gestion");

export function FooterGestionLink() {
  const { data: session, status } = useSession();

  const href =
    status === "authenticated" && session?.user
      ? "/gestion"
      : `/auth/signin?callbackUrl=${GESTION_CALLBACK}`;

  return (
    <Link
      href={href}
      className="shrink-0 text-[11px] font-medium tracking-wide text-[var(--feg-green)]/45 underline-offset-4 transition hover:text-[var(--feg-green)]/80 hover:underline"
    >
      Gestion
    </Link>
  );
}
