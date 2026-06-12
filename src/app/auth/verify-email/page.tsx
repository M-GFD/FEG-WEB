"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { verifyEmail } from "./actions";
import { FegLogo } from "@/components/layout/FegLogo";

function VerifyEmailInner() {
  const sp = useSearchParams();
  const email = sp.get("email") ?? "";
  const token = sp.get("token") ?? "";
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const t = useTranslations("auth.verifyEmail");

  useEffect(() => {
    if (!email || !token) {
      setOk(false);
      setMsg(t("incompleteLink"));
      return;
    }
    let cancelled = false;
    void verifyEmail(email, token).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setOk(true);
        setMsg(t("success"));
      } else {
        setOk(false);
        if ("errorMessage" in r && r.errorMessage) {
          setMsg(r.errorMessage);
        } else {
          setMsg(t(`errors.${r.errorKey}` as "errors.invalidLink"));
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [email, token, t]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo size="nav" className="h-16 object-center sm:h-[4.25rem]" />
        </div>
        <h1 className="mt-4 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          {t("title")}
        </h1>
        {ok === null && <p className="mt-6 text-center text-sm text-[var(--feg-green)]">{t("verifying")}</p>}
        {ok !== null && msg && (
          <p
            className={`mt-6 text-center text-sm ${ok ? "text-[var(--feg-green-2)]" : "text-red-700"}`}
            role="status"
          >
            {msg}
          </p>
        )}
        <Link
          href="/auth/signin"
          className="mt-8 block w-full rounded-xl bg-[var(--feg-green-2)] py-3 text-center text-sm font-semibold text-white"
        >
          {t("goToSignIn")}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const tCommon = useTranslations("common");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--feg-bg)] text-sm text-[var(--feg-green)]">
          {tCommon("loading")}
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
