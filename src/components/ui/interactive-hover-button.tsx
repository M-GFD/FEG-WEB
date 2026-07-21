import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
};

/**
 * Interactive Hover Button (Magic UI), adaptado a tokens FEG y con soporte `href` (Next Link).
 * @see https://magicui.design/docs/components/interactive-hover-button
 */
export function InteractiveHoverButton({
  children,
  className,
  href,
  ...props
}: Props) {
  const classes = cn(
    "group relative inline-flex w-auto cursor-pointer overflow-hidden rounded-full border border-transparent bg-[var(--feg-yellow)] p-2 px-4 text-center text-xs font-semibold text-[var(--feg-green-2)]",
    className
  );

  const content = (
    <>
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 shrink-0 rounded-full bg-[var(--feg-green-2)] transition-all duration-300 group-hover:scale-[100.8]" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-[var(--feg-yellow)] opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
