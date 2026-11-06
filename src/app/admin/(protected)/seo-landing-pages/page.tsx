import Link from "next/link";
import { AdminModulePage, AdminTable } from "@/components/admin/admin-module-page";
import { listSeoLandingPages } from "@/lib/seo-landing/queries";
import { pathToPublicUrl } from "@/lib/seo-landing/types";

export const dynamic = "force-dynamic";

export default async function AdminSeoLandingPagesPage() {
  const pages = await listSeoLandingPages();
  const published = pages.filter(
    (p) => p.status === "PUBLISHED" && p.enabled && p.robotsIndex
  );

  const rows = pages.map((p) => [
    pathToPublicUrl(p.path),
    p.metaTitle,
    p.status,
    p.enabled && p.robotsIndex ? "Yes" : p.enabled ? "No (noindex)" : "Disabled",
  ]);

  return (
    <AdminModulePage
      title="SEO landing pages"
      description={
        published.length === pages.length
          ? `Indexable guides and keyword pages (${published.length} total). Public URLs use /hotels/.... Edit copy in Orbit → SEO or seed the database; onsite list is for operations only.`
          : `${published.length} of ${pages.length} pages are published, enabled and indexable. Others are draft or noindex.`
      }
    >
      <p className="mb-6 text-sm text-cream-200/78">
        Open any URL to verify metadata and FAQ schema live. New programmatic pages
        ship after running{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          npm run seo:seed-landings
        </code>{" "}
        against production <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">DATABASE_URL</code>.
      </p>
      <AdminTable
        headers={["Public URL", "Meta title", "Status", "Indexed"]}
        rows={rows}
        empty="No SEO landing rows in the database yet. Run the seed script or create pages in Orbit → SEO."
      />
      {pages.length ? (
        <ul className="mt-8 space-y-2 text-sm text-cream-200/72">
          {pages.slice(0, 20).map((p) => (
            <li key={p.path}>
              <Link
                href={pathToPublicUrl(p.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D9B46B] hover:underline"
              >
                {pathToPublicUrl(p.path)}
              </Link>
              {p.path.startsWith("hotels/guide/") ? (
                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream-200/80">
                  keyword
                </span>
              ) : null}
            </li>
          ))}
          {pages.length > 20 ? (
            <li className="text-cream-200/55">
              … and {pages.length - 20} more in the table above.
            </li>
          ) : null}
        </ul>
      ) : null}
    </AdminModulePage>
  );
}
