import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";

export async function EventsSection() {
  const [weddingImage, meetingImage] = await Promise.all([
    resolveSiteImage("home.events.primary", {
      src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1920&auto=format&fit=crop",
      alt: "Wedding reception beneath chandeliers at Marlo Hotels",
    }),
    resolveSiteImage("home.events.secondary", {
      src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1920&auto=format&fit=crop",
      alt: "Elegant conference space prepared for an event",
    }),
  ]);

  const events = [
    {
      title: "Weddings Above the Valley",
      eyebrow: "Weddings & Celebrations",
      description:
        "Terrace vows for eighty as the sun sets behind the hills, or three-day celebrations choreographed by our events atelier — every wedding begins with a long conversation about the two of you.",
      image: { src: weddingImage.src, alt: weddingImage.alt },
      href: "/contact",
      cta: "Plan Your Wedding",
    },
    {
      title: "Meetings With a View",
      eyebrow: "Meetings & Boardrooms",
      description:
        "Daylit boardrooms, a garden ballroom for three hundred, and the kind of coffee breaks people write home about. Our team handles everything from staging to sunset cocktails.",
      image: { src: meetingImage.src, alt: meetingImage.alt },
      href: "/contact",
      cta: "Enquire For Events",
    },
  ];

  return (
    <section id="events" className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Weddings · Meetings · Events"
          title="Occasions, given a stage"
          description="From intimate vows to gala dinners for three hundred — our events atelier composes celebrations with the valley as backdrop."
        />

        <Stagger className="mt-16 grid gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <StaggerItem key={event.title}>
              <article className="group relative overflow-hidden rounded-xl shadow-luxury-sm transition-shadow duration-700 hover:shadow-luxury">
                <div className="img-hover-frame relative aspect-[16/11]">
                  <Image
                    src={event.image.src}
                    alt={event.image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
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
                    href={event.href}
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-gold-400 uppercase transition-colors hover:text-gold-300 after:absolute after:inset-0"
                  >
                    {event.cta}
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
