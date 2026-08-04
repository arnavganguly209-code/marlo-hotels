import "server-only";

import { ensureStaticBlogPosts, RESERVED_BLOG_KEYS } from "@/lib/blog-seed";
import { getDb } from "@/lib/db";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

export type BlogArticleStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type SerializedBlogArticle = {
  id: string;
  module: string;
  key: string;
  title: string;
  slug: string | null;
  status: BlogArticleStatus;
  data: JsonRecord & {
    coverUrl: string;
    imageUrl: string;
    bannerUrl: string;
    gallery: unknown[];
    featured: boolean;
    trending: boolean;
    sticky: boolean;
    commentsEnabled: boolean;
    viewCount: number;
    seoScore: number;
    readabilityScore: number;
  };
  seo: JsonRecord;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export { ensureStaticBlogPosts, RESERVED_BLOG_KEYS };

export function serializeBlogEntry(entry: {
  id: string;
  module: string;
  key: string;
  title: string;
  slug: string | null;
  status: BlogArticleStatus;
  data: unknown;
  seo: unknown;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedBlogArticle {
  const data = record(entry.data);
  const seo = record(entry.seo);
  return {
    id: entry.id,
    module: entry.module,
    key: entry.key,
    title: entry.title,
    slug: entry.slug,
    status: entry.status,
    data: {
      ...data,
      coverUrl: String(data.coverUrl || ""),
      imageUrl: String(data.imageUrl || data.bannerUrl || ""),
      bannerUrl: String(data.bannerUrl || data.imageUrl || ""),
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      featured: data.featured === true,
      trending: data.trending === true,
      sticky: data.sticky === true,
      commentsEnabled: data.commentsEnabled !== false,
      viewCount: Number(data.viewCount || 0),
      seoScore: Number(data.seoScore || 0),
      readabilityScore: Number(data.readabilityScore || 0),
    },
    seo,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    scheduledAt: entry.scheduledAt?.toISOString() ?? null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export async function listBlogArticles() {
  const db = getDb();
  if (!db) return [];
  await ensureStaticBlogPosts();
  const entries = await db.contentEntry.findMany({
    where: {
      module: "blog",
      key: { notIn: [...RESERVED_BLOG_KEYS] },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  return entries.map(serializeBlogEntry);
}

export async function getBlogArticle(id: string) {
  const db = getDb();
  if (!db) return null;
  const entry = await db.contentEntry.findUnique({ where: { id } });
  if (
    !entry ||
    entry.module !== "blog" ||
    RESERVED_BLOG_KEYS.has(entry.key)
  ) {
    return null;
  }
  return serializeBlogEntry(entry);
}
