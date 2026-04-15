import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GestionSidebar } from "@/components/gestion/GestionSidebar";

export default async function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  if (session.user.mustChangePassword) {
    redirect("/auth/change-password");
  }

  if (session.user.role === "PUBLIC") {
    redirect("/auth/unauthorized");
  }

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col md:flex-row">
        <GestionSidebar role={session.user.role} />
        <main className="flex-1 px-4 py-6 md:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
