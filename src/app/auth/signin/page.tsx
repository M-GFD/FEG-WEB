"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FegLogo } from "@/components/layout/FegLogo";
import { resendVerification } from "@/app/auth/verify-email/actions";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/gestion";
  const registered = searchParams.get("registered") === "1";
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth.signIn");
  const tCommon = useTranslations("common");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email?.trim()) {
      setError(t("emailRequired"));
      return;
    }
    if (!password) {
      setError(t("passwordRequired"));
      return;
    }

    setBusy(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setError(t("emailNotVerified"));
          try {
            await resendVerification(email.trim().toLowerCase());
            setInfo(t("verificationResent"));
          } catch {
            setInfo(null);
            setError(t("verificationResendFailed"));
          }
          return;
        }
        setError(t("invalidCredentials"));
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo size="nav" className="h-16 object-center sm:h-[4.25rem]" />
        </div>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          {t("title")}
        </h1>

        {registered && (
          <p className="mb-4 mt-4 rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
            {t("registered")}
          </p>
        )}
        {verified && (
          <p className="mb-4 mt-4 rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
            {t("verified")}
          </p>
        )}
        {reset && (
          <p className="mb-4 mt-4 rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
            {t("resetSuccess")}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-busy={busy}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={busy}
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={tCommon("emailPlaceholder")}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
              {t("password")}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={busy}
                autoComplete="current-password"
                className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] py-2.5 pl-4 pr-12 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={tCommon("passwordPlaceholder")}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--feg-green)] outline-none transition hover:bg-[var(--feg-green)]/10 hover:text-[var(--feg-green-2)] focus-visible:ring-2 focus-visible:ring-[var(--feg-green-2)]/40 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
                ) : (
                  <Eye className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
                )}
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {info && (
            <p className="rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
              {info}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-sm text-[var(--feg-green)]">
          <Link href="/" className="font-medium underline-offset-2 hover:text-[var(--feg-ink)] hover:underline">
            {t("backToHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  const tCommon = useTranslations("common");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--feg-bg)] text-[var(--feg-green)]">
          {tCommon("loading")}
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
