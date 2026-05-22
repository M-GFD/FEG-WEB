"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createReglamentoVideo, prepareReglamentoVideoUpload } from "./actions";

async function uploadToSignedUrl(
  signedUploadUrl: string,
  token: string,
  file: File,
  mimeType: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = new URL(signedUploadUrl);
  url.searchParams.set("token", token);

  const res = await fetch(url.toString(), {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    return {
      ok: false,
      error: detail || `Error al subir (${res.status})`,
    };
  }
  return { ok: true };
}

export function ReglamentoVideoForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Completá el título.");
      return;
    }
    if (!body.trim()) {
      setError("Completá la descripción.");
      return;
    }
    if (!file) {
      setError("Seleccioná un video (MP4, WebM o GIF).");
      return;
    }

    setSubmitting(true);
    try {
      const prep = await prepareReglamentoVideoUpload({
        mimeType: file.type,
        fileSize: file.size,
      });

      if (!prep.ok) {
        setError(prep.error ?? "No se pudo preparar la subida.");
        return;
      }

      const { upload } = prep;
      const uploaded = await uploadToSignedUrl(
        upload.signedUploadUrl,
        upload.token,
        file,
        upload.mimeType
      );

      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }

      const result = await createReglamentoVideo({
        title: title.trim(),
        body: body.trim(),
        videoUrl: upload.publicUrl,
        mimeType: upload.mimeType,
      });

      if (!result.ok) {
        setError(result.error ?? "No se pudo publicar el video.");
        return;
      }

      setTitle("");
      setBody("");
      setFile(null);
      setFileInputKey((k) => k + 1);
      setSuccess("Video publicado en Reglamento → Videos explicativos.");
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
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]"
    >
      <div>
        <Link
          href="/gestion/admin"
          className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          ← Volver a administración
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Publicar video explicativo
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          El video se sube directo a Supabase Storage (hasta 80 MB) y aparece en{" "}
          <span className="font-medium">Reglamento → Videos explicativos</span>.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="video-title" className="text-sm font-medium text-[var(--feg-green)]">
          Título
        </label>
        <input
          id="video-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2 text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="video-body" className="text-sm font-medium text-[var(--feg-green)]">
          Descripción
        </label>
        <textarea
          id="video-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={5000}
          className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2 text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="video-file" className="text-sm font-medium text-[var(--feg-green)]">
          Video
        </label>
        <input
          key={fileInputKey}
          id="video-file"
          type="file"
          accept="video/mp4,video/webm,image/gif,.mp4,.webm,.gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[var(--feg-green)] file:mr-3 file:rounded-xl file:border-0 file:bg-[var(--feg-green-2)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-95"
          required
        />
        <p className="text-xs text-[var(--feg-green)]/80">MP4, WebM o GIF · máx. 80 MB.</p>
        {file ? (
          <p className="text-xs text-[var(--feg-green)]">
            Archivo: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
          </p>
        ) : null}
      </div>

      {success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[var(--feg-yellow)] px-6 py-2.5 font-heading text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95 disabled:opacity-50"
      >
        {submitting ? "Publicando…" : "Publicar video"}
      </button>
    </form>
  );
}
