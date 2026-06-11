"use server";

import { cookies } from "next/headers";
import { routing, type AppLocale } from "@/i18n/routing";

export async function setUserLocale(locale: AppLocale) {
  if (!routing.locales.includes(locale)) return;

  const cookieStore = await cookies();
  const cookieConfig =
    typeof routing.localeCookie === "object" ? routing.localeCookie : null;

  cookieStore.set(cookieConfig?.name ?? "FEG_LOCALE", locale, {
    path: "/",
    maxAge: cookieConfig?.maxAge,
    sameSite: "lax",
  });
}
