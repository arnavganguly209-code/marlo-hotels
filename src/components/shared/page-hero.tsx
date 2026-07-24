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
    <section className="relative flex min-h-[62vh] items-end overflow-hidden bg-forest-950">
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
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/35 to-charcoal-950/45" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-44 pb-16 md:px-8 md:pb-20">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] tracking-[0.2em] text-cream-200/70 uppercase">
              {crumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <ChevronRight className="size-3 text-gold-500" />
                  ) : null}
                  {index === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-gold-400">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-gold-300"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <p className="eyebrow mt-8">{eyebrow}</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] font-medium text-ivory text-balance md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed font-light text-cream-200/85">
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
