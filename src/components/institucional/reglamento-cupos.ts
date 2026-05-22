export type CuposGroup = {
  aLabel: string;
  bLabel: string;
  title: string;
};

export type CuposRow = {
  fed: string;
  values: number[];
};

export const CUPOS_GROUPS: CuposGroup[] = [
  { title: "M18 - Varones", aLabel: "2008-2009", bLabel: "2010" },
  { title: "M18 - Mujeres", aLabel: "2008-2009", bLabel: "2010" },
  { title: "M15 - Varones", aLabel: "2011 y post.", bLabel: "TNJ" },
  { title: "M15 - Mujeres", aLabel: "2011 y post.", bLabel: "TNJ" },
];

const CUPOS_LINES: string[] = [
  "SUR 1 1 1 3 0 0 1 1 1 2 3 1 1",
  "MAR Y SIERRAS 2 1 2 5 0 0 1 1 2 1 3 2 1 3",
  "FENOBA 4 1 3 8 1 0 1 3 2 5 0 1 1",
  "NOROESTE 0 0 1 1 0 0 1 1 0 1 1 0 1 1",
  "NORDESTE 0 0 1 1 0 0 1 1 2 2 0 1 1",
  "CENTRO-CUYO 1 0 1 0 0 1 1 2 1 3 0 1 1",
  "CORDOBA 5 5 1 11 2 2 1 5 2 1 1 4 2 1 1 4",
  "METROPOLITANA 4 3 2 9 4 2 1 7 3 1 4 3 1 4",
  "LITORAL 0 0 1 1 0 0 1 1 0 1 1 0 1 1",
  "SUR DEL LITORAL 1 3 1 5 0 1 1 1 1 2 1 1 2",
  "Adicional Fed/Club sede 1 1 1 1",
  "SUB TOTALES 18 14 3 10 46 7 5 6 2 21 16 8 1 3 29 9 4 5 1 20",
];

function parseCuposLine(line: string): CuposRow {
  const parts = line.trim().split(/\s+/);
  const nums = parts.filter((p) => /^\d+$/.test(p)).map((p) => Number(p));
  const fed = parts.slice(0, parts.length - nums.length).join(" ");

  const out: number[] = [];
  let idx = 0;
  for (let g = 0; g < 4; g++) {
    const groupsLeft = 4 - (g + 1);
    const remaining = nums.length - idx;
    const minNeeded = groupsLeft * 3;

    let take = 3;
    if (remaining - 5 >= minNeeded) take = 5;
    else if (remaining - 4 >= minNeeded) take = 4;

    const chunk = nums.slice(idx, idx + take);
    idx += take;

    if (take === 5) {
      out.push(chunk[0] ?? 0, chunk[1] ?? 0, chunk[2] ?? 0, chunk[3] ?? 0, chunk[4] ?? 0);
    } else if (take === 4) {
      out.push(chunk[0] ?? 0, chunk[1] ?? 0, chunk[2] ?? 0, 0, chunk[3] ?? 0);
    } else {
      out.push(chunk[0] ?? 0, chunk[1] ?? 0, 0, 0, chunk[2] ?? 0);
    }
  }

  while (out.length < 20) out.push(0);
  return { fed, values: out.slice(0, 20) };
}

export const CUPOS_ROWS: CuposRow[] = CUPOS_LINES.map(parseCuposLine);
