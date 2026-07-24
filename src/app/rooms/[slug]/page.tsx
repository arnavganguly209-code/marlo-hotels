import { BedDouble, Check, Expand, Eye, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomCard } from "@/components/cards/room-card";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/shared/page-hero";
import { StickyRoomBookingCard } from "@/components/rooms/sticky-room-booking-card";
import { RoomGallery } from "@/components/rooms/room-gallery";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getRelatedRooms,
  getRoomBySlug,
  getRooms,
  roomPolicies,
} from "@/content/rooms";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    breakfast?: string;
    promo?: string;
  }>;
};

export async function generateStaticParams() {
  const rooms = await getRooms();
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) return {};
  return buildMetadata({
    title: room.name,
    description: room.shortDescription,
    path: `/rooms/${room.slug}`,
    image: room.images[0]?.src,
  });
}

export default async function RoomDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (await searchParams) || {};
  const room = await getRoomBySlug(slug);
  if (!room) notFound();

  const related = await getRelatedRooms(room.slug);

  const facts = [
    { Icon: Expand, label: "Size", value: room.size },
    { Icon: Users, label: "Occupancy", value: room.occupancy },
    { Icon: BedDouble, label: "Bedding", value: room.bed },
    { Icon: Eye, label: "View", value: room.view },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HotelRoom",
          name: room.name,
          description: room.shortDescription,
          image: room.images.map((image) => image.src),
          bed: { "@type": "BedDetails", typeOfBed: room.bed },
          occupancy: { "@type": "QuantitativeValue", value: room.occupancy },
          url: `${siteConfig.url}/rooms/${room.slug}`,
        }}
      />

      <PageHero
        eyebrow={room.category === "suite" ? "The Suites" : "The Rooms"}
        title={room.name}
        description={room.tagline}
        image={room.images[0] || { src: "", alt: room.name }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Rooms & Suites", href: "/rooms" },
          { label: room.name, href: `/rooms/${room.slug}` },
        ]}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <RoomGallery images={room.images} />
            </Reveal>

            <Reveal className="mt-14">
              <dl className="grid grid-cols-2 gap-6 rounded-xl border border-forest-800/10 bg-cream-50 p-7 sm:grid-cols-4">
                {facts.map(({ Icon, label, value }) => (
                  <div key={label}>
                    <Icon className="size-5 text-gold-600" />
                    <dt className="mt-3 text-[9px] tracking-[0.28em] text-charcoal-900/50 uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-light text-forest-950">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal className="mt-14">
              <p className="eyebrow">The Room</p>
              <h2 className="font-display mt-4 text-3xl font-medium text-forest-950 md:text-4xl">
                {room.tagline}
              </h2>
              {room.description.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal className="mt-14">
              <h3 className="font-display text-2xl font-medium text-forest-950">
                Amenities
              </h3>
              <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                {room.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-start gap-2.5 text-sm font-light text-charcoal-900/70"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-600" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-14">
              <h3 className="font-display text-2xl font-medium text-forest-950">
                Facilities
              </h3>
              <ul className="mt-6 space-y-3">
                {room.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm font-light text-charcoal-900/70"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-500"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-14">
              <h3 className="font-display text-2xl font-medium text-forest-950">
                Policies
              </h3>
              <dl className="mt-6 divide-y divide-forest-800/10 border-y border-forest-800/10">
                {roomPolicies.map((policy) => (
                  <div
                    key={policy.title}
                    className="grid gap-2 py-5 sm:grid-cols-[200px_1fr] sm:gap-8"
                  >
                    <dt className="text-[11px] font-medium tracking-[0.24em] text-forest-800 uppercase">
                      {policy.title}
                    </dt>
                    <dd className="text-sm leading-relaxed font-light text-charcoal-900/70">
                      {policy.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="lg:col-span-1">
            <StickyRoomBookingCard
              room={room}
              initial={{
                checkIn: query.checkIn,
                checkOut: query.checkOut,
                adults: query.adults ? Number(query.adults) : undefined,
                children: query.children ? Number(query.children) : undefined,
                rooms: query.rooms ? Number(query.rooms) : undefined,
                breakfast: query.breakfast === "1",
                promo: query.promo,
              }}
            />
          </div>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Continue Exploring"
            title="You may also love"
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {related.map((relatedRoom) => (
              <StaggerItem key={relatedRoom.slug}>
                <RoomCard room={relatedRoom} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
