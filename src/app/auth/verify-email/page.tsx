"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "./actions";
import { FegLogo } from "@/components/layout/FegLogo";

function VerifyEmailInner() {
  const sp = useSearchParams();
  const email = sp.get("email") ?? "";
  const token = sp.get("token") ?? "";

  const [state, setState] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!email || !token) {
        setState("error");
        setMessage("El enlace no es válido.");
        return;
      }
      const res = await verifyEmail(email, token);
      if (!alive) return;
      if (res.ok) {
        setState("ok");
        setMessage("Email verificado. Ya podés iniciar sesión.");
      } else {
        setState("error");
        setMessage(res.error || "No se pudo verificar el email.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [email, token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo size="nav" className="h-16 object-center sm:h-[4.25rem]" />
        </div>

        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Verificación
        </h1>

        <div
          className={
            "mt-6 rounded-xl p-4 text-sm " +
            (state === "ok"
              ? "bg-[var(--feg-green-2)]/10 text-[var(--feg-green-2)]"
              : state === "error"
                ? "bg-red-50 text-red-700"
                : "bg-[var(--feg-bg)] text-[var(--feg-green)]")
          }
        >
          {state === "idle" ? "Verificando…" : message}
        </div>

        <div className="mt-4 text-center text-sm text-[var(--feg-green)]">
          <Link
            href={state === "ok" ? "/auth/signin?verified=1" : "/auth/signin"}
            className="font-medium underline-offset-2 hover:text-[var(--feg-ink)] hover:underline"
          >
            Ir a iniciar sesión →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--feg-bg)] text-[var(--feg-green)]">
          Cargando…
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}

