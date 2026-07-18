import { Award as AwardIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { awards } from "@/content/gallery";

export function AwardsStrip() {
  return (
    <section
      aria-label="Awards and recognition"
      className="border-y border-forest-800/10 bg-cream-100 py-16"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Stagger
          stagger={0.08}
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5"
        >
          {awards.map((award) => (
            <StaggerItem key={award.title} className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full border border-gold-500/40 text-gold-600">
                <AwardIcon className="size-5" />
              </div>
              <h3 className="font-display mt-4 text-base leading-snug font-medium text-forest-950">
                {award.title}
              </h3>
              <p className="mt-2 text-[10px] tracking-[0.2em] text-charcoal-900/50 uppercase">
                {award.issuer} · {award.year}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
