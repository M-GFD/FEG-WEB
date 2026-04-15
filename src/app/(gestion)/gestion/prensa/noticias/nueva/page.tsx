import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireGestionArea } from "@/lib/gestion-access";
import { NewsPublishForm } from "./NewsPublishForm";

export default async function NuevaNoticiaPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "prensa");

  return (
    <div className="space-y-6">
      <Link
        href="/gestion/prensa"
        className="inline-flex text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
      >
        ← Volver a prensa
      </Link>
      <NewsPublishForm />
    </div>
  );
}
