import Link from "next/link";
import { getReglamentoVideos } from "@/lib/data";
import { ReglamentoVideosManager } from "./ReglamentoVideosManager";

export const dynamic = "force-dynamic";

export default async function EliminarReglamentoVideosPage() {
  const videos = await getReglamentoVideos();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/gestion/admin"
          className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          ← Volver a administración
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Eliminar videos explicativos
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          Gestioná los videos publicados en Reglamento → Videos explicativos.
        </p>
      </div>

      <ReglamentoVideosManager
        items={videos.map((v) => ({
          id: v.id,
          title: v.title,
          mimeType: v.mimeType,
          createdAt: v.createdAt,
        }))}
      />
    </div>
  );
}
