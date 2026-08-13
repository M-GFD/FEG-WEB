import { NextResponse } from "next/server";
import {
  revalidateYouthSignupPaths,
  syncYouthTournamentSignupFromCalendar,
} from "@/lib/inscripcion-torneos-menores/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const result = await syncYouthTournamentSignupFromCalendar();
  if (result.created.length > 0 || result.closed.length > 0 || result.active) {
    revalidateYouthSignupPaths();
  }

  return NextResponse.json({ ok: true, ...result });
}
