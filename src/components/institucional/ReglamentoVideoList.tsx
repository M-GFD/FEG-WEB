import { getTranslations } from "next-intl/server";
import type { ReglamentoVideoRow } from "@/lib/data";

export type ReglamentoVideoItem = ReglamentoVideoRow;

async function ReglamentoVideoPlayer({
  url,
  mimeType,
  title,
  unsupportedLabel,
}: {
  url: string;
  mimeType: string;
  title: string;
  unsupportedLabel: string;
}) {
  if (mimeType === "image/gif") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={title}
        className="w-full rounded-2xl border border-[var(--feg-green)]/12 bg-black/5 object-contain"
      />
    );
  }

  return (
    <video
      controls
      playsInline
      preload="metadata"
      className="w-full rounded-2xl border border-[var(--feg-green)]/12 bg-black shadow-[0_14px_40px_rgba(0,36,3,0.12)]"
    >
      <source src={url} type={mimeType} />
      {unsupportedLabel}
    </video>
  );
}

export async function ReglamentoVideoList({ videos }: { videos: ReglamentoVideoItem[] }) {
  const t = await getTranslations("regulationVideos");

  if (videos.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {videos.map((video) => (
        <article
          key={video.id}
          className="overflow-hidden rounded-3xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]"
        >
          <div className="p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
              {video.title}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--feg-green)]">
              {video.body}
            </p>
          </div>
          <div className="border-t border-[var(--feg-green)]/10 bg-[var(--feg-bg)]/50 p-4 sm:p-6">
            <ReglamentoVideoPlayer
              url={video.videoUrl}
              mimeType={video.mimeType}
              title={video.title}
              unsupportedLabel={t("unsupported")}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
