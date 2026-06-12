"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signUp, getClubsForSignup } from "./actions";
import { FegLogo } from "@/components/layout/FegLogo";
import { useSession } from "next-auth/react";

const ROLE_KEYS = ["ADMIN", "CLUB", "PRESS", "DIRECTOR", "TREASURER"] as const;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { status, data: session } = useSession();
  const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";
  const t = useTranslations("auth.signUp");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/auth/unauthorized");
      return;
    }
    getClubsForSignup().then(setClubs);
  }, [isAdmin, router, status]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await signUp(formData);
    if (result.ok) {
      router.push("/auth/signin?registered=1");
    } else {
      const key = result.errorKey;
      if (key === "registerError" && "errorMessage" in result && result.errorMessage) {
        setError(result.errorMessage);
      } else {
        setError(t(`errors.${key}` as "errors.unauthorized"));
      }
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
        {status === "loading" ? (
          <p className="mt-4 text-center text-sm text-[var(--feg-green)]">{tCommon("loading")}</p>
        ) : !isAdmin ? (
          <p className="mt-4 text-center text-sm text-[var(--feg-green)]">{t("notAuthorized")}</p>
        ) : (
          <div className="mt-6">
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                  {t("accountType")}
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
                >
                  <option value="">{t("selectAccountType")}</option>
                  {ROLE_KEYS.map((value) => (
                    <option key={value} value={value}>
                      {t(`roles.${value}`)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole === "CLUB" && (
                <div>
                  <label htmlFor="clubId" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                    {t("club")}
                  </label>
                  <select
                    id="clubId"
                    name="clubId"
                    required={selectedRole === "CLUB"}
                    className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
                  >
                    <option value="">{t("selectClub")}</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {clubs.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">{t("noClubs")}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                  {tCommon("email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
                  placeholder={tCommon("emailPlaceholder")}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                  {tCommon("password")}
                </label>
                <input
                  id="password"
                  name="password"
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
            <p className="mt-4 text-center text-sm text-[var(--feg-green)]">
              <Link
                href="/auth/signin"
                className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                {t("backToSignIn")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
