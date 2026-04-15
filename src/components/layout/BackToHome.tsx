import Link from "next/link";

export function BackToHome() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--feg-green)]/20 bg-white px-4 py-2 text-sm font-medium text-[var(--feg-green-2)] shadow-sm transition hover:border-[var(--feg-green-2)]/40 hover:bg-[var(--feg-yellow)]/15"
    >
      ← Volver al inicio
    </Link>
  );
}
