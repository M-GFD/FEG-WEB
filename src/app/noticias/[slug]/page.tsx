import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getNewsBySlug } from "@/lib/data";
import { formatNewsDateParts } from "@/lib/news-dates";
import { NewsGallery } from "@/components/news/NewsGallery";
import { parseNewsGalleryUrls } from "@/lib/news-gallery";
import { getGolfPlaceholder } from "@/lib/placeholders";

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const news = await getNewsBySlug(slug, locale);

  if (!news) notFound();

  const t = await getTranslations("news");
  const gallery = parseNewsGalleryUrls(news.galleryUrls);
  const when = formatNewsDateParts(news.publishedAt, news.createdAt, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-20 pt-8 lg:px-8">
        <BackToHome />
        <Link
          href="/noticias"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--feg-green)]/20 bg-white px-4 py-2 text-sm font-medium text-[var(--feg-green-2)] shadow-sm transition hover:border-[var(--feg-green-2)]/40 hover:bg-[var(--feg-yellow)]/15"
        >
          {t("backToNews")}
        </Link>
        <article className="rounded-3xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_20px_60px_rgba(0,36,3,0.08)] sm:p-8 md:p-10">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--feg-green)]/10">
            <Image
              src={news.imageUrl || getGolfPlaceholder(0, "large")}
              alt={news.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
          <time
            dateTime={when.dateTime}
            className="mt-8 block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--feg-green-2)]"
          >
            {when.label}
          </time>
          <h1 className="mt-3 font-heading text-3xl font-semibold uppercase leading-tight tracking-tight md:text-4xl">
            {news.title}
          </h1>
          {news.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-[var(--feg-green)]">{news.excerpt}</p>
          )}
          <div
            className="prose prose-lg mt-8 max-w-none text-[var(--feg-green)] prose-headings:font-heading prose-headings:text-[var(--feg-ink)] prose-a:text-[var(--feg-green-2)] prose-strong:text-[var(--feg-ink)] prose-blockquote:border-[var(--feg-yellow)]"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {gallery.length > 0 && <NewsGallery images={gallery} title={news.title} />}
        </article>
      </main>
    </div>
  );
}
