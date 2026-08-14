"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { NEWS_COVER_ASPECT } from "./cropCoverImage";

type Props = {
  imageSrc: string;
  onAreaChange: (area: Area) => void;
  onInteract?: () => void;
};

export function NewsCoverCropper({ imageSrc, onAreaChange, onInteract }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      onAreaChange(croppedAreaPixels);
    },
    [onAreaChange]
  );

  return (
    <div className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-[var(--feg-ink)] sm:h-72">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          minZoom={1}
          maxZoom={4}
          aspect={NEWS_COVER_ASPECT}
          objectFit="contain"
          mediaProps={{ crossOrigin: "anonymous" }}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleComplete}
          onInteractionEnd={() => onInteract?.()}
        />
      </div>
      <label className="flex items-center gap-3 text-sm text-[var(--feg-green)]">
        <span className="shrink-0 font-medium">Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => {
            onInteract?.();
            setZoom(Number(e.target.value));
          }}
          className="w-full accent-[var(--feg-green-2)]"
        />
      </label>
      <p className="text-xs text-[var(--feg-green)]/80">
        Arrastrá la imagen para elegir el recorte y usá el zoom si querés acercarla. El recuadro
        es 16:9, igual que la portada en la noticia.
      </p>
    </div>
  );
}
