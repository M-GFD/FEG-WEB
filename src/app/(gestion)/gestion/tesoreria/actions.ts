"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hasRole } from "@/lib/rbac";

async function requireTreasurer() {
  const session = await auth();
  if (!session?.user || !hasRole(session.user.role, "TREASURER")) {
    throw new Error("No autorizado");
  }
}

export async function approveExpense(expenseId: string) {
  await requireTreasurer();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("Expense").update({ status: "APPROVED" }).eq("id", expenseId);
  }
  revalidatePath("/gestion/tesoreria");
}

export async function rejectExpense(expenseId: string) {
  await requireTreasurer();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("Expense").update({ status: "REJECTED" }).eq("id", expenseId);
  }
  revalidatePath("/gestion/tesoreria");
}

export async function markPaid(expenseId: string) {
  await requireTreasurer();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("Expense").update({ status: "PAID", paidAt: new Date().toISOString() }).eq("id", expenseId);
  }
  revalidatePath("/gestion/tesoreria");
}
