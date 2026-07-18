import { Clock, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/blog/share-buttons";
import { PostCard } from "@/components/cards/post-card";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPostBySlug, getPosts, getRelatedPosts } from "@/content/blog";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image.src,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          date: post.date,
          author: post.author.name,
          image: post.image.src,
        })}
      />

      <PageHero
        eyebrow={post.category}
        title={post.title}
        image={post.image}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <article className="bg-ivory py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-forest-800/10 pb-8">
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-forest-900 text-gold-400">
                  <UserRound className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-forest-950">
                    {post.author.name}
                  </p>
                  <p className="text-xs font-light text-charcoal-900/55">
                    {post.author.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-light tracking-wider text-charcoal-900/55">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true" className="text-gold-500">
                  ·
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {post.readingTime}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <p className="font-display text-xl leading-relaxed font-light text-forest-900 italic md:text-2xl">
              {post.excerpt}
            </p>

            {post.content.map((section) => (
              <section key={section.heading ?? section.paragraphs[0].slice(0, 40)}>
                {section.heading ? (
                  <h2 className="font-display mt-12 text-3xl font-medium text-forest-950">
                    {section.heading}
                  </h2>
                ) : null}
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-6 text-[15px] leading-[1.9] font-light text-charcoal-900/75"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </Reveal>

          <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-forest-800/10 pt-8">
            <ul aria-label="Tags" className="flex flex-wrap gap-2.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-forest-800/20 px-4 py-1.5 text-[10px] font-medium tracking-[0.22em] text-forest-800 uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <ShareButtons title={post.title} path={`/blog/${post.slug}`} />
          </Reveal>
        </div>
      </article>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="Keep Reading" title="Related articles" />
          <Stagger className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {related.map((relatedPost) => (
              <StaggerItem key={relatedPost.slug}>
                <PostCard post={relatedPost} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
