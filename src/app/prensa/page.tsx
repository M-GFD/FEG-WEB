import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getApprovedPhotos } from "@/lib/data";
import { getGolfPlaceholder } from "@/lib/placeholders";

function isAllowedImageUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export default async function PrensaPublicPage() {
  const photos = await getApprovedPhotos(60);

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <div className="pt-4">
        <Header />
      </div>
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-12 text-center">
          <p className="mx-auto mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Galería
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            Prensa
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--feg-green)]">
            Imágenes de torneos y actividades de la Federación Entrerriana de Golf,
            aprobadas por el equipo de prensa.
          </p>
        </header>

        {photos.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-12 text-center text-[var(--feg-green)]">
            Aún no hay fotos publicadas en la galería.
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((p, i) => {
              const safeUrl = isAllowedImageUrl(p.url) ? p.url : getGolfPlaceholder(i, "regular");

              return (
                <figure
                  key={p.id}
                  className={`mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)] ${
                    p.featured ? "ring-2 ring-[var(--feg-yellow)] ring-offset-2 ring-offset-[var(--feg-bg)]" : ""
                  }`}
                >
                  {/* URLs pueden ser de cualquier origen (clubes suben enlaces públicos) */}
                  <img
                    src={safeUrl}
                    alt={p.caption || "Foto de la federación"}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                  {p.caption && (
                    <figcaption className="border-t border-[var(--feg-green)]/10 px-3 py-2 text-sm text-[var(--feg-green)]">
                      {p.caption}
                    </figcaption>
                  )}
                  {p.featured && (
                    <div className="border-t border-[var(--feg-green)]/10 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
                        Destacada
                      </span>
                    </div>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
