"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const GESTION_CALLBACK = encodeURIComponent("/gestion");

export function FooterGestionLink() {
  const { data: session, status } = useSession();
  const t = useTranslations("footer");

  const isAuthed = status === "authenticated" && session?.user;
  const href = isAuthed ? "/gestion" : `/auth/signin?callbackUrl=${GESTION_CALLBACK}`;
  const label = isAuthed ? t("management") : t("signIn");

  return (
    <Link
      href={href}
      className="shrink-0 text-xs font-medium text-[var(--feg-green-2)] underline-offset-4 transition hover:text-[var(--feg-green)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feg-green)]"
    >
      {label}
    </Link>
  );
}
