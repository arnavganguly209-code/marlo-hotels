import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Marlo Hotels mark — an abstract "M" of rising rooflines in brand teal,
 * flanked by gold accents, recreated as a crisp inline SVG so it scales
 * and sits on any background.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 88"
      aria-hidden="true"
      className={cn("h-10 w-auto", className)}
    >
      <path d="M6 88V52L20 38v50H6Z" fill="#C9963F" />
      <path d="M26 88V30L48 8v32l-8 8v40H26Z" fill="#3F7A72" />
      <path d="M50 6l14 14L78 6v20L64 40 50 26V6Z" fill="#3F7A72" />
      <path d="M102 88V30L80 8v32l8 8v40h14Z" fill="#3F7A72" />
      <path d="M122 88V52l-14-14v50h14Z" fill="#C9963F" />
    </svg>
  );
}

export function Logo({ tone = "light", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Marlo Hotels — Home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <LogoMark className="h-9 transition-transform duration-500 group-hover:scale-105 md:h-10" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.55rem] font-semibold tracking-wide",
            tone === "light" ? "text-cream-100" : "text-forest-800"
          )}
        >
          Marlo
        </span>
        <span className="mt-1 text-[0.55rem] font-medium tracking-[0.52em] text-gold-500 uppercase">
          Hotels
        </span>
      </span>
    </Link>
  );
}
