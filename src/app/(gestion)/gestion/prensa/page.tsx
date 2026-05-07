import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPendingPhotos, getPublishedNewsForGestion } from "@/lib/data";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { PhotoModeration } from "./PhotoModeration";
import { PublishedNewsManager } from "./PublishedNewsManager";

export default async function PrensaPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "prensa");

  const pendingPhotos = await getPendingPhotos();
  const publishedNews = await getPublishedNewsForGestion();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
            Prensa
          </h1>
          <p className="mt-1 text-[var(--feg-green)]">
            Moderación de fotos y publicación de noticias.
          </p>
        </div>
        <Link
          href="/gestion/prensa/noticias/nueva"
          className="rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Publicar noticia
        </Link>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Fotos pendientes de aprobación
        </h2>
        <p className="mb-4 text-sm text-[var(--feg-green)]">
          Revisá las fotos enviadas por los clubes. Si indicaron un{" "}
          <strong>torneo</strong>, al aprobar aparecen en la ficha de ese torneo.
        </p>
        <PhotoModeration photos={pendingPhotos} />
      </div>

      <div className="mt-14">
        <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Noticias publicadas
        </h2>
        <PublishedNewsManager items={publishedNews} />
      </div>
    </div>
  );
}
