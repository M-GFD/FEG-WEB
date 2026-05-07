"use client";

import { SessionProvider } from "next-auth/react";
import { PwaPushRegister } from "@/components/pwa/PwaPushRegister";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <PwaPushRegister />
    </SessionProvider>
  );
}
