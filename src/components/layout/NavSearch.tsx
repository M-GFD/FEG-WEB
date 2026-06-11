"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

type Props = {
  className?: string;
  /** En desktop va dentro de la cápsula; en móvil ocupa el ancho disponible. */
  variant?: "desktop" | "mobile";
};

/** Una sola cápsula: evita capas rectangulares internas que sobresalen en las curvas. */
const capsuleShell =
  "relative isolate flex h-9 w-full min-w-0 max-w-full items-center overflow-hidden rounded-full bg-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition focus-within:bg-white/85 [clip-path:inset(0_round_9999px)]";

const inputClass =
  "nav-search-input h-full min-h-0 w-full min-w-0 flex-1 border-0 bg-transparent pl-9 pr-3.5 text-sm font-semibold text-[#24321c] placeholder:text-[#24321c]/50 shadow-none outline-none [-webkit-appearance:none] appearance-none focus:outline-none focus:ring-0";

export function NavSearch({ className, variant = "desktop" }: Props) {
  const router = useRouter();
  const t = useTranslations("search");
  const [value, setValue] = useState("");
  const inputId = variant === "mobile" ? "nav-site-search-mobile" : "nav-site-search";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      className={`${capsuleShell} ${className ?? ""}`}
      role="search"
      aria-label={t("ariaLabel")}
      onSubmit={onSubmit}
    >
      <label htmlFor={inputId} className="sr-only">
        {t("srLabel")}
      </label>
      <Search
        aria-hidden
        strokeWidth={2}
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#24321c]/55"
      />
      <input
        id={inputId}
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("placeholder")}
        enterKeyHint="search"
        autoComplete="off"
        className={inputClass}
      />
    </form>
  );
}
