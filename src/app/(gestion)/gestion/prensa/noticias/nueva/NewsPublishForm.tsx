"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { parseApiJson } from "@/lib/parse-api-response";
import { slugifyTitle } from "@/lib/slugify";
import { publishNewsFromGestion, updateNewsFromGestion } from "./actions";
import { NewsRichEditor } from "./NewsRichEditor";
import { ContentAudienceField } from "@/components/forms/ContentAudienceField";
import type { ContentAudience } from "@/lib/content-audience";

const MAX_GALLERY = 15;

function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export type NewsFormInitial = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  galleryUrls: string[];
  audience: ContentAudience;
};

export function NewsPublishForm({ initial }: { initial?: NewsFormInitial }) {
  const isEdit = Boolean(initial?.id);
  const router = useRouter();
  const [formResetKey, setFormResetKey] = useState(0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(initial?.content ?? "<p></p>");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(
    initial?.imageUrl ?? null
  );
  const [removeCover, setRemoveCover] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(
    initial?.galleryUrls ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifyPush, setNotifyPush] = useState(false);
  const [audience, setAudience] = useState<ContentAudience>(initial?.audience ?? "GENERAL");

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
      let imageUrl = "";
      if (coverFile) {
        imageUrl = await uploadOne(coverFile);
      } else if (!removeCover && existingCoverUrl) {
        imageUrl = existingCoverUrl;
      }

      let galleryUrls: string[] = existingGalleryUrls;
      if (galleryFiles.length > 0) {
        galleryUrls = [];
        for (const f of galleryFiles) {
          galleryUrls.push(await uploadOne(f));
        }
      }

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || null,
        content: contentHtml,
        imageUrl,
        galleryUrls,
        audience,
        notifyPush,
      };

      const data = isEdit
        ? await updateNewsFromGestion(initial!.id, payload)
        : await publishNewsFromGestion(payload);

      if (!data.ok) {
        const msg = [data.error, data.code ? `(${data.code})` : ""].filter(Boolean).join(" ");
        setError(msg || (isEdit ? "No se pudo guardar" : "No se pudo publicar"));
        return;
      }

      if (isEdit) {
        setSuccess("Cambios guardados. La noticia ya refleja la edición en el sitio.");
        setCoverFile(null);
        setGalleryFiles([]);
        setRemoveCover(false);
        if (imageUrl) setExistingCoverUrl(imageUrl);
        else setExistingCoverUrl(null);
        setExistingGalleryUrls(galleryUrls);
        setFormResetKey((k) => k + 1);
        router.refresh();
        return;
      }

      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setExcerpt("");
      setContentHtml("<p></p>");
      setCoverFile(null);
      setExistingCoverUrl(null);
      setRemoveCover(false);
      setGalleryFiles([]);
      setExistingGalleryUrls([]);
      setAudience("GENERAL");
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
          {isEdit ? "Editar noticia" : "Publicar noticia"}
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          {isEdit
            ? "Los cambios se verán en Noticias al guardar. La fecha de publicación original se mantiene."
            : "La noticia quedará visible en Noticias al guardar. Podés insertar imágenes en el texto o sumar una galería al pie con varias fotos."}
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
        {isEdit && existingCoverUrl && !removeCover && !coverFile && (
          <div className="flex flex-wrap items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingCoverUrl}
              alt=""
              className="h-28 w-auto max-w-full rounded-lg border border-[var(--feg-green)]/15 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setRemoveCover(true);
                setExistingCoverUrl(null);
              }}
              className="text-sm font-medium text-red-700 underline-offset-2 hover:underline"
            >
              Quitar portada
            </button>
          </div>
        )}
        <input
          key={`cover-${formResetKey}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            setCoverFile(e.target.files?.[0] ?? null);
            if (e.target.files?.[0]) setRemoveCover(false);
          }}
          className="block w-full text-sm text-[var(--feg-green)] file:mr-3 file:rounded-xl file:border-0 file:bg-[var(--feg-green-2)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-95"
        />
        <p className="text-xs text-[var(--feg-green)]/80">
          PNG, JPG o WebP, máx. 5 MB.
          {isEdit ? " Si elegís un archivo nuevo, reemplaza la portada actual." : ""}
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--feg-green)]">
          Galería al pie (opcional)
        </span>
        {isEdit && existingGalleryUrls.length > 0 && galleryFiles.length === 0 && (
          <p className="text-xs text-[var(--feg-green)]">
            Galería actual: {existingGalleryUrls.length} imagen(es). Subí archivos nuevos solo
            si querés reemplazarla por completo.
          </p>
        )}
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
            {galleryFiles.length} archivo(s) seleccionado(s)
            {isEdit ? " (reemplazarán la galería actual)." : "."}
          </p>
        )}
      </div>

      <ContentAudienceField value={audience} onChange={setAudience} />

      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--feg-green)]">Cuerpo de la noticia</span>
        <NewsRichEditor
          key={`editor-${formResetKey}-${initial?.id ?? "new"}`}
          initialContent={contentHtml}
          onChange={setContentHtml}
        />
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
              {isEdit
                ? "Enviar notificación push al guardar"
                : "Enviar notificación push al publicar"}
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
            {submitting
              ? isEdit
                ? "Guardando…"
                : "Publicando…"
              : isEdit
                ? "Guardar cambios"
                : "Publicar noticia"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={() => router.push("/gestion/prensa")}
              className="rounded-full border border-[var(--feg-green)]/25 bg-white px-6 py-2.5 font-heading text-sm font-semibold text-[var(--feg-green)] transition hover:bg-[var(--feg-bg)]"
            >
              Volver al listado
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
