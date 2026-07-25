import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/cards/post-card";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { getPostCategories, getPosts } from "@/content/blog";
import { getBlogPageSettings } from "@/lib/blog-page-content";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "The Journal",
  description:
    "Dispatches from Marlo Hotels — concierge itineraries for Kathmandu, the craft behind our suites, stories from Amaya's kitchen and the art of slow mornings.",
  path: "/blog",
});

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [posts, categories, pageSettings] = await Promise.all([
    getPosts(),
    getPostCategories(),
    getBlogPageSettings(),
  ]);
  const { cover } = pageSettings;

  const active =
    category && categories.includes(category) ? category : "All";
  const filtered =
    active === "All" ? posts : posts.filter((post) => post.category === active);

  return (
    <>
      <PageHero
        eyebrow={cover.eyebrow}
        title={cover.title}
        description={cover.description}
        image={{
          src: cover.src,
          alt: cover.alt,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <nav aria-label="Journal categories">
              <ul className="flex flex-wrap justify-center gap-3">
                {["All", ...categories].map((item) => (
                  <li key={item}>
                    <Link
                      href={item === "All" ? "/blog" : `/blog?category=${item}`}
                      aria-current={active === item ? "page" : undefined}
                      className={cn(
                        "inline-block rounded-full border px-6 py-2.5 text-[10px] font-medium tracking-[0.26em] uppercase transition-all duration-400",
                        active === item
                          ? "border-gold-500 bg-gold-500 text-charcoal-950 shadow-gold"
                          : "border-forest-800/25 text-forest-900 hover:border-gold-500 hover:text-gold-600"
                      )}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Stagger className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((post) => (
              <StaggerItem key={post.slug}>
                <PostCard post={post} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
