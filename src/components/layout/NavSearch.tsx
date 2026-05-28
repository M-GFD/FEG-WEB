"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type Props = {
  className?: string;
  /** En desktop va dentro de la cápsula; en móvil ocupa el ancho disponible. */
  variant?: "desktop" | "mobile";
};

const inputBase =
  "box-border h-9 w-full min-w-0 max-w-full shrink-0 rounded-full border-0 bg-transparent pl-9 pr-3.5 text-sm font-semibold text-[#24321c] placeholder:text-[#24321c]/50 shadow-none outline-none transition [-webkit-appearance:none] appearance-none focus:bg-white/40 focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden";

export function NavSearch({ className, variant = "desktop" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      className={`${className ?? ""} w-full min-w-0 max-w-full`}
      role="search"
      aria-label="Buscar en el sitio"
      onSubmit={onSubmit}
    >
      <label htmlFor="nav-site-search" className="sr-only">
        Buscar noticias, torneos, clubes y jugadores
      </label>
      <div className="relative w-full min-w-0 max-w-full">
        <Search
          aria-hidden
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#24321c]/55"
        />
        <input
          id="nav-site-search"
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar…"
          enterKeyHint="search"
          autoComplete="off"
          className={inputBase}
        />
      </div>
    </form>
  );
}
