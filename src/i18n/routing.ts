import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en", "pt"] as const;
export type AppLocale = (typeof locales)[number];

export const LOCALE_CODE: Record<AppLocale, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
};

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "es",
  localePrefix: "never",
  localeCookie: {
    name: "FEG_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
