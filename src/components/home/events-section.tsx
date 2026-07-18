import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type {
  CollectionSection,
  EventEditorItem,
} from "@/lib/homepage-content";

function objectPosition(image: { focalX?: number; focalY?: number }) {
  return `${image.focalX ?? 50}% ${image.focalY ?? 50}%`;
}

export function EventsSection({
  content,
}: {
  content: CollectionSection<EventEditorItem>;
}) {
  if (!content.enabled) return null;

  return (
    <section id="events" className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />

        <Stagger className="mt-16 grid gap-8 lg:grid-cols-2">
          {content.items.map((event) => (
            <StaggerItem key={event.title}>
              <article className="group relative overflow-hidden rounded-xl shadow-luxury-sm transition-shadow duration-700 hover:shadow-luxury">
                <div className="img-hover-frame relative aspect-[16/11]">
                  <Image
                    src={event.image.src}
                    alt={event.image.alt}
                    fill
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    style={{ objectPosition: objectPosition(event.image) }}
                    unoptimized={event.image.src.startsWith("/media/")}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                  <p className="text-[9px] font-medium tracking-[0.3em] text-gold-400 uppercase">
                    {event.eyebrow}
                  </p>
                  <h3 className="font-display mt-3 text-3xl font-medium text-ivory md:text-4xl">
                    {event.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed font-light text-cream-200/80">
                    {event.description}
                  </p>
                  <Link
                    href={event.buttonLink}
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-gold-400 uppercase transition-colors hover:text-gold-300 after:absolute after:inset-0"
                  >
                    {event.buttonText}
                    <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
