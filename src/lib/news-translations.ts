import type { AppLocale } from "@/i18n/routing";
import {
  isNewsTranslationLocale,
  NEWS_TRANSLATION_LOCALES,
  translateNewsFields,
  type NewsSourceForTranslation,
  type NewsTranslationLocale,
} from "@/lib/news-translate";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { getSupabaseAdmin } from "@/lib/supabase";

export type NewsTranslationRow = {
  id: string;
  newsId: string;
  locale: string;
  title: string;
  excerpt: string | null;
  content: string;
};

export type NewsWithText = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
};

export async function fetchTranslationMap(
  newsIds: string[],
  locale: AppLocale
): Promise<Map<string, NewsTranslationRow>> {
  const map = new Map<string, NewsTranslationRow>();
  if (!isNewsTranslationLocale(locale) || newsIds.length === 0) return map;

  const supabase = getSupabaseAdmin();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("NewsTranslation")
    .select("id,newsId,locale,title,excerpt,content")
    .in("newsId", newsIds)
    .eq("locale", locale);

  if (error) {
    console.error("[fetchTranslationMap]", error.message);
    return map;
  }

  for (const row of data ?? []) {
    map.set((row as NewsTranslationRow).newsId, row as NewsTranslationRow);
  }
  return map;
}

export function applyTranslationToNews<T extends NewsWithText>(
  article: T,
  translation: NewsTranslationRow | undefined
): T {
  if (!translation) return article;
  return {
    ...article,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
  };
}

export async function applyTranslationsToNewsList<T extends NewsWithText>(
  articles: T[],
  locale: AppLocale
): Promise<T[]> {
  if (!isNewsTranslationLocale(locale) || articles.length === 0) return articles;

  const map = await fetchTranslationMap(
    articles.map((a) => a.id),
    locale
  );

  return articles.map((article) => applyTranslationToNews(article, map.get(article.id)));
}

async function upsertTranslation(
  newsId: string,
  locale: NewsTranslationLocale,
  fields: { title: string; excerpt: string | null; content: string }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  let sanitizedContent: string;
  try {
    sanitizedContent = sanitizeNewsContent(fields.content);
  } catch (e) {
    console.error("[upsertTranslation] sanitize", e);
    sanitizedContent = fields.content;
  }

  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("NewsTranslation")
    .select("id")
    .eq("newsId", newsId)
    .eq("locale", locale)
    .maybeSingle();

  const existingId = (existing as { id?: string } | null)?.id;
  const { error } = await supabase.from("NewsTranslation").upsert(
    {
      id: existingId ?? crypto.randomUUID(),
      newsId,
      locale,
      title: fields.title.trim(),
      excerpt: fields.excerpt?.trim() ? fields.excerpt.trim() : null,
      content: sanitizedContent,
      ...(existingId ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { onConflict: "newsId,locale" }
  );

  if (error) {
    console.error(`[upsertTranslation] ${locale}`, error.message);
  }
}

/**
 * Genera y persiste traducciones en/pt para una noticia publicada.
 * No lanza: los errores se registran para no bloquear el publish.
 */
export async function generateAndStoreNewsTranslations(
  newsId: string,
  source: NewsSourceForTranslation
): Promise<void> {
  for (const locale of NEWS_TRANSLATION_LOCALES) {
    try {
      const translated = await translateNewsFields(source, locale);
      await upsertTranslation(newsId, locale, translated);
    } catch (e) {
      console.error(`[generateAndStoreNewsTranslations] ${locale}`, e);
    }
  }
}
