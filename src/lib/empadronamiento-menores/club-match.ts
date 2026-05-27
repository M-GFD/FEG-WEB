import type { ClubCodeOption } from "./persistence";

/** Busca club en padrón FEG por nombre de la planilla de empadronamiento. */
export function matchEnrollmentClub(
  clubName: string,
  clubs: ClubCodeOption[]
): ClubCodeOption | null {
  const n = clubName.trim().toUpperCase();
  if (!n) return null;

  const exact = clubs.find((c) => c.name.trim().toUpperCase() === n);
  if (exact) return exact;

  const partial = clubs.find((c) => {
    const cn = c.name.trim().toUpperCase();
    return cn.includes(n) || n.includes(cn);
  });
  return partial ?? null;
}
