"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

import { PwaPushRegister } from "@/components/pwa/PwaPushRegister";
import { SiteNotificationsProvider } from "@/components/layout/SiteNotificationsContext";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  /** Sesión desde el servidor: evita flash unauthenticated en Safari iOS tras recargar. */
  session: Session | null;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false} session={session}>
      <SiteNotificationsProvider>
        {children}
        <PwaPushRegister />
      </SiteNotificationsProvider>
    </SessionProvider>
  );
}
