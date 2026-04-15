"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Desfase ligeramente irregular entre índices consecutivos */
function revealStaggerMs(index: number): number {
  return 40 + index * 64 + ((index * 11) % 7) * 26;
}

type RevealOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  /** Índice para calcular el delay de entrada (hermanos con distintos índices se desfasan) */
  revealIndex?: number;
  /** Desplazamiento vertical inicial en px */
  yOffset?: number;
  /** Umbral de intersección (0–1) */
  threshold?: number;
};

export function RevealOnScroll({
  children,
  className,
  revealIndex = 0,
  yOffset = 22,
  threshold = 0.08,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const delayMs = revealStaggerMs(revealIndex);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        transform: visible ? "translateY(0)" : `translateY(${yOffset}px)`,
        transitionDelay: visible ? `${delayMs}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
