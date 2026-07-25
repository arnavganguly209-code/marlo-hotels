import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHero } from "@/components/shared/page-hero";
import { getGalleryContent } from "@/lib/gallery-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "Light on water, brass at dusk and the valley from a suite window — explore Marlo Hotels through the lens: rooms, dining, wellness, architecture and celebrations.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const content = await getGalleryContent();

  return (
    <>
      <PageHero
        eyebrow={content.cover.eyebrow || "Gallery"}
        title={content.cover.title || "Marlo, framed"}
        description={content.cover.description}
        image={{
          src: content.cover.src,
          alt: content.cover.alt,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery", href: "/gallery" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <GalleryGrid
            images={content.images.map((image) => ({
              src: image.src,
              alt: image.alt,
              category: image.category,
            }))}
            categories={content.categories}
          />
        </div>
      </section>
    </>
  );
}
