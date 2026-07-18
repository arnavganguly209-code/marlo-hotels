import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ExperienceCard } from "@/components/cards/experience-card";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageContent } from "@/lib/homepage-content";

export function ExperiencesSection({
  content,
}: {
  content: HomepageContent["experiences"];
}) {
  if (!content.enabled) return null;

  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />

        <Stagger className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {content.items.map((experience) => (
            <StaggerItem key={experience.slug}>
              <ExperienceCard
                experience={experience}
                actionLabel={content.labels?.discover}
              />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline-dark" size="lg">
            <Link href={content.buttonLink ?? "/experiences"}>
              {content.buttonText ?? "All Experiences"}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
