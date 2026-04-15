"use client";

import { useState } from "react";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  date: string;
  club: { name: string };
  status: string;
};

export function UpcomingTournamentsTabs({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const selected = tournaments[activeIdx] ?? tournaments[0];

  if (tournaments.length === 0) {
    return (
      <section className="bg-[#0b0f0b]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <h3 className="font-heading text-3xl font-semibold tracking-tight text-white">
            PRÓXIMOS TORNEOS
          </h3>
          <p className="mt-4 text-white/60">
            No hay torneos próximos en este momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#0b0f0b]">
      <div className="mx-auto max-w-7xl px-0 lg:px-0">
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="bg-[#0b2b12] px-6 py-10 text-white lg:col-span-4 lg:rounded-tr-[22px] lg:rounded-br-[22px] lg:px-8">
            <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              PRÓXIMOS TORNEOS
            </h3>

            <div className="mt-8 space-y-1">
              {tournaments.map((t, i) => {
                const active = i === activeIdx;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`w-full rounded-xl px-4 py-4 text-left transition ${
                      active
                        ? "bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                        : "hover:bg-white/6"
                    }`}
                  >
                    <p
                      className={`font-heading text-lg font-semibold ${
                        active ? "text-[#dbf3db]" : "text-white/70"
                      }`}
                    >
                      {new Date(t.date).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      — {t.club.name}
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        active ? "text-[var(--feg-yellow)]" : "text-white/40"
                      }`}
                    >
                      {t.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#0b0f0b] px-6 py-10 lg:col-span-8 lg:px-12 lg:py-14">
            {selected && (
              <div className="w-full max-w-lg space-y-6 text-center">
                <div className="inline-flex rounded-full bg-[var(--feg-yellow)] px-5 py-2 font-heading text-sm font-semibold text-[#193f2b] shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
                  {selected.name}
                </div>
                <div className="space-y-2">
                  <p className="font-heading text-3xl font-semibold text-white sm:text-4xl">
                    {new Date(selected.date).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-lg font-medium text-[#dbf3db]">
                    {selected.club.name}
                  </p>
                </div>
                <p className="text-sm text-white/50">
                  Estado:{" "}
                  <span className="text-white/80">
                    {selected.status === "PUBLISHED"
                      ? "Publicado"
                      : selected.status === "DRAFT"
                        ? "Borrador"
                        : "Pendiente"}
                  </span>
                </p>
                <a
                  href={`/torneos/${selected.slug}`}
                  className="mt-2 inline-flex rounded-full bg-[#e7f4e7] px-6 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:brightness-95"
                >
                  Ver torneo →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
