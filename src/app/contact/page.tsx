import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { getContactContent } from "@/lib/contact-content";
import { buildMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ subject?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactContent();
  return buildMetadata({
    title: content.seo.title || "Contact",
    description: content.seo.description,
    path: "/contact",
  });
}

export default async function ContactPage({ searchParams }: PageProps) {
  const [{ subject }, content] = await Promise.all([
    searchParams,
    getContactContent(),
  ]);

  const channels = [
    {
      Icon: Phone,
      title: "Telephone",
      lines: [content.details.phone, content.details.reservationsPhone],
      href: `tel:${content.details.phone.replace(/\s/g, "")}`,
      action: "Call us",
    },
    {
      Icon: MessageCircle,
      title: "WhatsApp",
      lines: ["Concierge, instantly", content.details.conciergeHours],
      href: `https://wa.me/${content.details.whatsapp.replace(/\D/g, "")}`,
      action: "Message us",
    },
    {
      Icon: Mail,
      title: "Email",
      lines: [content.details.generalEmail, content.details.reservationsEmail],
      href: `mailto:${content.details.generalEmail}`,
      action: "Write to us",
    },
    {
      Icon: Clock,
      title: "Hours",
      lines: content.details.businessHours
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      href: content.cover.buttonLink || "/booking",
      action: content.cover.buttonText || "Reserve a stay",
    },
  ];

  const span = Math.max(0.004, 0.08 / Math.max(1, content.map.zoom / 5));

  return (
    <>
      <PageHero
        eyebrow={content.cover.eyebrow}
        title={content.cover.headline}
        description={
          content.cover.subheading
            ? `${content.cover.subheading}\n\n${content.cover.description}`
            : content.cover.description
        }
        image={{
          src: content.cover.image.src,
          alt: content.cover.image.alt,
          objectPosition: `${content.cover.image.focalX ?? 50}% ${content.cover.image.focalY ?? 50}%`,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <section className="bg-ivory py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Stagger className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {channels.map((channel) => (
              <StaggerItem key={channel.title}>
                <a
                  href={channel.href}
                  className="group block h-full rounded-xl border border-forest-800/10 bg-white p-8 shadow-luxury-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-luxury"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-forest-900 text-gold-400 transition-colors duration-500 group-hover:bg-gold-500 group-hover:text-charcoal-950">
                    <channel.Icon className="size-5" />
                  </span>
                  <h2 className="font-display mt-5 text-xl font-medium text-forest-950">
                    {channel.title}
                  </h2>
                  {channel.lines.map((line) => (
                    <p
                      key={line}
                      className="mt-1.5 text-sm font-light text-charcoal-900/65"
                    >
                      {line}
                    </p>
                  ))}
                  <p className="mt-4 text-[10px] font-medium tracking-[0.3em] text-gold-600 uppercase">
                    {channel.action} →
                  </p>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">{content.form.eyebrow}</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-forest-950">
              {content.form.heading}
            </h2>
            <p className="mt-4 mb-10 text-[15px] leading-relaxed font-light text-charcoal-900/65">
              {content.form.description}
            </p>
            <ContactForm
              defaultSubject={subject}
              buttonText={content.form.buttonText}
              successTitle={content.form.successTitle}
              successMessage={content.form.successMessage}
              errorMessage={content.form.errorMessage}
            />
          </Reveal>

          <Reveal direction="left" delay={0.15}>
            <div className="shadow-luxury h-full min-h-[480px] overflow-hidden rounded-xl">
              <iframe
                title={`Map — ${content.details.hotelName}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${content.map.lng - span}%2C${content.map.lat - span * 0.7}%2C${content.map.lng + span}%2C${content.map.lat + span * 0.7}&layer=mapnik&marker=${content.map.lat}%2C${content.map.lng}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-4 flex items-center gap-2.5 text-sm font-light text-charcoal-900/65">
              <MapPin className="size-4 text-gold-600" />
              {content.details.address}
              <a
                href={content.map.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline ml-auto text-[10px] font-medium tracking-[0.26em] text-gold-600 uppercase"
              >
                Open in Maps
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
