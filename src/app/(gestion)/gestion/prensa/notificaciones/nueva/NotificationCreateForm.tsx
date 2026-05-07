"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSiteNotificationFromGestion } from "./actions";

export function NotificationCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Completá el título.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSiteNotificationFromGestion({
        title: title.trim(),
        body: body.trim() || undefined,
        linkUrl: linkUrl.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      router.push("/gestion/prensa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-5 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm"
    >
      <div>
        <label htmlFor="notif-title" className="mb-1 block text-sm font-medium text-[var(--feg-ink)]">
          Título
        </label>
        <input
          id="notif-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
          autoComplete="off"
          placeholder="Ej.: Nuevo torneo inscripto"
        />
      </div>

      <div>
        <label htmlFor="notif-body" className="mb-1 block text-sm font-medium text-[var(--feg-ink)]">
          Mensaje (opcional)
        </label>
        <textarea
          id="notif-body"
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
          placeholder="Detalle breve del aviso…"
        />
      </div>

      <div>
        <label htmlFor="notif-link" className="mb-1 block text-sm font-medium text-[var(--feg-ink)]">
          Enlace (opcional)
        </label>
        <input
          id="notif-link"
          name="linkUrl"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
          autoComplete="off"
          placeholder="https://… o /noticias/…"
        />
        <p className="mt-1 text-xs text-[var(--feg-green)]">URL absoluta (https) o ruta interna que empiece con /.</p>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[var(--feg-green-2)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {submitting ? "Publicando…" : "Publicar notificación"}
        </button>
      </div>
    </form>
  );
}
