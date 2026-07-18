import { ArrowRight, Check, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/types/content";

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className="group shadow-luxury-sm hover:shadow-luxury relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-shadow duration-700">
      <div className="img-hover-frame relative aspect-[16/10]">
        <Image
          src={offer.image.src}
          alt={offer.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/50 to-transparent" />
        <span className="glass-dark absolute top-4 left-4 rounded-full px-4 py-1.5 text-[9px] font-medium tracking-[0.28em] text-gold-300 uppercase">
          {offer.category}
        </span>
        <span className="font-display absolute bottom-4 left-4 text-xl font-medium text-gold-300 italic">
          {offer.discount}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-2xl font-medium text-forest-950">
          {offer.title}
        </h3>
        <p className="mt-1 text-xs tracking-[0.14em] text-gold-600 uppercase">
          {offer.tagline}
        </p>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed font-light text-charcoal-900/60">
          {offer.description}
        </p>

        <ul className="mt-5 space-y-2">
          {offer.perks.slice(0, 3).map((perk) => (
            <li
              key={perk}
              className="flex items-start gap-2.5 text-xs font-light text-charcoal-900/70"
            >
              <Check className="mt-0.5 size-3.5 shrink-0 text-gold-600" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between border-t border-forest-800/10 pt-5">
          <span className="flex items-center gap-2 text-[10px] font-medium tracking-[0.22em] text-forest-800 uppercase">
            <Ticket className="size-3.5 text-gold-600" />
            Code · {offer.code}
          </span>
          <Link
            href={`/booking?promo=${offer.code}`}
            className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-gold-600 uppercase transition-colors hover:text-gold-500"
          >
            Book
            <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
          </Link>
        </div>
        <p className="mt-3 text-[11px] font-light text-charcoal-900/45 italic">
          {offer.validity}
        </p>
      </div>
    </article>
  );
}
