"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("auth.changePassword");

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await changePassword(formData);
    if (result.ok) {
      router.push("/gestion");
      router.refresh();
    } else {
      if ("errorMessage" in result && result.errorMessage) {
        setError(result.errorMessage);
      } else if (result.errorKey === "error") {
        setError(t("error"));
      } else {
        setError(t(`errors.${result.errorKey}` as "errors.invalidData"));
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--feg-green-2)]">
          {t("badge")}
        </p>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          {t("title")}
        </h1>
        <p className="mb-6 mt-3 text-center text-sm text-[var(--feg-green)]">{t("subtitle")}</p>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
              {t("newPassword")}
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder={t("passwordMinPlaceholder")}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              {t("confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder={t("confirmPasswordPlaceholder")}
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
