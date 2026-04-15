import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function GestionAdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/unauthorized");
  }
  return <>{children}</>;
}