"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { createCalendarLabels, type CalendarLabels } from "@/lib/calendario-feg";

export function useCalendarI18n(): { locale: AppLocale; labels: CalendarLabels } {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("calendar");
  const labels = useMemo(() => createCalendarLabels((key) => t(key)), [t]);
  return { locale, labels };
}
