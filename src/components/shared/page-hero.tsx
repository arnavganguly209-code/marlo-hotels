import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

type Crumb = { label: string; href: string };

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  image: { src: string; alt: string; objectPosition?: string };
  videoUrl?: string;
  crumbs: Crumb[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  videoUrl,
  crumbs,
}: PageHeroProps) {
  return (
    <section className="page-hero relative flex min-h-[62vh] items-end overflow-hidden bg-forest-950">
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({ name: crumb.label, path: crumb.href }))
        )}
      />
      {videoUrl ? (
        <video
          src={videoUrl}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          poster={image.src || undefined}
        />
      ) : image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          quality={100}
          sizes="100vw"
          className="animate-kenburns object-cover opacity-70"
          style={{ objectPosition: image.objectPosition || "50% 50%" }}
          unoptimized={image.src.startsWith("/media/")}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-950 to-charcoal-950" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/92 via-charcoal-950/40 to-charcoal-950/50" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-44 pb-16 md:px-8 md:pb-20">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-[0.22em] text-[#F0E6D2]/80 uppercase">
              {crumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <ChevronRight className="size-3 text-[#D9B46B]" />
                  ) : null}
                  {index === crumbs.length - 1 ? (
                    <span
                      aria-current="page"
                      className="text-[#E4C98A]"
                      style={{ textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-[#F0E6D2]/75 transition-colors hover:text-[#E4C98A]"
                      style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <p
            className="mt-8 text-[0.7rem] font-semibold tracking-[0.3em] text-[#D9B46B] uppercase"
            style={{ textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="font-display mt-5 max-w-3xl text-5xl leading-[1.1] font-semibold tracking-[-0.018em] text-white text-balance md:text-6xl md:leading-[1.08] lg:text-7xl"
            style={{ textShadow: "0 2px 28px rgba(0,0,0,0.55)" }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-7 max-w-xl text-[15.5px] leading-[1.8] font-medium tracking-[0.012em] text-white/92"
              style={{ textShadow: "0 1px 18px rgba(0,0,0,0.5)" }}
            >
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
