import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Reach Marlo Hotels — Durbar Marg, Kathmandu. Reservations, events, dining and concierge enquiries by phone, WhatsApp, email or our contact form.",
  path: "/contact",
});

type PageProps = {
  searchParams: Promise<{ subject?: string }>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const { subject } = await searchParams;

  const channels = [
    {
      Icon: Phone,
      title: "Telephone",
      lines: [siteConfig.contact.phone, siteConfig.contact.reservations],
      href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`,
      action: "Call us",
    },
    {
      Icon: MessageCircle,
      title: "WhatsApp",
      lines: ["Concierge, instantly", "Available 6 AM – 11 PM"],
      href: `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}`,
      action: "Message us",
    },
    {
      Icon: Mail,
      title: "Email",
      lines: [siteConfig.contact.email, siteConfig.contact.reservationsEmail],
      href: `mailto:${siteConfig.contact.email}`,
      action: "Write to us",
    },
    {
      Icon: Clock,
      title: "Hours",
      lines: [
        `Front desk · ${siteConfig.hours.frontDesk}`,
        `Concierge · ${siteConfig.hours.concierge}`,
      ],
      href: "/booking",
      action: "Reserve a stay",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We are at your service"
        description="Reservations, celebrations, dining or a question about the valley — the concierge desk answers around the clock."
        image={{
          src: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=2400&auto=format&fit=crop",
          alt: "The warm lights of the Marlo lobby at evening",
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      {/* Channels */}
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

      {/* Form + map */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Write To Us</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-forest-950">
              Begin the conversation
            </h2>
            <p className="mt-4 mb-10 text-[15px] leading-relaxed font-light text-charcoal-900/65">
              Tell us about your stay, your celebration or your question —
              a member of our team replies within one working day.
            </p>
            <ContactForm defaultSubject={subject} />
          </Reveal>

          <Reveal direction="left" delay={0.15}>
            <div className="shadow-luxury h-full min-h-[480px] overflow-hidden rounded-xl">
              <iframe
                title="Map — Marlo Hotels, Durbar Marg, Kathmandu"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${siteConfig.contact.geo.lng - 0.01}%2C${siteConfig.contact.geo.lat - 0.007}%2C${siteConfig.contact.geo.lng + 0.01}%2C${siteConfig.contact.geo.lat + 0.007}&layer=mapnik&marker=${siteConfig.contact.geo.lat}%2C${siteConfig.contact.geo.lng}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-4 flex items-center gap-2.5 text-sm font-light text-charcoal-900/65">
              <MapPin className="size-4 text-gold-600" />
              {siteConfig.contact.address}
              <a
                href={siteConfig.contact.mapUrl}
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
