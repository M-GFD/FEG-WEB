/** Curva suave: acelera al inicio y desacelera al final (sensación de “desliz” largo) */
function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/** Duración del scroll por ancla (Nav / hash); más lenta que el `smooth` nativo del navegador */
export const SMOOTH_ANCHOR_SCROLL_MS = 1850;

/** Compensa header sticky (equiv. ~`scroll-mt-28` en las secciones con ancla) */
export const SMOOTH_SCROLL_HEADER_OFFSET_PX = 112;

export function smoothScrollToElement(
  element: HTMLElement,
  options?: { durationMs?: number; offsetPx?: number }
): void {
  const durationMs = options?.durationMs ?? SMOOTH_ANCHOR_SCROLL_MS;
  const offsetPx = options?.offsetPx ?? SMOOTH_SCROLL_HEADER_OFFSET_PX;

  const startY = window.scrollY;
  const rect = element.getBoundingClientRect();
  const targetTop = rect.top + startY - offsetPx;
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const endY = Math.max(0, Math.min(targetTop, maxY));
  const distance = endY - startY;

  if (Math.abs(distance) < 1) return;

  const t0 = performance.now();

  function frame(now: number) {
    const elapsed = now - t0;
    const t = Math.min(1, elapsed / durationMs);
    const eased = easeInOutQuart(t);
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

export function smoothScrollToElementId(
  id: string,
  options?: { durationMs?: number; offsetPx?: number }
): void {
  const el = document.getElementById(id);
  if (el) smoothScrollToElement(el, options);
}
