import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-svh items-center justify-center bg-forest-950 px-5 pt-24">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-gold-500/40 text-gold-400">
          <Compass className="size-7" />
        </span>
        <p className="eyebrow mt-8">Page Not Found</p>
        <h1 className="font-display mt-4 text-5xl font-medium text-ivory md:text-6xl">
          A quiet corner, off the map
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed font-light text-cream-200/75">
          The page you are looking for has checked out. Allow us to walk you
          back to the lobby.
        </p>
        <Button asChild variant="gold" size="lg" className="mt-10">
          <Link href="/">
            <ArrowLeft />
            Return Home
          </Link>
        </Button>
      </div>
    </section>
  );
}
