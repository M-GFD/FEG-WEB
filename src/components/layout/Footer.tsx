import { FegLogoLink } from "@/components/layout/FegLogo";
import { auth } from "@/lib/auth";

const FEG_PUBLIC_ORIGIN =
  (process.env.NEXT_PUBLIC_FEG_PUBLIC_URL ?? "https://www.feg.ar").replace(
    /\/$/,
    ""
  );

/** Misma lógica que los CTAs del header: sesión → gestión; sin sesión → iniciar sesión con vuelta a /gestion */
function gestionEntryHref(session: Awaited<ReturnType<typeof auth>>) {
  const gestionAbs = `${FEG_PUBLIC_ORIGIN}/gestion`;
  if (session?.user) return gestionAbs;
  const signIn = new URL(`${FEG_PUBLIC_ORIGIN}/auth/signin`);
  signIn.searchParams.set("callbackUrl", "/gestion");
  return signIn.toString();
}

export async function Footer() {
  const session = await auth();
  const gestionHref = gestionEntryHref(session);

  return (
    <footer className="mt-auto border-t border-[var(--feg-green)]/15 bg-white text-[var(--feg-ink)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <FegLogoLink size="footer" className="ring-offset-white" />
          <div
            className="min-h-[4rem] flex-1 max-w-md rounded-2xl border border-dashed border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-3 sm:max-w-lg"
            aria-label="Información de contacto"
          />
        </div>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-center text-xs text-[var(--feg-green)]/60 sm:text-left">
            © {new Date().getFullYear()} Federación Entrerriana de Golf
          </p>
          <a
            href={gestionHref}
            className="self-end text-sm font-semibold text-[var(--feg-ink)] underline-offset-4 transition hover:text-[var(--feg-green-2)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--feg-green)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:self-auto"
          >
            Gestión
          </a>
        </div>
      </div>
    </footer>
  );
}
