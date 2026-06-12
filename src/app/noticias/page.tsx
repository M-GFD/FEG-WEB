import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getNews } from "@/lib/data";
import { formatNewsDateParts } from "@/lib/news-dates";
import { getGolfPlaceholder } from "@/lib/placeholders";
import { parseAudienceSegment } from "@/lib/content-audience";

const longDate = { day: "numeric" as const, month: "long" as const, year: "numeric" as const };

type Props = {
  searchParams: Promise<{ audiencia?: string | string[] }>;
};

export default async function NoticiasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const segment = parseAudienceSegment(sp.audiencia);
  const news = await getNews({ audience: segment });
  const [featured, ...rest] = news;
  const featuredWhen = featured
    ? formatNewsDateParts(featured.publishedAt, featured.createdAt, longDate)
    : null;

  const t = await getTranslations("news");
  const tAudience = await getTranslations("audience");
  const segmentLabel = segment ? tAudience(segment) : null;
  const segmentLabelLower = segmentLabel?.toLowerCase() ?? "";

  const pageTitle = segment
    ? t("titleWithAudience", { audience: segmentLabel! })
    : t("title");
  const emptyMessage = segment
    ? t("emptyForAudience", { audience: segmentLabelLower })
    : t("empty");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            {segment
              ? t("badgeWithAudience", { audience: segmentLabel! })
              : t("badge")}
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            {pageTitle}
          </h1>
          {segment ? (
            <p className="mt-3 max-w-2xl text-sm text-[var(--feg-green)]">
              {t("segmentDescription", { audience: segmentLabelLower })}
            </p>
          ) : null}
        </header>

        {news.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-10">
            {featured && featuredWhen && (
              <article className="overflow-hidden rounded-3xl border border-[var(--feg-green)]/12 bg-white shadow-[0_20px_60px_rgba(0,36,3,0.12)] transition hover:shadow-[0_24px_70px_rgba(0,36,3,0.16)]">
                <Link href={`/noticias/${featured.slug}`} className="block">
                  <div className="relative h-64 w-full md:h-80">
                    <Image
                      src={featured.imageUrl || getGolfPlaceholder(0, "large")}
                      alt={featured.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1024px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--feg-ink)]/85 via-[var(--feg-ink)]/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                      <time
                        dateTime={featuredWhen.dateTime}
                        className="text-xs font-semibold uppercase tracking-[0.15em] text-white/85"
                      >
                        {featuredWhen.label}
                      </time>
                      <h2 className="mt-2 font-heading text-2xl font-semibold uppercase leading-tight tracking-tight md:text-3xl">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-white/90 md:text-base">
                          {featured.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((n, i) => {
                  const rowWhen = formatNewsDateParts(n.publishedAt, n.createdAt);
                  return (
                    <article
                      key={n.id}
                      className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)] transition hover:border-[var(--feg-green-2)]/30 hover:shadow-[0_18px_48px_rgba(0,36,3,0.12)]"
                    >
                      <Link href={`/noticias/${n.slug}`} className="block">
                        <div className="relative h-44 w-full">
                          <Image
                            src={n.imageUrl || getGolfPlaceholder(i + 1, "regular")}
                            alt={n.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-5">
                          <time
                            dateTime={rowWhen.dateTime}
                            className="text-xs font-semibold uppercase tracking-wide text-[var(--feg-green-2)]/80"
                          >
                            {rowWhen.label}
                          </time>
                          <h3 className="mt-2 font-heading text-lg font-semibold uppercase leading-snug tracking-tight text-[var(--feg-ink)] line-clamp-2">
                            {n.title}
                          </h3>
                          {n.excerpt && (
                            <p className="mt-2 text-sm leading-relaxed text-[var(--feg-green)] line-clamp-2">
                              {n.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
