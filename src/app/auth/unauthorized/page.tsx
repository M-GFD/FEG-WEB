import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function UnauthorizedPage() {
  const t = await getTranslations("auth.unauthorized");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="max-w-md rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <h1 className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-[var(--feg-green)]">{t("body")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/gestion"
            className="rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {t("goToPanel")}
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--feg-ink)] transition hover:border-[var(--feg-green-2)]/40"
          >
            {t("publicSite")}
          </Link>
        </div>
      </div>
    </div>
  );
}
