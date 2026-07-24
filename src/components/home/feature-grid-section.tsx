import {
  ConciergeBell,
  Plane,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wifi,
  Car,
  Clock,
  Bath,
  BedDouble,
  type LucideIcon,
} from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FeatureGridSection } from "@/lib/homepage-content";

const ICONS: Record<string, LucideIcon> = {
  bed: BedDouble,
  utensils: UtensilsCrossed,
  coffee: UtensilsCrossed,
  spa: Bath,
  wifi: Wifi,
  plane: Plane,
  clock: Clock,
  roomService: ConciergeBell,
  laundry: Shirt,
  parking: Car,
  travel: Sparkles,
  sparkles: Sparkles,
  concierge: ConciergeBell,
};

export function FeatureGridSectionView({
  content,
  tone = "ivory",
}: {
  content: FeatureGridSection;
  tone?: "ivory" | "cream" | "forest";
}) {
  if (!content.enabled) return null;

  const bg =
    tone === "cream"
      ? "bg-cream-100"
      : tone === "forest"
        ? "bg-forest-950"
        : "bg-ivory";
  const headingTone = tone === "forest" ? "light" : "dark";

  return (
    <section className={`${bg} py-24 md:py-36`}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
          tone={headingTone}
        />
        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {content.items.map((item) => {
            const Icon = ICONS[item.icon] || Sparkles;
            return (
              <StaggerItem key={item.title}>
                <article
                  className={
                    tone === "forest"
                      ? "rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition hover:border-gold-500/40"
                      : "shadow-luxury-sm rounded-2xl border border-forest-800/8 bg-white p-7 transition hover:-translate-y-1 hover:shadow-luxury"
                  }
                >
                  <Icon
                    className={
                      tone === "forest"
                        ? "size-6 text-gold-400"
                        : "size-6 text-gold-600"
                    }
                  />
                  <h3
                    className={
                      tone === "forest"
                        ? "font-display mt-5 text-2xl text-ivory"
                        : "font-display mt-5 text-2xl text-forest-950"
                    }
                  >
                    {item.title}
                  </h3>
                  <p
                    className={
                      tone === "forest"
                        ? "mt-3 text-sm leading-relaxed font-light text-cream-200/70"
                        : "mt-3 text-sm leading-relaxed font-light text-charcoal-900/65"
                    }
                  >
                    {item.description}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
