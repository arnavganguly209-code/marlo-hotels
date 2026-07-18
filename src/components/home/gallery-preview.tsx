import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageContent } from "@/lib/homepage-content";

const spans = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:row-span-2",
  "",
  "",
];

export function GalleryPreview({
  content,
}: {
  content: HomepageContent["gallery"];
}) {
  if (!content.enabled) return null;

  return (
    <section className="bg-forest-950 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          tone="light"
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />

        <Stagger
          stagger={0.08}
          className="mt-16 grid auto-rows-[200px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-4"
        >
          {content.items.map((image, index) => (
            <StaggerItem key={image.src} className={spans[index]}>
              <Link
                href={content.buttonLink ?? "/gallery"}
                aria-label={`Open gallery — ${image.alt}`}
                className="img-hover-frame group relative block h-full overflow-hidden rounded-lg"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  quality={100}
                  unoptimized={image.src.startsWith("/media/")}
                />
                <span className="absolute inset-0 bg-charcoal-950/0 transition-colors duration-500 group-hover:bg-charcoal-950/30" />
                <span className="absolute bottom-4 left-4 text-[9px] font-medium tracking-[0.28em] text-ivory uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {image.category}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href={content.buttonLink ?? "/gallery"}>
              {content.buttonText ?? "View Full Gallery"}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
