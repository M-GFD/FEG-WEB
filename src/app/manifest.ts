import type { MetadataRoute } from "next";
import { FEG_LOGO_MIME, FEG_LOGO_PUBLIC_PATH } from "@/lib/feegBrand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FEG - Federación Entrerriana de Golf",
    short_name: "FEG",
    description: "Torneos, rankings y resultados",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#166534",
    icons: [
      {
        src: FEG_LOGO_PUBLIC_PATH,
        sizes: "any",
        type: FEG_LOGO_MIME,
        purpose: "any",
      },
    ],
  };
}
