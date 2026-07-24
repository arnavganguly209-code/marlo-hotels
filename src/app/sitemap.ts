import type { MetadataRoute } from "next";
import { getPosts } from "@/content/blog";
import { getRestaurants } from "@/content/dining";
import { getRooms } from "@/content/rooms";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rooms, restaurants, posts] = await Promise.all([
    getRooms(),
    getRestaurants(),
    getPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/rooms", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/dining", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/spa", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/experiences", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/gallery", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/offers", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/booking", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/legal", priority: 0.3, changeFrequency: "yearly" as const },
  ].map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: `${siteConfig.url}/rooms/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const diningRoutes: MetadataRoute.Sitemap = restaurants.map((restaurant) => ({
    url: `${siteConfig.url}/dining/${restaurant.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...roomRoutes, ...diningRoutes, ...postRoutes];
}
