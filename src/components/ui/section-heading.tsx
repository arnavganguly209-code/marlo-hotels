import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isLight = tone === "light";

  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        isCenter && "mx-auto text-center",
        className
      )}
    >
      <p className={cn("eyebrow", isCenter && "gold-rule justify-center")}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display mt-5 text-4xl leading-[1.08] font-medium text-balance md:text-5xl lg:text-[3.4rem]",
          isLight ? "text-ivory" : "text-forest-950"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-6 text-[15px] leading-relaxed font-light tracking-wide",
            isLight ? "text-cream-200/80" : "text-charcoal-900/65"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
