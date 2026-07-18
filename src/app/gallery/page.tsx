import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHero } from "@/components/shared/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "Light on water, brass at dusk and the valley from a suite window — explore Marlo Hotels through the lens: rooms, dining, wellness, architecture and celebrations.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Marlo, framed"
        description="Rooms, tables, rituals and the architecture that holds them — a portrait of life at Marlo Hotels."
        image={{
          src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop",
          alt: "Marlo Hotels architecture and pool",
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery", href: "/gallery" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <GalleryGrid />
        </div>
      </section>
    </>
  );
}
