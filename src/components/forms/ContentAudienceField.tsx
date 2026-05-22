"use client";

import {
  CONTENT_AUDIENCE_LABELS,
  CONTENT_AUDIENCE_VALUES,
  type ContentAudience,
} from "@/lib/content-audience";

type Props = {
  name?: string;
  value: ContentAudience;
  onChange: (value: ContentAudience) => void;
  legend?: string;
};

/** Selector de audiencia: General | Menores | Mayores (radio, una opción). */
export function ContentAudienceField({
  name = "audience",
  value,
  onChange,
  legend = "Audiencia",
}: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[var(--feg-green)]">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {CONTENT_AUDIENCE_VALUES.map((opt) => {
          const id = `${name}-${opt.toLowerCase()}`;
          const checked = value === opt;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-3 text-sm transition ${
                checked
                  ? "border-[var(--feg-green-2)] bg-[var(--feg-green-2)]/8 shadow-sm"
                  : "border-[var(--feg-green)]/20 bg-[var(--feg-bg)]/80 hover:border-[var(--feg-green)]/35"
              }`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={opt}
                checked={checked}
                onChange={() => onChange(opt)}
                className="mt-0.5 h-4 w-4 shrink-0 border-[var(--feg-green)]/40 text-[var(--feg-green-2)] focus:ring-[var(--feg-green-2)]"
              />
              <span className="text-[var(--feg-ink)]">{CONTENT_AUDIENCE_LABELS[opt]}</span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-[var(--feg-green)]/80">
        General aparece en todo el sitio. Menores o Mayores también se listan en su apartado
        filtrado (rankings, calendario, torneos y noticias con{" "}
        <code className="rounded bg-black/5 px-1">?audiencia=</code>).
      </p>
    </fieldset>
  );
}
