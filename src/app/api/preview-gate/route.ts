import { NextResponse } from "next/server";

function isGateEnabled() {
  const v = process.env.PREVIEW_GATE_ENABLED;
  return v === "true" || v === "1";
}

function expectedPassword() {
  return process.env.PREVIEW_GATE_PASSWORD ?? "Abcd1234";
}

/** Entrada temporal al sitio en fase de desarrollo (contraseña + cookie). */
export async function POST(req: Request) {
  if (!isGateEnabled()) {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (password !== expectedPassword()) {
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
    maxAge: 60 * 60 * 24 * 90, // 90 días
  });
  return res;
}
