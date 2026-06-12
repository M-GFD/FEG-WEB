"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = {
  images: string[];
  title: string;
};

export function NewsGallery({ images, title }: Props) {
  const t = useTranslations("news");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, goPrev, goNext]);

  if (images.length === 0) return null;

  const multi = images.length > 1;

  return (
    <>
      {multi ? (
        <section className="mt-12" aria-label={t("galleryAria")}>
          <h2 className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
            {t("gallery")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((url, i) => (
              <GalleryThumb
                key={`${url}-${i}`}
                url={url}
                alt={t("imageAltNumbered", { title, number: i + 1 })}
                openLabel={t("openImage")}
                onOpen={() => openAt(i)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-10">
          <GalleryThumb
            url={images[0]}
            alt={t("imageAlt", { title })}
            openLabel={t("openImage")}
            onOpen={() => openAt(0)}
            className="aspect-video w-full"
          />
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={t("lightboxAria")}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label={t("lightboxClose")}
          >
            {t("lightboxClose")}
          </button>

          {multi && (
            <p className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              {t("lightboxCounter", { current: index + 1, total: images.length })}
            </p>
          )}

          {multi && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6"
              aria-label={t("lightboxPrev")}
            >
              <ChevronLeft />
            </button>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center px-14 py-16 sm:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* URL original de Supabase (resolución completa); tamaño vía viewport, no del thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={
                multi
                  ? t("imageAltNumbered", { title, number: index + 1 })
                  : t("imageAlt", { title })
              }
              className="max-h-[calc(100dvh-8rem)] max-w-[min(calc(100vw-7rem),72rem)] object-contain"
              decoding="async"
            />
          </div>

          {multi && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6"
              aria-label={t("lightboxNext")}
            >
              <ChevronRight />
            </button>
          )}
        </div>
      )}
    </>
  );
}

function GalleryThumb({
  url,
  alt,
  openLabel,
  onOpen,
  className = "aspect-video",
}: {
  url: string;
  alt: string;
  openLabel: string;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative overflow-hidden rounded-2xl border border-[var(--feg-green)]/10 shadow-sm transition hover:border-[var(--feg-green-2)]/35 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--feg-yellow)] focus-visible:ring-offset-2 ${className}`}
      aria-label={openLabel}
    >
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover transition duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 640px) 100vw, 336px"
      />
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
    </button>
  );
}

function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
