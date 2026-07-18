import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/types/content";

export function ExperienceCard({
  experience,
  actionLabel = "Discover",
}: {
  experience: Experience;
  actionLabel?: string;
}) {
  return (
    <article className="group img-hover-frame shadow-luxury-sm hover:shadow-luxury relative aspect-[3/4] overflow-hidden rounded-xl">
      <Image
        src={experience.image.src}
        alt={experience.image.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        quality={100}
        unoptimized={experience.image.src.startsWith("/media/")}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/25 to-charcoal-950/10 transition-opacity duration-700" />

      <div className="absolute inset-x-0 bottom-0 p-7">
        <div className="flex items-center gap-3 text-[9px] font-medium tracking-[0.28em] text-gold-400 uppercase">
          <span>{experience.category}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-cream-200/80">
            <Clock className="size-3" />
            {experience.duration}
          </span>
        </div>
        <h3 className="font-display mt-3 text-2xl leading-tight font-medium text-ivory">
          <Link
            href={`/experiences#${experience.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {experience.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 max-h-0 overflow-hidden text-sm leading-relaxed font-light text-cream-200/80 opacity-0 transition-all duration-700 group-hover:max-h-24 group-hover:opacity-100">
          {experience.shortDescription}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-gold-400 uppercase">
          {actionLabel}
          <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
        </span>
      </div>
    </article>
  );
}
