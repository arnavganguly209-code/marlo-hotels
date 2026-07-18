import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParallaxBanner } from "@/components/ui/parallax-banner";
import { Reveal } from "@/components/ui/reveal";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";

export async function PoolBanner() {
  const image = await resolveSiteImage("home.pool", {
    src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2400&auto=format&fit=crop",
    alt: "The infinity pool pouring into the valley horizon",
  });
  return (
    <ParallaxBanner
      image={{
        src: image.src,
        alt: image.alt,
      }}
      className="min-h-[70vh] py-32"
      overlayClassName="bg-gradient-to-b from-charcoal-950/60 via-charcoal-950/35 to-charcoal-950/70"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow gold-rule justify-center">The Infinity Pool</p>
        <h2 className="font-display mt-6 text-4xl leading-[1.08] font-medium text-ivory text-balance md:text-6xl">
          Where the water ends and the <em className="text-gold-300">valley begins</em>
        </h2>
        <p className="mx-auto mt-7 max-w-lg text-[15px] leading-relaxed font-light text-cream-200/85">
          Heated year-round and poured to the very edge of the terrace, the
          pool holds the valley in its surface — sunrise laps, golden-hour
          swims and service that arrives before you raise a hand.
        </p>
        <Button asChild variant="outline" size="lg" className="mt-10">
          <Link href="/gallery">
            See The Pool
            <ArrowRight />
          </Link>
        </Button>
      </Reveal>
    </ParallaxBanner>
  );
}
