import { AdminArticlesManager } from "@/components/admin/admin-articles-manager";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { listBlogArticles } from "@/lib/admin/articles";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [initialEntries, initialMedia] = await Promise.all([
    listBlogArticles(),
    getDb()?.mediaAsset.findMany({
      where: { folder: "blog", deletedAt: null },
      select: { id: true, url: true, alt: true, originalName: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }) ?? [],
  ]);
  return (
    <AdminModulePage
      title="Articles"
      description="Create and publish journal stories shared with the Orbit Blog Studio."
    >
      <AdminArticlesManager initialEntries={initialEntries} initialMedia={initialMedia} />
    </AdminModulePage>
  );
}
