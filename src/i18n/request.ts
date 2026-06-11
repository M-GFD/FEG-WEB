import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing, type AppLocale } from "@/i18n/routing";

function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && routing.locales.includes(value as AppLocale);
}

/** Preferencia del usuario (cookie) o del navegador (Accept-Language). */
async function resolveLocaleAsync(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("FEG_LOCALE")?.value;
  if (isAppLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = (await headers()).get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((part) => part.split(";")[0]?.trim().toLowerCase())
      .filter(Boolean);

    for (const tag of preferred) {
      if (tag.startsWith("pt")) return "pt";
      if (tag.startsWith("en")) return "en";
      if (tag.startsWith("es")) return "es";
    }
  }

  return routing.defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocaleAsync();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
