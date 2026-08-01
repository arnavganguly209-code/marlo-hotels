import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Champagne-gold museum frame — full photo visible (object-contain), native 3:2.
 * Shared by Spa and Dining for a consistent five-star look.
 */
export function RoyalImageFrame({
  image,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className,
  tone = "light",
}: {
  image: { src: string; alt: string };
  priority?: boolean;
  sizes?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <figure className={cn("group relative w-full", className)}>
      <div
        className={cn(
          "rounded-[2px] p-[3px] shadow-[0_22px_50px_-24px_rgb(12_26_24_/_0.45)]",
          dark
            ? "bg-gradient-to-br from-[#E8D5A3] via-[#C9A24A] to-[#8B7340]"
            : "bg-gradient-to-br from-[#EDE0BE] via-[#D4B56A] to-[#A8894A]"
        )}
      >
        <div
          className={cn(
            "rounded-[1px] p-[1px]",
            dark ? "bg-forest-950" : "bg-forest-900/80"
          )}
        >
          <div
            className={cn(
              "p-2.5 sm:p-3.5 md:p-4",
              dark ? "bg-[#1A2A24]" : "bg-[#F7F1E6]"
            )}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#EDE6D8]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={priority}
                quality={100}
                sizes={sizes}
                className="object-contain object-center"
                unoptimized={
                  image.src.startsWith("/media/") ||
                  image.src.includes("?")
                }
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-forest-950/10"
              />
            </div>
          </div>
        </div>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1 -left-1 size-3 border-t border-l border-gold-600/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1 -right-1 size-3 border-t border-r border-gold-600/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 -left-1 size-3 border-b border-l border-gold-600/70"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 -right-1 size-3 border-b border-r border-gold-600/70"
      />
    </figure>
  );
}
