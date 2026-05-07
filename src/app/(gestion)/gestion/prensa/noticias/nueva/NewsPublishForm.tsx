"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseApiJson } from "@/lib/parse-api-response";
import { slugifyTitle } from "@/lib/slugify";
import { publishNewsFromGestion } from "./actions";
import { NewsRichEditor } from "./NewsRichEditor";

const MAX_GALLERY = 15;

function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function NewsPublishForm() {
  const router = useRouter();
  const [formResetKey, setFormResetKey] = useState(0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifyPush, setNotifyPush] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/news/upload-image", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    const data = await parseApiJson<{ ok: boolean; url?: string; error?: string }>(res);
    if (!data.ok || !data.url) {
      throw new Error(data.error ?? "Error al subir imagen");
    }
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const bodyText = stripHtmlToText(contentHtml);
    if (!title.trim()) {
      setError("Completá el título.");
      return;
    }
    if (bodyText.length < 3) {
      setError("Escribí el cuerpo de la noticia (al menos un párrafo).");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (coverFile) {
        imageUrl = await uploadOne(coverFile);
      }

      const galleryUrls: string[] = [];
      for (const f of galleryFiles) {
        galleryUrls.push(await uploadOne(f));
      }

      const data = await publishNewsFromGestion({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || null,
        content: contentHtml,
        imageUrl: imageUrl ?? "",
        galleryUrls,
        notifyPush,
      });

      if (!data.ok) {
        const msg = [data.error, data.code ? `(${data.code})` : ""].filter(Boolean).join(" ");
        setError(msg || "No se pudo publicar");
        return;
      }

      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setExcerpt("");
      setContentHtml("<p></p>");
      setCoverFile(null);
      setGalleryFiles([]);
      setFormResetKey((k) => k + 1);
      setSuccess("Noticia publicada. El formulario quedó listo para otra.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]"
    >
      <div>
        <h1 className="font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Publicar noticia
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          La noticia quedará visible en Noticias al guardar. Podés insertar imágenes en el
          texto o sumar una galería al pie con varias fotos.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="news-title" className="text-sm font-medium text-[var(--feg-green)]">
          Título
        </label>
        <input
          id="news-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2 text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="news-slug" className="text-sm font-medium text-[var(--feg-green)]">
          URL (slug)
        </label>
        <input
          id="news-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="se-genera-del-titulo"
          className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2 font-mono text-sm text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
        />
        <p className="text-xs text-[var(--feg-green)]/80">
          Se arma desde el título si no lo editás. Si la URL ya existe, se añade un sufijo
          automático.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="news-excerpt" className="text-sm font-medium text-[var(--feg-green)]">
          Bajada / resumen (opcional)
        </label>
        <textarea
          id="news-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2 text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--feg-green)]">Portada (opcional)</span>
        <input
          key={`cover-${formResetKey}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[var(--feg-green)] file:mr-3 file:rounded-xl file:border-0 file:bg-[var(--feg-green-2)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-95"
        />
        <p className="text-xs text-[var(--feg-green)]/80">PNG, JPG o WebP, máx. 5 MB.</p>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--feg-green)]">
          Galería al pie (opcional)
        </span>
        <input
          key={`gallery-${formResetKey}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={(e) => {
            const list = e.target.files;
            if (!list?.length) {
              setGalleryFiles([]);
              return;
            }
            const arr = [...list];
            if (arr.length > MAX_GALLERY) {
              setError(`Máximo ${MAX_GALLERY} imágenes en la galería.`);
              e.target.value = "";
              setGalleryFiles([]);
              return;
            }
            setError(null);
            setGalleryFiles(arr);
          }}
          className="block w-full text-sm text-[var(--feg-green)] file:mr-3 file:rounded-xl file:border-0 file:bg-[var(--feg-green-2)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-95"
        />
        <p className="text-xs text-[var(--feg-green)]/80">
          Si subís más de una imagen, en la noticia se mostrarán como galería debajo del
          texto. Hasta {MAX_GALLERY} archivos.
        </p>
        {galleryFiles.length > 0 && (
          <p className="text-xs text-[var(--feg-green)]">
            {galleryFiles.length} archivo(s) seleccionado(s).
          </p>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--feg-green)]">Cuerpo de la noticia</span>
        <NewsRichEditor key={`editor-${formResetKey}`} onChange={setContentHtml} />
      </div>

      {success && (
        <p
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {success}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex max-w-prose cursor-pointer items-start gap-3 rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)]/80 px-4 py-3 text-sm text-[var(--feg-ink)] shadow-sm">
          <input
            type="checkbox"
            checked={notifyPush}
            onChange={(e) => setNotifyPush(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--feg-green)]/40 text-[var(--feg-green-2)] focus:ring-[var(--feg-green-2)]"
          />
          <span>
            <span className="font-medium text-[var(--feg-green)]">
              Enviar notificación push al publicar
            </span>
            <span className="mt-0.5 block text-[var(--feg-green)]/85">
              Si está marcado, los dispositivos con la PWA instalada y notificaciones permitidas recibirán un aviso con el
              enlace a la noticia.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[var(--feg-yellow)] px-6 py-2.5 font-heading text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95 disabled:opacity-50"
          >
            {submitting ? "Publicando…" : "Publicar noticia"}
          </button>
        </div>
      </div>
    </form>
  );
}
