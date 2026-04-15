import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";

const CALENDARIO_2026 = [
  { num: "1°", fecha: "28 de marzo", sede: "Villa Elisa", modalidad: "18H Mayores" },
  { num: "2°", fecha: "25 de abril", sede: "Club Social La Paz", modalidad: "18H Mayores" },
  { num: "3°", fecha: "9 de mayo", sede: "Los Bretes", modalidad: "18H Mayores" },
  { num: "—", fecha: "15/16 de mayo", sede: "Interfederativo (cancha a des.)", modalidad: "36H Mayores" },
  { num: "4°", fecha: "30 de mayo", sede: "Villa Libertador", modalidad: "18H Mayores" },
  { num: "5°", fecha: "13 de junio", sede: "Las Colinas", modalidad: "18H Mayores" },
  { num: "6°", fecha: "4 de julio", sede: "CUCU", modalidad: "18H Mayores" },
  { num: "7°", fecha: "15 de agosto", sede: "Aero Club Villaguay", modalidad: "18H Mayores" },
  { num: "8°", fecha: "22 de agosto", sede: "Concordia Golf Club", modalidad: "18H Mayores" },
  { num: "9°", fecha: "5 de setiembre", sede: "Gualeguaychú", modalidad: "18H Mayores" },
  { num: "10°", fecha: "26 de setiembre", sede: "Santa Elena", modalidad: "18H Mayores" },
  { num: "11°", fecha: "24 de octubre", sede: "Colón Golf Club", modalidad: "18H Mayores" },
  { num: "12°", fecha: "14 de noviembre", sede: "CAE", modalidad: "18H Mayores" },
];

export default function CalendarioPage() {
  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Temporada 2026
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            Calendario Mayores
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--feg-green)]">
            Federación de Golf del Litoral · Golf Club Social La Paz
          </p>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)] text-white">
              <tr>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  N°
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Modalidad
                </th>
              </tr>
            </thead>
            <tbody>
              {CALENDARIO_2026.map((row, i) => {
                const isSpecial = row.num === "—";
                return (
                  <tr
                    key={i}
                    className={`border-t border-[var(--feg-green)]/10 transition hover:bg-[var(--feg-bg)]/80 ${
                      isSpecial ? "bg-[var(--feg-yellow)]/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-heading font-semibold text-[var(--feg-green-2)]">
                      {row.num}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                      {row.fecha}
                    </td>
                    <td className="px-4 py-3 text-[var(--feg-ink)]">
                      {row.sede}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isSpecial
                            ? "bg-[var(--feg-yellow)] text-[var(--feg-ink)]"
                            : "bg-[var(--feg-green-2)]/10 text-[var(--feg-green-2)]"
                        }`}
                      >
                        {row.modalidad}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
