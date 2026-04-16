"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const GESTION_CALLBACK = encodeURIComponent("/gestion");

export function FooterGestionLink() {
  const { data: session, status } = useSession();

  const isAuthed = status === "authenticated" && session?.user;
  const href = isAuthed ? "/gestion" : `/auth/signin?callbackUrl=${GESTION_CALLBACK}`;
  const label = isAuthed ? "Gestión" : "Acceder";

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-yellow)] px-8 py-3.5 font-heading text-base font-semibold uppercase tracking-wide text-[var(--feg-ink)] shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feg-green)]"
    >
      {label}
    </Link>
  );
}
