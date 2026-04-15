import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.mustChangePassword) redirect("/gestion");

  return <ChangePasswordForm />;
}
