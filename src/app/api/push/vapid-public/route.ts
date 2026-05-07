import { NextResponse } from "next/server";
import { getWebPushVapidPublicKey } from "@/lib/web-push-vapid";

/** Expone la clave VAPID pública en runtime (no es secreta). Evita redeploy solo por NEXT_PUBLIC_. */
export async function GET() {
  const publicKey = getWebPushVapidPublicKey();
  return NextResponse.json({ publicKey: publicKey || null });
}
