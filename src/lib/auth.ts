import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { getSupabaseAdmin } from "./supabase";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      clubId?: string | null;
      mustChangePassword?: boolean;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
        token.role = (user as { role?: Role }).role ?? "PUBLIC";
        token.clubId = (user as { clubId?: string | null }).clubId ?? null;
      }
      if (token.id) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data: dbUser } = await supabase
            .from("User")
            .select("role, clubId, mustChangePassword")
            .eq("id", token.id as string)
            .single();
          if (dbUser) {
            token.role = dbUser.role;
            token.clubId = dbUser.clubId;
            token.mustChangePassword = dbUser.mustChangePassword ?? false;
          }
        } else {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, clubId: true, mustChangePassword: true },
            });
            if (dbUser) {
              token.role = dbUser.role;
              token.clubId = dbUser.clubId;
              token.mustChangePassword = dbUser.mustChangePassword ?? false;
            }
          } catch {
            // Prisma no conecta (ej. firewall) - ya tenemos role/clubId del authorize
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "PUBLIC";
        session.user.clubId = token.clubId as string | null;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data: user } = await supabase
            .from("User")
            .select("*")
            .eq("email", email)
            .single();
          if (!user) return null;
          const valid = await compare(password, user.password);
          if (!valid) return null;
          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
          return user;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) return null;
          const valid = await compare(password, user.password);
          if (!valid) return null;
          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
          return user;
        } catch (e) {
          if (e instanceof Error && e.message === "EMAIL_NOT_VERIFIED") {
            throw e;
          }
          return null;
        }
      },
    }),
  ],
});
