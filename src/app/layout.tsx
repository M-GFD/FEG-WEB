import type { Metadata } from "next";
import { Oswald, Urbanist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FooterPublicOnly } from "@/components/layout/FooterPublicOnly";
import { FEG_LOGO_MIME, FEG_LOGO_PUBLIC_PATH } from "@/lib/feegBrand";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FEG - Federación Entrerriana de Golf",
  description: "Plataforma de torneos, rankings y gestión",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: FEG_LOGO_PUBLIC_PATH, type: FEG_LOGO_MIME }],
    apple: [{ url: FEG_LOGO_PUBLIC_PATH, type: FEG_LOGO_MIME }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${oswald.variable} ${urbanist.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <Providers>
          <div className="flex flex-1 flex-col">{children}</div>
          <FooterPublicOnly />
        </Providers>
      </body>
    </html>
  );
}
