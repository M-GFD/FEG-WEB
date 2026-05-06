import type { Category } from "@prisma/client";
import {
  courseHandicap18,
  playingHandicap18,
  type WhsTeeContext,
  NEUTRAL_TEE,
} from "./whs-handicap";

const HOLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;

export type { WhsTeeContext };

export type HoleScores = Record<number, number>;

export function parseHoleScores(formData: FormData): HoleScores {
  const scores: HoleScores = {};
  for (const h of HOLES) {
    const v = formData.get(`h${h}`);
    if (v !== null && v !== "") {
      const n = parseInt(String(v), 10);
      if (!Number.isNaN(n) && n >= 1 && n <= 15) scores[h] = n;
    }
  }
  return scores;
}

export function computeGross(scores: HoleScores): number | null {
  const vals = HOLES.map((h) => scores[h]).filter((v) => v != null);
  if (vals.length !== 18) return null;
  return vals.reduce((a, b) => a + b, 0);
}

/** Golpes que recibe el jugador en medal play (Playing Handicap 18 hoyos). */
export function strokesForMedalNet(
  category: Category,
  player: { handicap: number; handicapIndex?: number | null },
  tee: WhsTeeContext = NEUTRAL_TEE,
  playingAllowancePercent: number = 100
): number {
  const isScratch =
    category === "DAMAS_SCRATCH" || category === "CABALLEROS_SCRATCH";
  if (isScratch) return 0;
  const hi =
    typeof player.handicapIndex === "number" && !Number.isNaN(player.handicapIndex)
      ? player.handicapIndex
      : player.handicap;
  const ch = courseHandicap18(hi, tee);
  return playingHandicap18(ch, playingAllowancePercent);
}

/**
 * Neto stroke play (medal) según WHS: gross − Playing Handicap.
 * `handicapIndex` es el Handicap Index oficial cuando existe.
 */
export function computeNet(
  gross: number,
  category: Category,
  player: { handicap: number; handicapIndex?: number | null },
  tee: WhsTeeContext | null = null,
  playingAllowancePercent: number = 100
): number {
  const strokes = strokesForMedalNet(
    category,
    player,
    tee ?? NEUTRAL_TEE,
    playingAllowancePercent
  );
  return gross - strokes;
}

export function scorecardToDbFields(scores: HoleScores) {
  return {
    h1: scores[1] ?? null,
    h2: scores[2] ?? null,
    h3: scores[3] ?? null,
    h4: scores[4] ?? null,
    h5: scores[5] ?? null,
    h6: scores[6] ?? null,
    h7: scores[7] ?? null,
    h8: scores[8] ?? null,
    h9: scores[9] ?? null,
    h10: scores[10] ?? null,
    h11: scores[11] ?? null,
    h12: scores[12] ?? null,
    h13: scores[13] ?? null,
    h14: scores[14] ?? null,
    h15: scores[15] ?? null,
    h16: scores[16] ?? null,
    h17: scores[17] ?? null,
    h18: scores[18] ?? null,
    gross: computeGross(scores),
  };
}
