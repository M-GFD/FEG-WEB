import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { gestionHomeForRole } from "@/lib/gestion-access";

export default async function GestionIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  redirect(gestionHomeForRole(session.user.role));
}
