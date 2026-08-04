import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { STATIC_BLOG_POSTS } from "@/content/blog";
import { getDb } from "@/lib/db";

export const RESERVED_BLOG_KEYS = new Set([
  "blog-settings",
  "page-studio",
  "page-settings",
]);

function structuredToHtml(
  content: { heading?: string; paragraphs: string[] }[]
) {
  return content
    .map((section) => {
      const heading = section.heading ? `<h2>${section.heading}</h2>` : "";
      const paragraphs = section.paragraphs
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("");
      return `${heading}${paragraphs}`;
    })
    .join("");
}

/**
 * Upsert public static journal posts into ContentEntry(module=blog)
 * so Admin Articles and the website share one catalogue.
 * Existing CMS rows are never overwritten.
 */
export async function ensureStaticBlogPosts() {
  const db = getDb();
  if (!db) return 0;

  let created = 0;
  for (const post of STATIC_BLOG_POSTS) {
    const key = post.slug;
    if (RESERVED_BLOG_KEYS.has(key)) continue;

    const existing = await db.contentEntry.findUnique({
      where: { module_key: { module: "blog", key } },
      select: { id: true },
    });
    if (existing) continue;

    const html = structuredToHtml(post.content);
    await db.contentEntry.create({
      data: {
        module: "blog",
        key,
        title: post.title,
        slug: post.slug,
        status: "PUBLISHED",
        data: {
          excerpt: post.excerpt,
          html,
          content: html,
          category: post.category,
          tags: post.tags,
          authorName: post.author.name,
          authorRole: post.author.role,
          author: post.author.name,
          readingTime: post.readingTime,
          publishDate: post.date,
          coverUrl: post.image.src,
          coverAlt: post.image.alt,
          imageUrl: post.image.src,
          imageAlt: post.image.alt,
          bannerUrl: post.image.src,
          gallery: [],
          featured: false,
          trending: false,
          sticky: false,
          commentsEnabled: true,
          viewCount: 0,
          relatedPostSlugs: [],
          metaTitle: post.title,
          metaDescription: post.excerpt,
          ogTitle: post.title,
          ogDescription: post.excerpt,
          ogImageUrl: post.image.src,
        } as Prisma.InputJsonValue,
        seo: {
          metaTitle: post.title,
          metaDescription: post.excerpt,
          ogTitle: post.title,
          ogDescription: post.excerpt,
          ogImageUrl: post.image.src,
          canonicalUrl: `/blog/${post.slug}`,
        } as Prisma.InputJsonValue,
        publishedAt: new Date(post.date),
      },
    });
    created += 1;
  }
  return created;
}
