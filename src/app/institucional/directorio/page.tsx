import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";

const MEMBER_KEYS = [
  { id: "president", imageSrc: "/feg%20image%20(1).webp" },
  { id: "vicePresident", imageSrc: "/feg%20image%20(2).webp" },
  { id: "treasury", imageSrc: "/feg%20image%20(3).webp" },
  { id: "secretary", imageSrc: "/feg%20image%20(4).webp" },
  { id: "press", imageSrc: "/feg%20image%20(6).webp" },
  { id: "commercial", imageSrc: "/feg%20image%20(5).webp" },
] as const;

export default async function DirectorioPage() {
  const t = await getTranslations("directory");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
              {t("badge")}
            </p>
            <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          <Link
            href="/institucional"
            className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
          >
            {t("backToAbout")}
          </Link>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBER_KEYS.map((m) => {
            const role = t(`members.${m.id}.role`);
            return (
              <article
                key={m.id}
                className="overflow-hidden rounded-3xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]"
              >
                <div className="relative h-44">
                  <Image
                    src={m.imageSrc}
                    alt={role}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    {role}
                  </p>
                  <h2 className="mt-2 font-heading text-xl font-semibold leading-snug text-[var(--feg-ink)]">
                    {t("placeholderName")}
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--feg-green)]">
                    {t(`members.${m.id}.summary`)}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
