import { auth } from "@/lib/auth";
import {
  INSCRIPTOS_COLUMNS,
  buildXlsxBuffer,
  fetchInscriptosRows,
} from "@/lib/admin-exports";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tournamentKey = searchParams.get("tournamentKey") ?? undefined;

  const rows = await fetchInscriptosRows(tournamentKey);
  const buffer = await buildXlsxBuffer("Inscriptos", INSCRIPTOS_COLUMNS, rows);

  const filename = tournamentKey
    ? `inscriptos-${tournamentKey}.xlsx`
    : "inscriptos-torneos.xlsx";
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
