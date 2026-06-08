import { auth } from "@/lib/auth";
import {
  EMPADRONADOS_COLUMNS,
  buildXlsxBuffer,
  fetchEmpadronadosRows,
} from "@/lib/admin-exports";
import { EMPADRONAMIENTO_SEASON_YEAR } from "@/lib/empadronamiento-menores/constants";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const rows = await fetchEmpadronadosRows();
  const buffer = await buildXlsxBuffer(
    `Empadronados ${EMPADRONAMIENTO_SEASON_YEAR}`,
    EMPADRONADOS_COLUMNS,
    rows
  );

  const filename = `empadronados-${EMPADRONAMIENTO_SEASON_YEAR}.xlsx`;
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
