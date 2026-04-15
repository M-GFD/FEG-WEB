import type { Category } from "@prisma/client";

type Entry = {
  id: string;
  category: Category;
  player: { firstName: string; lastName: string; handicap: number };
  scorecard: {
    gross: number | null;
    net: number | null;
    position: number | null;
  } | null;
};

function byCategory(entries: Entry[]) {
  const map = new Map<Category, Entry[]>();
  for (const e of entries) {
    const list = map.get(e.category) ?? [];
    list.push(e);
    map.set(e.category, list);
  }
  for (const [, list] of map) {
    const isScratch =
      list[0]?.category === "DAMAS_SCRATCH" ||
      list[0]?.category === "CABALLEROS_SCRATCH";
    list.sort((a, b) => {
      const ga = a.scorecard?.gross ?? 999;
      const gb = b.scorecard?.gross ?? 999;
      if (isScratch) return ga - gb;
      const na = a.scorecard?.net ?? 999;
      const nb = b.scorecard?.net ?? 999;
      return na - nb;
    });
  }
  return map;
}

export function PreviewSection({
  entries,
}: {
  entries: Entry[];
}) {
  const byCat = byCategory(entries);

  return (
    <div className="space-y-6">
      {Array.from(byCat.entries()).map(([cat, list]) => (
        <div
          key={cat}
          className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm"
        >
          <h3 className="border-b border-[var(--feg-green)]/12 bg-[var(--feg-bg)] px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
            {cat.replace(/_/g, " ")}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--feg-green)]/12 bg-[var(--feg-bg)]">
                <th className="px-4 py-2 text-left font-medium text-[var(--feg-green-2)]">Pos</th>
                <th className="px-4 py-2 text-left font-medium text-[var(--feg-green-2)]">Jugador</th>
                <th className="px-4 py-2 text-left font-medium text-[var(--feg-green-2)]">Gross</th>
                <th className="px-4 py-2 text-left font-medium text-[var(--feg-green-2)]">Neto</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e, i) => (
                <tr key={e.id} className="border-b border-[var(--feg-green)]/10">
                  <td className="px-4 py-2 text-[var(--feg-ink)]">{i + 1}</td>
                  <td className="px-4 py-2 text-[var(--feg-ink)]">
                    {e.player.firstName} {e.player.lastName}
                  </td>
                  <td className="px-4 py-2 text-[var(--feg-green)]">{e.scorecard?.gross ?? "-"}</td>
                  <td className="px-4 py-2 text-[var(--feg-green)]">{e.scorecard?.net ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
