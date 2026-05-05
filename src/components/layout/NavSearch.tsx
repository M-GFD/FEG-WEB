"use client";

import { useState } from "react";

type Props = {
  className?: string;
};

/**
 * Campo de búsqueda UI (sin lógica de búsqueda aún).
 * Más adelante se conectará a noticias/torneos/clubes/jugadores.
 */
export function NavSearch({ className }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className={className} role="search" aria-label="Buscar en el sitio">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar…"
        className="h-9 w-44 rounded-full border border-[#123c15]/12 bg-white/55 px-4 text-sm font-semibold text-[#24321c] placeholder:text-[#24321c]/55 shadow-[0_0_10px_rgba(255,255,255,0.28),0_0_20px_rgba(255,255,255,0.14)] outline-none transition focus:bg-white/70 focus:shadow-[0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(255,255,255,0.18)] focus:ring-2 focus:ring-[var(--feg-green)]/25"
      />
    </div>
  );
}

