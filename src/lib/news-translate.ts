import translate from "google-translate-api-x";
import type { AppLocale } from "@/i18n/routing";

export const NEWS_TRANSLATION_LOCALES = ["en", "pt"] as const;
export type NewsTranslationLocale = (typeof NEWS_TRANSLATION_LOCALES)[number];

const GOOGLE_LANG: Record<NewsTranslationLocale, string> = {
  en: "en",
  pt: "pt",
};

const CHUNK_SIZE = 4000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateText(text: string, locale: NewsTranslationLocale): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const result = await translate(trimmed, {
    from: "es",
    to: GOOGLE_LANG[locale],
    autoCorrect: false,
  });

  return typeof result.text === "string" ? result.text : trimmed;
}

/** Traduce HTML preservando etiquetas; trocea por párrafos si supera el límite. */
export async function translateNewsHtml(
  html: string,
  locale: NewsTranslationLocale
): Promise<string> {
  if (!html.trim()) return html;
  if (html.length <= CHUNK_SIZE) {
    const result = await translate(html, {
      from: "es",
      to: GOOGLE_LANG[locale],
      autoCorrect: false,
    });
    return typeof result.text === "string" ? result.text : html;
  }

  const parts = html.split(/(?=<\/p>)/i);
  const chunks: string[] = [];
  let buffer = "";

  for (const part of parts) {
    if (!part) continue;
    if ((buffer + part).length > CHUNK_SIZE && buffer) {
      chunks.push(buffer);
      buffer = part;
    } else {
      buffer += part;
    }
  }
  if (buffer) chunks.push(buffer);

  const translated: string[] = [];
  for (const chunk of chunks) {
    const result = await translate(chunk, {
      from: "es",
      to: GOOGLE_LANG[locale],
      autoCorrect: false,
    });
    translated.push(typeof result.text === "string" ? result.text : chunk);
    await sleep(250);
  }

  return translated.join("");
}

export type NewsSourceForTranslation = {
  title: string;
  excerpt: string | null;
  content: string;
};

export type TranslatedNewsFields = {
  title: string;
  excerpt: string | null;
  content: string;
};

export async function translateNewsFields(
  source: NewsSourceForTranslation,
  locale: NewsTranslationLocale
): Promise<TranslatedNewsFields> {
  const title = await translateText(source.title, locale);
  await sleep(200);

  const excerpt = source.excerpt?.trim()
    ? await translateText(source.excerpt, locale)
    : null;
  await sleep(200);

  const content = await translateNewsHtml(source.content, locale);

  return { title, excerpt, content };
}

export function isNewsTranslationLocale(locale: AppLocale): locale is NewsTranslationLocale {
  return locale === "en" || locale === "pt";
}
