/** Evita que `toISOString()` rompa el render si Supabase devuelve fechas raras o vacías. */
export function formatNewsDateParts(
  publishedAt: unknown,
  createdAt: unknown,
  labelOptions?: Intl.DateTimeFormatOptions
): { dateTime: string; label: string } {
  const primary = publishedAt ?? createdAt;
  const d =
    primary != null && primary !== ""
      ? new Date(primary as string | number | Date)
      : new Date();
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  const dateTime = safe.toISOString();
  const label =
    labelOptions === undefined
      ? safe.toLocaleDateString("es-AR")
      : safe.toLocaleDateString("es-AR", labelOptions);
  return { dateTime, label };
}
