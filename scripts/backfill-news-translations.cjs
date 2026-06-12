/**
 * Genera traducciones en/pt para noticias publicadas que aún no las tienen.
 *
 * Uso (PowerShell, desde la raíz del repo):
 *   node scripts/backfill-news-translations.cjs
 *   node scripts/backfill-news-translations.cjs --limit=5
 */
try {
  require("dotenv").config({ path: ".env.local" });
} catch {
  /* dotenv opcional */
}
try {
  require("dotenv").config({ path: ".env" });
} catch {
  /* dotenv opcional */
}

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const translate = require("google-translate-api-x");

const MIGRATION_SQL = path.join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  "20260612_news_translations",
  "migration.sql"
);

const TARGET_LOCALES = ["en", "pt"];
const CHUNK_SIZE = 4000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseLimit() {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  if (!arg) return null;
  const n = parseInt(arg.split("=")[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function translateText(text, locale) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return text;
  const result = await translate(trimmed, { from: "es", to: locale, autoCorrect: false });
  return result.text || trimmed;
}

async function translateHtml(html, locale) {
  if (!html || html.length <= CHUNK_SIZE) {
    const result = await translate(html || "", { from: "es", to: locale, autoCorrect: false });
    return result.text || html;
  }
  const parts = html.split(/(?=<\/p>)/i);
  const chunks = [];
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

  const out = [];
  for (const chunk of chunks) {
    const result = await translate(chunk, { from: "es", to: locale, autoCorrect: false });
    out.push(result.text || chunk);
    await sleep(250);
  }
  return out.join("");
}

async function translateFields(source, locale) {
  const title = await translateText(source.title, locale);
  await sleep(200);
  const excerpt = source.excerpt ? await translateText(source.excerpt, locale) : null;
  await sleep(200);
  const content = await translateHtml(source.content, locale);
  return { title, excerpt, content };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { error: tableProbe } = await supabase.from("NewsTranslation").select("id").limit(1);
  if (tableProbe?.message?.includes("schema cache") || tableProbe?.code === "PGRST205") {
    console.error("\nLa tabla NewsTranslation no existe en Supabase.");
    console.error("Ejecutá este SQL en Supabase → SQL Editor y volvé a correr el script:\n");
    if (fs.existsSync(MIGRATION_SQL)) {
      console.error(fs.readFileSync(MIGRATION_SQL, "utf8"));
    } else {
      console.error(MIGRATION_SQL);
    }
    process.exit(1);
  }

  const limit = parseLimit();

  let query = supabase
    .from("News")
    .select("id,title,excerpt,content")
    .eq("published", true)
    .order("publishedAt", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data: articles, error } = await query;
  if (error) {
    console.error("Error al listar noticias:", error.message);
    process.exit(1);
  }

  let processed = 0;
  let skipped = 0;

  for (const article of articles ?? []) {
    const { data: existing } = await supabase
      .from("NewsTranslation")
      .select("locale")
      .eq("newsId", article.id);

    const have = new Set((existing ?? []).map((r) => r.locale));
    const missing = TARGET_LOCALES.filter((l) => !have.has(l));

    if (missing.length === 0) {
      skipped += 1;
      continue;
    }

    console.log(`Traduciendo noticia ${article.id} → [${missing.join(", ")}]`);

    for (const locale of missing) {
      try {
        const fields = await translateFields(article, locale);
        const now = new Date().toISOString();
        const { error: upErr } = await supabase.from("NewsTranslation").upsert(
          {
            id: crypto.randomUUID(),
            newsId: article.id,
            locale,
            title: fields.title.trim(),
            excerpt: fields.excerpt?.trim() ? fields.excerpt.trim() : null,
            content: fields.content,
            createdAt: now,
            updatedAt: now,
          },
          { onConflict: "newsId,locale" }
        );
        if (upErr) {
          if (upErr.message?.includes("schema cache") || upErr.code === "PGRST205") {
            console.error(`  ${locale}: tabla NewsTranslation inexistente (ver instrucciones arriba).`);
            process.exit(1);
          }
          console.error(`  ${locale}:`, upErr.message);
        } else {
          console.log(`  ${locale}: OK`);
        }
      } catch (e) {
        console.error(`  ${locale}:`, e);
      }
    }

    processed += 1;
  }

  console.log(`Listo. Procesadas: ${processed}, omitidas (ya traducidas): ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
