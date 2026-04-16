import type { MetadataRoute } from "next";

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
        src: "/LOGO_FEG.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/LOGO_FEG.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
