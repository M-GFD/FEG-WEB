import { NextResponse } from "next/server";
import { getWebPushVapidPublicKey } from "@/lib/web-push-vapid";

export const dynamic = "force-dynamic";

/** Expone la clave VAPID pública en runtime (no es secreta). Evita redeploy solo por NEXT_PUBLIC_. */
export async function GET() {
  const publicKey = getWebPushVapidPublicKey();
  const res = NextResponse.json({ publicKey: publicKey || null });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
