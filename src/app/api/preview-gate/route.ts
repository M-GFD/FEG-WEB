import { NextResponse } from "next/server";
import { previewGateBodySchema } from "@/lib/api-input-schemas";
import { PUBLIC_ERROR_VALIDATION } from "@/lib/public-api-error";

function isGateEnabled() {
  const v = process.env.PREVIEW_GATE_ENABLED;
  return v === "true" || v === "1";
}

function expectedPassword(): string | null {
  const p = process.env.PREVIEW_GATE_PASSWORD?.trim();
  return p && p.length > 0 ? p : null;
}

/** Entrada temporal al sitio en fase de desarrollo (contraseña + cookie). */
export async function POST(req: Request) {
  if (!isGateEnabled()) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 503 });
  }

  const expected = expectedPassword();
  if (!expected) {
    console.error("[preview-gate] PREVIEW_GATE_ENABLED sin PREVIEW_GATE_PASSWORD");
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: PUBLIC_ERROR_VALIDATION }, { status: 400 });
  }

  const parsed = previewGateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: PUBLIC_ERROR_VALIDATION }, { status: 400 });
  }

  if (parsed.data.password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "feg_preview_ok",
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
