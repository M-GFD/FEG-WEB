"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, getClubsForSignup } from "./actions";
import { FegLogo } from "@/components/layout/FegLogo";
import { useSession } from "next-auth/react";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Federación (Admin)",
  CLUB: "Club",
  PRESS: "Prensa",
  DIRECTOR: "Directivo",
  TREASURER: "Tesorería",
};

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { status, data: session } = useSession();
  const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/auth/unauthorized");
      return;
    }
    getClubsForSignup().then(setClubs);
  }, [isAdmin, router, status]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await signUp(formData);
    if (result.ok) {
      router.push("/auth/signin?registered=1");
    } else {
      setError(result.error ?? "Error al registrarse");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo size="nav" className="h-16 object-center sm:h-[4.25rem]" />
        </div>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Crear cuenta
        </h1>
        {status === "loading" ? (
          <p className="mt-4 text-center text-sm text-[var(--feg-green)]">Cargando…</p>
        ) : !isAdmin ? (
          <p className="mt-4 text-center text-sm text-[var(--feg-green)]">
            No autorizado.
          </p>
        ) : (
          <div className="mt-6">
            <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="role"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Tipo de cuenta
            </label>
            <select
              id="role"
              name="role"
              required
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
            >
              <option value="">Selecciona el tipo de cuenta</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {selectedRole === "CLUB" && (
            <div>
              <label
                htmlFor="clubId"
                className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
              >
                Club
              </label>
              <select
                id="clubId"
                name="clubId"
                required={selectedRole === "CLUB"}
                className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              >
                <option value="">Selecciona tu club</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {clubs.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No hay clubes cargados. Contacta a la federación.
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder="Repite la contraseña"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95"
          >
            Registrarse
          </button>
            </form>
            <p className="mt-4 text-center text-sm text-[var(--feg-green)]">
              <Link
                href="/auth/signin"
                className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
