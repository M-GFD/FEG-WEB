import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FegLogoSize = "nav" | "footer";

const heightClass: Record<FegLogoSize, string> = {
  nav: "h-10",
  footer: "h-14",
};

const sizesAttr: Record<FegLogoSize, string> = {
  nav: "40px",
  footer: "56px",
};

type FegLogoProps = {
  size?: FegLogoSize;
  className?: string;
};

/** Logo oficial FEG (`/LOGO_FEG.png`). Mantiene proporción del escudo. */
export function FegLogo({ size = "nav", className }: FegLogoProps) {
  return (
    <Image
      src="/LOGO_FEG.png"
      alt="Federación Entrerriana de Golf"
      width={150}
      height={200}
      sizes={sizesAttr[size]}
      priority={size === "nav"}
      className={cn(heightClass[size], "w-auto object-contain object-left", className)}
    />
  );
}

export function FegLogoLink({ size = "nav", className }: FegLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2 rounded-sm",
        className
      )}
    >
      <FegLogo size={size} />
    </Link>
  );
}
