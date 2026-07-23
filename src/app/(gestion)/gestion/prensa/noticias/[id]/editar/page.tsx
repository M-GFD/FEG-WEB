import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireGestionArea } from "@/lib/gestion-access";
import { getPublishedNewsByIdForGestion } from "@/lib/data";
import { NewsPublishForm } from "../../nueva/NewsPublishForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarNoticiaPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "prensa");

  const { id } = await params;
  const news = await getPublishedNewsByIdForGestion(id);
  if (!news) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/gestion/prensa"
        className="inline-flex text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
      >
        ← Volver a prensa
      </Link>
      <NewsPublishForm
        initial={{
          id: news.id,
          title: news.title,
          slug: news.slug,
          excerpt: news.excerpt ?? "",
          content: news.content,
          imageUrl: news.imageUrl,
          galleryUrls: news.galleryUrls,
          audience: news.audience,
        }}
      />
    </div>
  );
}
