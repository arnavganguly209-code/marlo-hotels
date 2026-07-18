import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ExperienceCard } from "@/components/cards/experience-card";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Experience } from "@/types/content";

export function ExperiencesSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Luxury Experiences"
          title="The valley, opened for you"
          description="Sunrise flights past Everest, historian-led walks and ateliers behind unmarked doors — experiences composed by our concierge, impossible to book anywhere else."
        />

        <Stagger className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {experiences.slice(0, 3).map((experience) => (
            <StaggerItem key={experience.slug}>
              <ExperienceCard experience={experience} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline-dark" size="lg">
            <Link href="/experiences">
              All Experiences
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
