import Link from "next/link";
import {
  AdminModulePage,
  AdminTable,
} from "@/components/admin/admin-module-page";
import { listSeoLandingPages } from "@/lib/seo-landing/queries";
import { pathToPublicUrl } from "@/lib/seo-landing/types";

export const dynamic = "force-dynamic";

function keywordKind(path: string) {
  if (path.startsWith("hotels/guide/")) return "Keyword guide";
  if (path.startsWith("hotels/nepal/")) return "Nepal travel";
  if (path.startsWith("hotels/thamel") || path.startsWith("hotels/kathmandu")) {
    return "Hub";
  }
  return "Landing";
}

function seoHealth(metaTitle: string, metaDescription: string) {
  const titleLen = metaTitle.length;
  const descLen = metaDescription.length;
  const titleOk = titleLen >= 30 && titleLen <= 65;
  const descOk = descLen >= 120 && descLen <= 165;
  const score =
    titleOk && descOk ? 100 : titleOk || descOk ? 75 : 50;
  const notes: string[] = [];
  if (!titleOk) {
    notes.push(
      titleLen < 30
        ? "Title short"
        : titleLen > 65
          ? "Title long"
          : "Title length check"
    );
  }
  if (!descOk) {
    notes.push(
      descLen < 120
        ? "Meta desc short"
        : descLen > 165
          ? "Meta desc long"
          : "Meta desc check"
    );
  }
  return { score, label: `${score}%`, detail: notes.join(" · ") || "OK" };
}

export default async function AdminBacklinkPagesPage() {
  const pages = await listSeoLandingPages();
  const published = pages.filter(
    (p) => p.status === "PUBLISHED" && p.enabled && p.robotsIndex
  );

  const rows = pages.map((p) => {
    const url = pathToPublicUrl(p.path);
    const health = seoHealth(p.metaTitle, p.metaDescription);
    const kind = keywordKind(p.path);
    return [
      <Link
        key={`link-${p.path}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#D9B46B] hover:underline"
      >
        {url}
      </Link>,
      <span key={`title-${p.path}`} className="block max-w-md text-cream-200/85">
        {p.metaTitle}
      </span>,
      kind,
      p.status,
      p.enabled && p.robotsIndex ? "Yes" : p.enabled ? "No (noindex)" : "Off",
      <span
        key={`score-${p.path}`}
        className={
          health.score === 100
            ? "font-semibold text-emerald-400"
            : health.score >= 75
              ? "text-amber-300"
              : "text-red-300"
        }
      >
        {health.label}
      </span>,
      <span key={`hint-${p.path}`} className="block max-w-xs text-xs text-cream-200/60">
        {health.detail}
      </span>,
    ];
  });

  return (
    <AdminModulePage
      title="Backlink pages"
      description={
        published.length === pages.length
          ? `All programmatic SEO landing URLs (${pages.length}). Each row links to the live public page and checks title/description length for Google snippets (approx. 100% = both in range).`
          : `${published.length} of ${pages.length} rows are published, enabled and indexable. Fix drafts or noindex if you expect them in search.`
      }
    >
      <p className="mb-6 text-sm text-cream-200/78">
        New rows from the repo ship after{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          npm run seo:seed-landings
        </code>{" "}
        (production DB). Canonical copy lives in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          scripts/seo-landing-seeds.json
        </code>
        . Orbit → SEO can override individual pages when connected to the same DB.
      </p>
      <p className="mb-4 text-xs text-cream-200/60">
        Snippet score: meta title ~30–65 chars, meta description ~120–165 chars (common
        SEO band; not a Google guarantee).
      </p>
      <AdminTable
        headers={[
          "Public URL",
          "Meta title",
          "Type",
          "Status",
          "Indexed",
          "Snippet",
          "Length check",
        ]}
        rows={rows}
        empty="No SEO landing rows in the database yet. Run npm run seo:seed-landings with DATABASE_URL."
      />
    </AdminModulePage>
  );
}
