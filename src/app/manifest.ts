import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";
import { FEG_LOGO_MIME, FEG_LOGO_PUBLIC_PATH } from "@/lib/feegBrand";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations("meta");

  return {
    name: t("siteTitle"),
    short_name: "FEG",
    description: t("manifestDescription"),
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
