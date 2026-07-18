import Image from "next/image";
import { InstagramIcon } from "@/components/shared/social-icons";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import type { InstagramEditorContent } from "@/lib/homepage-content";

export function InstagramStrip({
  content,
}: {
  content: InstagramEditorContent;
}) {
  if (!content.enabled) return null;

  return (
    <section aria-label="Marlo Hotels on Instagram" className="bg-ivory py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="text-center">
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3"
          >
            <InstagramIcon className="size-5 text-gold-600" />
            <span className="text-sm font-medium tracking-[0.3em] text-forest-900 uppercase transition-colors group-hover:text-gold-600">
              {content.handle}
            </span>
          </a>
        </Reveal>

        <Stagger
          stagger={0.06}
          className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6"
        >
          {content.images.map((image) => {
            const objectPosition = `${image.focalX ?? 50}% ${image.focalY ?? 50}%`;
            return (
              <StaggerItem key={image.src}>
                <a
                  href={content.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View on Instagram — ${image.alt}`}
                  className="img-hover-frame group relative block aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    quality={100}
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover"
                    style={{ objectPosition }}
                    unoptimized={image.src.startsWith("/media/")}
                  />
                  <span className="absolute inset-0 grid place-items-center bg-charcoal-950/0 transition-colors duration-500 group-hover:bg-charcoal-950/40">
                    <InstagramIcon className="size-5 text-ivory opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
